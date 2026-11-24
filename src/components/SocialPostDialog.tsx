import { useEffect, useMemo, useState } from "react";
import { Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildSocialPost, PostIndividual, PostTeam } from "@/lib/socialPost";

const DAYS = ["V nedeľu", "V pondelok", "V utorok", "V stredu", "Vo štvrtok", "V piatok", "V sobotu"];
const MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"];
const dateLabel = (d: string) => {
  const dt = new Date(d + "T12:00:00");
  return `${DAYS[dt.getDay()]} ${dt.getDate()}. ${MONTHS[dt.getMonth()]}`;
};

export default function SocialPostDialog({ competitions }: { competitions: Competition[] }) {
  const [open, setOpen] = useState(false);
  const past = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...competitions].filter((c) => c.datum <= today).sort((a, b) => b.datum.localeCompare(a.datum));
  }, [competitions]);
  const [compId, setCompId] = useState("");
  const [platform, setPlatform] = useState<"fb" | "ig">("fb");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open && !compId && past[0]) setCompId(past[0].id); }, [open, past, compId]);

  useEffect(() => {
    const comp = competitions.find((c) => c.id === compId);
    if (!open || !comp) return;
    let cancel = false;
    setLoading(true);
    (async () => {
      const [res, teams, entries] = await Promise.all([
        supabase.from("competition_results").select("placement, members(meno, priezvisko)").eq("competition_id", compId),
        supabase.from("team_competition_results").select("discipline, members_text, placement").eq("competition_id", compId),
        supabase.from("member_competition_entries").select("member_id").eq("competition_id", compId).eq("registered", true),
      ]);
      if (cancel) return;
      const individuals: PostIndividual[] = (res.data ?? []).map((r: any) => ({
        name: r.members?.meno ?? "", surname: r.members?.priezvisko ?? "", placement: r.placement,
      }));
      const teamList: PostTeam[] = (teams.data ?? []).map((t: any) => ({ discipline: t.discipline, members: t.members_text ?? "", placement: t.placement }));
      const participants = new Set((entries.data ?? []).map((e: any) => e.member_id)).size;
      setText(buildSocialPost({ competitionName: comp.nazov, dateLabel: dateLabel(comp.datum), participants, individuals, teams: teamList, platform }));
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [open, compId, platform, competitions]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast.success("Text skopírovaný"); }
    catch { toast.error("Kopírovanie zlyhalo, označ text ručne"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Príspevok na FB/IG">
          <Megaphone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Príspevok o výsledkoch</DialogTitle></DialogHeader>
        <select
          value={compId}
          onChange={(e) => setCompId(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {past.map((c) => <option key={c.id} value={c.id}>{c.nazov} ({c.datum.split("-").reverse().join(".")})</option>)}
        </select>
        <div className="flex gap-2">
          <Button variant={platform === "fb" ? "default" : "outline"} size="sm" onClick={() => setPlatform("fb")}>Facebook</Button>
          <Button variant={platform === "ig" ? "default" : "outline"} size="sm" onClick={() => setPlatform("ig")}>Instagram</Button>
        </div>
        <Textarea value={loading ? "Načítavam výsledky…" : text} onChange={(e) => setText(e.target.value)} rows={16} className="text-sm" />
        <p className="text-xs text-muted-foreground">Text môžeš pred skopírovaním upraviť (napr. počet členov výpravy).</p>
        <Button onClick={copy} disabled={loading || !text}><Copy className="h-4 w-4 mr-2" />Kopírovať text</Button>
      </DialogContent>
    </Dialog>
  );
}
