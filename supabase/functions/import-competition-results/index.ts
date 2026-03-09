const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Strip diacritics and lowercase for fuzzy comparison
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Simple Levenshtein distance
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

interface ParsedResult {
  name: string;
  discipline: string;
  category: string;
  placement: number;
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
    
    const dist1 = levenshtein(normResult, fullName1);
    const dist2 = levenshtein(normResult, fullName2);
    const dist = Math.min(dist1, dist2);

    if (dist < bestScore) {
      bestScore = dist;
      bestMatch = member;
    }
  }

  if (!bestMatch) return null;

  const maxLen = Math.max(normResult.length, normalize(`${bestMatch.meno} ${bestMatch.priezvisko}`).length);
  const confidence = 1 - bestScore / maxLen;

  if (confidence >= 0.7) {
    return { member: bestMatch, confidence };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, competitionId } = await req.json();

    if (!pdfBase64 || !competitionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'pdfBase64 and competitionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI with vision to extract results from PDF
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF, base64 length:', pdfBase64.length);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a parser for karate competition results from PDF documents. Extract ONLY individual results (not team/družstvo/team kata) for members of "Karate klub Seiken Bratislava" or "KK Seiken" or "Seiken Bratislava" or "Seiken" or similar.

Return a JSON array of objects with these fields:
- name: full name of the competitor (as written in the PDF)
- discipline: the discipline (e.g. "kata", "kumite", "kobudo")
- category: the category (e.g. age group, weight class)
- placement: numeric placement (1, 2, 3, etc.)

IMPORTANT:
- Only include INDIVIDUAL results, skip team/družstvo entries
- Include all placements, not just medalists
- If you can't determine placement, use 0
- Return ONLY the JSON array, no markdown, no explanation
- Look carefully through all pages of the PDF for any Seiken members`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract individual karate competition results for Seiken Bratislava members from this PDF document.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI error:', errText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI parsing failed: ' + errText.substring(0, 200) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response:', content.substring(0, 500));
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsedResults: ParsedResult[];
    try {
      parsedResults = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse results from PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get members from DB for matching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const membersResponse = await fetch(`${supabaseUrl}/rest/v1/members?select=id,meno,priezvisko`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    const members: MemberRecord[] = await membersResponse.json();

    // Match results to members
    const matched: Array<ParsedResult & { memberId: string; memberName: string; confidence: number }> = [];
    const unmatched: ParsedResult[] = [];

    for (const result of parsedResults) {
      const match = matchName(result.name, members);
      if (match) {
        matched.push({
          ...result,
          memberId: match.member.id,
          memberName: `${match.member.meno} ${match.member.priezvisko}`,
          confidence: match.confidence,
        });
      } else {
        unmatched.push(result);
      }
    }

    console.log(`Found ${parsedResults.length} results, matched ${matched.length}, unmatched ${unmatched.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        matched,
        unmatched,
        totalFound: parsedResults.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
