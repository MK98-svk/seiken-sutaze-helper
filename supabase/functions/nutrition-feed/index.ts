import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const FEED_URL =
  "https://feeds.mergado.com/zdravy-svet-heureka-sk-produktovy-sk-6f606332e78edfcf61449c60180b1dd3.xml";

const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hodín

type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  url: string;
  price: number | null;
  manufacturer: string;
  ean: string;
  category: string;
};

let cache: { at: number; data: Product[] } | null = null;

const CATEGORY_RULES: { id: string; label: string; keywords: RegExp }[] = [
  
  { id: "deti", label: "Pre deti", keywords: /pre deti|for kids|kids|bejby|baby|imuníček|detsk/i },
  { id: "probiotika", label: "Probiotiká a trávenie", keywords: /probiot|postbiot|microbiome|enzy|dao|diaminooxid|trávenie|zeolit|biooral|črev/i },
  { id: "omega", label: "Omega 3 a oleje", keywords: /omega|rybí olej|krill|olivov|evo²|olej/i },
  { id: "huby", label: "Medicinálne huby", keywords: /čaga|caga|reishi|cordyceps|lions ?mane|mushroom|hlivа|medicinálne huby/i },
  { id: "sport", label: "Šport a energia", keywords: /creatin|kreatín|elektrolyt|electrolyt|kolagén|collagen|vollagen|aminokyselin|protein|proteín|energia|warrior|forever strong|forever drink|magnézium|magnesium|mg2/i },
  { id: "krasa", label: "Vlasy, pleť a krása", keywords: /hair|beard|beauty|skin|pleť|vlasy|ceramid|peptid|krás/i },
  { id: "spanok", label: "Spánok a regenerácia", keywords: /sleep|spánok|ashwagandha|relax|mental|forever mind|stres/i },
  { id: "imunita", label: "Imunita", keywords: /imunit|imuni|dýchacie cesty|guardian|obranyschopn/i },
  { id: "longevity", label: "Longevity a antioxidanty", keywords: /nad\+|spermidin|fisetin|resveratrol|sulforaphane|glutatión|antioxidant|longevity|genome|anti ?age|forever young|berberin|q10|conquer|kurkumín|moringa|chlorella|spirulina|jačmeň|greens/i },
  { id: "vitaminy", label: "Vitamíny a minerály", keywords: /vitamín|vitamin|multivitamín|minerál|zinok|selén|železo|iron|jód|horčík|vápnik|acerola|b12|d3|k2|kyselina listová|osteo|soľ/i },
];

const OTHER = { id: "ostatne", label: "Ostatné" };

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]).trim() : "";
}

function stripHtml(html: string): string {
  return decode(
    html
      .replace(/<\s*(br|\/p|\/div|\/li|\/tr)\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function categorize(name: string, subtitle: string, description: string): string {
  const primary = `${name} ${subtitle}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(primary)) return rule.id;
  }
  const secondary = description.slice(0, 300);
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(secondary)) return rule.id;
  }
  return OTHER.id;
}

// Produkty, ktoré sa už nepredávajú a nemajú sa zobrazovať
const EXCLUDED = [
  /omega\s*(&|a)\s*bejby/i,
  /\d\s*\+\s*\d/, // 1+1, 2+1, 3+1 balíčky
  /balíček/i,
  /shotbox/i,
  /zdarma/i,
];

function parseFeed(xml: string): Product[] {
  const items = xml.match(/<SHOPITEM>[\s\S]*?<\/SHOPITEM>/gi) ?? [];
  const products: Product[] = [];
  for (const raw of items) {
    const name = tag(raw, "PRODUCTNAME") || tag(raw, "PRODUCT");
    if (!name) continue;
    if (EXCLUDED.some((re) => re.test(name))) continue;
    const subtitle = tag(raw, "custom_label_0");
    const description = stripHtml(tag(raw, "DESCRIPTION"));
    const priceRaw = tag(raw, "PRICE_VAT").replace(",", ".");
    const price = priceRaw ? Number(priceRaw) : null;
    products.push({
      id: tag(raw, "ITEM_ID") || name,
      name,
      subtitle,
      description,
      imageUrl: tag(raw, "IMGURL"),
      url: tag(raw, "URL"),
      price: price !== null && Number.isFinite(price) ? price : null,
      manufacturer: tag(raw, "MANUFACTURER"),
      ean: tag(raw, "EAN"),
      category: categorize(name, subtitle, description),
    });
  }
  return products;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const categories = [...CATEGORY_RULES.map((c) => ({ id: c.id, label: c.label })), OTHER];

    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ products: cache.data, categories, cached: true });
    }

    const res = await fetch(FEED_URL, { headers: { "User-Agent": "KK-SEIKEN-app/1.0" } });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Feed fetch failed [${res.status}]: ${text.slice(0, 300)}`);
      if (cache) return json({ products: cache.data, categories, cached: true, stale: true });
      return json({ error: "Nepodarilo sa načítať produktový feed", status: res.status }, 502);
    }

    const xml = await res.text();
    const products = parseFeed(xml);
    if (products.length === 0) {
      if (cache) return json({ products: cache.data, categories, cached: true, stale: true });
      return json({ error: "Feed neobsahuje žiadne produkty" }, 502);
    }

    cache = { at: Date.now(), data: products };
    return json({ products, categories, cached: false });
  } catch (e) {
    console.error("nutrition-feed error:", e);
    return json({ error: e instanceof Error ? e.message : "Neznáma chyba" }, 500);
  }
});
