import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";

interface AddResultDialogProps {
  competitionId: string;
  member: Member;
  onAdded: () => void;
}

const DISCIPLINES = ["kata", "kumite", "kobudo"];

export default function AddResultDialog({ competitionId, member, onAdded }: AddResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discipline, setDiscipline] = useState("");
  const [category, setCategory] = useState("");
  const [placement, setPlacement] = useState("");

  const handleSave = async () => {
    if (!discipline || !placement) {
      toast.error("Vyplňte disciplínu a umiestnenie.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("competition_results")
        .insert({
          competition_id: competitionId,
          member_id: member.id,
          discipline,
          category: category || null,
          placement: Number(placement),
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
    setCategory("");
    setPlacement("");
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
          <div className="space-y-1.5">
            <Label className="text-xs">Disciplína</Label>
            <Select value={discipline} onValueChange={setDiscipline}>
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
          <div className="space-y-1.5">
            <Label className="text-xs">Kategória (voliteľné)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="napr. junior, senior…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Umiestnenie</Label>
            <Input type="number" min={1} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1, 2, 3…" className="h-9" />
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
