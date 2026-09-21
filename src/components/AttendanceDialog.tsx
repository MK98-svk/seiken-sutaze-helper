import { useMemo, useState } from "react";
import { Member, Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { useCompetitionEntries } from "@/hooks/useClubData";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  competition: Competition;
  members: Member[];
  currentUserId: string | null;
  isAdmin: boolean;
  isCoach: boolean;
}

export default function AttendanceDialog({ competition, members, currentUserId, isAdmin, isCoach }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { setEntry, getEntry } = useCompetitionEntries();
  const seesAll = isAdmin || isCoach;

  const visible = useMemo(() => {
    const base = seesAll ? members : members.filter((m) => m.userId === currentUserId);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((m) => `${m.meno} ${m.priezvisko}`.toLowerCase().includes(q));
  }, [members, seesAll, currentUserId, search]);

  const mine = useMemo(
    () => members.filter((m) => currentUserId != null && m.userId === currentUserId),
    [members, currentUserId]
  );

  if (!seesAll && mine.length === 0) return null;

  const formatDate = (d: string) => {
    try { return format(new Date(d), "d.M.yyyy", { locale: sk }); } catch { return d; }
  };

  const mark = async (m: Member, going: boolean) => {
    try {
      await setEntry(m.id, competition.id, going);
      toast.success(going
        ? `${m.meno} ${m.priezvisko} — ide na súťaž`
        : `${m.meno} ${m.priezvisko} — nejde na súťaž`);
    } catch { /* toast shown by hook */ }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserCheck className="h-4 w-4" />
          Účasť na súťaži
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Účasť na súťaži</DialogTitle>
          <DialogDescription>
            {competition.nazov} — {formatDate(competition.datum)}
          </DialogDescription>
        </DialogHeader>

        {seesAll && (
          <Input
            placeholder="Hľadať meno…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        )}

        <div className="space-y-2">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nikto nenájdený.</p>
          ) : (
            visible.map((m) => {
              const entry = getEntry(m.id, competition.id);
              const going = entry?.registered === true;
              const notGoing = entry?.registered === false;
              return (
                <div key={m.id} className="bg-secondary/30 rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{m.meno} {m.priezvisko}</span>
                    <span className={`text-[11px] shrink-0 ${going ? "text-primary" : notGoing ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                      {going ? "Ide" : notGoing ? "Nejde" : "Bez odpovede"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={going ? "default" : "outline"}
                      className="gap-1.5"
                      onClick={() => mark(m, true)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Idem
                    </Button>
                    <Button
                      size="sm"
                      variant={notGoing ? "secondary" : "outline"}
                      className="gap-1.5"
                      onClick={() => mark(m, false)}
                    >
                      <XCircle className="h-4 w-4" /> Nejdem
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Kto potvrdí účasť, zobrazí sa hneď v listine pretekárov na túto súťaž.
        </p>
      </DialogContent>
    </Dialog>
  );
}
