import { useEffect, useMemo, useState } from "react";
import { Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  competitions: Competition[];
}

const formatDate = (d: string) => {
  try {
    return format(new Date(d), "d.M.yyyy", { locale: sk });
  } catch {
    return d;
  }
};

export default function CompetitionNotifyDialog({ competitions }: Props) {
  const [open, setOpen] = useState(false);
  const [compId, setCompId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [sendAt, setSendAt] = useState("");
  const [sending, setSending] = useState(false);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return competitions.filter((c) => c.datum >= today);
  }, [competitions]);

  // Predvyplnenie textu podľa vybranej súťaže.
  useEffect(() => {
    const comp = upcoming.find((c) => c.id === compId);
    if (!comp) return;
    setTitle(comp.nazov.slice(0, 100));
    setBody(`Súťaž ${comp.nazov} sa koná ${formatDate(comp.datum)}. Nezabudni na výstroj a včasný príchod.`);
    // Predvolený čas odoslania: 18:00 deň pred súťažou.
    const d = new Date(comp.datum);
    d.setDate(d.getDate() - 1);
    d.setHours(18, 0, 0, 0);
    if (d.getTime() > Date.now()) {
      const pad = (n: number) => String(n).padStart(2, "0");
      setSendAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    }
  }, [compId, upcoming]);

  const send = async () => {
    if (!compId) return toast.error("Vyber súťaž.");
    if (!title.trim() || !body.trim()) return toast.error("Vyplň nadpis aj text správy.");
    if (when === "later" && !sendAt) return toast.error("Zadaj dátum a čas odoslania.");

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("notify-competition", {
        body: {
          competitionId: compId,
          title: title.trim(),
          body: body.trim(),
          sendAt: when === "later" ? new Date(sendAt).toISOString() : null,
        },
      });
      if (error) throw error;
      const res = data as { recipients?: number; immediate?: boolean };
      const count = res?.recipients ?? 0;
      if (count === 0) {
        toast.error("Nikto z prihlásených na túto súťaž nemá prepojený účet v aplikácii.");
        return;
      }
      toast.success(
        res?.immediate
          ? `Správa odoslaná (${count} ${count === 1 ? "pretekár" : "pretekárov"}).`
          : `Naplánované na ${format(new Date(sendAt), "d.M.yyyy HH:mm", { locale: sk })} (${count}).`
      );
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Správu sa nepodarilo odoslať. Skús to znova.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2" title="Poslať upozornenie na súťaž">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Upozornenie</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upozornenie na súťaž</DialogTitle>
        </DialogHeader>

        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Momentálne nie sú žiadne nadchádzajúce súťaže.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground font-medium">Súťaž</label>
              <Select value={compId} onValueChange={setCompId}>
                <SelectTrigger>
                  <SelectValue placeholder="— vyber súťaž —" />
                </SelectTrigger>
                <SelectContent>
                  {upcoming.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nazov} — {formatDate(c.datum)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Správa príde len pretekárom prihláseným na túto súťaž.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground font-medium">Nadpis</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground font-medium">Text správy</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={300} />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Kedy odoslať</label>
              <div className="flex gap-2">
                <Button type="button" variant={when === "now" ? "default" : "outline"} size="sm" onClick={() => setWhen("now")}>
                  Hneď
                </Button>
                <Button type="button" variant={when === "later" ? "default" : "outline"} size="sm" onClick={() => setWhen("later")}>
                  Naplánovať
                </Button>
              </div>
              {when === "later" && (
                <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
              )}
            </div>

            <Button className="w-full" onClick={send} disabled={sending}>
              {sending ? "Odosielam…" : when === "now" ? "Odoslať teraz" : "Naplánovať odoslanie"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
