export type MotionPose = "guard" | "punch" | "chamber" | "kick" | "feint";
export interface MotionFrame {
  label: string;
  a: number;
  b: number;
  pose: MotionPose;
  partnerPose?: MotionPose;
  lane?: number;
  target?: boolean;
}
export interface ActivityMotion { frames: MotionFrame[]; note: string }

const note = "Zjednodušený bočný pohľad na pohyb a načasovanie. Nie je náhradou technickej ukážky trénera; uhol chodidiel a rotácia bedier nie sú v tomto pohľade zobrazené.";
const punch = (label: string): ActivityMotion => ({ note, frames: [
  { label: "Príprava v kryte", a: 110, b: 330, pose: "guard", target: true },
  { label: "Nastavenie vzdialenosti", a: 145, b: 330, pose: "guard", target: true },
  { label, a: 185, b: 330, pose: "punch", target: true },
  { label: "Návrat ruky a bezpečný odstup", a: 110, b: 330, pose: "guard", target: true },
] });
const kick: ActivityMotion = { note, frames: [
  { label: "Stabilný postoj", a: 130, b: 340, pose: "guard", target: true },
  { label: "Zdvih kolena", a: 130, b: 340, pose: "chamber", target: true },
  { label: "Kontrolovaný nízky mae-geri", a: 130, b: 340, pose: "kick", target: true },
  { label: "Stiahnutie kolena pred dosadnutím", a: 130, b: 340, pose: "chamber", target: true },
] };

export const activityMotions: Record<string, ActivityMotion> = {
  "kizami-navrat": punch("Predná ruka na stabilnú lapu"),
  "gyaku-zuki-na-jeden-signal": punch("Priamy úder na lapu"),
  "farebny-signal": punch("Úder až po platnom signále"),
  "mae-geri": kick,
  "mae-geri-cez-tri-fazy": kick,
  "rychly-navrat-kolena": kick,
  "kumite-nastup-kizami": punch("Kizami-zuki na lapu"),
  "kumite-gyaku-odchod": punch("Gyaku-zuki na lapu"),
  "kumite-dvojita-vzdialenost": { note, frames: [
    { label: "Vzdialenosť mimo dosahu", a: 100, b: 350, pose: "guard" },
    { label: "Partner sa pomaly približuje", a: 100, b: 290, pose: "guard" },
    { label: "Cvičenec obnoví odstup ústupom", a: 55, b: 290, pose: "guard" },
    { label: "Obaja zastavia v kryte", a: 55, b: 290, pose: "guard" },
  ] },
  "kumite-unik-uhol": { note, frames: [
    { label: "Príprava pred lapou", a: 110, b: 330, pose: "guard", target: true },
    { label: "Nástup a kontrolovaný úder", a: 185, b: 330, pose: "punch", target: true },
    { label: "Kryt a odchod z línie", a: 145, b: 330, pose: "guard", lane: 30, target: true },
    { label: "Nový odstup, pohľad na partnera", a: 110, b: 330, pose: "guard", lane: 30, target: true },
  ] },
  "kumite-kontra-ustup": { note, frames: [
    { label: "Dohodnutý bezpečný odstup", a: 110, b: 350, pose: "guard" },
    { label: "Partner naznačí nástup bez úderu", a: 65, b: 305, pose: "guard" },
    { label: "Partner zastane a ustáli lapu", a: 65, b: 305, pose: "guard", target: true },
    { label: "Cvičenec nastúpi a zasiahne lapu", a: 160, b: 305, pose: "punch", target: true },
  ] },
  "kumite-finta-rukou": { note, frames: [
    { label: "Kryt a pripravená lapa", a: 140, b: 330, pose: "guard", target: true },
    { label: "Malý náznak prednou rukou", a: 140, b: 330, pose: "feint", target: true },
    { label: "Kontrolovaný priamy úder na lapu", a: 185, b: 330, pose: "punch", target: true },
    { label: "Návrat do krytu a odchod", a: 110, b: 330, pose: "guard", target: true },
  ] },
  "kumite-finta-krokom": { note, frames: [
    { label: "Vzdialenosť mimo dosahu", a: 105, b: 330, pose: "guard", target: true },
    { label: "Malý náznak nástupu", a: 125, b: 330, pose: "guard", target: true },
    { label: "Skutočný nástup na stabilnú lapu", a: 185, b: 330, pose: "punch", target: true },
    { label: "Kryt a návrat na štart", a: 105, b: 330, pose: "guard", target: true },
  ] },
  "kumite-stop-start": { note, frames: [
    { label: "Ľahký pohyb v kryte", a: 105, b: 330, pose: "guard" },
    { label: "Povel stop: obaja zastavia", a: 125, b: 350, pose: "guard" },
    { label: "Štart až po ustálení lapy", a: 185, b: 330, pose: "punch", target: true },
    { label: "Návrat a pokračovanie pohybu", a: 105, b: 330, pose: "guard" },
  ] },
  "kumite-hranica": { note, frames: [
    { label: "Cvičenec pri označenej hranici", a: 70, b: 310, pose: "guard" },
    { label: "Bočný odchod z línie", a: 100, b: 310, pose: "guard", lane: 30 },
    { label: "Obnovenie postoja smerom k partnerovi", a: 130, b: 310, pose: "guard", lane: 30 },
    { label: "Bezpečný odstup mimo hranice", a: 110, b: 350, pose: "guard", lane: 30 },
  ] },
  "kumite-zmena-tempa": { note, frames: [
    { label: "Pomalé krátke posuny", a: 110, b: 330, pose: "guard", target: true },
    { label: "Krátke zastavenie v kryte", a: 135, b: 330, pose: "guard", target: true },
    { label: "Svižný nástup na stabilnú lapu", a: 185, b: 330, pose: "punch", target: true },
    { label: "Kontrolovaný odchod, pokojné tempo", a: 110, b: 330, pose: "guard", target: true },
  ] },
  "kumite-mae-geri-odchod": { note, frames: [
    { label: "Stabilný postoj pred blokom", a: 130, b: 340, pose: "guard", target: true },
    { label: "Zdvih kolena", a: 130, b: 340, pose: "chamber", target: true },
    { label: "Nízky mae-geri na veľký blok", a: 130, b: 340, pose: "kick", target: true },
    { label: "Stiahnutie kolena; po dosadnutí krátky odchod", a: 130, b: 340, pose: "chamber", target: true },
  ] },
  "kumite-rozhodni-ciel": { note, frames: [
    { label: "Kryt, dve stabilné lapy", a: 125, b: 330, pose: "guard", target: true },
    { label: "Partner označí správny cieľ", a: 145, b: 330, pose: "guard", target: true },
    { label: "Jeden kontrolovaný úder na cieľ", a: 185, b: 330, pose: "punch", target: true },
    { label: "Obnovenie krytu a odstupu", a: 110, b: 330, pose: "guard", target: true },
  ] },
};