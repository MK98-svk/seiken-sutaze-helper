import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, Pause, Play, RotateCcw, Youtube, Flag, Trash2, Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutSession, useCreateWorkout } from "@/hooks/useWorkouts";
import { exerciseById, restForGoal, GOALS } from "@/data/exercises";
import { useCatalog } from "@/hooks/useCatalog";
import { IMG, muscleLabel, equipmentLabel } from "@/lib/catalog";
import { openExternal, youtubeSearch } from "@/lib/openExternal";
import ExerciseDetailDialog from "@/components/ExerciseDetailDialog";
import ExerciseNote from "@/components/ExerciseNote";
import PlateCalcPopover from "@/components/PlateCalcPopover";
import { useExerciseNotes } from "@/hooks/useExerciseNotes";
import { restFinishedAlert, startAudioKeepAlive, stopAudioKeepAlive, unlockAudio } from "@/lib/notifications";
import { CatalogExercise, CatalogMode } from "@/lib/catalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { toast } from "sonner";

const WorkoutSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { session, sets, updateSet, addSet, finish } = useWorkoutSession(id);
  const { remove } = useCreateWorkout();
  const { catalog } = useCatalog();
  const { notes, saveNote } = useExerciseNotes(session?.memberId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [weightOverride, setWeightOverride] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<CatalogExercise | null>(null);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");

  const [rest, setRest] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const deadlineRef = useRef<number | null>(null);
  const defaultRest = restForGoal(session?.goal);

  // Časovač počíta z cieľového času, nie z tikania – prežije uspatie appky na pozadí.
  useEffect(() => {
    if (!running) {
      stopAudioKeepAlive();
      return;
    }
    if (deadlineRef.current === null) deadlineRef.current = Date.now() + (rest ?? defaultRest) * 1000;
    startAudioKeepAlive();

    const tick = () => {
      const left = Math.max(0, Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000));
      setRest(left);
      if (left <= 0) {
        deadlineRef.current = null;
        setRunning(false);
        restFinishedAlert();
        toast.success("Oddych skončil — ďalšia séria!");
      }
    };
    tick();
    const t = setInterval(tick, 500);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => () => stopAudioKeepAlive(), []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sets>();
    sets.forEach((s) => {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    });
    return Array.from(map.entries());
  }, [sets]);

  const exerciseResults = useMemo(() => {
    if (!catalog || exerciseQuery.trim().length < 2) return [];
    const existing = new Set(sets.map((set) => set.exerciseId));
    const mode: CatalogMode = session?.mode === "home" ? "bezpomocok" : (session?.mode as CatalogMode) || "gym";
    return catalog.search(exerciseQuery, mode).filter((exercise) => !existing.has(exercise.id)).slice(0, 20);
  }, [catalog, exerciseQuery, session?.mode, sets]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const doneCount = sets.filter((s) => s.done).length;
  const goalLabel = GOALS.find((g) => g.id === session?.goal)?.label;

  const toggleDone = (setId: string, done: boolean) => {
    updateSet.mutate({ id: setId, updates: { done } });
    if (done) {
      unlockAudio();
      deadlineRef.current = Date.now() + defaultRest * 1000;
      setRest(defaultRest);
      setRunning(true);
    }
  };

  const appendSet = (list: typeof sets) => {
    const last = list[list.length - 1];
    if (!last) return;
    addSet.mutate({
      sessionId: last.sessionId,
      exerciseId: last.exerciseId,
      exerciseName: last.exerciseName,
      muscleGroup: last.muscleGroup,
      setNumber: Math.max(...list.map((set) => set.setNumber)) + 1,
      reps: last.reps,
      weight: last.weight,
    });
  };

  const appendExercise = (exercise: CatalogExercise) => {
    if (!id) return;
    addSet.mutate(
      {
        sessionId: id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: catalog?.groupOf(exercise)?.name ?? muscleLabel(exercise.target),
        setNumber: 1,
        reps: 10,
        weight: null,
      },
      {
        onSuccess: () => {
          setAddExerciseOpen(false);
          setExerciseQuery("");
          toast.success("Cvik pridaný do tréningu");
        },
      }
    );
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

  const deleteWorkout = async () => {
    if (!id) return;
    try {
      await remove(id);
      toast.success("Tréning zrušený");
      navigate("/posilnovanie");
    } catch (e: any) {
      toast.error("Nepodarilo sa zrušiť: " + e.message);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-32">
      <PageHeader title={session?.title || "Tréning"} subtitle={goalLabel ? `Cieľ: ${goalLabel}` : undefined} backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-3">
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-primary/50 bg-card p-3 min-[360px]:grid-cols-[1fr_auto] min-[360px]:items-center">
          <div className="text-xs text-muted-foreground">
            Hotové série: <span className="text-foreground">{doneCount}/{sets.length}</span>
          </div>
          <Button size="sm" className="h-10 w-full gap-1 min-[360px]:w-auto" onClick={() => setAddExerciseOpen(true)}>
            <Plus className="h-4 w-4" /> Pridať cvik
          </Button>
        </div>

        {grouped.map(([exId, list]) => {
          const legacy = exerciseById(exId);
          const cat = catalog?.get(exId);
          const name = list[0].exerciseName;
          const bodyweight = !cat || cat.equipment === "body weight" || cat.equipment === "assisted";
          return (
            <div key={exId} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2 min-w-0">
                  {cat && (
                    <button onClick={() => setDetail(cat)} className="shrink-0" title="Ukázať cvik">
                      <img src={IMG(cat.image)} alt={name} loading="lazy" className="h-12 w-12 rounded-md bg-white object-contain" />
                    </button>
                  )}
                  <button className="min-w-0 text-left" onClick={() => cat && setDetail(cat)}>
                    <div className="font-display text-sm tracking-wide uppercase leading-tight">{name}</div>
                    {legacy ? (
                      <div className="text-[11px] text-muted-foreground">{legacy.muscles}</div>
                    ) : cat ? (
                      <div className="text-[11px] text-muted-foreground">
                        {muscleLabel(cat.target)} · {equipmentLabel(cat.equipment)}
                      </div>
                    ) : null}
                  </button>
                </div>
                <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-full px-2 text-xs"
                    onClick={() => appendSet(list)}
                    disabled={addSet.isPending}
                    title="Pridať ďalšiu sériu"
                  >
                    <Plus className="h-4 w-4" /> Pridať sériu
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title="Video"
                    onClick={() => openExternal(legacy?.youtube ?? youtubeSearch(name + " exercise technique"))}
                  >
                    <Youtube className="h-4 w-4" />
                  </Button>
                </div>

              </div>

              <div className="text-[11px] text-muted-foreground">
                {bodyweight
                  ? "Vlastná váha – kg nechaj prázdne, vypĺňaj len počet opakovaní."
                  : "Do „kg“ napíš váhu činky/stroja, do „opak.“ počet opakovaní v sérii."}
              </div>

              <ExerciseNote value={notes[exId] ?? ""} onSave={(n) => saveNote(exId, n)} disabled={!session?.memberId} />

              <div className="space-y-1.5">
                {list.map((s) => (
                  <div key={s.id} className="flex min-w-0 items-center gap-2">
                    <Badge variant="outline" className="w-10 justify-center shrink-0">{s.setNumber}.</Badge>
                    <Input
                      key={`${s.id}-${weightOverride[s.id] ?? ""}`}
                      type="number"
                      inputMode="decimal"
                      placeholder={bodyweight ? "vlastná váha" : "kg"}
                      defaultValue={weightOverride[s.id] ?? s.weight ?? ""}
                      onBlur={(e) =>
                        updateSet.mutate({ id: s.id, updates: { weight: e.target.value === "" ? null : Number(e.target.value) } })
                      }
                      className="h-9 min-w-0 flex-1"
                    />
                    {!bodyweight && (
                      <PlateCalcPopover
                        onApply={(total) => {
                          setWeightOverride((prev) => ({ ...prev, [s.id]: total }));
                          updateSet.mutate({ id: s.id, updates: { weight: total } });
                        }}
                      />
                    )}

                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="opak."
                      defaultValue={s.reps ?? ""}
                      onBlur={(e) => updateSet.mutate({ id: s.id, updates: { reps: e.target.value === "" ? null : Number(e.target.value) } })}
                      className="h-9 min-w-0 flex-1"
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

        {sets.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-5 text-center space-y-3">
            <div className="text-sm text-muted-foreground">Tréning neobsahuje žiadne cviky.</div>
            <Button size="sm" className="gap-1" onClick={() => setAddExerciseOpen(true)}>
              <Plus className="h-4 w-4" /> Pridať prvý cvik
            </Button>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm p-3">
        <div className="max-w-3xl mx-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="font-display text-2xl tabular-nums text-primary w-16">{fmt(rest ?? defaultRest)}</div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => {
                  unlockAudio();
                  deadlineRef.current = null;
                  setRunning((r) => !r);
                }}
                title="Štart/pauza"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => {
                  deadlineRef.current = null;
                  setRest(defaultRest);
                  setRunning(false);
                }}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hidden h-9 px-2 text-xs min-[400px]:inline-flex"
                onClick={() => {
                  if (deadlineRef.current !== null) deadlineRef.current += 15000;
                  setRest((r) => (r ?? defaultRest) + 15);
                }}
              >
                +15s
              </Button>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Zrušiť tréning" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={endWorkout} className="gap-1 shrink-0">
            <Flag className="h-4 w-4" /> Ukončiť
          </Button>
        </div>
      </div>

      <ExerciseDetailDialog exercise={detail} onOpenChange={(o) => !o && setDetail(null)} />

      <Dialog open={addExerciseOpen} onOpenChange={setAddExerciseOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">Pridať cvik do tréningu</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={exerciseQuery}
                onChange={(event) => setExerciseQuery(event.target.value)}
                placeholder="Napíš aspoň 2 písmená…"
                className="pl-9"
                autoFocus
              />
            </div>
            {exerciseQuery.trim().length < 2 && <p className="text-sm text-muted-foreground">Vyhľadaj cvik podľa názvu.</p>}
            {exerciseQuery.trim().length >= 2 && exerciseResults.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenašiel sa žiadny ďalší cvik.</p>
            )}
            {exerciseResults.map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <img src={IMG(exercise.image)} alt={exercise.name} loading="lazy" className="h-11 w-11 shrink-0 rounded-md bg-background object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-tight line-clamp-2">{exercise.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {muscleLabel(exercise.target)} · {equipmentLabel(exercise.equipment)}
                  </div>
                </div>
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => appendExercise(exercise)} disabled={addSet.isPending} title="Pridať cvik">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zrušiť tréning?</AlertDialogTitle>
            <AlertDialogDescription>
              Tréning aj so všetkými sériami sa nenávratne vymaže. Môžeš si potom vybrať iný.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nie</AlertDialogCancel>
            <AlertDialogAction onClick={deleteWorkout}>Áno, zrušiť</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutSessionPage;
