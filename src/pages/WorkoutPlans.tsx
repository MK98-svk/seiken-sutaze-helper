import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Play, Trash2, Save, ClipboardList } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MemberPicker from "@/components/MemberPicker";
import { useAuth } from "@/hooks/useAuth";
import { useTrainableMembers, useCreateWorkout, readDraft, clearDraft } from "@/hooks/useWorkouts";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { toast } from "sonner";

const WorkoutPlans = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { selectable, isLoading: membersLoading } = useTrainableMembers();
  const [memberId, setMemberId] = useState("");
  const { plans, isLoading, savePlan, deletePlan } = useWorkoutPlans(memberId || null);
  const { create } = useCreateWorkout();
  const [name, setName] = useState("");
  const draft = useMemo(() => readDraft(), []);

  const { sessions } = useWorkoutSessions(memberId || null);

  useEffect(() => {
    if (!memberId && selectable.length > 0) setMemberId(selectable[0].id);
  }, [selectable, memberId]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }, []);

  const doneThisWeek = (planName: string) =>
    sessions.filter((s) => s.title === planName && new Date(s.performedAt) >= weekStart).length;


  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const saveDraft = async () => {
    if (!memberId) return toast.error("Vyber pretekára");
    if (!draft.items.length) return toast.error("Nemáš rozpracovaný tréning");
    try {
      await savePlan({
        memberId,
        name: name.trim() || "Môj plán",
        mode: draft.mode || "gym",
        goal: null,
        items: draft.items,
      });
      setName("");
      toast.success("Plán uložený");
    } catch (e: any) {
      toast.error("Nepodarilo sa uložiť: " + e.message);
    }
  };

  const startPlan = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    try {
      const id = await create({
        memberId: plan.memberId,
        mode: plan.mode,
        goal: plan.goal,
        title: plan.name,
        items: plan.items,
      });
      clearDraft();
      navigate(`/posilnovanie/trening/${id}`);
    } catch (e: any) {
      toast.error("Nepodarilo sa spustiť tréning: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader title="Moje plány" subtitle="Ulož si zostavu a cvič ju opakovane" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-5">
        {membersLoading ? (
          <div className="text-sm text-muted-foreground">Načítavam…</div>
        ) : selectable.length === 0 ? (
          <div className="text-sm text-muted-foreground">K tvojmu účtu nie je priradený žiadny pretekár.</div>
        ) : (
          <>
            <MemberPicker members={selectable} value={memberId} onChange={setMemberId} label="Pre koho" />


            {draft.items.length > 0 && (
              <section className="rounded-xl border border-primary/50 bg-primary/10 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <div className="font-display text-sm tracking-wider uppercase">Rozpracovaný tréning</div>
                </div>
                <div className="text-[11px] text-muted-foreground">{draft.items.map((i) => i.exerciseName).join(" · ")}</div>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Názov plánu (napr. Chrbát + biceps)" />
                  <Button onClick={saveDraft} className="gap-1 shrink-0"><Save className="h-4 w-4" /> Uložiť</Button>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Uložené plány</div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Načítavam plány…</div>
              ) : plans.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Zatiaľ žiadne plány. Poskladaj si cviky v katalógu a ulož ich sem.
                </div>
              ) : (
                plans.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-display text-sm tracking-wide uppercase truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.items.length} cvikov · {new Date(p.createdAt).toLocaleDateString("sk-SK")}
                          {p.daysPerWeek ? ` · ${p.daysPerWeek}× do týždňa` : ""}
                        </div>
                        <div className="text-[11px] text-primary">
                          Tento týždeň: {doneThisWeek(p.name)}
                          {p.daysPerWeek ? `/${p.daysPerWeek}` : ""} tréningy
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deletePlan(p.id)} title="Zmazať">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => startPlan(p.id)}>
                          <Play className="h-4 w-4" /> Spustiť
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.items.slice(0, 6).map((i) => (
                        <Badge key={i.exerciseId} variant="outline" className="text-[10px]">{i.exerciseName}</Badge>
                      ))}
                      {p.items.length > 6 && <Badge variant="outline" className="text-[10px]">+{p.items.length - 6}</Badge>}
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default WorkoutPlans;
