import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KarateActivity, DiagramKind } from "@/data/karateActivities";

type Point = [number, number];
const paths: Record<DiagramKind, Point[]> = {
  signal: [[100, 170], [100, 170], [200, 170], [100, 170]],
  targets: [[100, 170], [200, 110], [100, 170], [200, 220]],
  mirror: [[130, 120], [130, 220], [130, 160], [130, 120]],
  cones: [[90, 240], [220, 120], [310, 240], [90, 240]],
  line: [[75, 170], [75, 170], [260, 170], [335, 170]],
  sequence: [[100, 240], [100, 150], [235, 150], [235, 75]],
};

export default function ActivityDiagram({ activity, compact = false }: { activity: KarateActivity; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [activity.id]);
  useEffect(() => {
    if (!playing || compact) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % 4), slow ? 2400 : 1200);
    return () => window.clearInterval(timer);
  }, [playing, slow, compact]);

  const route = paths[activity.diagram];
  const [x, y] = route[compact ? 2 : step];
  const partner: Point = activity.diagram === "mirror" ? [280, y] : [300, 170];
  const showPartner = ["signal", "targets", "mirror"].includes(activity.diagram);
  const hasTarget = ["signal", "targets"].includes(activity.diagram);
  const points = route.map((p) => p.join(",")).join(" ");

  return (
    <div className="min-w-0">
      <svg viewBox="0 0 400 300" role="img" aria-label={`Schéma aktivity: ${activity.name}`} className={`w-full bg-muted/40 ${compact ? "h-36" : "aspect-[4/3] max-h-80"}`}>
        <defs><pattern id={`grid-${activity.id}-${compact}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" /></pattern></defs>
        <rect width="400" height="300" fill={`url(#grid-${activity.id}-${compact})`} />
        {route.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="4" fill="hsl(var(--muted-foreground))" />)}
        <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="7 6" opacity="0.6" />
        {activity.diagram === "cones" && [[75, 250], [220, 90], [325, 250]].map(([cx, cy], i) => <path key={i} d={`M${cx} ${cy - 12} l-10 22 h20 Z`} fill="hsl(var(--primary))" />)}
        {activity.diagram === "line" && <><path d="M75 80 V260 M260 80 V260" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="5 5" /><text x="75" y="65" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">ŠTART</text><text x="260" y="65" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">CIEĽ</text></>}
        {showPartner && <g className="activity-marker" transform={`translate(${partner[0]} ${partner[1]})`}><circle r="23" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="2" /><text textAnchor="middle" y="5" fontSize="15" fill="hsl(var(--foreground))">B</text></g>}
        {hasTarget && <><rect x="248" y={activity.diagram === "targets" ? 90 : 149} width="14" height="40" rx="4" fill="hsl(var(--primary))" />{activity.diagram === "targets" && <rect x="248" y="200" width="14" height="40" rx="4" fill="hsl(var(--primary))" />}<path d={`M${x + 24} ${y} L245 ${activity.diagram === "targets" ? (step === 3 || compact ? 220 : 110) : 170}`} stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="4 5" opacity={step === 2 || step === 3 || compact ? 1 : 0.2} /></>}
        <g className="activity-marker" transform={`translate(${x} ${y})`}><circle r="23" fill="hsl(var(--primary))" /><text textAnchor="middle" y="5" fontSize="15" fill="hsl(var(--primary-foreground))">A</text></g>
        {activity.diagram === "sequence" && route.map(([px, py], i) => <text key={i} x={px + 32} y={py + 5} fill="hsl(var(--muted-foreground))" fontSize="12">{i + 1}</text>)}
      </svg>
      {!compact && <div className="border-t border-border p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" aria-label="Predchádzajúci krok" onClick={() => { setPlaying(false); setStep((s) => (s + 3) % 4); }}><ChevronLeft /></Button>
            <Button size="icon" aria-label={playing ? "Pozastaviť ukážku" : "Spustiť ukážku"} onClick={() => setPlaying((p) => !p)}>{playing ? <Pause /> : <Play />}</Button>
            <Button size="icon" variant="outline" aria-label="Nasledujúci krok" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % 4); }}><ChevronRight /></Button>
          </div>
          <Button variant="secondary" size="sm" aria-pressed={slow} onClick={() => setSlow((s) => !s)}>{slow ? "0,5×" : "1×"}</Button>
        </div>
        <p className="text-sm"><span className="text-primary font-medium">{step + 1}/4</span> · {activity.beats[step]}</p>
        <p className="text-xs text-muted-foreground">Schéma organizácie: A = cvičenec{showPartner ? ", B = partner" : ""}. Nie je ukážkou technického prevedenia.</p>
      </div>}
    </div>
  );
}