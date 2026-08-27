import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkouts";

export default function MemberPlansList({ memberId }: { memberId: string }) {
  const { plans, isLoading } = useWorkoutPlans(memberId);
  const { sessions } = useWorkoutSessions(memberId);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }, []);

  const doneThisWeek = (name: string) =>
    sessions.filter((s) => s.title === name && new Date(s.performedAt) >= weekStart).length;

  if (isLoading) return <div className="text-sm text-muted-foreground">Načítavam plány…</div>;
  if (plans.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Plány</div>
      {plans.map((p) => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-3 space-y-1">
          <div className="font-display text-sm tracking-wide uppercase truncate">{p.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {p.items.length} cvikov · {new Date(p.createdAt).toLocaleDateString("sk-SK")}
            {p.daysPerWeek ? ` · ${p.daysPerWeek}× do týždňa` : ""}
          </div>
          <div className="text-[11px] text-primary">
            Tento týždeň: {doneThisWeek(p.name)}
            {p.daysPerWeek ? `/${p.daysPerWeek}` : ""} tréningy
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {p.items.slice(0, 6).map((i) => (
              <Badge key={i.exerciseId} variant="outline" className="text-[10px]">
                {i.exerciseName}
              </Badge>
            ))}
            {p.items.length > 6 && (
              <Badge variant="outline" className="text-[10px]">
                +{p.items.length - 6}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
