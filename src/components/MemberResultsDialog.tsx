import { Member, Competition } from "@/types/member";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface Props {
  member: Member | null;
  competitions?: Competition[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const placementLabel = (p: number | null, n: number | null) => {
  if (!p) return "bez umiestnenia";
  const medal = p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : "";
  return `${medal} ${p}. miesto${n ? ` z ${n}` : ""}`.trim();
};

export default function MemberResultsDialog({ member, competitions, open, onOpenChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["member_history", member?.id],
    enabled: open && !!member,
    queryFn: async () => {
      const [indiv, teams] = await Promise.all([
        (supabase as any)
          .from("competition_results")
          .select("*")
          .eq("member_id", member!.id),
        (supabase as any).from("team_competition_results").select("*"),
      ]);
      if (indiv.error) throw indiv.error;
      if (teams.error) throw teams.error;
      return { indiv: indiv.data ?? [], teams: teams.data ?? [] };
    },
  });

  const compById = new Map(competitions.map((c) => [c.id, c]));

  const surname = member ? norm(member.priezvisko) : "";
  const firstName = member ? norm(member.meno) : "";

  const teamRows = (data?.teams ?? []).filter((t: any) => {
    const txt = norm(`${t.members_text ?? ""} ${t.team_name ?? ""}`);
    if (!surname) return false;
    return txt.includes(surname) || (firstName && txt.includes(`${firstName} ${surname}`));
  });

  type Row = {
    key: string;
    compId: string;
    discipline: string;
    category: string | null;
    placement: number | null;
    num: number | null;
    team?: string | null;
  };

  const rows: Row[] = [
    ...(data?.indiv ?? []).map((r: any) => ({
      key: `i-${r.id}`,
      compId: r.competition_id,
      discipline: r.discipline,
      category: r.category,
      placement: r.placement,
      num: r.num_competitors,
    })),
    ...teamRows.map((r: any) => ({
      key: `t-${r.id}`,
      compId: r.competition_id,
      discipline: r.discipline,
      category: r.category,
      placement: r.placement,
      num: r.num_competitors,
      team: r.team_name || r.members_text,
    })),
  ];

  const grouped = new Map<string, Row[]>();
  rows.forEach((r) => {
    const list = grouped.get(r.compId) ?? [];
    list.push(r);
    grouped.set(r.compId, list);
  });

  const orderedComps = [...grouped.entries()].sort((a, b) => {
    const da = compById.get(a[0])?.datum ?? "";
    const db = compById.get(b[0])?.datum ?? "";
    return db.localeCompare(da);
  });

  const medals = {
    zlato: rows.filter((r) => r.placement === 1).length,
    striebro: rows.filter((r) => r.placement === 2).length,
    bronz: rows.filter((r) => r.placement === 3).length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {member?.meno} {member?.priezvisko}
          </DialogTitle>
          <DialogDescription>Výsledky zo všetkých súťaží (jednotlivci aj družstvá)</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Zatiaľ žiadne zaznamenané výsledky.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm bg-secondary/50 rounded-lg px-3 py-2">
              <span>🥇 <strong>{medals.zlato}</strong></span>
              <span>🥈 <strong>{medals.striebro}</strong></span>
              <span>🥉 <strong>{medals.bronz}</strong></span>
              <span className="text-muted-foreground ml-auto">{orderedComps.length} súťaží</span>
            </div>

            {orderedComps.map(([compId, list]) => {
              const comp = compById.get(compId);
              return (
                <div key={compId} className="rounded-lg border border-border">
                  <div className="px-3 py-2 bg-secondary/40 border-b border-border">
                    <div className="font-medium text-sm">{comp?.nazov ?? "Neznáma súťaž"}</div>
                    {comp?.datum && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(comp.datum), "d.M.yyyy", { locale: sk })}
                      </div>
                    )}
                  </div>
                  <ul className="divide-y divide-border">
                    {list.map((r) => (
                      <li key={r.key} className="px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                        <span className="capitalize font-medium">{r.discipline}</span>
                        {r.team && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            družstvo: {r.team}
                          </span>
                        )}
                        {r.category && <span className="text-xs text-muted-foreground">({r.category})</span>}
                        <span className="ml-auto whitespace-nowrap">{placementLabel(r.placement, r.num)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
