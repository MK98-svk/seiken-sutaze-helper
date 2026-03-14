/**
 * Competition categories for Slovak karate competitions.
 * Parsed from official category list (2026).
 * Individual categories + KATA RENGO OPEN (no team KS/KT, no inclusive IN).
 */

export interface CompetitionCategory {
  code: string;
  name: string;
  discipline: "kata" | "kumite" | "kobudo";
  gender: "CH" | "D"; // CH = chlapci/muži, D = dievčatá/ženy
  ageMin: number | null; // null = no minimum
  ageMax: number | null; // null = no maximum
  rankMin: number | null; // numeric rank (higher = better), null = no restriction
  rankMax: number | null; // numeric rank, null = no restriction
  weightMin: number | null; // kg, null = no restriction
  weightMax: number | null;
  heightMin: number | null; // cm, null = no restriction
  heightMax: number | null;
  subtype?: string; // e.g. "LONG", "SHORT" for kobudo
}

/**
 * Convert stupen string to numeric rank.
 * Higher number = higher/better rank.
 * "10. kyu" = 1, "9. kyu" = 2, ..., "1. kyu" = 10, "1. dan" = 11, ...
 */
export function parseRank(stupen: string): number | null {
  if (!stupen) return null;
  const match = stupen.match(/(\d+)\.\s*(kyu|dan)/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const type = match[2].toLowerCase();
  if (type === "kyu") return 11 - num; // 10kyu=1, 9kyu=2, ..., 1kyu=10
  if (type === "dan") return 10 + num; // 1dan=11, 2dan=12, ...
  return null;
}

/**
 * Calculate age based on birth date and reference year.
 * In Slovak karate, age = year of competition - year of birth.
 */
export function calculateAge(datumNarodenia: string, competitionYear: number): number | null {
  if (!datumNarodenia) return null;
  // Parse date parts directly to avoid UTC timezone shift issues
  const parts = datumNarodenia.split("-");
  const birthYear = parts.length >= 1 ? parseInt(parts[0], 10) : NaN;
  if (isNaN(birthYear)) return null;
  return competitionYear - birthYear;
}

/**
 * Filter categories that match a member's attributes.
 */
export function getEligibleCategories(
  categories: CompetitionCategory[],
  member: {
    pohlavie?: string | null;
    datumNarodenia?: string;
    stupen?: string;
    vyska?: number | null;
    vaha?: number | null;
  },
  discipline: string,
  competitionYear: number
): CompetitionCategory[] {
  const age = member.datumNarodenia ? calculateAge(member.datumNarodenia, competitionYear) : null;
  const rank = member.stupen ? parseRank(member.stupen) : null;
  const gender = member.pohlavie || null;

  return categories.filter((cat) => {
    // Filter by discipline
    if (cat.discipline !== discipline) return false;

    // Filter by gender (if member has gender set)
    if (gender && cat.gender !== gender) return false;

    // Filter by age
    if (age !== null) {
      if (cat.ageMin !== null && age < cat.ageMin) return false;
      if (cat.ageMax !== null && age > cat.ageMax) return false;
    }

    // Filter by rank (for kata)
    if (rank !== null) {
      if (cat.rankMin !== null && rank < cat.rankMin) return false;
      if (cat.rankMax !== null && rank > cat.rankMax) return false;
    }

    // Filter by weight (for kumite)
    if (member.vaha !== null && member.vaha !== undefined) {
      if (cat.weightMax !== null && member.vaha > cat.weightMax) return false;
      // For "+X kg" categories, weightMin is set
      if (cat.weightMin !== null && member.vaha < cat.weightMin) return false;
    }

    // Filter by height (for kumite)
    if (member.vyska !== null && member.vyska !== undefined) {
      if (cat.heightMax !== null && member.vyska > cat.heightMax) return false;
      if (cat.heightMin !== null && member.vyska < cat.heightMin) return false;
    }

    return true;
  });
}

// ─── KATA GOJU categories ─────────────────────────────

const KATA_CATEGORIES: CompetitionCategory[] = [
  // === CHLAPCI (CH) ===
  { code: "KA01", name: "KATA GOJU do 6 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: null, ageMax: 6, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA02", name: "KATA GOJU 7 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 7, ageMax: 7, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA03", name: "KATA GOJU 8 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 8, ageMax: 8, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 9 rokov - split by kyu
  { code: "KA04", name: "KATA GOJU 9 rokov 9.-7.KYU CH", discipline: "kata", gender: "CH", ageMin: 9, ageMax: 9, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA05", name: "KATA GOJU 9 rokov 6.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 9, ageMax: 9, rankMin: 5, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 10 rokov
  { code: "KA06", name: "KATA GOJU 10 rokov 9.-7.KYU CH", discipline: "kata", gender: "CH", ageMin: 10, ageMax: 10, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA07a", name: "KATA GOJU 10 rokov 6.-4.KYU CH", discipline: "kata", gender: "CH", ageMin: 10, ageMax: 10, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA07b", name: "KATA GOJU 10 rokov 3.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 10, ageMax: 10, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 11 rokov
  { code: "KA08", name: "KATA GOJU 11 rokov 9.-7.KYU CH", discipline: "kata", gender: "CH", ageMin: 11, ageMax: 11, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA09a", name: "KATA GOJU 11 rokov 6.-4.KYU CH", discipline: "kata", gender: "CH", ageMin: 11, ageMax: 11, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA09b", name: "KATA GOJU 11 rokov 3.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 11, ageMax: 11, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 12 rokov
  { code: "KA10", name: "KATA GOJU 12 rokov 9.-7.KYU CH", discipline: "kata", gender: "CH", ageMin: 12, ageMax: 12, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA11a", name: "KATA GOJU 12 rokov 6.-4.KYU CH", discipline: "kata", gender: "CH", ageMin: 12, ageMax: 12, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA11b", name: "KATA GOJU 12 rokov 3.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 12, ageMax: 12, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 13 rokov
  { code: "KA12", name: "KATA GOJU 13 rokov 9.-7.KYU CH", discipline: "kata", gender: "CH", ageMin: 13, ageMax: 13, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA13a", name: "KATA GOJU 13 rokov 6.-4.KYU CH", discipline: "kata", gender: "CH", ageMin: 13, ageMax: 13, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA13b", name: "KATA GOJU 13 rokov 3.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 13, ageMax: 13, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 14-15 rokov
  { code: "KA14", name: "KATA GOJU 14-15 rokov 9.-5.KYU CH", discipline: "kata", gender: "CH", ageMin: 14, ageMax: 15, rankMin: 2, rankMax: 6, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA15", name: "KATA GOJU 14-15 rokov 4.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 14, ageMax: 15, rankMin: 7, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 16-17 rokov
  { code: "KA16", name: "KATA GOJU 16-17 rokov 9.-5.KYU CH", discipline: "kata", gender: "CH", ageMin: 16, ageMax: 17, rankMin: 2, rankMax: 6, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA17", name: "KATA GOJU 16-17 rokov 4.KYU+ CH", discipline: "kata", gender: "CH", ageMin: 16, ageMax: 17, rankMin: 7, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // Adults
  { code: "KA18", name: "KATA GOJU 18-20 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA19", name: "KATA GOJU 21-35 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA20", name: "KATA GOJU 36-40 rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 36, ageMax: 40, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA21", name: "KATA GOJU 41+ rokov OPEN CH", discipline: "kata", gender: "CH", ageMin: 41, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },

  // === DIEVČATÁ (D) ===
  { code: "KA22", name: "KATA GOJU do 6 rokov OPEN D", discipline: "kata", gender: "D", ageMin: null, ageMax: 6, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA23", name: "KATA GOJU 7 rokov OPEN D", discipline: "kata", gender: "D", ageMin: 7, ageMax: 7, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA24", name: "KATA GOJU 8 rokov OPEN D", discipline: "kata", gender: "D", ageMin: 8, ageMax: 8, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA25", name: "KATA GOJU 9 rokov 9.-7.KYU D", discipline: "kata", gender: "D", ageMin: 9, ageMax: 9, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA26", name: "KATA GOJU 9 rokov 6.KYU+ D", discipline: "kata", gender: "D", ageMin: 9, ageMax: 9, rankMin: 5, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA27", name: "KATA GOJU 10 rokov 9.-7.KYU D", discipline: "kata", gender: "D", ageMin: 10, ageMax: 10, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA28a", name: "KATA GOJU 10 rokov 6.-4.KYU D", discipline: "kata", gender: "D", ageMin: 10, ageMax: 10, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA28b", name: "KATA GOJU 10 rokov 3.KYU+ D", discipline: "kata", gender: "D", ageMin: 10, ageMax: 10, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA29", name: "KATA GOJU 11 rokov 9.-7.KYU D", discipline: "kata", gender: "D", ageMin: 11, ageMax: 11, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA30a", name: "KATA GOJU 11 rokov 6.-4.KYU D", discipline: "kata", gender: "D", ageMin: 11, ageMax: 11, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA30b", name: "KATA GOJU 11 rokov 3.KYU+ D", discipline: "kata", gender: "D", ageMin: 11, ageMax: 11, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA31", name: "KATA GOJU 12 rokov 9.-7.KYU D", discipline: "kata", gender: "D", ageMin: 12, ageMax: 12, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA32a", name: "KATA GOJU 12 rokov 6.-4.KYU D", discipline: "kata", gender: "D", ageMin: 12, ageMax: 12, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA32b", name: "KATA GOJU 12 rokov 3.KYU+ D", discipline: "kata", gender: "D", ageMin: 12, ageMax: 12, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA33", name: "KATA GOJU 13 rokov 9.-7.KYU D", discipline: "kata", gender: "D", ageMin: 13, ageMax: 13, rankMin: 2, rankMax: 4, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA34a", name: "KATA GOJU 13 rokov 6.-4.KYU D", discipline: "kata", gender: "D", ageMin: 13, ageMax: 13, rankMin: 5, rankMax: 7, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA34b", name: "KATA GOJU 13 rokov 3.KYU+ D", discipline: "kata", gender: "D", ageMin: 13, ageMax: 13, rankMin: 8, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA35", name: "KATA GOJU 14-15 rokov 9.-5.KYU D", discipline: "kata", gender: "D", ageMin: 14, ageMax: 15, rankMin: 2, rankMax: 6, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA36", name: "KATA GOJU 14-15 rokov 4.KYU+ D", discipline: "kata", gender: "D", ageMin: 14, ageMax: 15, rankMin: 7, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA37", name: "KATA GOJU 16-17 rokov 9.-5.KYU D", discipline: "kata", gender: "D", ageMin: 16, ageMax: 17, rankMin: 2, rankMax: 6, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA38", name: "KATA GOJU 16-17 rokov 4.KYU+ D", discipline: "kata", gender: "D", ageMin: 16, ageMax: 17, rankMin: 7, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA39", name: "KATA GOJU 18-20 rokov OPEN D", discipline: "kata", gender: "D", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA40", name: "KATA GOJU 21-35 rokov OPEN D", discipline: "kata", gender: "D", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA41", name: "KATA GOJU 36-40 rokov OPEN D", discipline: "kata", gender: "D", ageMin: 36, ageMax: 40, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KA42", name: "KATA GOJU 41+ rokov OPEN D", discipline: "kata", gender: "D", ageMin: 41, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
];

// ─── KATA RENGO OPEN categories ───────────────────────

const KATA_RENGO_CATEGORIES: CompetitionCategory[] = [
  // CH
  { code: "KR01a", name: "KATA RENGO OPEN do 10 rokov CH", discipline: "kata", gender: "CH", ageMin: null, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR01b", name: "KATA RENGO OPEN 11-13 rokov CH", discipline: "kata", gender: "CH", ageMin: 11, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR02", name: "KATA RENGO OPEN 14-17 rokov CH", discipline: "kata", gender: "CH", ageMin: 14, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR03", name: "KATA RENGO OPEN 18+ rokov CH", discipline: "kata", gender: "CH", ageMin: 18, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  // D
  { code: "KR04a", name: "KATA RENGO OPEN do 10 rokov D", discipline: "kata", gender: "D", ageMin: null, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR04b", name: "KATA RENGO OPEN 11-13 rokov D", discipline: "kata", gender: "D", ageMin: 11, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR05", name: "KATA RENGO OPEN 14-17 rokov D", discipline: "kata", gender: "D", ageMin: 14, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
  { code: "KR06", name: "KATA RENGO OPEN 18+ rokov D", discipline: "kata", gender: "D", ageMin: 18, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "RENGO" },
];

// ─── KOBUDO categories ─────────────────────────────────

const KOBUDO_CATEGORIES: CompetitionCategory[] = [
  // CH
  { code: "KB01a", name: "KOBUDO do 10 rokov LONG CH", discipline: "kobudo", gender: "CH", ageMin: null, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB01b", name: "KOBUDO 11-13 rokov LONG CH", discipline: "kobudo", gender: "CH", ageMin: 11, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB02", name: "KOBUDO 14-17 rokov LONG CH", discipline: "kobudo", gender: "CH", ageMin: 14, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB03", name: "KOBUDO od 18 rokov LONG CH", discipline: "kobudo", gender: "CH", ageMin: 18, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB04", name: "KOBUDO SHORT CH", discipline: "kobudo", gender: "CH", ageMin: null, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "SHORT" },
  // D
  { code: "KB05a", name: "KOBUDO do 10 rokov LONG D", discipline: "kobudo", gender: "D", ageMin: null, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB05b", name: "KOBUDO 11-13 rokov LONG D", discipline: "kobudo", gender: "D", ageMin: 11, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB06", name: "KOBUDO 14-17 rokov LONG D", discipline: "kobudo", gender: "D", ageMin: 14, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB07", name: "KOBUDO od 18 rokov LONG D", discipline: "kobudo", gender: "D", ageMin: 18, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "LONG" },
  { code: "KB08", name: "KOBUDO SHORT D", discipline: "kobudo", gender: "D", ageMin: null, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null, subtype: "SHORT" },
];

// ─── KUMITE categories ─────────────────────────────────

const KUMITE_CATEGORIES: CompetitionCategory[] = [
  // === CHLAPCI (CH) ===
  { code: "KU01", name: "KUMITE do 6 rokov OPEN CH", discipline: "kumite", gender: "CH", ageMin: null, ageMax: 6, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU02", name: "KUMITE 7 rokov OPEN CH", discipline: "kumite", gender: "CH", ageMin: 7, ageMax: 7, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU03", name: "KUMITE 8 rokov OPEN CH", discipline: "kumite", gender: "CH", ageMin: 8, ageMax: 8, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU04", name: "KUMITE 9 rokov OPEN CH", discipline: "kumite", gender: "CH", ageMin: 9, ageMax: 9, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 10 rokov - by height
  { code: "KU05", name: "KUMITE 10 rokov do 145cm CH", discipline: "kumite", gender: "CH", ageMin: 10, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 145 },
  { code: "KU06", name: "KUMITE 10 rokov od 145cm CH", discipline: "kumite", gender: "CH", ageMin: 10, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 145, heightMax: null },
  // 11 rokov - by height
  { code: "KU07", name: "KUMITE 11 rokov do 150cm CH", discipline: "kumite", gender: "CH", ageMin: 11, ageMax: 11, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 150 },
  { code: "KU08", name: "KUMITE 11 rokov od 150cm CH", discipline: "kumite", gender: "CH", ageMin: 11, ageMax: 11, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 150, heightMax: null },
  // 12 rokov - by height
  { code: "KU09", name: "KUMITE 12 rokov do 155cm CH", discipline: "kumite", gender: "CH", ageMin: 12, ageMax: 12, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 155 },
  { code: "KU10", name: "KUMITE 12 rokov od 155cm CH", discipline: "kumite", gender: "CH", ageMin: 12, ageMax: 12, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 155, heightMax: null },
  // 13 rokov - by weight
  { code: "KU11a", name: "KUMITE 13 rokov do 45kg CH", discipline: "kumite", gender: "CH", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: 45, heightMin: null, heightMax: null },
  { code: "KU11b", name: "KUMITE 13 rokov do 55kg CH", discipline: "kumite", gender: "CH", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: 45, weightMax: 55, heightMin: null, heightMax: null },
  { code: "KU12", name: "KUMITE 13 rokov nad 55kg CH", discipline: "kumite", gender: "CH", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: 55, weightMax: null, heightMin: null, heightMax: null },
  // 14-15 rokov - by weight
  { code: "KU13a", name: "KUMITE 14-15 rokov -55kg CH", discipline: "kumite", gender: "CH", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: null, weightMax: 55, heightMin: null, heightMax: null },
  { code: "KU13b", name: "KUMITE 14-15 rokov -65kg CH", discipline: "kumite", gender: "CH", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: 55, weightMax: 65, heightMin: null, heightMax: null },
  { code: "KU14", name: "KUMITE 14-15 rokov +65kg CH", discipline: "kumite", gender: "CH", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: 65, weightMax: null, heightMin: null, heightMax: null },
  // 16-17 rokov
  { code: "KU15", name: "KUMITE 16-17 rokov -65kg CH", discipline: "kumite", gender: "CH", ageMin: 16, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: 65, heightMin: null, heightMax: null },
  { code: "KU16", name: "KUMITE 16-17 rokov +65kg CH", discipline: "kumite", gender: "CH", ageMin: 16, ageMax: 17, rankMin: null, rankMax: null, weightMin: 65, weightMax: null, heightMin: null, heightMax: null },
  // 18-20
  { code: "KU17", name: "KUMITE 18-20 rokov -75kg CH", discipline: "kumite", gender: "CH", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: null, weightMax: 75, heightMin: null, heightMax: null },
  { code: "KU18", name: "KUMITE 18-20 rokov +75kg CH", discipline: "kumite", gender: "CH", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: 75, weightMax: null, heightMin: null, heightMax: null },
  // 21-35
  { code: "KU19", name: "KUMITE 21-35 rokov -75kg CH", discipline: "kumite", gender: "CH", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: null, weightMax: 75, heightMin: null, heightMax: null },
  { code: "KU20", name: "KUMITE 21-35 rokov +75kg CH", discipline: "kumite", gender: "CH", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: 75, weightMax: null, heightMin: null, heightMax: null },
  // 36+
  { code: "KU21", name: "KUMITE 36+ rokov OPEN CH", discipline: "kumite", gender: "CH", ageMin: 36, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },

  // === DIEVČATÁ (D) ===
  { code: "KU22", name: "KUMITE do 6 rokov OPEN D", discipline: "kumite", gender: "D", ageMin: null, ageMax: 6, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU23", name: "KUMITE 7 rokov OPEN D", discipline: "kumite", gender: "D", ageMin: 7, ageMax: 7, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU24", name: "KUMITE 8 rokov OPEN D", discipline: "kumite", gender: "D", ageMin: 8, ageMax: 8, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  { code: "KU25", name: "KUMITE 9 rokov OPEN D", discipline: "kumite", gender: "D", ageMin: 9, ageMax: 9, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
  // 10 rokov - by height
  { code: "KU26", name: "KUMITE 10 rokov do 145cm D", discipline: "kumite", gender: "D", ageMin: 10, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 145 },
  { code: "KU27", name: "KUMITE 10 rokov od 145cm D", discipline: "kumite", gender: "D", ageMin: 10, ageMax: 10, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 145, heightMax: null },
  // 11 rokov
  { code: "KU28", name: "KUMITE 11 rokov do 150cm D", discipline: "kumite", gender: "D", ageMin: 11, ageMax: 11, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 150 },
  { code: "KU29", name: "KUMITE 11 rokov od 150cm D", discipline: "kumite", gender: "D", ageMin: 11, ageMax: 11, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 150, heightMax: null },
  // 12 rokov
  { code: "KU30", name: "KUMITE 12 rokov do 155cm D", discipline: "kumite", gender: "D", ageMin: 12, ageMax: 12, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: 155 },
  { code: "KU31", name: "KUMITE 12 rokov od 155cm D", discipline: "kumite", gender: "D", ageMin: 12, ageMax: 12, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: 155, heightMax: null },
  // 13 rokov
  { code: "KU32a", name: "KUMITE 13 rokov -50kg D", discipline: "kumite", gender: "D", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: null, weightMax: 50, heightMin: null, heightMax: null },
  { code: "KU32b", name: "KUMITE 13 rokov -55kg D", discipline: "kumite", gender: "D", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: 50, weightMax: 55, heightMin: null, heightMax: null },
  { code: "KU33", name: "KUMITE 13 rokov +55kg D", discipline: "kumite", gender: "D", ageMin: 13, ageMax: 13, rankMin: null, rankMax: null, weightMin: 55, weightMax: null, heightMin: null, heightMax: null },
  // 14-15 rokov
  { code: "KU34a", name: "KUMITE 14-15 rokov -55kg D", discipline: "kumite", gender: "D", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: null, weightMax: 55, heightMin: null, heightMax: null },
  { code: "KU34b", name: "KUMITE 14-15 rokov -60kg D", discipline: "kumite", gender: "D", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: 55, weightMax: 60, heightMin: null, heightMax: null },
  { code: "KU35", name: "KUMITE 14-15 rokov +60kg D", discipline: "kumite", gender: "D", ageMin: 14, ageMax: 15, rankMin: null, rankMax: null, weightMin: 60, weightMax: null, heightMin: null, heightMax: null },
  // 16-17
  { code: "KU36", name: "KUMITE 16-17 rokov -60kg D", discipline: "kumite", gender: "D", ageMin: 16, ageMax: 17, rankMin: null, rankMax: null, weightMin: null, weightMax: 60, heightMin: null, heightMax: null },
  { code: "KU37", name: "KUMITE 16-17 rokov +60kg D", discipline: "kumite", gender: "D", ageMin: 16, ageMax: 17, rankMin: null, rankMax: null, weightMin: 60, weightMax: null, heightMin: null, heightMax: null },
  // 18-20
  { code: "KU38", name: "KUMITE 18-20 rokov -65kg D", discipline: "kumite", gender: "D", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: null, weightMax: 65, heightMin: null, heightMax: null },
  { code: "KU39", name: "KUMITE 18-20 rokov +65kg D", discipline: "kumite", gender: "D", ageMin: 18, ageMax: 20, rankMin: null, rankMax: null, weightMin: 65, weightMax: null, heightMin: null, heightMax: null },
  // 21-35
  { code: "KU40", name: "KUMITE 21-35 rokov -65kg D", discipline: "kumite", gender: "D", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: null, weightMax: 65, heightMin: null, heightMax: null },
  { code: "KU41", name: "KUMITE 21-35 rokov +65kg D", discipline: "kumite", gender: "D", ageMin: 21, ageMax: 35, rankMin: null, rankMax: null, weightMin: 65, weightMax: null, heightMin: null, heightMax: null },
  // 36+
  { code: "KU42", name: "KUMITE 36+ rokov OPEN D", discipline: "kumite", gender: "D", ageMin: 36, ageMax: null, rankMin: null, rankMax: null, weightMin: null, weightMax: null, heightMin: null, heightMax: null },
];

export const ALL_INDIVIDUAL_CATEGORIES: CompetitionCategory[] = [
  ...KATA_CATEGORIES,
  ...KATA_RENGO_CATEGORIES,
  ...KOBUDO_CATEGORIES,
  ...KUMITE_CATEGORIES,
];
