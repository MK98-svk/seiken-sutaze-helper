export type MotionPose = "guard" | "punch" | "reversePunch" | "chamber" | "kick" | "roundKick" | "feint" | "neutral" | "walk" | "walkBack" | "clap" | "catch" | "reach" | "point" | "armsOpen" | "armsForward" | "shoulder" | "lunge" | "hipOpen" | "crossTouch" | "bear" | "block";
export interface MotionProp {
  kind: "ball" | "belt" | "marker" | "pad" | "block" | "line" | "support";
  x: number;
  y: number;
  label?: string;
  secondary?: boolean;
}
export interface MotionFrame {
  label: string;
  a: number;
  b: number;
  pose: MotionPose;
  partnerPose?: MotionPose;
  lane?: number;
  partnerLane?: number;
  target?: boolean;
  facing?: -1 | 1;
  hold?: number;
  cue?: string;
  props?: MotionProp[];
  technique?: number;
}
export interface ActivityMotion {
  frames: MotionFrame[];
  note: string;
  view?: "side" | "front";
  solo?: boolean;
  coachSequence?: boolean;
  groupCount?: number;
}
export const MOTION_NOTE = "Metodická animácia, nie biomechanický návod. Tréner overí postoj, chodidlá, rotáciu a dosah podľa školy a schopností dieťaťa. Kontakt iba ľahko na pripravenú pomôcku, nikdy do partnera.";