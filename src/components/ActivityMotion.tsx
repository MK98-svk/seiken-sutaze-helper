import { useEffect, useState } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityMotion as MotionData, MotionPose, MotionProp } from "@/data/motionTypes";

type Limbs = { frontArm: string; backArm: string; frontLeg: string; backLeg: string; torso?: string };
const guard: Limbs = { frontArm: "M4 105 L34 112 L48 88", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L38 180 L65 216", backLeg: "M0 156 L-24 185 L-40 216" };
const neutral: Limbs = { frontArm: "M4 105 L15 130 L18 151", backArm: "M-4 105 L-15 130 L-18 151", frontLeg: "M0 156 L15 185 L20 216", backLeg: "M0 156 L-15 185 L-20 216" };
const poses: Record<MotionPose, Limbs> = {
  guard,
  neutral,
  punch: { ...guard, frontArm: "M4 105 L65 106 L102 106" },
  reversePunch: { ...guard, backArm: "M-4 105 L55 106 L102 106", frontArm: "M4 105 L22 116 L36 91" },
  feint: { ...guard, frontArm: "M4 105 L42 107 L65 97" },
  chamber: { ...guard, frontLeg: "M0 156 L52 144 L45 185", backLeg: "M0 156 L-10 185 L-15 216" },
  kick: { ...guard, frontLeg: "M0 156 L52 144 L140 146", backLeg: "M0 156 L-10 185 L-15 216" },
  roundKick: { ...guard, frontLeg: "M0 156 L65 139 L140 152", backLeg: "M0 156 L-10 185 L-28 216" },
  walk: { ...neutral, frontLeg: "M0 156 L32 182 L50 216", backLeg: "M0 156 L-15 190 L-35 216", frontArm: "M4 105 L20 127 L30 137", backArm: "M-4 105 L-24 129 L-32 145" },
  walkBack: { ...neutral, frontLeg: "M0 156 L8 185 L20 216", backLeg: "M0 156 L-35 179 L-50 216", frontArm: "M4 105 L-5 129 L-18 145", backArm: "M-4 105 L16 120 L28 137" },
  clap: { ...neutral, frontArm: "M4 105 L30 130 L45 118", backArm: "M-4 105 L23 130 L45 118" },
  catch: { ...neutral, frontArm: "M4 105 L30 130 L52 122", backArm: "M-4 105 L20 136 L45 122" },
  reach: { ...neutral, frontArm: "M4 105 L38 132 L65 138", backArm: "M-4 105 L22 135 L52 145" },
  point: { ...guard, frontArm: "M4 105 L40 130 L65 155" },
  armsOpen: { ...neutral, frontArm: "M4 105 L40 112 L70 122", backArm: "M-4 105 L-40 112 L-70 122" },
  armsForward: { ...neutral, frontArm: "M4 105 L45 111 L75 120", backArm: "M-4 105 L25 116 L58 124" },
  shoulder: { ...neutral, frontArm: "M4 105 L28 111 L36 132", backArm: "M-4 105 L-20 113 L-28 132" },
  lunge: { ...guard, frontLeg: "M0 156 L45 186 L50 216", backLeg: "M0 156 L-28 185 L-45 216" },
  hipOpen: { ...guard, frontLeg: "M0 156 L-46 154 L-53 190", backLeg: "M0 156 L10 185 L15 216" },
  crossTouch: { ...guard, frontLeg: "M0 156 L48 145 L40 185", backLeg: "M0 156 L-10 185 L-15 216", backArm: "M-4 105 L12 128 L48 145" },
  bear: { frontArm: "M-18 162 L-38 190 L-45 216", backArm: "M-18 162 L-5 190 L8 216", frontLeg: "M38 163 L65 185 L80 216", backLeg: "M38 163 L32 190 L40 216", torso: "M-18 162 L38 163" },
  block: { ...guard, frontArm: "M4 105 L35 115 L40 75", backArm: "M-4 105 L-12 133 L-8 146" },
};
const frontGuard: Limbs = { frontArm: "M4 105 L32 124 L24 93", backArm: "M-4 105 L-32 124 L-24 93", frontLeg: "M0 156 L30 185 L43 216", backLeg: "M0 156 L-30 185 L-43 216" };
const options: { value: MotionPose; label: string }[] = [
  { value: "guard", label: "Bojový postoj / kryt" }, { value: "punch", label: "Priamy úder prednou rukou" },
  { value: "reversePunch", label: "Priamy úder zadnou rukou" }, { value: "block", label: "Blok · orientačná poloha" },
  { value: "chamber", label: "Zdvih kolena" }, { value: "kick", label: "Nízky mae-geri" }, { value: "neutral", label: "Neutrálna poloha" },
];

function Figure({ x, pose, partner = false, lane = 0, duration, facing = 1, front = false, miniature = false }: { x: number; pose: MotionPose; partner?: boolean; lane?: number; duration: number; facing?: number; front?: boolean; miniature?: boolean }) {
  const p = front && pose === "guard" ? frontGuard : poses[pose];
  const transition = { duration, ease: "easeInOut" as const };
  const bear = pose === "bear";
  return <motion.g animate={{ x, y: 32 + lane }} transition={transition}>
    <g transform={`scale(${(partner ? -1 : facing) * (miniature ? 0.65 : 1)} ${miniature ? 0.65 : 1})`} stroke={partner ? "hsl(var(--foreground))" : "hsl(var(--primary))"} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <motion.circle animate={{ cx: bear ? -38 : 0, cy: bear ? 153 : 72 }} r="15" fill="hsl(var(--card))" strokeWidth="3" transition={transition} />
      <motion.path animate={{ d: p.torso ?? "M0 88 L0 156" }} transition={transition} />
      <motion.path animate={{ d: p.backArm }} transition={transition} />
      <motion.path animate={{ d: p.frontArm }} transition={transition} />
      <motion.path animate={{ d: p.backLeg }} transition={transition} />
      <motion.path animate={{ d: p.frontLeg }} transition={transition} />
      {!bear && <path d="M-8 148 H9" stroke="hsl(var(--muted-foreground))" strokeWidth="4" />}
    </g>
  </motion.g>;
}
function Prop({ item, duration }: { item: MotionProp; duration: number }) {
  const fill = item.secondary ? "hsl(var(--foreground))" : "hsl(var(--primary))";
  return <motion.g animate={{ x: item.x, y: item.y }} transition={{ duration, ease: "easeInOut" }}>
    {item.kind === "ball" && <circle r="9" fill={fill} stroke="hsl(var(--background))" strokeWidth="2" />}
    {item.kind === "belt" && <rect x="-4" y="-17" width="8" height="34" rx="2" fill={fill} />}
    {(item.kind === "pad" || item.kind === "block") && <><rect x="0" y="-24" width={item.kind === "block" ? 28 : 18} height={item.kind === "block" ? 64 : 42} rx="4" fill={fill} stroke="hsl(var(--foreground))" strokeWidth="2" /><rect x="2" y="-5" width="12" height="12" fill="none" stroke="hsl(var(--background))" strokeWidth="2" /></>}
    {item.kind === "marker" && <ellipse rx="15" ry="4" fill={fill} />}
    {item.kind === "line" && <path d="M0 -34 V17" stroke={fill} strokeWidth="2" strokeDasharray="4 4" />}
    {item.kind === "support" && <path d="M-15 85 V-30 H15 V85 M-15 0 H15" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth="4" />}
    {item.label && <text x="0" y={item.kind === "marker" ? 21 : -30} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12">{item.label}</text>}
  </motion.g>;
}

export default function ActivityMotion({ data, name, compact = false }: { data: MotionData; name: string; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const [techniques, setTechniques] = useState<(MotionPose | "")[]>(["", "", ""]);
  const reduced = useReducedMotion();
  const total = data.frames.length;
  const slots = [...new Set(data.frames.flatMap((frame) => frame.technique === undefined ? [] : [frame.technique]))].sort();
  const ready = !data.coachSequence || slots.every((slot) => Boolean(techniques[slot]));
  useEffect(() => { setStep(0); setPlaying(false); setTechniques(["", "", ""]); }, [data]);
  useEffect(() => {
    if (!playing || compact || !ready) return;
    const hold = data.frames[step]?.hold ?? 1.5;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % total), hold * (slow ? 2 : 1) * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, compact, slow, total, step, data, ready]);
  const frame = data.frames[compact ? Math.min(2, total - 1) : step];
  if (!frame) return null;
  const pose = frame.technique === undefined ? frame.pose : techniques[frame.technique] || "neutral";
  const duration = reduced || compact ? 0 : slow ? 0.9 : 0.45;
  const props = frame.props ?? [];
  return <div className="min-w-0">
    <svg viewBox="0 0 460 310" role="img" aria-label={`Pohybová ukážka: ${name}`} className={`w-full bg-muted/40 ${compact ? "h-36" : "aspect-[46/31] max-h-80"}`}>
      <text x="18" y="24" fill="hsl(var(--muted-foreground))" fontSize="12">{data.coachSequence ? "TRÉNER URČUJE TECHNIKU" : data.view === "front" ? "ČELNÝ POHĽAD" : "BOČNÁ SCHÉMA"}</text>
      <path d="M20 248 H440 M20 278 H440" stroke="hsl(var(--border))" strokeWidth="2" />
      {!data.solo && <Figure x={frame.b} pose={frame.partnerPose ?? (frame.target || props.some((p) => p.kind === "pad" || p.kind === "block") ? "catch" : "guard")} partner lane={frame.partnerLane ?? 0} duration={duration} front={data.view === "front"} />}
      {frame.target && <Prop item={{ kind: frame.pose === "kick" || frame.pose === "chamber" ? "block" : "pad", x: frame.b - (frame.pose === "kick" || frame.pose === "chamber" ? 70 : 63), y: frame.pose === "kick" || frame.pose === "chamber" ? 178 : 138 }} duration={duration} />}
      <Figure x={frame.a} pose={pose} lane={frame.lane ?? 0} duration={duration} facing={frame.facing ?? 1} front={data.view === "front"} />
      {props.map((item, i) => <Prop key={`${item.kind}-${i}`} item={item} duration={duration} />)}
      {frame.cue && <text x="230" y="49" textAnchor="middle" fill="hsl(var(--primary))" fontSize="13" fontWeight="600">{frame.cue}</text>}
      <text x="18" y="300" fill="hsl(var(--primary))" fontSize="12">CVIČENEC</text>
      {!data.solo && <text x="442" y="300" textAnchor="end" fill="hsl(var(--foreground))" fontSize="12">PARTNER</text>}
    </svg>
    {!compact && <div className="border-t border-border p-3 space-y-3">
      {data.coachSequence && <fieldset className="space-y-2"><legend className="text-sm font-medium mb-2">Techniky úseku podľa trénera</legend>{slots.map((slot) => <label key={slot} className="flex items-center gap-2 text-xs"><span className="shrink-0">{slot + 1}.</span><select aria-label={`Technika ${slot + 1}`} className="h-10 w-full min-w-0 rounded-md border border-input bg-background text-foreground px-2 text-sm" value={techniques[slot] ?? ""} onChange={(e) => { const value = e.target.value as MotionPose | ""; setPlaying(false); setTechniques((previous) => previous.map((p, i) => i === slot ? value : p)); }}><option value="">Vyberte známu techniku…</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}<p className="text-xs text-muted-foreground">Orientačné polohy pre zvolený úsek. Nie ukážka konkrétnej kata; jej presnú dráhu a techniku predvedie tréner.</p></fieldset>}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-1">
          <Button size="icon" variant="outline" aria-label="Predchádzajúca fáza" title="Predchádzajúca fáza" onClick={() => { setPlaying(false); setStep((s) => (s + total - 1) % total); }}><ChevronLeft /></Button>
          <Button size="icon" disabled={!ready} aria-label={playing ? "Pozastaviť pohyb" : "Spustiť pohyb"} title={ready ? "Prehrať / pozastaviť" : "Najprv vyberte techniky"} onClick={() => setPlaying((p) => !p)}>{playing ? <Pause /> : <Play />}</Button>
          <Button size="icon" variant="outline" aria-label="Nasledujúca fáza" title="Nasledujúca fáza" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % total); }}><ChevronRight /></Button>
          <Button size="icon" variant="ghost" aria-label="Ukážka od začiatku" title="Od začiatku" onClick={() => { setPlaying(false); setStep(0); }}><RotateCcw /></Button>
        </div>
        <Button size="sm" variant="secondary" aria-label="Rýchlosť pohybu" aria-pressed={slow} onClick={() => setSlow((s) => !s)}>{slow ? "0,5×" : "1×"}</Button>
      </div>
      <div className="flex gap-1" aria-hidden="true">{data.frames.map((_, index) => <span key={index} className={`h-1 flex-1 rounded-sm ${index === step ? "bg-primary" : "bg-muted"}`} />)}</div>
      <p className="text-sm min-h-10 break-words" aria-live={playing ? "off" : "polite"}><span className="text-primary font-medium">{step + 1}/{total}</span> · {frame.label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{data.note}</p>
    </div>}
  </div>;
}
