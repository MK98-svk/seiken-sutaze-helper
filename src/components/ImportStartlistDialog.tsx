import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Loader2, Upload, ClipboardList, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";

interface MatchedEntry {
  name: string;
  memberId: string;
  memberName: string;
  confidence: number;
}

interface UnmatchedEntry {
  name: string;
}

interface TeamEntry {
  discipline: string;
  category: string;
  members?: string[];
}

interface ImportStartlistDialogProps {
  competitionId: string;
  competitionName: string;
  members: Member[];
  onImported: () => void;
}

export default function ImportStartlistDialog({ competitionId, competitionName, members, onImported }: ImportStartlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matched, setMatched] = useState<MatchedEntry[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedEntry[]>([]);
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [unmatchedAssignments, setUnmatchedAssignments] = useState<Record<number, string>>({});
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Prosím nahrajte PDF súbor.");
      return;
    }
    setFileName(file.name);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error } = await supabase.functions.invoke("import-competition-results", {
        body: { pdfBase64: base64, competitionId, mode: "startlist" },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setMatched(data.matched || []);
      setUnmatched(data.unmatched || []);
      setTeams(data.teams || []);
      setUnmatchedAssignments({});
      setStep("review");

      if (data.totalFound === 0 && (data.totalTeams || 0) === 0) {
        toast.info("Nenašli sa žiadni členovia Seiken v tejto štartovnej listine.");
      }
    } catch (e: any) {
      toast.error("Chyba pri importe: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Register individual members
      const memberIds: string[] = [];
      for (const m of matched) memberIds.push(m.memberId);
      for (const [, memberId] of Object.entries(unmatchedAssignments)) {
        if (memberId) memberIds.push(memberId);
      }
      const uniqueIds = [...new Set(memberIds)];

      if (uniqueIds.length > 0) {
        const entries = uniqueIds.map((memberId) => ({
          competition_id: competitionId,
          member_id: memberId,
          registered: true,
        }));
        const { error } = await (supabase as any)
          .from("member_competition_entries")
          .upsert(entries, { onConflict: "competition_id,member_id" });
        if (error) throw error;
      }

      // 2. Insert team entries into team_competition_results
      if (teams.length > 0) {
        const teamRows = teams.map((t) => ({
          competition_id: competitionId,
          discipline: t.discipline,
          category: t.category,
          members_text: t.members?.join(", ") || null,
        }));
        const { error: teamError } = await (supabase as any)
          .from("team_competition_results")
          .insert(teamRows);
        if (teamError) throw teamError;
      }

      const parts: string[] = [];
      if (uniqueIds.length > 0) parts.push(`${uniqueIds.length} pretekárov`);
      if (teams.length > 0) parts.push(`${teams.length} družstiev`);
      toast.success(`Zaregistrovaných ${parts.join(" a ")}!`);

      onImported();
      setOpen(false);
      resetState();
    } catch (e: any) {
      toast.error("Chyba pri ukladaní: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setStep("upload");
    setFileName("");
    setMatched([]);
    setUnmatched([]);
    setTeams([]);
    setUnmatchedAssignments({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalIndividuals = matched.length + Object.values(unmatchedAssignments).filter(Boolean).length;
  const hasAnything = totalIndividuals > 0 || teams.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" /> Import štartovnej listiny
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Import štartovnej listiny — {competitionName}</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>PDF so štartovnou listinou</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Spracovávam PDF…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {fileName || "Kliknite pre nahratie PDF so štartovnou listinou"}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Nahrajte štartovnú listinu súťaže. Systém automaticky nájde členov KK Seiken a zaregistruje ich.
              </p>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            {matched.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Priradení jednotlivci ({matched.length})
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Meno z listiny</TableHead>
                        <TableHead className="text-xs">Priradený člen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matched.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{r.name}</TableCell>
                          <TableCell className="text-sm">
                            {r.memberName}
                            {r.confidence < 0.9 && (
                              <Badge variant="outline" className="ml-1.5 text-[10px]">
                                {Math.round(r.confidence * 100)}%
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {teams.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  Družstvá ({teams.length})
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Disciplína</TableHead>
                        <TableHead className="text-xs">Kategória</TableHead>
                        <TableHead className="text-xs">Členovia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">
                            <Badge variant="secondary" className="text-xs capitalize">{t.discipline} družstvá</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{t.category}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.members?.join(", ") || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Družstvá budú vytvorené bez umiestnenia — doplníte ho po súťaži.
                </p>
              </div>
            )}

            {unmatched.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Nepriradení ({unmatched.length})
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Meno z listiny</TableHead>
                        <TableHead className="text-xs">Priradiť k členovi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unmatched.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{r.name}</TableCell>
                          <TableCell>
                            <Select
                              value={unmatchedAssignments[i] || ""}
                              onValueChange={(v) => setUnmatchedAssignments((prev) => ({ ...prev, [i]: v }))}
                            >
                              <SelectTrigger className="h-8 text-xs w-[200px]">
                                <SelectValue placeholder="Vybrať člena…" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.meno} {m.priezvisko}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {matched.length === 0 && unmatched.length === 0 && teams.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenašli sa žiadni členovia KK Seiken v tejto štartovnej listine.
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetState}>Späť</Button>
              <Button onClick={handleSave} disabled={saving || !hasAnything}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registrujem…</>
                ) : (
                  <>Importovať {totalIndividuals > 0 ? `${totalIndividuals} pretekárov` : ""}{totalIndividuals > 0 && teams.length > 0 ? " a " : ""}{teams.length > 0 ? `${teams.length} družstiev` : ""}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}