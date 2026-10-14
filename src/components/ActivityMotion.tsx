import { useEffect, useState } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityMotion as MotionData, MotionPose } from "@/data/activityMotion";

const poses: Record<MotionPose, { frontArm: string; backArm: string; frontLeg: string; backLeg: string }> = {
  guard: { frontArm: "M4 105 L34 112 L48 88", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L38 180 L65 216", backLeg: "M0 156 L-24 185 L-40 216" },
  punch: { frontArm: "M4 105 L65 106 L102 106", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L38 180 L65 216", backLeg: "M0 156 L-24 185 L-40 216" },
  feint: { frontArm: "M4 105 L42 107 L65 97", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L38 180 L65 216", backLeg: "M0 156 L-24 185 L-40 216" },
  chamber: { frontArm: "M4 105 L34 112 L48 88", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L52 144 L45 185", backLeg: "M0 156 L-10 185 L-15 216" },
  kick: { frontArm: "M4 105 L34 112 L48 88", backArm: "M-4 105 L12 123 L25 101", frontLeg: "M0 156 L52 144 L140 146", backLeg: "M0 156 L-10 185 L-15 216" },
};

function Figure({ x, pose, partner = false, lane = 0, duration }: { x: number; pose: MotionPose; partner?: boolean; lane?: number; duration: number }) {
  const p = poses[pose];
  const transition = { duration, ease: "easeInOut" as const };
  return <motion.g animate={{ x, y: lane }} transition={transition}>
    <g transform={partner ? "scale(-1 1)" : undefined} stroke={partner ? "hsl(var(--foreground))" : "hsl(var(--primary))"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx="0" cy="72" r="15" fill="hsl(var(--card))" strokeWidth="4" />
      <path d="M0 88 L0 156" />
      <motion.path animate={{ d: p.backArm }} transition={transition} />
      <motion.path animate={{ d: p.frontArm }} transition={transition} />
      <motion.path animate={{ d: p.backLeg }} transition={transition} />
      <motion.path animate={{ d: p.frontLeg }} transition={transition} />
      <path d="M-8 148 H9" stroke="hsl(var(--muted-foreground))" strokeWidth="4" />
    </g>
    <text x="0" y="40" textAnchor="middle" fill={partner ? "hsl(var(--foreground))" : "hsl(var(--primary))"} fontSize="13">{partner ? "PARTNER" : "CVIČENEC"}</text>
  </motion.g>;
}

export default function ActivityMotion({ data, name, compact = false }: { data: MotionData; name: string; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const reduced = useReducedMotion();
  const total = data.frames.length;
  useEffect(() => { setStep(0); setPlaying(false); }, [data]);
  useEffect(() => {
    if (!playing || compact) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % total), slow ? 3000 : 1500);
    return () => window.clearInterval(timer);
  }, [playing, compact, slow, total]);
  const frame = data.frames[compact ? Math.min(2, total - 1) : step];
  if (!frame) return null;
  const duration = reduced || compact ? 0 : slow ? 0.85 : 0.4;
  return <div className="min-w-0">
    <svg viewBox="0 0 460 290" role="img" aria-label={`Pohybová ukážka: ${name}`} className={`w-full bg-muted/40 ${compact ? "h-36" : "aspect-[46/29] max-h-80"}`}>
      <path d="M20 248 H440 M20 258 H440" stroke="hsl(var(--border))" strokeWidth="2" />
      <path d="M45 215 V265" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="5 5" />
      <Figure x={frame.b} pose={frame.partnerPose ?? "guard"} partner duration={duration} />
      {frame.target && <motion.rect animate={{ x: frame.b - 48, y: frame.pose === "kick" || frame.pose === "chamber" ? 128 : 88 }} width="18" height="42" rx="4" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="2" transition={{ duration }} />}
      <Figure x={frame.a} pose={frame.pose} lane={frame.lane ?? 0} duration={duration} />
      {frame.lane && <path d="M75 270 L150 280" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />}
    </svg>
    {!compact && <div className="border-t border-border p-3 space-y-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-1">
          <Button size="icon" variant="outline" aria-label="Predchádzajúca fáza" onClick={() => { setPlaying(false); setStep((s) => (s + total - 1) % total); }}><ChevronLeft /></Button>
          <Button size="icon" aria-label={playing ? "Pozastaviť pohyb" : "Spustiť pohyb"} onClick={() => setPlaying((p) => !p)}>{playing ? <Pause /> : <Play />}</Button>
          <Button size="icon" variant="outline" aria-label="Nasledujúca fáza" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % total); }}><ChevronRight /></Button>
          <Button size="icon" variant="ghost" aria-label="Ukážka od začiatku" onClick={() => { setPlaying(false); setStep(0); }}><RotateCcw /></Button>
        </div>
        <Button size="sm" variant="secondary" aria-label="Rýchlosť pohybu" aria-pressed={slow} onClick={() => setSlow((s) => !s)}>{slow ? "0,5×" : "1×"}</Button>
      </div>
      <p className="text-sm min-h-10" aria-live={playing ? "off" : "polite"}><span className="text-primary font-medium">{step + 1}/{total}</span> · {frame.label}</p>
      <p className="text-xs text-muted-foreground">{data.note}</p>
    </div>}
  </div>;
}