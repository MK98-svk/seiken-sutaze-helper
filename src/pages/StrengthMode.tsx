import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Youtube, Plus, Check, Play, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { MODES, WorkoutMode, MuscleGroup, groupsFor, exercisesFor, Exercise } from "@/data/exercises";
import { readDraft, writeDraft, clearDraft, PlannedItem } from "@/hooks/useWorkouts";
import { toast } from "sonner";

const StrengthMode = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [draft, setDraft] = useState(readDraft());

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const modeInfo = MODES.find((m) => m.id === mode);
  if (!modeInfo) return <Navigate to="/posilnovanie" replace />;
  const m = mode as WorkoutMode;

  const groups = groupsFor(m);
  const list = group ? exercisesFor(m, group) : [];
  const inDraft = (id: string) => draft.items.some((i) => i.exerciseId === id);

  const addToDraft = (ex: Exercise) => {
    const base = draft.mode === m ? draft.items : [];
    if (base.some((i) => i.exerciseId === ex.id)) return;
    const item: PlannedItem = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.group,
      sets: parseInt(ex.sets) || 3,
      reps: parseInt(ex.reps) || 10,
    };
    const next = { mode: m, items: [...base, item] };
    writeDraft(next);
    setDraft(next);
    toast.success(`${ex.name} pridané do tréningu`);
  };

  const removeFromDraft = (id: string) => {
    const next = { mode: m, items: draft.items.filter((i) => i.exerciseId !== id) };
    writeDraft(next);
    setDraft(next);
  };

  const resetDraft = () => {
    clearDraft();
    setDraft({ mode: "", items: [] });
  };

  const activeItems = draft.mode === m ? draft.items : [];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24">
      <PageHeader title={modeInfo.label} subtitle={group ? undefined : "Vyber si partiu tela"} backTo="/posilnovanie" />

      <main className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(group === g.id ? null : g.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                group === g.id ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span className="mr-1">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>

        {!group && <p className="text-sm text-muted-foreground pt-4">Klikni na partiu tela a zobrazia sa cviky s popisom a videom.</p>}

        <div className="grid gap-2 sm:grid-cols-2">
          {list.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <button className="text-left min-w-0 flex-1" onClick={() => setDetail(ex)}>
                  <div className="font-display text-sm tracking-wide uppercase leading-tight">{ex.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{ex.muscles}</div>
                </button>
                <Button
                  size="icon"
                  variant={inDraft(ex.id) ? "secondary" : "outline"}
                  className="h-8 w-8 shrink-0"
                  onClick={() => (inDraft(ex.id) ? removeFromDraft(ex.id) : addToDraft(ex))}
                  title={inDraft(ex.id) ? "Odobrať z tréningu" : "Pridať do tréningu"}
                >
                  {inDraft(ex.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">{ex.difficulty}</Badge>
                <Badge variant="outline" className="text-[10px]">{ex.equipment}</Badge>
                <Badge variant="outline" className="text-[10px]">{ex.sets} × {ex.reps}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {activeItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-3">
          <div className="max-w-5xl mx-auto flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
              V tréningu: <span className="text-foreground">{activeItems.length} cvikov</span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={resetDraft} title="Vyprázdniť">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/posilnovanie/ai?draft=1")} className="gap-1">
              <Play className="h-4 w-4" /> Spustiť tréning
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{detail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{detail.difficulty}</Badge>
                  <Badge variant="outline">{detail.equipment}</Badge>
                  <Badge variant="outline">{detail.sets} sérií × {detail.reps}</Badge>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Zapojené svaly</div>
                  <p>{detail.muscles}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ako to cvičiť</div>
                  <ol className="list-decimal pl-5 space-y-1">
                    {detail.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Časté chyby</div>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {detail.mistakes.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" className="flex-1 gap-1">
                    <a href={detail.youtube} target="_blank" rel="noreferrer">
                      <Youtube className="h-4 w-4" /> Video
                    </a>
                  </Button>
                  <Button
                    className="flex-1 gap-1"
                    onClick={() => {
                      addToDraft(detail);
                      setDetail(null);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Do tréningu
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrengthMode;
