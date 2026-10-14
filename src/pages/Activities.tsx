import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowUpRight, Clock, Search, ShieldCheck, SlidersHorizontal, Users, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canAccessActivities } from "@/lib/activityAccess";
import { ACTIVITY_CATEGORIES, filterActivities, karateActivities, type KarateActivity } from "@/data/karateActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import ActivityDiagram from "@/components/ActivityDiagram";
import ActivityMotion from "@/components/ActivityMotion";
import { activityMotions } from "@/data/activityMotion";
import activitiesImage from "@/assets/karate-activities.jpg";

export default function Activities() {
  const { user, loading, isAdmin, isCoach } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Všetky");
  const [level, setLevel] = useState("Všetky úrovne");
  const [selected, setSelected] = useState<KarateActivity | null>(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const list = useMemo(() => filterActivities(query, category, level), [query, category, level]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!canAccessActivities(isAdmin, isCoach)) return <Navigate to="/" replace />;

  return <div className="min-h-screen bg-background pb-10">
    <PageHeader title="Aktivity" subtitle="Karate · knižnica trénera" />
    <main className="max-w-5xl mx-auto px-3 py-5 space-y-5">
      <section className="grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_260px] items-center gap-4 border-b border-border pb-5">
        <div className="min-w-0 space-y-2">
          <div className="text-xs text-primary flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> KK SEIKEN · tréneri</div>
          <h2 className="font-display text-2xl sm:text-3xl">Karate aktivity</h2>
          <p className="text-sm text-muted-foreground">Reflex. Rýchlosť. Precíznosť. Technika.</p>
          <p className="text-xs text-muted-foreground">{karateActivities.length} aktivít · {ACTIVITY_CATEGORIES.length - 1} oblastí</p>
        </div>
        <img src={activitiesImage} alt="Ilustračná scéna karate tréningu na lapu" width={1536} height={1024} className="w-full aspect-square sm:aspect-[3/2] object-cover rounded-md" />
      </section>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Hľadať aktivity" placeholder="Hľadať aktivitu, cieľ alebo pomôcku…" className="pl-9 pr-10" value={query} onChange={(e) => setQuery(e.target.value)} />{query && <Button size="icon" variant="ghost" className="absolute right-0 top-0" aria-label="Vymazať hľadanie" onClick={() => setQuery("")}><X /></Button>}</div>
          <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" /><select aria-label="Úroveň aktivity" value={level} onChange={(e) => setLevel(e.target.value)} className="h-10 min-w-0 w-full sm:w-48 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option>Všetky úrovne</option><option>Začiatočníci</option><option>Pokročilí</option></select></div>
        </div>
        <div className="flex flex-wrap gap-1.5" aria-label="Oblasti aktivít">{ACTIVITY_CATEGORIES.map((c) => <Button key={c} size="sm" variant={category === c ? "default" : "secondary"} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</Button>)}</div>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">Zobrazené aktivity: {list.length} / {karateActivities.length}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((a) => <article key={a.id} className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
          {activityMotions[a.id] ? <ActivityMotion data={activityMotions[a.id]} name={a.name} compact /> : <ActivityDiagram activity={a} compact />}
          <div className="p-4 flex flex-col flex-1 gap-3">
            <div className="flex flex-wrap gap-1.5"><Badge variant="secondary" className="text-primary">{a.category}</Badge><Badge variant="outline">{a.age}</Badge></div>
            <h3 className="font-display text-lg leading-snug tracking-normal normal-case">{a.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{a.summary}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex gap-1 items-center"><Clock className="h-3.5 w-3.5" />{a.duration} min</span><span className="inline-flex gap-1 items-center"><Users className="h-3.5 w-3.5" />{a.people}</span></div>
            <Button variant="outline" className="w-full justify-between" onClick={() => { setSelected(a); setShowFloorPlan(false); }}>Otvoriť aktivitu <ArrowUpRight /></Button>
          </div>
        </article>)}
      </div>
      {list.length === 0 && <div className="py-10 text-center space-y-3"><p className="text-muted-foreground">Žiadna aktivita nezodpovedá výberu.</p><Button variant="outline" onClick={() => { setQuery(""); setCategory("Všetky"); setLevel("Všetky úrovne"); }}>Zrušiť filtre</Button></div>}
      <p className="text-xs text-muted-foreground border-t border-border pt-4">Vlastná metodická knižnica KK SEIKEN. Vek a dávkovanie sú orientačné; tréner ich prispôsobí schopnostiam a zdravotnému stavu skupiny.</p>
    </main>

    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        {selected && <>
          <DialogHeader className="pr-6 text-left"><DialogTitle className="font-display text-xl tracking-normal">{selected.name}</DialogTitle><DialogDescription>{selected.goal}</DialogDescription></DialogHeader>
          <div className="flex flex-wrap gap-1.5"><Badge>{selected.category}</Badge><Badge variant="outline">{selected.level}</Badge><Badge variant="outline">{selected.age}</Badge><Badge variant="outline">{selected.duration} min</Badge><Badge variant="outline">{selected.people}</Badge></div>
          <div className="grid md:grid-cols-2 gap-5 items-start">
            <div className="space-y-4">
              <section className="border border-border rounded-md overflow-hidden">
                {activityMotions[selected.id] && <div className="flex gap-1 p-2 border-b border-border" role="group" aria-label="Zobrazenie ukážky"><Button size="sm" variant={!showFloorPlan ? "default" : "secondary"} aria-pressed={!showFloorPlan} onClick={() => setShowFloorPlan(false)}>Pohyb</Button><Button size="sm" variant={showFloorPlan ? "default" : "secondary"} aria-pressed={showFloorPlan} onClick={() => setShowFloorPlan(true)}>Rozmiestnenie</Button></div>}
                {activityMotions[selected.id] && !showFloorPlan ? <ActivityMotion data={activityMotions[selected.id]} name={selected.name} /> : <ActivityDiagram activity={selected} />}
              </section>
              <section className="text-sm space-y-1"><h4 className="text-xs text-muted-foreground tracking-normal">Pomôcky</h4><p>{selected.equipment.join(" · ")}</p></section>
              <section className="text-sm space-y-1"><h4 className="text-xs text-muted-foreground tracking-normal">Dávkovanie</h4><p>{selected.dose}</p></section>
              <section className="text-sm space-y-1"><h4 className="text-xs text-muted-foreground tracking-normal">Čo sledovať</h4><p>{selected.measure}</p></section>
            </div>
            <div className="space-y-5 text-sm leading-relaxed">
              <section className="space-y-2"><h4 className="font-display text-base tracking-normal">Príprava</h4><p>{selected.setup}</p></section>
              <section className="space-y-2"><h4 className="font-display text-base tracking-normal">Postup</h4><ol className="space-y-3">{selected.steps.map((s, i) => <li key={s} className="flex gap-2.5"><span className="text-primary font-display shrink-0">{i + 1}.</span><span>{s}</span></li>)}</ol></section>
              <section className="space-y-2"><h4 className="font-display text-base tracking-normal">Trénerské body</h4><ul className="list-disc pl-4 space-y-1">{selected.cues.map((c) => <li key={c}>{c}</li>)}</ul></section>
              <section className="border-t border-border pt-3 space-y-3"><div><h4 className="text-xs text-primary tracking-normal">Jednoduchšia verzia</h4><p>{selected.easier}</p></div><div><h4 className="text-xs text-primary tracking-normal">Ťažšia verzia</h4><p>{selected.harder}</p></div></section>
            </div>
          </div>
          <section className="border-t border-border pt-3 space-y-1"><h4 className="text-xs text-primary flex items-center gap-1.5 tracking-normal"><ShieldCheck className="h-4 w-4" />Bezpečnosť</h4><p className="text-sm leading-relaxed">{selected.safety}</p></section>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}