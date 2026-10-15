import type { ActivityMotion, MotionFrame, MotionPose, MotionProp } from "./motionTypes";
import { MOTION_NOTE } from "./motionTypes";

// Explicit scenarios for strength activities; shared body-position primitives only.
const f = (label: string, a = 200, pose: MotionPose = "neutral", extra: Partial<MotionFrame> = {}): MotionFrame => ({ label, a, b: 340, pose, ...extra });
const prop = (kind: MotionProp["kind"], x: number, y: number, label?: string, secondary = false): MotionProp => ({ kind, x, y, label, secondary });
const m = (frames: MotionFrame[], options: Partial<Omit<ActivityMotion, "frames">> = {}): ActivityMotion => ({ note: MOTION_NOTE, frames, ...options });
const solo = { solo: true };
const front = { solo: true, view: "front" as const };
const medbal = [prop("ball", 232, 158, "MB")];
const medbalLow = [prop("ball", 232, 200, "MB")];
const medbalUp = [prop("ball", 200, 105, "MB")];
const expander = [prop("belt", 265, 150, "EXP")];

export const strengthActivityMotions: Record<string, ActivityMotion> = {
  "silovy-medicimbal-hod-z-hrude": m([
    f("Medicimbal pri hrudi, lakte pri tele", 165, "catch", { props: medbal }),
    f("Mierne znoženie, náhľad na partnera", 165, "guard", { props: medbalLow }),
    f("Vymrštenie z nôh a trupu, hod z hrude", 165, "punch", { props: [prop("ball", 245, 140, "MB")] }),
    f("Partner chytí a zmäkčí dopad", 165, "guard", { partnerPose: "catch", props: [prop("ball", 310, 150, "MB")] }),
    f("Partner podáva späť rovnakým spôsobom", 165, "guard", { partnerPose: "punch", props: [prop("ball", 285, 140, "MB")] }),
  ]),
  "silovy-medicimbal-vrh-ponad-hlavu": m([
    f("Stoj chrbtom k smeru vrhu, lopta pred telom", 200, "catch", { props: medbal }),
    f("Polodrep, lopta medzi nohy", 200, "lunge", { props: medbalLow }),
    f("Pružné natiahnutie tela", 200, "neutral", { props: medbal }),
    f("Vrh ponad hlavu dozadu", 200, "armsOpen", { props: [prop("ball", 165, 100, "MB")], cue: "VRH" }),
    f("Pokojne pre loptu zájsť, nie chytať za pochodu", 200, "walkBack"),
  ], solo),
  "silovy-medicimbal-rotacie": m([
    f("Dvojica chrbtom k sebe, lopta pri bruchu", 165, "catch", { props: medbal }),
    f("Rotácia trupu do strany, chodidlá na zemi", 165, "armsOpen", { props: [prop("ball", 255, 160, "MB")] }),
    f("Partner prevezme loptu opačnou rotáciou", 165, "neutral", { partnerPose: "catch", props: [prop("ball", 310, 160, "MB")] }),
    f("Partner podáva späť druhou stranou", 165, "neutral", { partnerPose: "armsOpen", props: [prop("ball", 290, 160, "MB")] }),
    f("Prevziať a pokračovať; po 8 zmeniť smer", 165, "catch", { props: medbal }),
  ], front),
  "silovy-medicimbal-drep-tlak": m([
    f("Postoj na šírku ramien, lopta pri hrudi", 200, "catch", { props: medbal }),
    f("Kontrolovaný polodrep, kolená v smere chodidiel", 200, "lunge", { props: medbalLow }),
    f("Vzpriamenie z nôh", 200, "neutral", { props: medbal }),
    f("Vytlačenie lopty nad hlavu", 200, "armsOpen", { props: medbalUp, cue: "HORE" }),
    f("Lopta späť k hrudi, ďalšie opakovanie", 200, "catch", { props: medbal }),
  ], solo),
  "silovy-expander-tah-pred-hrudnikom": m([
    f("Expander pred hrudníkom, dlaňami nadol", 200, "armsForward", { props: expander }),
    f("Pomalé rozťahovanie do strán", 200, "armsOpen", { props: [prop("belt", 290, 150, "EXP")] }),
    f("Dotyk hrudníka, lopatky k sebe", 200, "armsOpen", { props: [prop("belt", 300, 150, "EXP")], hold: 2, cue: "2 s" }),
    f("Pomalý návrat bez cuknutia", 200, "armsForward", { props: expander }),
    f("Ramená dole, rovnomerné tempo", 200, "neutral", { props: expander }),
  ], front),
  "silovy-expander-veslovanie": m([
    f("Ľahký predklon, expander napnutý vpredu", 165, "armsForward", { props: expander }),
    f("Ťah držadiel k pásu, lakte pozdĺž tela", 165, "guard", { props: expander, cue: "ŤAH" }),
    f("Lopatky k sebe, krátka výdrž", 165, "guard", { props: expander, hold: 2 }),
    f("Pomalý návrat vpred, trup napnutý", 165, "armsForward", { props: expander }),
    f("Chrbát rovný počas celej série", 165, "neutral", { props: expander }),
  ], solo),
  "silovy-expander-rotacia": m([
    f("Bokom ku kotveniu, ruky pri hrudi", 165, "guard", { props: expander }),
    f("Rotácia začína v nohách a bedrách", 165, "guard", { lane: 10, props: expander }),
    f("Vytlačenie rúk proti odporu", 165, "punch", { lane: 10, props: expander }),
    f("Kontrolovaný návrat, guma neťahá telo", 165, "guard", { props: expander }),
    f("Po sérii vystriedať stranu", 165, "guard", { facing: -1, props: expander }),
  ], solo),
  "silovy-expander-kliky": m([
    f("Poloha kliku, guma cez lopatky", 200, "bear", { props: expander }),
    f("Spustenie hrudníka k zemi, telo v línii", 200, "bear", { cue: "DOLE" }),
    f("Vytlačenie hore proti odporu", 200, "bear", { cue: "HORE" }),
    f("Rovnomerné tempo bez prepadnutia drieku", 200, "bear"),
    f("Dokončiť sériu, oddych v kľaku", 200, "neutral"),
  ], { ...solo, note: `${MOTION_NOTE} Klik je znázornený schematicky zboku; guma vedie cez lopatky, nikdy cez krk.` }),
  "silovy-vaha-doskoky": m([
    f("Mierny polodrep, ruky pripravené", 150, "lunge"),
    f("Krátky doskok vpred", 210, "walk", { cue: "DOSKOK" }),
    f("Mäkké pristátie na celej ploche chodidiel", 240, "lunge", { cue: "TICHO" }),
    f("Stabilizácia pred ďalším skokom", 240, "guard", { hold: 2 }),
    f("Po 5 doskokoch pokojný návrat", 150, "walkBack"),
  ], solo),
  "silovy-vaha-vypady": m([
    f("Vzpriamený stoj, ruky pred hrudníkom", 230, "neutral"),
    f("Široký krok do strany", 260, "walk"),
    f("Znoženie na krokovú nohu, druhá natiahnutá", 270, "lunge", { cue: "PÄTA NA ZEMI" }),
    f("Odraz späť do stredu", 230, "neutral"),
    f("Vystriedať stranu, trup vzpriamený", 190, "lunge", { facing: -1 }),
  ], front),
  "silovy-vaha-plank-dotyky": m([
    f("Plank, telo v jednej línii", 200, "bear"),
    f("Dotyk opačného ramena pravou rukou", 200, "bear", { cue: "DOTYK" }),
    f("Boky sa neotáčajú", 200, "bear", { hold: 2 }),
    f("Dotyk ľavou rukou, plynulý dych", 200, "bear", { cue: "DOTYK" }),
    f("Po 10 dotykoch oddych v kľaku", 200, "neutral"),
  ], solo),
  "silovy-vaha-mrtvy-chrobak": m([
    f("Lež na chrbte, ruky hore, kolená nad bedrami", 200, "neutral", { cue: "DRIEK NA ZEMI" }),
    f("Spustiť pravú ruku a ľavú nohu k zemi", 200, "reach", { facing: -1 }),
    f("Kontrolovaný návrat, driek pritlačený", 200, "neutral"),
    f("Spustiť ľavú ruku a pravú nohu", 200, "reach"),
    f("Výdych pri spúšťaní, pomalé tempo", 200, "neutral"),
  ], { ...solo, note: `${MOTION_NOTE} Ležiaca poloha je znázornená schematicky; tréner kontroluje, že driek zostáva pritlačený k podložke.` }),
};
