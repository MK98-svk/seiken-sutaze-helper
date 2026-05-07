import { useMemo, useState } from "react";
import { Member, Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList } from "lucide-react";
import { useCompetitionIntents, CompetitionIntent } from "@/hooks/useCompetitionIntents";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  members: Member[];
  competitions: Competition[];
  currentUserId: string;
  isAdmin: boolean;
}

type Draft = {
  kata: boolean; kataGoju: boolean; kataOpen: boolean;
  kobudo: boolean; kumite: boolean;
};

const blank = (): Draft => ({ kata: false, kataGoju: false, kataOpen: false, kobudo: false, kumite: false });

export default function SelfRegisterDialog({ members, competitions, currentUserId, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const { intents, upsertIntent, deleteIntent } = useCompetitionIntents();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const myMembers = useMemo(
    () => isAdmin ? members : members.filter((m) => m.userId === currentUserId),
    [members, currentUserId, isAdmin]
  );

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return competitions.filter((c) => c.datum >= today);
  }, [competitions]);

  if (myMembers.length === 0) return null;

  const key = (memberId: string, compId: string) => `${memberId}|${compId}`;

  const getDraft = (memberId: string, compId: string): Draft => {
    const k = key(memberId, compId);
    if (drafts[k]) return drafts[k];
    const existing = intents.find((i) => i.memberId === memberId && i.competitionId === compId);
    if (existing) {
      return {
        kata: existing.kata, kataGoju: existing.kataGoju, kataOpen: existing.kataOpen,
        kobudo: existing.kobudo, kumite: existing.kumite,
      };
    }
    return blank();
  };

  const setDraft = (memberId: string, compId: string, patch: Partial<Draft>) => {
    const k = key(memberId, compId);
    const cur = getDraft(memberId, compId);
    setDrafts({ ...drafts, [k]: { ...cur, ...patch } });
  };

  const save = async (member: Member, comp: Competition) => {
    const d = getDraft(member.id, comp.id);
    if (d.kata && !d.kataGoju && !d.kataOpen) {
      toast.error("Pri kata vyber aspoň Goju-ryu alebo Open (rengo).");
      return;
    }
    const noneSelected = !d.kata && !d.kobudo && !d.kumite;
    try {
      if (noneSelected) {
        await deleteIntent(member.id, comp.id);
        toast.success("Plán odstránený");
      } else {
        await upsertIntent({
          memberId: member.id, competitionId: comp.id,
          kata: d.kata, kataGoju: d.kataGoju, kataOpen: d.kataOpen,
          kobudo: d.kobudo, kumite: d.kumite,
        });
        toast.success(`${member.meno} ${member.priezvisko} prihlásený na ${comp.nazov}`);
      }
      const k = key(member.id, comp.id);
      const next = { ...drafts }; delete next[k]; setDrafts(next);
    } catch { /* toast already shown */ }
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), "d.M.yyyy", { locale: sk }); } catch { return d; }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2" title="Prihlásiť na súťaž">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Prihlásiť na súťaž</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prihlásenie na súťaž</DialogTitle>
        </DialogHeader>

        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Momentálne nie sú žiadne nadchádzajúce súťaže.</p>
        ) : (
          <div className="space-y-6">
            {upcoming.map((comp) => (
              <div key={comp.id} className="border border-border rounded-lg p-3 space-y-3">
                <div className="font-display font-semibold text-foreground">
                  {comp.nazov} <span className="text-muted-foreground text-sm font-normal">— {formatDate(comp.datum)}</span>
                </div>
                {myMembers.map((m) => {
                  const d = getDraft(m.id, comp.id);
                  const hasIntent = !!intents.find((i) => i.memberId === m.id && i.competitionId === comp.id);
                  return (
                    <div key={m.id} className="bg-secondary/30 rounded p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          {m.meno} {m.priezvisko}
                          {hasIntent && <span className="ml-2 text-xs text-primary">(prihlásený)</span>}
                        </div>
                        <Button size="sm" onClick={() => save(m, comp)}>Uložiť</Button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {m.kata && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <Checkbox checked={d.kata} onCheckedChange={(v) => setDraft(m.id, comp.id, { kata: !!v })} />
                              <span>Kata</span>
                            </label>
                            {d.kata && (
                              <div className="flex items-center gap-3 pl-2 border-l border-border">
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                  <Checkbox checked={d.kataGoju} onCheckedChange={(v) => setDraft(m.id, comp.id, { kataGoju: !!v })} />
                                  <span>Goju-ryu</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                  <Checkbox checked={d.kataOpen} onCheckedChange={(v) => setDraft(m.id, comp.id, { kataOpen: !!v })} />
                                  <span>Open (rengo)</span>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                        {m.kobudo && (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox checked={d.kobudo} onCheckedChange={(v) => setDraft(m.id, comp.id, { kobudo: !!v })} />
                            <span>Kobudo</span>
                          </label>
                        )}
                        {m.kumite && (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox checked={d.kumite} onCheckedChange={(v) => setDraft(m.id, comp.id, { kumite: !!v })} />
                            <span>Kumite</span>
                          </label>
                        )}
                        {!m.kata && !m.kobudo && !m.kumite && (
                          <span className="text-xs text-muted-foreground">V profile nie sú zaškrtnuté žiadne disciplíny — uprav profil cvičenca.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function formatIntentLabel(i: CompetitionIntent): string {
  const parts: string[] = [];
  if (i.kata) {
    const sub: string[] = [];
    if (i.kataGoju) sub.push("Goju");
    if (i.kataOpen) sub.push("Open");
    parts.push(sub.length ? `Kata (${sub.join(", ")})` : "Kata");
  }
  if (i.kobudo) parts.push("Kobudo");
  if (i.kumite) parts.push("Kumite");
  return parts.join(", ");
}
