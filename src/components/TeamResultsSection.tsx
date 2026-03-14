import { useState } from "react";
import { TeamResult } from "@/hooks/useCompetitionResults";
import { X, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddTeamResultDialog from "./AddTeamResultDialog";

interface TeamResultsSectionProps {
  competitionId: string;
  discipline: "kata" | "kumite";
  teamResults: TeamResult[];
  canManage: boolean;
  canDelete: boolean;
  deleteTeamResult: (id: string) => Promise<void>;
  addTeamResult: (result: { competitionId: string; discipline: string; category?: string; placement?: number; numCompetitors?: number }) => Promise<void>;
  updateTeamResult: (id: string, updates: { placement?: number | null; numCompetitors?: number | null }) => Promise<void>;
  invalidate: () => void;
}

function getMedalEmoji(placement: number | null) {
  if (placement === 1) return "🥇";
  if (placement === 2) return "🥈";
  if (placement === 3) return "🥉";
  return null;
}

function EditTeamResultDialog({
  result,
  onSave,
}: {
  result: TeamResult;
  onSave: (updates: { placement?: number | null; numCompetitors?: number | null }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [placement, setPlacement] = useState(result.placement?.toString() ?? "");
  const [numCompetitors, setNumCompetitors] = useState(result.numCompetitors?.toString() ?? "");

  const handleSave = async () => {
    if (!placement) {
      toast.error("Vyplňte umiestnenie.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        placement: Number(placement),
        numCompetitors: numCompetitors ? Number(numCompetitors) : null,
      });
      toast.success("Výsledok uložený");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ? `Chyba pri ukladaní: ${e.message}` : "Chyba pri ukladaní");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-primary p-1"
        title="Doplniť výsledok"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base">
            Výsledok — {result.category || result.discipline}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {result.membersText && <span>{result.membersText}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Umiestnenie</Label>
              <Input
                type="number"
                min={1}
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="1, 2, 3…"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Počet tímov</Label>
              <Input
                type="number"
                min={1}
                value={numCompetitors}
                onChange={(e) => setNumCompetitors(e.target.value)}
                placeholder="napr. 8"
                className="h-9"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Zrušiť</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uložiť"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamResultsSection({
  competitionId,
  discipline,
  teamResults,
  canManage,
  canDelete,
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
        {canManage && (
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
          {filtered.map((r) => {
            const medal = getMedalEmoji(r.placement);
            return (
              <div key={r.id} className="flex items-center bg-secondary/60 rounded px-2.5 py-1.5 text-sm gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {medal && <span className="shrink-0">{medal}</span>}
                    <span className="font-medium truncate">{r.category || "—"}</span>
                    {r.placement != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {r.placement}. {r.numCompetitors != null && `z ${r.numCompetitors}`}
                      </span>
                    )}
                  </div>
                  {r.membersText && (
                    <div className="text-muted-foreground text-xs truncate mt-0.5">{r.membersText}</div>
                  )}
                </div>
                {(canManage || canDelete) && (
                  <div className="flex items-center shrink-0">
                    {canManage && (
                      <EditTeamResultDialog
                        result={r}
                        onSave={(updates) => updateTeamResult(r.id, updates)}
                      />
                    )}
                    {canDelete && (
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Žiadne tímové výsledky</p>
      )}
    </div>
  );
}
