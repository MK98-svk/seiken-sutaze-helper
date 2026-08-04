import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, Pause, Play, RotateCcw, Youtube, Flag } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutSession } from "@/hooks/useWorkouts";
import { exerciseById, restForGoal, GOALS } from "@/data/exercises";
import { useCatalog } from "@/hooks/useCatalog";
import { IMG, muscleLabel, equipmentLabel } from "@/lib/catalog";
import { openExternal, youtubeSearch } from "@/lib/openExternal";

import { toast } from "sonner";

const WorkoutSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { session, sets, updateSet, finish } = useWorkoutSession(id);
  const { catalog } = useCatalog();


  const [rest, setRest] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const defaultRest = restForGoal(session?.goal);

  useEffect(() => {
    if (!running || rest === null) return;
    const t = setInterval(() => {
      setRest((r) => {
        if (r === null) return null;
        if (r <= 1) {
          setRunning(false);
          try {
            navigator.vibrate?.([200, 100, 200]);
          } catch {
            /* ignore */
          }
          toast.success("Oddych skončil — ďalšia séria!");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, rest]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sets>();
    sets.forEach((s) => {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    });
    return Array.from(map.entries());
  }, [sets]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const doneCount = sets.filter((s) => s.done).length;
  const goalLabel = GOALS.find((g) => g.id === session?.goal)?.label;

  const toggleDone = (setId: string, done: boolean) => {
    updateSet.mutate({ id: setId, updates: { done } });
    if (done) {
      setRest(defaultRest);
      setRunning(true);
    }
  };

  const endWorkout = () => {
    const mins = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    finish.mutate(mins, {
      onSuccess: () => {
        toast.success("Tréning uložený do výsledkov");
        navigate("/posilnovanie/vysledky");
      },
    });
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      <PageHeader title={session?.title || "Tréning"} subtitle={goalLabel ? `Cieľ: ${goalLabel}` : undefined} backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-3">
        <div className="text-xs text-muted-foreground">
          Hotové série: <span className="text-foreground">{doneCount}/{sets.length}</span>
        </div>

        {grouped.map(([exId, list]) => {
          const legacy = exerciseById(exId);
          const cat = catalog?.get(exId);
          const name = list[0].exerciseName;
          return (
            <div key={exId} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {cat && (
                    <img src={IMG(cat.image)} alt={name} loading="lazy" className="h-12 w-12 rounded-md bg-white object-contain shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-display text-sm tracking-wide uppercase leading-tight">{name}</div>
                    {legacy ? (
                      <div className="text-[11px] text-muted-foreground">{legacy.muscles}</div>
                    ) : cat ? (
                      <div className="text-[11px] text-muted-foreground">
                        {muscleLabel(cat.target)} · {equipmentLabel(cat.equipment)}
                      </div>
                    ) : null}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  title="Video"
                  onClick={() => openExternal(legacy?.youtube ?? youtubeSearch(name + " exercise technique"))}
                >
                  <Youtube className="h-4 w-4" />
                </Button>

              </div>


              <div className="space-y-1.5">
                {list.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-10 justify-center shrink-0">{s.setNumber}.</Badge>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="kg"
                      defaultValue={s.weight ?? ""}
                      onBlur={(e) =>
                        updateSet.mutate({ id: s.id, updates: { weight: e.target.value === "" ? null : Number(e.target.value) } })
                      }
                      className="h-9"
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="opak."
                      defaultValue={s.reps ?? ""}
                      onBlur={(e) => updateSet.mutate({ id: s.id, updates: { reps: e.target.value === "" ? null : Number(e.target.value) } })}
                      className="h-9"
                    />
                    <Button
                      size="icon"
                      variant={s.done ? "default" : "outline"}
                      className="h-9 w-9 shrink-0"
                      onClick={() => toggleDone(s.id, !s.done)}
                      title="Hotovo"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {sets.length === 0 && <div className="text-sm text-muted-foreground">Tréning neobsahuje žiadne cviky.</div>}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="font-display text-2xl tabular-nums text-primary w-16">{fmt(rest ?? defaultRest)}</div>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setRunning((r) => !r)} title="Štart/pauza">
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => {
                  setRest(defaultRest);
                  setRunning(false);
                }}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-9 px-2 text-xs" onClick={() => setRest((r) => (r ?? defaultRest) + 15)}>
                +15s
              </Button>
            </div>
          </div>
          <Button onClick={endWorkout} className="gap-1 shrink-0">
            <Flag className="h-4 w-4" /> Ukončiť
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionPage;
