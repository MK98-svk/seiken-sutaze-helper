// Katalóg cvikov (1300+) s animáciami a slovenskými popismi.
// Dáta sa načítavajú z /data/*.json (nie sú v bundli).

export type CatalogExercise = {
  id: string;
  name: string;
  target: string;
  secondary: string[];
  bodyPart: string;
  equipment: string;
  steps: string[];
  image: string;
  gif: string;
};

export const IMG = (path: string) =>
  `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${path}`;

export type CatalogGroup = { id: string; name: string; icon: string; muscles: string[] };

export const CATALOG_GROUPS: CatalogGroup[] = [
  { id: "chest", name: "Hrudník", icon: "🫁", muscles: ["pectorals", "serratus anterior"] },
  { id: "back", name: "Chrbát", icon: "🔙", muscles: ["lats", "upper back", "traps", "spine", "levator scapulae"] },
  { id: "shoulders", name: "Ramená", icon: "💪", muscles: ["delts"] },
  { id: "biceps", name: "Biceps", icon: "🦾", muscles: ["biceps"] },
  { id: "triceps", name: "Triceps", icon: "🦿", muscles: ["triceps"] },
  { id: "forearms", name: "Predlaktia", icon: "✊", muscles: ["forearms"] },
  { id: "abs", name: "Brucho / core", icon: "🧱", muscles: ["abs"] },
  { id: "legs", name: "Nohy", icon: "🦵", muscles: ["quads", "hamstrings", "adductors", "abductors"] },
  { id: "glutes", name: "Zadok", icon: "🍑", muscles: ["glutes"] },
  { id: "calves", name: "Lýtka", icon: "🐾", muscles: ["calves"] },
  { id: "cardio", name: "Kardio", icon: "🏃", muscles: ["cardiovascular system"] },
];

export const getCatalogGroup = (id: string) => CATALOG_GROUPS.find((g) => g.id === id);

const SECONDARY_TO_GROUP: Record<string, string> = {
  chest: "chest",
  "upper chest": "chest",
  "serratus anterior": "chest",
  back: "back",
  lats: "back",
  "latissimus dorsi": "back",
  "upper back": "back",
  "lower back": "back",
  traps: "back",
  trapezius: "back",
  rhomboids: "back",
  shoulders: "shoulders",
  deltoids: "shoulders",
  "rear deltoids": "shoulders",
  "rotator cuff": "shoulders",
  biceps: "biceps",
  brachialis: "biceps",
  triceps: "triceps",
  forearms: "forearms",
  "wrist extensors": "forearms",
  "wrist flexors": "forearms",
  "grip muscles": "forearms",
  abdominals: "abs",
  core: "abs",
  obliques: "abs",
  "lower abs": "abs",
  quadriceps: "legs",
  hamstrings: "legs",
  "inner thighs": "legs",
  "hip flexors": "legs",
  groin: "legs",
  adductors: "legs",
  glutes: "glutes",
  calves: "calves",
  soleus: "calves",
};

export const EQUIPMENT_SK: Record<string, string> = {
  barbell: "Veľká činka",
  "olympic barbell": "Veľká činka",
  "trap bar": "Trap tyč",
  "ez barbell": "EZ tyč",
  dumbbell: "Jednoručky",
  "body weight": "Vlastná váha",
  cable: "Kladka",
  "leverage machine": "Stroj",
  "sled machine": "Stroj",
  "smith machine": "Smith stroj",
  assisted: "Asistovaný",
  "medicine ball": "Medicinbal",
  "stability ball": "Fitlopta",
  "bosu ball": "Bosu",
  band: "Gumy",
  "resistance band": "Gumy",
  rope: "Lano",
  kettlebell: "Kettlebell",
  weighted: "So záťažou",
  roller: "Valec",
  "wheel roller": "Ab koliesko",
  "skierg machine": "SkiErg",
  "upper body ergometer": "Ergometer",
  "stationary bike": "Bicykel",
  "elliptical machine": "Eliptický trenažér",
  "stepmill machine": "Stepper",
  hammer: "Kladivo",
  tire: "Pneumatika",
};

export const equipmentLabel = (e: string) => EQUIPMENT_SK[e] ?? e;

