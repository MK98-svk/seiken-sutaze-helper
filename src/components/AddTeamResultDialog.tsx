import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddTeamResultDialogProps {
  competitionId: string;
  discipline: "kata" | "kumite";
  onAdded: () => void;
  addTeamResult: (result: { competitionId: string; discipline: string; category?: string; placement?: number; numCompetitors?: number }) => Promise<void>;
}

export default function AddTeamResultDialog({ competitionId, discipline, onAdded, addTeamResult }: AddTeamResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [placement, setPlacement] = useState("");
  const [numCompetitors, setNumCompetitors] = useState("");

  const handleSave = async () => {
    if (!placement) {
      toast.error("Vyplňte umiestnenie.");
      return;
    }
    setSaving(true);
    try {
      await addTeamResult({
        competitionId,
        discipline,
        category: category || undefined,
        placement: Number(placement),
        numCompetitors: numCompetitors ? Number(numCompetitors) : undefined,
      });
      toast.success(`Tímový výsledok pridaný`);
      onAdded();
      setOpen(false);
      setCategory("");
      setPlacement("");
      setNumCompetitors("");
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <Plus className="h-3 w-3" /> Pridať {discipline} družstvo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base capitalize">
            {discipline} družstvo — výsledok
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Kategória (voliteľné)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="napr. Junior" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Umiestnenie</Label>
              <Input type="number" min={1} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1, 2, 3…" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Počet tímov</Label>
              <Input type="number" min={1} value={numCompetitors} onChange={(e) => setNumCompetitors(e.target.value)} placeholder="napr. 8" className="h-9" />
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
