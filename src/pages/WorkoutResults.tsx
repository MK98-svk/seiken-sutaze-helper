import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Dumbbell, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MemberPicker from "@/components/MemberPicker";
import { useAuth } from "@/hooks/useAuth";
import { useTrainableMembers, useWorkoutSessions, useCreateWorkout } from "@/hooks/useWorkouts";
import { MODES, GROUPS } from "@/data/exercises";
import { toast } from "sonner";

const WorkoutResults = () => {
  const { user, loading } = useAuth();
  const { selectable, isStaff } = useTrainableMembers();
  const [memberId, setMemberId] = useState<string>("all");
  const { sessions, sets } = useWorkoutSessions(memberId === "all" ? null : memberId);
  const { remove } = useCreateWorkout();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = sessions.filter((s) => {
      const d = new Date(s.performedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const volume = sets.reduce((acc, s) => acc + (s.done && s.weight && s.reps ? s.weight * s.reps : 0), 0);
    const groupCount = new Map<string, number>();
    sets.forEach((s) => s.muscleGroup && groupCount.set(s.muscleGroup, (groupCount.get(s.muscleGroup) ?? 0) + 1));
    const top = Array.from(groupCount.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      total: sessions.length,
      thisMonth,
      volume: Math.round(volume),
      topGroup: top ? GROUPS.find((g) => g.id === top[0])?.label ?? top[0] : "—",
    };
  }, [sessions, sets]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const memberName = (id: string) => {
    const m = selectable.find((x) => x.id === id);
    return m ? `${m.meno} ${m.priezvisko}` : "";
  };

  const onDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success("Tréning vymazaný");
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader title="Výsledky cvičenia" subtitle="História tréningov" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {(selectable.length > 1 || isStaff) && (
          <MemberPicker members={selectable} value={memberId} onChange={setMemberId} withAll />
        )}

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Tréningov", value: stats.total },
            { label: "Tento mesiac", value: stats.thisMonth },
            { label: "Objem (kg)", value: stats.volume },
            { label: "Top partia", value: stats.topGroup },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg border border-border p-2 text-center">
              <div className="text-base sm:text-xl font-display font-bold text-primary truncate">{s.value}</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && <p className="text-sm text-muted-foreground pt-4">Zatiaľ žiadne zapísané tréningy.</p>}

        <div className="space-y-2">
          {sessions.map((s, i) => {
            const mySets = sets.filter((x) => x.sessionId === s.id);
            const byEx = new Map<string, typeof mySets>();
            mySets.forEach((x) => byEx.set(x.exerciseId, [...(byEx.get(x.exerciseId) ?? []), x]));
            const vol = mySets.reduce((a, x) => a + (x.weight && x.reps ? x.weight * x.reps : 0), 0);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-lg border border-border bg-card p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(s.performedAt).toLocaleDateString("sk-SK")}
                      {memberId === "all" && <span className="truncate">• {memberName(s.memberId)}</span>}
                    </div>
                    <div className="font-display text-sm tracking-wide uppercase leading-tight mt-0.5">{s.title || "Tréning"}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => onDelete(s.id)} title="Vymazať">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">{MODES.find((m) => m.id === s.mode)?.label ?? s.mode}</Badge>
                  {s.durationMin && <Badge variant="outline" className="text-[10px]">{s.durationMin} min</Badge>}
                  {vol > 0 && <Badge variant="outline" className="text-[10px]">{Math.round(vol)} kg objem</Badge>}
                  {!s.completed && <Badge variant="secondary" className="text-[10px]">Neukončený</Badge>}
                </div>

                <div className="space-y-0.5">
                  {Array.from(byEx.entries()).map(([exId, list]) => (
                    <div key={exId} className="flex items-start gap-2 text-xs">
                      <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="min-w-0">
                        <span className="text-foreground">{list[0].exerciseName}</span>{" "}
                        <span className="text-muted-foreground">
                          {list
                            .filter((x) => x.done || x.weight || x.reps)
                            .map((x) => `${x.weight ? x.weight + "kg×" : ""}${x.reps ?? "?"}`)
                            .join(", ") || "nezapísané"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default WorkoutResults;
