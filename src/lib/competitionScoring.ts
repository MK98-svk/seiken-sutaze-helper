/**
 * Competition scoring tiers based on competition name/type.
 *
 * Tier 0 – Začiatočnícke (Rovné Cup, …): 0.5 / 1 / 1.5
 * Tier 1 – Slovak domestic (pohár, kolo SP, …): 1 / 2 / 3
 * Tier 2 – International (WUKF, open, cup except Rovné Cup): 1.5 / 2.5 / 3.5
 * Tier 3 – ME WUKF (European Championships): 2 / 3 / 4
 * Tier 4 – MS WUKF (World Championships): 2.5 / 3.5 / 4.5
 */

export interface ScoringTier {
  label: string;
  bronze: number;
  silver: number;
  gold: number;
}

export const SCORING_TIERS: Record<string, ScoringTier> = {
  beginner: { label: "Začiatočnícke súťaže", bronze: 0.5, silver: 1, gold: 1.5 },
  domestic: { label: "Slovenské súťaže", bronze: 1, silver: 2, gold: 3 },
  international: { label: "Medzinárodné súťaže", bronze: 1.5, silver: 2.5, gold: 3.5 },
  me_wukf: { label: "ME WUKF", bronze: 2, silver: 3, gold: 4 },
  ms_wukf: { label: "MS WUKF", bronze: 2.5, silver: 3.5, gold: 4.5 },
};

export function getCompetitionTier(competitionName: string): keyof typeof SCORING_TIERS {
  const name = competitionName.toLowerCase().trim();

  // MS WUKF – World Championships (must check before generic WUKF)
  if (name.includes("ms") && name.includes("wukf")) return "ms_wukf";

  // ME WUKF – European Championships
  if (name.includes("me") && name.includes("wukf")) return "me_wukf";

  // Beginner: Rovné Cup (must check before generic cup)
  if (name.includes("rovné") || name.includes("rovne")) return "beginner";

  // International: WUKF, open, or cup
  if (name.includes("wukf")) return "international";
  if (name.includes("open")) return "international";
  if (name.includes("cup")) return "international";

  // Everything else is domestic
  return "domestic";
}

export function getPlacementScore(placement: number | null, competitionName: string): number {
  if (!placement || placement < 1 || placement > 3) return 0;
  const tier = SCORING_TIERS[getCompetitionTier(competitionName)];
  if (placement === 1) return tier.gold;
  if (placement === 2) return tier.silver;
  return tier.bronze;
}
