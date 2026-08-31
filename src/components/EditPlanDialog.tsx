import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useCatalog";
import { CatalogExercise, CatalogMode, IMG, muscleLabel, equipmentLabel } from "@/lib/catalog";
import { PlannedItem } from "@/hooks/useWorkouts";
import { WorkoutPlan } from "@/hooks/useWorkoutPlans";
import ExerciseDetailDialog from "@/components/ExerciseDetailDialog";
import ExerciseNote from "@/components/ExerciseNote";
import { useExerciseNotes } from "@/hooks/useExerciseNotes";

interface Props {
  plan: WorkoutPlan | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (input: { id: string; name: string; items: PlannedItem[]; daysPerWeek: number | null }) => Promise<void>;
}

export default function EditPlanDialog({ plan, open, onOpenChange, onSave }: Props) {
  const { catalog } = useCatalog();
  const { notes, saveNote } = useExerciseNotes(plan?.memberId);
  const [name, setName] = useState("");
  const [items, setItems] = useState<PlannedItem[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<string>("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<CatalogExercise | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan && open) {
      setName(plan.name);
      setItems(plan.items.map((i) => ({ ...i })));
      setDaysPerWeek(plan.daysPerWeek ? String(plan.daysPerWeek) : "");
      setQuery("");
    }
  }, [plan, open]);

  const mode = (plan?.mode as CatalogMode) || "gym";

  const results = useMemo(() => {
    if (!catalog || query.trim().length < 2) return [];
    return catalog.search(query, mode).slice(0, 20);
  }, [catalog, query, mode]);

  const patch = (id: string, changes: Partial<PlannedItem>) =>
    setItems((prev) => prev.map((i) => (i.exerciseId === id ? { ...i, ...changes } : i)));

  const addExercise = (ex: CatalogExercise) => {
    if (items.some((i) => i.exerciseId === ex.id)) return toast.error("Cvik už v pláne je");
    setItems((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: catalog?.groupOf(ex)?.name ?? muscleLabel(ex.target),
        sets: 3,
        reps: 10,
      },
    ]);
    setQuery("");
  };

  const save = async () => {
    if (!plan) return;
    if (!items.length) return toast.error("Plán musí mať aspoň jeden cvik");
    setSaving(true);
    try {
      await onSave({
        id: plan.id,
        name: name.trim() || plan.name,
        items: items.map((i) => ({
          ...i,
          sets: Number.isFinite(i.sets) ? Math.max(1, Math.min(12, i.sets)) : 1,
          reps: Number.isFinite(i.reps) ? Math.max(1, Math.min(100, i.reps)) : 1,
        })),
        daysPerWeek: daysPerWeek ? Math.max(1, Math.min(7, Number(daysPerWeek))) : null,
      });
      toast.success("Plán upravený");
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Nepodarilo sa uložiť: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">Upraviť plán</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Názov plánu</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Názov plánu" />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Tréningov do týždňa</label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                placeholder="napr. 3"
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Cviky ({items.length})</div>
              {items.map((it) => {
                const ex = catalog?.get(it.exerciseId) ?? null;
                return (
                  <div key={it.exerciseId} className="rounded-lg border border-border bg-card p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      {ex && (
                        <button onClick={() => setDetail(ex)} className="shrink-0">
                          <img src={IMG(ex.image)} alt={it.exerciseName} loading="lazy" className="h-11 w-11 rounded-md bg-white object-contain" />
                        </button>
                      )}
                      <button className="text-left min-w-0 flex-1" onClick={() => ex && setDetail(ex)}>
                        <div className="font-display text-sm tracking-wide uppercase leading-tight line-clamp-2">{it.exerciseName}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{it.muscleGroup}</div>
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setItems((p) => p.filter((x) => x.exerciseId !== it.exerciseId))}
                        title="Odobrať cvik"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Série</label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 shrink-0"
                            onClick={() => patch(it.exerciseId, { sets: Math.max(1, (Number.isFinite(it.sets) ? it.sets : 1) - 1) })}
                            disabled={Number.isFinite(it.sets) && it.sets <= 1}
                            title="Odobrať sériu"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={12}
                            value={Number.isFinite(it.sets) ? it.sets : ""}
                            onChange={(e) => patch(it.exerciseId, { sets: e.target.value === "" ? (NaN as number) : Number(e.target.value) })}
                            onBlur={(e) => patch(it.exerciseId, { sets: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
                            className="h-9 min-w-0 text-center px-1"
                            aria-label={`Počet sérií pre ${it.exerciseName}`}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 shrink-0"
                            onClick={() => patch(it.exerciseId, { sets: Math.min(12, (Number.isFinite(it.sets) ? it.sets : 0) + 1) })}
                            disabled={Number.isFinite(it.sets) && it.sets >= 12}
                            title="Pridať sériu"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Opakovania</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={100}
                          value={Number.isFinite(it.reps) ? it.reps : ""}
                          onChange={(e) => patch(it.exerciseId, { reps: e.target.value === "" ? (NaN as number) : Number(e.target.value) })}
                          onBlur={(e) => patch(it.exerciseId, { reps: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Váha (kg)</label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={it.suggestedWeight ?? ""}
                          onChange={(e) =>
                            patch(it.exerciseId, { suggestedWeight: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })
                          }
                          placeholder="vlastná váha"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Pridať cvik</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hľadaj cvik…" className="pl-9" />
              </div>
              {results.map((ex) => (
                <div key={ex.id} className="rounded-lg border border-border bg-card p-2 flex items-center gap-2">
                  <button onClick={() => setDetail(ex)} className="shrink-0">
                    <img src={IMG(ex.image)} alt={ex.name} loading="lazy" className="h-10 w-10 rounded-md bg-white object-contain" />
                  </button>
                  <button className="text-left min-w-0 flex-1" onClick={() => setDetail(ex)}>
                    <div className="text-sm leading-tight line-clamp-2">{ex.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {muscleLabel(ex.target)} · {equipmentLabel(ex.equipment)}
                    </div>
                  </button>
                  <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => addExercise(ex)} title="Pridať">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Zrušiť
            </Button>
            <Button onClick={save} disabled={saving} className="gap-1">
              <Save className="h-4 w-4" /> {saving ? "Ukladám…" : "Uložiť zmeny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExerciseDetailDialog exercise={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </>
  );
}
