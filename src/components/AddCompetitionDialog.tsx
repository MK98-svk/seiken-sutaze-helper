import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

interface AddCompetitionDialogProps {
  onAdd: (comp: { nazov: string; datum: string }) => void;
}

export default function AddCompetitionDialog({ onAdd }: AddCompetitionDialogProps) {
  const [open, setOpen] = useState(false);
  const [nazov, setNazov] = useState("");
  const [datum, setDatum] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nazov || !datum) return;
    onAdd({ nazov, datum });
    setNazov("");
    setDatum("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2" title="Pridať súťaž">
          <Trophy className="h-4 w-4" />
          <span className="hidden sm:inline">Pridať súťaž</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nová súťaž</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Názov súťaže *</Label>
            <Input value={nazov} onChange={(e) => setNazov(e.target.value)} placeholder="Napr. Majstrovstvá SR" />
          </div>
          <div className="space-y-1.5">
            <Label>Dátum *</Label>
            <Input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Pridať súťaž</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