export const MUSCLE_SK: Record<string, string> = {
  abs: "brucho",
  quads: "predné stehná",
  lats: "široký sval chrbta",
  calves: "lýtka",
  pectorals: "prsné svaly",
  glutes: "zadok",
  hamstrings: "zadné stehná",
  adductors: "priťahovače",
  triceps: "triceps",
  "cardiovascular system": "kardio",
  spine: "vzpriamovače chrbta",
  "upper back": "horný chrbát",
  biceps: "biceps",
  delts: "ramená",
  forearms: "predlaktia",
  traps: "trapézy",
  "serratus anterior": "pílovitý sval",
  abductors: "odťahovače",
  "levator scapulae": "šija",
  abdominals: "brucho",
  "ankle stabilizers": "stabilizátory členkov",
  ankles: "členky",
  back: "chrbát",
  brachialis: "brachialis",
  chest: "hrudník",
  core: "stred tela",
  deltoids: "ramená",
  feet: "chodidlá",
  "grip muscles": "úchop",
  groin: "slabiny",
  "hip flexors": "ohýbače bedier",
  "inner thighs": "vnútorné stehná",
  "latissimus dorsi": "široký sval chrbta",
  "lower abs": "spodné brucho",
  "lower back": "spodný chrbát",
  obliques: "šikmé brušné svaly",
  quadriceps: "predné stehná",
  "rear deltoids": "zadné ramená",
  rhomboids: "rombické svaly",
  "rotator cuff": "rotátorová manžeta",
  shins: "predkolenia",
  shoulders: "ramená",
  soleus: "lýtka",
  sternocleidomastoid: "krk",
  trapezius: "trapézy",
  "upper chest": "horný hrudník",
  "wrist extensors": "vystierače zápästia",
  "wrist flexors": "ohýbače zápästia",
  wrists: "zápästia",
};

export const muscleLabel = (m: string) => MUSCLE_SK[m] ?? m;

// ── Kde sa dá cvik cvičiť ───────────────────────────────────────────
const HOME_EQUIPMENT = new Set([
  "body weight",
  "dumbbell",
  "band",
  "resistance band",
  "kettlebell",
  "medicine ball",
  "stability ball",
  "bosu ball",
  "roller",
  "wheel roller",
  "rope",
  "weighted",
  "ez barbell",
]);

export type CatalogMode = "gym" | "pomocky" | "bezpomocok";

export function availableIn(ex: CatalogExercise, mode: CatalogMode) {
  if (mode === "gym") return true;
  if (mode === "pomocky") return HOME_EQUIPMENT.has(ex.equipment);
  return ex.equipment === "body weight" || ex.equipment === "assisted";
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const SK_PHRASES: [RegExp, string][] = [
  [/mrtvy(mi|ch|m)? tah\w*/g, "deadlift"],
  [/bicepsov\w+ zdvih\w*/g, "curl"],
  [/francuzsk\w+ tlak\w*/g, "triceps extension"],
  [/tlak\w* na hrudnik\w*/g, "bench press"],
];

const SK_SYNONYMS: Record<string, string> = {
  drep: "squat",
  drepy: "squat",
  drepov: "squat",
  vypad: "lunge",
  vypady: "lunge",
  kluk: "push-up",
  kluky: "push-up",
  klik: "push-up",
  kliky: "push-up",
  zhyb: "pull-up",
  zhyby: "pull-up",
  pritah: "row",
  pritahy: "row",
  veslovanie: "row",
  tlak: "press",
  tlaky: "press",
  vypon: "calf raise",
  vypony: "calf raise",
  sklapacky: "sit-up",
  brusaky: "crunch",
  skracovacky: "crunch",
  krcenie: "shrug",
  zdvih: "raise",
  zdvihy: "raise",
  mostik: "bridge",
  upazovanie: "lateral raise",
  predpazovanie: "front raise",
  plank: "plank",
  planky: "plank",
};

export class Catalog {
  readonly exercises: CatalogExercise[];
  private byId: Map<string, CatalogExercise>;
  private haystack: Map<string, string>;
  private skSteps: Record<string, string[]>;

  constructor(exercises: CatalogExercise[], skSteps: Record<string, string[]>) {
    this.exercises = exercises;
    this.skSteps = skSteps;
    this.byId = new Map(exercises.map((e) => [e.id, e]));
    this.haystack = new Map(
      exercises.map((e) => {
        const g = this.groupOf(e);
        return [e.id, norm(`${e.name} ${g?.name ?? ""} ${muscleLabel(e.target)} ${equipmentLabel(e.equipment)}`)];
      })
    );
  }

  get(id: string) {
    return this.byId.get(id);
  }

  steps(ex: CatalogExercise) {
    return this.skSteps[ex.id] ?? ex.steps;
  }

  groupOf(ex: CatalogExercise) {
    return CATALOG_GROUPS.find((g) => g.muscles.includes(ex.target));
  }

  isPrimaryIn(ex: CatalogExercise, g: CatalogGroup) {
    return g.muscles.includes(ex.target);
  }

  inGroup(g: CatalogGroup, mode?: CatalogMode) {
    return this.exercises.filter(
      (e) =>
        (!mode || availableIn(e, mode)) &&
        (this.isPrimaryIn(e, g) || e.secondary.some((m) => SECONDARY_TO_GROUP[m] === g.id))
    );
  }

  search(q: string, mode?: CatalogMode): CatalogExercise[] {
    let text = norm(q);
    for (const [re, en] of SK_PHRASES) text = text.replace(re, en);
    const tokens = text
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .flatMap((t) => (SK_SYNONYMS[t] ?? t).split(" "));
    if (tokens.length === 0) return [];
    return this.exercises.filter((e) => {
      if (mode && !availableIn(e, mode)) return false;
      const hay = this.haystack.get(e.id)!;
      return tokens.every((t) => hay.includes(t));
    });
  }
}

export const CATALOG_ATTRIBUTION = "Animácie © Gym Visual · dataset exercises-dataset";
