import { useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTrainableMembers } from "@/hooks/useWorkouts";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

const CoachMembers = () => {
  const { user, loading, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();
  const { members, isLoading } = useTrainableMembers();

  const { data: rows = [] } = useQuery({
    queryKey: ["coach_sessions_overview"],
    enabled: isAdmin || isCoach,
    queryFn: async () => {
      const { data, error } = await db.from("workout_sessions").select("member_id, performed_at, completed");
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; last: string | null; month: number }>();
    const ym = new Date().toISOString().slice(0, 7);
    for (const r of rows as any[]) {
      const cur = map.get(r.member_id) ?? { count: 0, last: null, month: 0 };
      cur.count++;
      if (!cur.last || r.performed_at > cur.last) cur.last = r.performed_at;
      if (String(r.performed_at).slice(0, 7) === ym) cur.month++;
      map.set(r.member_id, cur);
    }
    return map;
  }, [rows]);

  const sorted = useMemo(
    () =>
      [...members].sort((a, b) => {
        const sa = stats.get(a.id), sb = stats.get(b.id);
        if ((sb?.count ?? 0) !== (sa?.count ?? 0)) return (sb?.count ?? 0) - (sa?.count ?? 0);
        return a.priezvisko.localeCompare(b.priezvisko, "sk");
      }),
    [members, stats]
  );

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isCoach) return <Navigate to="/posilnovanie" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader title="Cvičenci" subtitle="Prehľad tréningov a progresu" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Načítavam členov…</div>
        ) : (
          sorted.map((m) => {
            const s = stats.get(m.id);
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/posilnovanie/cvicenci/${m.id}`)}
                className="w-full text-left rounded-lg border border-border bg-card p-3 flex items-center gap-2 hover:border-primary/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm tracking-wide uppercase truncate">{m.meno} {m.priezvisko}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s ? `${s.count} tréningov · naposledy ${new Date(s.last!).toLocaleDateString("sk-SK")}` : "Zatiaľ netrénoval"}
                  </div>
                </div>
                {s?.month ? <Badge className="shrink-0 text-[10px]">{s.month} tento mesiac</Badge> : null}
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })
        )}
      </main>
    </div>
  );
};

export default CoachMembers;
