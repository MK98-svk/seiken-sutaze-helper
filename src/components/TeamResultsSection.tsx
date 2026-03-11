import { useState } from "react";
import { TeamResult } from "@/hooks/useCompetitionResults";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AddTeamResultDialog from "./AddTeamResultDialog";

interface TeamResultsSectionProps {
  competitionId: string;
  discipline: "kata" | "kumite";
  teamResults: TeamResult[];
  isAdmin: boolean;
  deleteTeamResult: (id: string) => Promise<void>;
  addTeamResult: (result: { competitionId: string; discipline: string; category?: string; placement?: number; numCompetitors?: number }) => Promise<void>;
  updateTeamResult: (id: string, updates: { placement?: number | null; numCompetitors?: number | null }) => Promise<void>;
  invalidate: () => void;
}

function getMedalEmoji(placement: number | null) {
  if (placement === 1) return "🥇";
  if (placement === 2) return "🥈";
  if (placement === 3) return "🥉";
  return "";
}

function TeamResultRow({
  result,
  isAdmin,
  onDelete,
  onUpdate,
}: {
  result: TeamResult;
  isAdmin: boolean;
  onDelete: () => void;
  onUpdate: (updates: { placement?: number | null; numCompetitors?: number | null }) => Promise<void>;
}) {
  const [editPlacement, setEditPlacement] = useState(result.placement?.toString() ?? "");
  const [editNum, setEditNum] = useState(result.numCompetitors?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanges =
    (editPlacement !== (result.placement?.toString() ?? "")) ||
    (editNum !== (result.numCompetitors?.toString() ?? ""));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        placement: editPlacement ? Number(editPlacement) : null,
        numCompetitors: editNum ? Number(editNum) : null,
      });
      toast.success("Výsledok uložený");
    } catch {
      toast.error("Chyba pri ukladaní");
    } finally {
      setSaving(false);
    }
  };

  const medal = getMedalEmoji(editPlacement ? Number(editPlacement) : null);

  return (
    <div className="flex items-center gap-2 bg-secondary/60 rounded px-2.5 py-1.5 text-sm">
      {medal && <span>{medal}</span>}
      <span className="text-muted-foreground shrink-0">{result.category || "—"}</span>

      {isAdmin ? (
        <>
          <div className="flex items-center gap-1 ml-auto">
            <Input
              type="number"
              min={1}
              value={editPlacement}
              onChange={(e) => setEditPlacement(e.target.value)}
              placeholder="Um."
              className="h-7 w-14 text-xs text-center"
            />
            <span className="text-xs text-muted-foreground">z</span>
            <Input
              type="number"
              min={1}
              value={editNum}
              onChange={(e) => setEditNum(e.target.value)}
              placeholder="N"
              className="h-7 w-14 text-xs text-center"
            />
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-primary hover:text-primary/80 p-1"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          {result.placement != null && <span className="font-bold text-foreground">{result.placement}.</span>}
          {result.numCompetitors != null && <span>z {result.numCompetitors}</span>}
        </div>
      )}
    </div>
  );
}

export default function TeamResultsSection({
  competitionId,
  discipline,
  teamResults,
  isAdmin,
  deleteTeamResult,
  addTeamResult,
  updateTeamResult,
  invalidate,
}: TeamResultsSectionProps) {
  const filtered = teamResults.filter((r) => r.discipline === discipline);
  const title = discipline === "kata" ? "Kata — Družstvá" : "Kumite — Družstvá";

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
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
            <TeamResultRow
              key={r.id}
              result={r}
              isAdmin={isAdmin}
              onDelete={async () => {
                try { await deleteTeamResult(r.id); toast.success("Tímový výsledok zmazaný"); }
                catch { toast.error("Chyba pri mazaní"); }
              }}
              onUpdate={(updates) => updateTeamResult(r.id, updates)}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Žiadne tímové výsledky</p>
      )}
    </div>
  );
}
