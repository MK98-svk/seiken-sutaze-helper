import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Check, AlertTriangle, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";

interface MatchedResult {
  name: string;
  discipline: string;
  category: string;
  placement: number;
  memberId: string;
  memberName: string;
  confidence: number;
}

interface UnmatchedResult {
  name: string;
  discipline: string;
  category: string;
  placement: number;
}

interface ImportResultsDialogProps {
  competitionId: string;
  competitionName: string;
  members: Member[];
  onImported: () => void;
}

export default function ImportResultsDialog({ competitionId, competitionName, members, onImported }: ImportResultsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matched, setMatched] = useState<MatchedResult[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedResult[]>([]);
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
      // Convert PDF to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error } = await supabase.functions.invoke("import-competition-results", {
        body: { pdfBase64: base64, competitionId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setMatched(data.matched || []);
      setUnmatched(data.unmatched || []);
      setUnmatchedAssignments({});
      setStep("review");

      if (data.totalFound === 0) {
        toast.info("Nenašli sa žiadne výsledky pre Seiken v tomto PDF.");
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
      const results: Array<{ competition_id: string; member_id: string; discipline: string; category: string; placement: number }> = [];

      for (const r of matched) {
        results.push({
          competition_id: competitionId,
          member_id: r.memberId,
          discipline: r.discipline,
          category: r.category || "",
          placement: r.placement,
        });
      }

      for (const [idx, memberId] of Object.entries(unmatchedAssignments)) {
        if (memberId) {
          const r = unmatched[Number(idx)];
          results.push({
            competition_id: competitionId,
            member_id: memberId,
            discipline: r.discipline,
            category: r.category || "",
            placement: r.placement,
          });
        }
      }

      if (results.length === 0) {
        toast.info("Žiadne výsledky na uloženie.");
        setSaving(false);
        return;
      }

      // Deduplicate
      const uniqueMap = new Map<string, typeof results[number]>();
      for (const r of results) {
        const key = `${r.competition_id}|${r.member_id}|${r.discipline}|${r.category}`;
        uniqueMap.set(key, r);
      }
      const dedupedResults = Array.from(uniqueMap.values());

      const { error } = await (supabase as any)
        .from("competition_results")
        .upsert(dedupedResults, { onConflict: "competition_id,member_id,discipline,category" });

      if (error) throw error;

      toast.success(`Uložených ${dedupedResults.length} výsledkov!`);
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
    setUnmatchedAssignments({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMedalEmoji = (placement: number) => {
    if (placement === 1) return "🥇";
    if (placement === 2) return "🥈";
    if (placement === 3) return "🥉";
    return `${placement}.`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Import výsledkov
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Import výsledkov — {competitionName}</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>PDF súbor s výsledkami</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Spracovávam PDF…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {fileName || "Kliknite pre nahratie PDF súboru s výsledkami"}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Nahrajte PDF s výsledkami súťaže. Systém automaticky nájde výsledky členov KK Seiken.
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
                  Priradené ({matched.length})
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Meno z výsledkov</TableHead>
                        <TableHead className="text-xs">Priradený člen</TableHead>
                        <TableHead className="text-xs">Disciplína</TableHead>
                        <TableHead className="text-xs">Kategória</TableHead>
                        <TableHead className="text-xs text-center">Umiestnenie</TableHead>
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
                          <TableCell className="text-sm capitalize">{r.discipline}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.category || "—"}</TableCell>
                          <TableCell className="text-center text-sm">{getMedalEmoji(r.placement)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {unmatched.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Nepriradené ({unmatched.length})
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="text-xs">Meno z výsledkov</TableHead>
                        <TableHead className="text-xs">Priradiť k členovi</TableHead>
                        <TableHead className="text-xs">Disciplína</TableHead>
                        <TableHead className="text-xs text-center">Umiestnenie</TableHead>
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
                          <TableCell className="text-sm capitalize">{r.discipline}</TableCell>
                          <TableCell className="text-center text-sm">{getMedalEmoji(r.placement)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {matched.length === 0 && unmatched.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenašli sa žiadne výsledky pre KK Seiken v tomto PDF.
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { resetState(); }}>
                Späť
              </Button>
              <Button onClick={handleSave} disabled={saving || (matched.length === 0 && Object.keys(unmatchedAssignments).length === 0)}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ukladám…</> : `Uložiť výsledky`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
