import { useState, useEffect } from "react";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const KYU_DAN_OPTIONS = [
  "10. kyu", "9. kyu", "8. kyu", "7. kyu", "6. kyu",
  "5. kyu", "4. kyu", "3. kyu", "2. kyu", "1. kyu",
  "1. dan", "2. dan", "3. dan", "4. dan", "5. dan",
  "6. dan", "7. dan", "8. dan", "9. dan", "10. dan",
];

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Member>) => void;
}

export default function EditMemberDialog({ member, open, onOpenChange, onSave }: EditMemberDialogProps) {
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
    zlato: "0",
    striebro: "0",
    bronz: "0",
  });

  useEffect(() => {
    if (member) {
      setForm({
        meno: member.meno,
        priezvisko: member.priezvisko,
        stupen: member.stupen,
        pohlavie: member.pohlavie ?? "",
        datumNarodenia: member.datumNarodenia,
        vyska: member.vyska?.toString() ?? "",
        vaha: member.vaha?.toString() ?? "",
        kata: member.kata,
        kobudo: member.kobudo,
        kumite: member.kumite,
        zlato: (member.zlato ?? 0).toString(),
        striebro: (member.striebro ?? 0).toString(),
        bronz: (member.bronz ?? 0).toString(),
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !form.meno || !form.priezvisko) return;
    onSave(member.id, {
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
      zlato: Number(form.zlato) || 0,
      striebro: Number(form.striebro) || 0,
      bronz: Number(form.bronz) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upraviť člena</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Meno *</Label>
              <Input value={form.meno} onChange={(e) => setForm({ ...form, meno: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Priezvisko *</Label>
              <Input value={form.priezvisko} onChange={(e) => setForm({ ...form, priezvisko: e.target.value })} />
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
          <div className="space-y-2">
            <Label>Medaily</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">🥇 Zlaté</Label>
                <Input type="number" min={0} value={form.zlato} onChange={(e) => setForm({ ...form, zlato: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">🥈 Strieborné</Label>
                <Input type="number" min={0} value={form.striebro} onChange={(e) => setForm({ ...form, striebro: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">🥉 Bronzové</Label>
                <Input type="number" min={0} value={form.bronz} onChange={(e) => setForm({ ...form, bronz: e.target.value })} />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full">Uložiť zmeny</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
