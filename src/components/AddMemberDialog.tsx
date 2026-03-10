import { useState } from "react";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";

const KYU_DAN_OPTIONS = [
  "10. kyu", "9. kyu", "8. kyu", "7. kyu", "6. kyu",
  "5. kyu", "4. kyu", "3. kyu", "2. kyu", "1. kyu",
  "1. dan", "2. dan", "3. dan", "4. dan", "5. dan",
  "6. dan", "7. dan", "8. dan", "9. dan", "10. dan",
];

interface AddMemberDialogProps {
  onAdd: (member: Omit<Member, "id">) => void;
}

export default function AddMemberDialog({ onAdd }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    meno: "",
    priezvisko: "",
    stupen: "",
    pohlavie: "",
    datumNarodenia: "",
    vyska: "",
    vaha: "",
    kata: false,
    kobudo: false,
    kumite: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.meno || !form.priezvisko) return;
    onAdd({
      meno: form.meno,
      priezvisko: form.priezvisko,
      stupen: form.stupen,
      pohlavie: form.pohlavie || null,
      datumNarodenia: form.datumNarodenia,
      vyska: form.vyska ? Number(form.vyska) : null,
      vaha: form.vaha ? Number(form.vaha) : null,
      kata: form.kata,
      kobudo: form.kobudo,
      kumite: form.kumite,
      zlato: 0,
      striebro: 0,
      bronz: 0,
      userId: null,
    });
    setForm({ meno: "", priezvisko: "", stupen: "", pohlavie: "", datumNarodenia: "", vyska: "", vaha: "", kata: false, kobudo: false, kumite: false });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2" title="Pridať člena">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Pridať člena</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nový člen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Meno *</Label>
              <Input value={form.meno} onChange={(e) => setForm({ ...form, meno: e.target.value })} placeholder="Meno" />
            </div>
            <div className="space-y-1.5">
              <Label>Priezvisko *</Label>
              <Input value={form.priezvisko} onChange={(e) => setForm({ ...form, priezvisko: e.target.value })} placeholder="Priezvisko" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stupeň (kyu/dan)</Label>
              <Select value={form.stupen} onValueChange={(v) => setForm({ ...form, stupen: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Vybrať stupeň" />
                </SelectTrigger>
                <SelectContent>
                  {KYU_DAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pohlavie</Label>
              <Select value={form.pohlavie} onValueChange={(v) => setForm({ ...form, pohlavie: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Vybrať" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CH">Chlapec / Muž</SelectItem>
                  <SelectItem value="D">Dievča / Žena</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dátum narodenia</Label>
            <Input type="date" value={form.datumNarodenia} onChange={(e) => setForm({ ...form, datumNarodenia: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Výška (cm)</Label>
              <Input type="number" value={form.vyska} onChange={(e) => setForm({ ...form, vyska: e.target.value })} placeholder="cm" />
            </div>
            <div className="space-y-1.5">
              <Label>Váha (kg)</Label>
              <Input type="number" value={form.vaha} onChange={(e) => setForm({ ...form, vaha: e.target.value })} placeholder="kg" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Disciplíny</Label>
            <div className="flex gap-6">
              {(["kata", "kobudo", "kumite"] as const).map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form[d]} onCheckedChange={(v) => setForm({ ...form, [d]: !!v })} />
                  <span className="capitalize">{d}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Pridať</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
