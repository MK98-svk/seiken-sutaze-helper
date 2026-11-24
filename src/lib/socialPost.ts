export interface PostIndividual { name: string; surname: string; placement: number | null }
export interface PostTeam { discipline: string; members: string; placement: number | null }
export interface PostInput {
  competitionName: string;
  dateLabel: string; // napr. "V sobotu 26. septembra"
  participants: number;
  individuals: PostIndividual[];
  teams: PostTeam[];
  platform: "fb" | "ig";
}

const MEDAL = ["", "🥇", "🥈", "🥉"];
const isMedal = (p: number | null): p is 1 | 2 | 3 => p === 1 || p === 2 || p === 3;

export function medalCounts(individuals: PostIndividual[]) {
  const c = { gold: 0, silver: 0, bronze: 0 };
  for (const i of individuals) {
    if (i.placement === 1) c.gold++;
    else if (i.placement === 2) c.silver++;
    else if (i.placement === 3) c.bronze++;
  }
  return c;
}

const collator = new Intl.Collator("sk");

export function buildSocialPost(input: PostInput): string {
  const { gold, silver, bronze } = medalCounts(input.individuals);
  const byPerson = new Map<string, { surname: string; medals: number[] }>();
  for (const i of input.individuals) {
    if (!isMedal(i.placement)) continue;
    const key = `${i.name} ${i.surname}`;
    const e = byPerson.get(key) ?? { surname: i.surname, medals: [] };
    e.medals.push(i.placement);
    byPerson.set(key, e);
  }
  const people = [...byPerson.entries()]
    .sort((a, b) => collator.compare(a[1].surname, b[1].surname) || collator.compare(a[0], b[0]))
    .map(([n, e]) => `${n} – ${e.medals.sort().map((m) => MEDAL[m]).join("")}`);

  const teamLines = (kind: "kata" | "kumite") =>
    input.teams
      .filter((t) => isMedal(t.placement) && t.discipline.toLowerCase().includes(kind))
      .sort((a, b) => (a.placement ?? 9) - (b.placement ?? 9))
      .map((t) => `${MEDAL[t.placement as number]} ${t.members.split(/\s*,\s*/).join(" – ")}`);

  const sep = input.platform === "ig" ? "\n\n" : "\n";
  const blocks: string[] = [];
  blocks.push(`🥋🏆 MEDAILOVÁ ŽATVA – ${input.competitionName.toUpperCase()}! 🏆🥋`);
  blocks.push(`${input.dateLabel} sa naša ${input.participants}-členná výprava predstavila na súťaži ${input.competitionName} a naši karatisti opäť ukázali, že tvrdá práca na tréningoch prináša výsledky. 💪🥋`);
  if (gold + silver + bronze > 0) {
    blocks.push("V individuálnych kategóriách sme vybojovali fantastickú medailovú bilanciu:");
    blocks.push([`🥇 ${gold}× ZLATO`, `🥈 ${silver}× STRIEBRO`, `🥉 ${bronze}× BRONZ`].join("\n"));
    blocks.push("🏅 Individuálne výsledky:");
    blocks.push(people.join("\n"));
  }
  const kata = teamLines("kata");
  if (kata.length) { blocks.push("👥 KATA TEAM"); blocks.push(kata.join("\n")); }
  const kumite = teamLines("kumite");
  if (kumite.length) { blocks.push("👊 KUMITE TEAM"); blocks.push(kumite.join("\n")); }
  blocks.push("👏 Všetkým našim súťažiacim ďakujeme za skvelú reprezentáciu klubu a gratulujeme k výborným výkonom a získaným medailám! Každý štart, každý zápas aj každá kata sú ďalšou skúsenosťou a krokom vpred.");
  blocks.push("Veľké poďakovanie patrí aj našim coachom, ktorí boli počas celého dňa súťažiacim oporou, radili im a pomáhali podať čo najlepší výkon. 🙌");
  blocks.push("⚖️ Zabudnúť nemôžeme ani na rozhodcov z nášho klubu – ďakujeme za ich nasadenie a profesionálne a spravodlivé rozhodovanie.");
  if (input.platform === "ig") {
    blocks.push("Ďakujeme @slovakfederationofkarate za organizáciu súťaže a mestskej časti @petrzalkasportuje za podporu. ❤️");
    blocks.push("SEIKEN – jeden tím, jeden cieľ! 🥋🔥");
  } else {
    blocks.push("Ďakujeme Slovenská Federácia Karate - oficiálna stránka za organizáciu súťaže. ❤️");
    blocks.push("SEIKEN – jeden tím, jeden cieľ! 🥋🔥");
    blocks.push("Účasť na tejto súťaži bola s finančnou podporou Mestskej časti Bratislava - Petržalka.");
  }
  return blocks.join(sep);
}
