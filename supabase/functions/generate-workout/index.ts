import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Chýba LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { catalog, profile, mode, goal, duration, days, groups, ageBand } = body ?? {};

    if (!Array.isArray(catalog) || catalog.length === 0) {
      return new Response(JSON.stringify({ error: "Prázdny katalóg cvikov" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modeLabel =
      mode === "gym" ? "posilňovňa (stroje a činky)" : mode === "pomocky" ? "doma s pomôckami (činky, expandery)" : "doma bez pomôcok (vlastná váha)";

    const band = ageBand === "kids" || ageBand === "teens" ? ageBand : "adult";
    const bandRules =
      band === "kids"
        ? [
            "Cvičenec má 12 rokov alebo menej: IBA vlastná váha a ľahké pomôcky, žiadna externá záťaž.",
            "Vyšší počet opakovaní (12-20) a menej sérií (2-3), dôraz na správnu techniku a hravosť.",
            "suggestedWeightKg vždy 0.",
          ]
        : band === "teens"
        ? [
            "Cvičenec má 13-15 rokov: technika a stredná záťaž, žiadne maximálky a žiadne ťažké osi.",
            "Opakovania 10-15, série 3, záťaž ľahká až stredná.",
            "suggestedWeightKg navrhni opatrne a nízko (max ~30 % telesnej hmotnosti pri veľkých cvikoch).",
          ]
        : [
            "Cvičenec má 16+ rokov: plný rozsah cvikov, série a opakovania podľa cieľa.",
            "suggestedWeightKg odhadni podľa telesnej hmotnosti, cieľa a typu cviku.",
          ];

    const system = [
      "Si skúsený kondičný tréner karatistov (klub KK SEIKEN).",
      "Zostavuješ bezpečný tréningový plán pre konkrétneho športovca.",
      "Vyberáš IBA cviky z dodaného katalógu a vraciaš ich presné id.",
      "Plán vždy prispôsobíš veku, výške a hmotnosti športovca.",
      ...bandRules,
      "Pri vyššej telesnej hmotnosti sa vyhni nárazovým a skokovým cvikom.",
      "Odpovedz IBA platným JSON objektom bez markdownu.",
    ].join(" ");

    const user = `Športovec: ${JSON.stringify(profile)}
Veková kategória: ${band === "kids" ? "do 12 rokov" : band === "teens" ? "13-15 rokov" : "16 a viac rokov"}
Prostredie: ${modeLabel}
Cieľ: ${goal}
Dĺžka tréningu: ${duration} minút
Frekvencia: ${days}x týždenne
Preferované partie: ${Array.isArray(groups) && groups.length ? groups.join(", ") : "vyváženo celé telo"}

Katalóg dostupných cvikov (vyber iba z týchto id):
${catalog.map((c: any) => `${c.id} | ${c.name} | ${c.group} | ${c.equipment}`).join("\n")}

Vráť JSON v tvare:
{"title":"krátky názov tréningu po slovensky","adaptation":"1 veta ako je plán prispôsobený veku, výške a váhe","warmup":["3-5 bodov rozcvičky"],"exercises":[{"id":"id_z_katalogu","sets":3,"reps":10,"suggestedWeightKg":0}],"stretch":["3-4 body strečingu"],"note":"1-2 vety odporúčania"}
suggestedWeightKg je orientačná záťaž v kg na jednu sériu; pri cvikoch s vlastnou váhou daj 0. Počet cvikov prispôsob dĺžke tréningu (cca 1 cvik na 6-8 minút, min 4, max 9). Všetok text po slovensky.`;


    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `AI ${res.status}: ${txt.slice(0, 300)}` }), {
        status: res.status === 429 || res.status === 402 ? res.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    const valid = new Set(catalog.map((c: any) => c.id));
    parsed.exercises = (parsed.exercises ?? []).filter((e: any) => valid.has(e?.id)).slice(0, 9);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
