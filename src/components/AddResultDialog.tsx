import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";
import { ALL_INDIVIDUAL_CATEGORIES, getEligibleCategories } from "@/data/competitionCategories";

interface AddResultDialogProps {
  competitionId: string;
  competitionDate?: string;
  member: Member;
  onAdded: () => void;
}

const DISCIPLINES = ["kata", "kumite", "kobudo"] as const;

export default function AddResultDialog({ competitionId, competitionDate, member, onAdded }: AddResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discipline, setDiscipline] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [placement, setPlacement] = useState("");
  const [numCompetitors, setNumCompetitors] = useState("");

  const competitionYear = competitionDate
    ? parseInt(competitionDate.split("-")[0], 10) || new Date().getFullYear()
    : new Date().getFullYear();

  // Get eligible categories based on member attributes and selected discipline
  const eligibleCategories = useMemo(() => {
    if (!discipline) return [];
    return getEligibleCategories(
      ALL_INDIVIDUAL_CATEGORIES,
      {
        pohlavie: member.pohlavie,
        datumNarodenia: member.datumNarodenia,
        stupen: member.stupen,
        vyska: member.vyska,
        vaha: member.vaha,
      },
      discipline,
      competitionYear
    );
  }, [discipline, member, competitionYear]);

  // Check if member is missing key data for proper filtering
  const missingData = useMemo(() => {
    const missing: string[] = [];
    if (!member.pohlavie) missing.push("pohlavie");
    if (!member.datumNarodenia) missing.push("dátum narodenia");
    if (discipline === "kata" && !member.stupen) missing.push("stupeň");
    if (discipline === "kumite") {
      if (!member.vyska) missing.push("výška");
      if (!member.vaha) missing.push("váha");
    }
    return missing;
  }, [member, discipline]);

  const selectedCategory = ALL_INDIVIDUAL_CATEGORIES.find((c) => c.code === categoryCode);

  const handleSave = async () => {
    if (!discipline || !placement) {
      toast.error("Vyplňte disciplínu a umiestnenie.");
      return;
    }
    setSaving(true);
    try {
      const categoryName = selectedCategory?.name || categoryCode || null;
      const { error } = await (supabase as any)
        .from("competition_results")
        .insert({
          competition_id: competitionId,
          member_id: member.id,
          discipline,
          category: categoryName,
          placement: Number(placement),
          num_competitors: numCompetitors ? Number(numCompetitors) : null,
        });
      if (error) throw error;
      toast.success(`Výsledok pridaný pre ${member.meno} ${member.priezvisko}`);
      onAdded();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDiscipline("");
    setCategoryCode("");
    setPlacement("");
    setNumCompetitors("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Pridať výsledok — {member.meno} {member.priezvisko}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Discipline */}
          <div className="space-y-1.5">
            <Label className="text-xs">Disciplína</Label>
            <Select value={discipline} onValueChange={(v) => { setDiscipline(v); setCategoryCode(""); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Vybrať disciplínu" />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINES.map((d) => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Missing data warning */}
          {discipline && missingData.length > 0 && (
            <div className="flex items-start gap-2 rounded-md bg-warning/10 border border-warning/30 p-2 text-xs text-warning-foreground">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
              <span>
                Chýbajúce údaje: <strong>{missingData.join(", ")}</strong>. Zobrazujú sa všetky kategórie pre danú disciplínu.
              </span>
            </div>
          )}

          {/* Category (smart filtered, grouped for kata) */}
          {discipline && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Kategória ({eligibleCategories.length} {eligibleCategories.length === 1 ? "možnosť" : "možností"})
              </Label>
              <Select value={categoryCode} onValueChange={setCategoryCode}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Vybrať kategóriu" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {eligibleCategories.length > 0 ? (
                    discipline === "kata" ? (
                      <>
                        {/* GOJU RYU group */}
                        {eligibleCategories.filter(c => !c.subtype || c.subtype !== "RENGO").length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-xs font-bold text-primary">KATA GOJU RYU</SelectLabel>
                            {eligibleCategories.filter(c => !c.subtype || c.subtype !== "RENGO").map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>
                                <span className="text-xs">{cat.code} — {cat.name}</span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        {/* RENGO OPEN group */}
                        {eligibleCategories.filter(c => c.subtype === "RENGO").length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-xs font-bold text-primary">KATA RENGO OPEN</SelectLabel>
                            {eligibleCategories.filter(c => c.subtype === "RENGO").map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>
                                <span className="text-xs">{cat.code} — {cat.name}</span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </>
                    ) : (
                      eligibleCategories.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          <span className="text-xs">{cat.code} — {cat.name}</span>
                        </SelectItem>
                      ))
                    )
                  ) : (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      Žiadna zodpovedajúca kategória
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Placement */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Umiestnenie</Label>
              <Input type="number" min={1} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1, 2, 3…" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Počet pretekárov</Label>
              <Input type="number" min={1} value={numCompetitors} onChange={(e) => setNumCompetitors(e.target.value)} placeholder="napr. 12" className="h-9" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Zrušiť</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pridať"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
