import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Loader2, Play, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MemberPicker from "@/components/MemberPicker";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GOALS } from "@/data/exercises";
import { useCatalog } from "@/hooks/useCatalog";
import { CATALOG_GROUPS, CatalogMode, availableIn, equipmentLabel, muscleLabel } from "@/lib/catalog";
import { useTrainableMembers, useCreateWorkout, readDraft, clearDraft, PlannedItem } from "@/hooks/useWorkouts";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";

const MODES: { id: CatalogMode; label: string; icon: string }[] = [
  { id: "gym", label: "Fitko", icon: "🏋️" },
  { id: "pomocky", label: "Doma s pomôckami", icon: "🏠" },
  { id: "bezpomocok", label: "Doma bez pomôcok", icon: "🤸" },
];

import { toast } from "sonner";

const DURATIONS = [20, 30, 45, 60];

function ageOf(dob?: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

const WorkoutAI = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromDraft = params.get("draft") === "1";
  const { selectable, isLoading: membersLoading } = useTrainableMembers();
  const { create } = useCreateWorkout();
  const { catalog, isLoading: catalogLoading, error: catalogError } = useCatalog();

  const [memberId, setMemberId] = useState<string>("");
  const [mode, setMode] = useState<CatalogMode>("gym");
  const [goal, setGoal] = useState<string>("objem");
  const [duration, setDuration] = useState(45);
  const [days, setDays] = useState(3);
  const [groups, setGroups] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<{ title: string; warmup: string[]; stretch: string[]; items: PlannedItem[]; note?: string } | null>(null);

  useEffect(() => {
    if (!memberId && selectable.length > 0) setMemberId(selectable[0].id);
  }, [selectable, memberId]);

  useEffect(() => {
    if (!fromDraft) return;
    const d = readDraft();
    if (d.items.length) {
      setMode((d.mode as CatalogMode) || "gym");
      setPlan({ title: "Môj tréning", warmup: [], stretch: [], items: d.items });
    }
  }, [fromDraft]);

  const member = useMemo(() => selectable.find((m) => m.id === memberId), [selectable, memberId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const toggleGroup = (g: string) => setGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const generate = async () => {
    if (!member) return toast.error("Vyber cvičenca");
    if (!catalog) return toast.error("Katalóg cvikov sa ešte načítava, skús o chvíľu znova");
    setGenerating(true);
    try {
      const selectedGroups = groups.length ? CATALOG_GROUPS.filter((g) => groups.includes(g.id)) : CATALOG_GROUPS;
      const perGroup = Math.max(8, Math.floor(120 / Math.max(1, selectedGroups.length)));
      const pool = new Map<string, { id: string; name: string; group: string; muscle: string; equipment: string }>();
      for (const g of selectedGroups) {
        let taken = 0;
        for (const e of catalog.inGroup(g, mode)) {
          if (taken >= perGroup) break;
          if (!availableIn(e, mode)) continue;
          taken++;
          pool.set(e.id, {
            id: e.id,
            name: e.name,
            group: g.name,
            muscle: muscleLabel(e.target),
            equipment: equipmentLabel(e.equipment),
          });
        }
      }
      const catalogPayload = [...pool.values()];
      if (!catalogPayload.length) throw new Error("Pre zvolené prostredie a partie nie sú dostupné žiadne cviky");


      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          catalog: catalogPayload,
          profile: {
            meno: `${member.meno} ${member.priezvisko}`,
            vek: ageOf(member.datumNarodenia),
            pohlavie: member.pohlavie,
            vyska: member.vyska,
            vaha: member.vaha,
            stupen: member.stupen,
            disciplíny: [member.kata && "kata", member.kobudo && "kobudo", member.kumite && "kumite"].filter(Boolean),
          },
          mode,
          goal,
          duration,
          days,
          groups: selectedGroups.map((g) => g.name),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const items: PlannedItem[] = (data.exercises ?? [])
        .map((it: any) => {
          const ex = catalog.get(String(it.id));
          if (!ex) return null;
          return {
            exerciseId: ex.id,
            exerciseName: ex.name,
            muscleGroup: catalog.groupOf(ex)?.name ?? muscleLabel(ex.target),
            sets: Math.min(6, Math.max(1, Number(it.sets) || 3)),
            reps: Math.min(60, Math.max(1, Number(it.reps) || 10)),
          } as PlannedItem;
        })
        .filter(Boolean);


      if (!items.length) throw new Error("AI nevrátila žiadne cviky, skús to znova");

      const title = data.title || "AI tréning";

      setPlan({
        title,
        warmup: data.warmup ?? [],
        stretch: data.stretch ?? [],
        items,
        note: data.note,
      });

      try {
        await savePlan({ memberId: member.id, name: title, mode, goal, items, daysPerWeek: days });
        toast.success("Plán uložený medzi Moje plány");
      } catch {
        toast.message("Plán sa nepodarilo uložiť, ale môžeš ho hneď spustiť.");
      }
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("429")) toast.error("Priveľa požiadaviek na AI, skús o chvíľu.");
      else if (msg.includes("402")) toast.error("Minuté AI kredity — treba ich doplniť.");
      else toast.error("Nepodarilo sa vygenerovať tréning: " + msg);
    } finally {
      setGenerating(false);
    }
  };

  const start = async () => {
    if (!plan || !member) return;
    try {
      const id = await create({
        memberId: member.id,
        mode,
        goal,
        title: plan.title,
        items: plan.items,
      });
      clearDraft();
      navigate(`/posilnovanie/trening/${id}`);
    } catch (e: any) {
      toast.error("Nepodarilo sa uložiť tréning: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader title="Tréning s AI" subtitle="Plán na mieru podľa profilu" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-5">
        {membersLoading ? (
          <div className="text-muted-foreground text-sm">Načítavam pretekárov…</div>
        ) : selectable.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            K tvojmu účtu nie je priradený žiadny pretekár. Napíš trénerovi, aby ti priradil profil.
          </div>
        ) : (
          <>
            <section className="space-y-2">
              <MemberPicker
                members={selectable}
                value={memberId}
                onChange={(id) => {
                  setMemberId(id);
                  setPlan(null);
                }}
                label="Pre koho"
              />

              {member && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {ageOf(member.datumNarodenia) !== null && <Badge variant="outline">{ageOf(member.datumNarodenia)} r.</Badge>}
                  {member.vyska && <Badge variant="outline">{member.vyska} cm</Badge>}
                  {member.vaha && <Badge variant="outline">{member.vaha} kg</Badge>}
                  {member.stupen && <Badge variant="outline">{member.stupen}</Badge>}
                </div>
              )}
            </section>

            <section className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Kde cvičíš</label>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`rounded-lg border p-2 text-xs text-left ${mode === m.id ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground"}`}
                  >
                    <div className="text-lg">{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Cieľ</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`rounded-lg border px-3 py-2 text-sm ${goal === g.id ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Oddych medzi sériami sa nastaví automaticky podľa cieľa.</p>
            </section>

            <section className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Partie tela (nepovinné)</label>
              <div className="flex flex-wrap gap-2">
                {CATALOG_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGroup(g.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${groups.includes(g.id) ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground"}`}
                  >
                    {g.icon} {g.name}
                  </button>
                ))}

              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Dĺžka</label>
                <div className="flex flex-wrap gap-1">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${duration === d ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground"}`}
                    >
                      {d}′
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Dní v týždni</label>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${days === d ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {catalogError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm space-y-2">
                <div>Nepodarilo sa načítať katalóg cvikov. Skontroluj pripojenie a skús to znova.</div>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Načítať znova</Button>
              </div>
            )}

            <Button onClick={generate} disabled={generating || catalogLoading || !catalog} className="w-full gap-2">
              {generating || catalogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {catalogLoading ? "Načítavam katalóg cvikov…" : generating ? "Generujem tréning…" : "Vygenerovať tréning"}
            </Button>


            {plan && (
              <section className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="font-display text-base tracking-wider uppercase">{plan.title}</div>
                {plan.note && <p className="text-xs text-muted-foreground">{plan.note}</p>}

                {plan.warmup.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Rozcvička</div>
                    <ul className="list-disc pl-5 text-sm space-y-0.5">
                      {plan.warmup.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cviky</div>
                  {plan.items.map((it) => (
                    <div key={it.exerciseId} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5">
                      <span className="text-sm min-w-0 truncate">{it.exerciseName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">{it.sets} × {it.reps}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setPlan({ ...plan, items: plan.items.filter((x) => x.exerciseId !== it.exerciseId) })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {plan.stretch.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Strečing</div>
                    <ul className="list-disc pl-5 text-sm space-y-0.5">
                      {plan.stretch.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <Button onClick={start} className="w-full gap-2" disabled={!plan.items.length}>
                  <Play className="h-4 w-4" /> Spustiť tréning
                </Button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkoutAI;
