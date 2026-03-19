const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

interface MemberRecord {
  id: string;
  meno: string;
  priezvisko: string;
}

function matchName(resultName: string, members: MemberRecord[]): { member: MemberRecord; confidence: number } | null {
  const normResult = normalize(resultName);
  let bestMatch: MemberRecord | null = null;
  let bestScore = Infinity;

  for (const member of members) {
    const fullName1 = normalize(`${member.meno} ${member.priezvisko}`);
    const fullName2 = normalize(`${member.priezvisko} ${member.meno}`);
    const dist = Math.min(levenshtein(normResult, fullName1), levenshtein(normResult, fullName2));
    if (dist < bestScore) {
      bestScore = dist;
      bestMatch = member;
    }
  }

  if (!bestMatch) return null;
  const maxLen = Math.max(normResult.length, normalize(`${bestMatch.meno} ${bestMatch.priezvisko}`).length);
  const confidence = 1 - bestScore / maxLen;
  return confidence >= 0.7 ? { member: bestMatch, confidence } : null;
}

async function fetchMembers(): Promise<MemberRecord[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const res = await fetch(`${supabaseUrl}/rest/v1/members?select=id,meno,priezvisko`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
  });
  return await res.json();
}

async function callAI(pdfBase64: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('AI not configured');

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract data from this PDF document.' },
            { type: 'image_url', image_url: { url: `data:application/pdf;base64,${pdfBase64}` } }
          ]
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    throw new Error('AI parsing failed: ' + errText.substring(0, 200));
  }

  const aiData = await aiResponse.json();
  let content = aiData.choices?.[0]?.message?.content || '[]';
  return content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

// MODE: startlist — extract individual Seiken members + team category entries
async function handleStartlist(pdfBase64: string) {
  const systemPrompt = `You are a parser for karate competition start lists / registration lists. Extract ALL entries for "Karate klub Seiken Bratislava" or "KK Seiken" or "Seiken Bratislava" or "Seiken" or similar club name.

Return a JSON object with two arrays:
1. "individuals" - array of objects with:
   - name: full name of the competitor (format: "Meno Priezvisko"). List each person ONLY ONCE even if they appear in multiple categories/divisions.
   - categories: array of objects with { discipline, category } listing ALL divisions/categories this person is registered in. Use the EXACT division/category text from the PDF. For example:
     - For WUKF format: discipline could be "Individual Kata", "Kumite Shobu Nihon", "Kobudo Short Weapons", "Kobudo Long Weapons", etc. Category should be the full description like "Open | Female | 11 to 12 Years | 4th kyu & below"
     - For Slovak format: discipline is "kata", "kumite", "kobudo". Category is the Slovak name like "Mladší žiaci", "Kadeti", etc.
     - Always preserve the original text from the PDF as closely as possible.
2. "teams" - array of objects with:
   - discipline: the team discipline (e.g. "Mixed Team Kata", "Mixed Pairs Kata", "kata družstvá", "kumite družstvá")
   - category: the full category description as written in the PDF
   - members: array of strings with the names/surnames of team members as written in the PDF

IMPORTANT:
- Each individual competitor must appear ONLY ONCE in the individuals array, with ALL their categories listed
- Preserve the EXACT division/category names from the PDF - do NOT translate or normalize them
- Include ALL individual competitors AND all team entries
- Look through all pages carefully
- Return ONLY the JSON object, no markdown, no explanation`;

  const content = await callAI(pdfBase64, systemPrompt);
  let parsed: { individuals: Array<{ name: string; categories?: Array<{ discipline: string; category: string }> }>; teams: Array<{ discipline: string; category: string; members?: string[] }> };
  try {
    const raw = JSON.parse(content);
    if (Array.isArray(raw)) {
      parsed = { individuals: raw, teams: [] };
    } else {
      parsed = { individuals: raw.individuals || [], teams: raw.teams || [] };
    }
  } catch {
    throw new Error('Failed to parse startlist from PDF');
  }

  // Deduplicate individuals by normalized name
  const seen = new Set<string>();
  const uniqueIndividuals: typeof parsed.individuals = [];
  for (const entry of parsed.individuals) {
    const key = normalize(entry.name);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueIndividuals.push(entry);
    }
  }
  parsed.individuals = uniqueIndividuals;

  const members = await fetchMembers();
  const matched: Array<{ name: string; memberId: string; memberName: string; confidence: number; categories?: Array<{ discipline: string; category: string }> }> = [];
  const unmatched: Array<{ name: string; categories?: Array<{ discipline: string; category: string }> }> = [];

  for (const entry of parsed.individuals) {
    const match = matchName(entry.name, members);
    if (match) {
      matched.push({
        name: entry.name,
        memberId: match.member.id,
        memberName: `${match.member.meno} ${match.member.priezvisko}`,
        confidence: match.confidence,
        categories: entry.categories,
      });
    } else {
      unmatched.push({ name: entry.name, categories: entry.categories });
    }
  }

  return {
    success: true,
    mode: 'startlist',
    matched,
    unmatched,
    teams: parsed.teams,
    totalFound: parsed.individuals.length,
    totalTeams: parsed.teams.length,
  };
}

// MODE: results — extract competition results (existing logic)
async function handleResults(pdfBase64: string) {
  const systemPrompt = `You are a parser for karate competition results from PDF documents. Extract ONLY individual results (not team/družstvo/team kata) for members of "Karate klub Seiken Bratislava" or "KK Seiken" or "Seiken Bratislava" or "Seiken" or similar.

Return a JSON array of objects with these fields:
- name: full name of the competitor (as written in the PDF)
- discipline: the discipline as written in the PDF (preserve original text, e.g. "Individual Kata", "Kumite Shobu Nihon", "Kobudo Short Weapons", "kata", "kumite", "kobudo")
- category: the full category as written in the PDF (preserve original text, e.g. "Open | Female | 11 to 12 Years | 4th kyu & below" for WUKF, or Slovak category names)
- placement: numeric placement (1, 2, 3, etc.)

IMPORTANT:
- Only include INDIVIDUAL results, skip team/družstvo entries
- Preserve the EXACT division/category names from the PDF - do NOT translate or normalize them
- Include all placements, not just medalists
- If you can't determine placement, use 0
- Return ONLY the JSON array, no markdown, no explanation
- Look carefully through all pages of the PDF for any Seiken members`;

  const content = await callAI(pdfBase64, systemPrompt);

  interface ParsedResult { name: string; discipline: string; category: string; placement: number; }
  let parsedResults: ParsedResult[];
  try {
    parsedResults = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse results from PDF');
  }

  const members = await fetchMembers();
  const matched: Array<ParsedResult & { memberId: string; memberName: string; confidence: number }> = [];
  const unmatched: ParsedResult[] = [];

  for (const result of parsedResults) {
    const match = matchName(result.name, members);
    if (match) {
      matched.push({ ...result, memberId: match.member.id, memberName: `${match.member.meno} ${match.member.priezvisko}`, confidence: match.confidence });
    } else {
      unmatched.push(result);
    }
  }

  return { success: true, mode: 'results', matched, unmatched, totalFound: parsedResults.length };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, competitionId, mode = 'results' } = await req.json();

    if (!pdfBase64 || !competitionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'pdfBase64 and competitionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing PDF in mode: ${mode}, base64 length: ${pdfBase64.length}`);

    const result = mode === 'startlist'
      ? await handleStartlist(pdfBase64)
      : await handleResults(pdfBase64);

    console.log(`Found ${result.totalFound} entries, matched ${result.matched.length}, unmatched ${result.unmatched.length}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
