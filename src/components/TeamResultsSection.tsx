import { TeamResult } from "@/hooks/useCompetitionResults";
import { X } from "lucide-react";
import { toast } from "sonner";
import AddTeamResultDialog from "./AddTeamResultDialog";

interface TeamResultsSectionProps {
  competitionId: string;
  discipline: "kata" | "kumite";
  teamResults: TeamResult[];
  isAdmin: boolean;
  deleteTeamResult: (id: string) => Promise<void>;
  addTeamResult: (result: { competitionId: string; discipline: string; category?: string; placement?: number; numCompetitors?: number }) => Promise<void>;
  invalidate: () => void;
}

function getMedalEmoji(placement: number | null) {
  if (placement === 1) return "🥇";
  if (placement === 2) return "🥈";
  if (placement === 3) return "🥉";
  return "";
}

export default function TeamResultsSection({
  competitionId,
  discipline,
  teamResults,
  isAdmin,
  deleteTeamResult,
  addTeamResult,
  invalidate,
}: TeamResultsSectionProps) {
  const filtered = teamResults.filter((r) => r.discipline === discipline);

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize">{discipline} — družstvá</h3>
        {isAdmin && (
          <AddTeamResultDialog
            competitionId={competitionId}
            discipline={discipline}
            onAdded={invalidate}
            addTeamResult={addTeamResult}
          />
        )}
      </div>
      {filtered.length > 0 ? (
        <div className="space-y-1">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-secondary/60 rounded px-2.5 py-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                {getMedalEmoji(r.placement) && <span>{getMedalEmoji(r.placement)}</span>}
                <span className="font-bold">{r.placement}.</span>
                {r.category && <span className="text-muted-foreground">({r.category})</span>}
                {r.numCompetitors && <span className="text-xs text-muted-foreground">z {r.numCompetitors}</span>}
              </div>
              {isAdmin && (
                <button
                  onClick={async () => {
                    try { await deleteTeamResult(r.id); toast.success("Tímový výsledok zmazaný"); }
                    catch { toast.error("Chyba pri mazaní"); }
                  }}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Žiadne tímové výsledky</p>
      )}
    </div>
  );
}
