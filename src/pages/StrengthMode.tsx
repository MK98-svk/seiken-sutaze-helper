import { useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Youtube, Plus, Check, Play, Trash2, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCatalog } from "@/hooks/useCatalog";
import { openExternal, youtubeSearch } from "@/lib/openExternal";

import {
  CATALOG_GROUPS,
  CatalogExercise,
  CatalogMode,
  IMG,
  equipmentLabel,
  muscleLabel,
  CATALOG_ATTRIBUTION,
} from "@/lib/catalog";
import { readDraft, writeDraft, clearDraft, PlannedItem } from "@/hooks/useWorkouts";
import { toast } from "sonner";

const MODE_INFO: Record<CatalogMode, { label: string }> = {
  gym: { label: "Fitko" },
  pomocky: { label: "Doma s pomôckami" },
  bezpomocok: { label: "Doma bez pomôcok" },
};

const PAGE = 40;

const StrengthMode = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { catalog, isLoading: catalogLoading } = useCatalog();
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [detail, setDetail] = useState<CatalogExercise | null>(null);
  const [draft, setDraft] = useState(readDraft());

  const m = mode as CatalogMode;
  const modeInfo = MODE_INFO[m];

  const list = useMemo(() => {
    if (!catalog) return [];
    let base: CatalogExercise[] = [];
    if (query.trim().length >= 2) base = catalog.search(query, m);
    else if (group) base = catalog.inGroup(CATALOG_GROUPS.find((g) => g.id === group)!, m);
    if (equipment) base = base.filter((e) => e.equipment === equipment);
    return base;
  }, [catalog, query, group, equipment, m]);

  const equipmentOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of list) counts.set(e.equipment, (counts.get(e.equipment) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([e]) => e);
  }, [list]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!modeInfo) return <Navigate to="/posilnovanie" replace />;

  const activeItems = draft.mode === m ? draft.items : [];
  const inDraft = (id: string) => activeItems.some((i) => i.exerciseId === id);

  const addToDraft = (ex: CatalogExercise) => {
    if (inDraft(ex.id)) return;
    const item: PlannedItem = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: catalog?.groupOf(ex)?.name ?? muscleLabel(ex.target),
      sets: 3,
      reps: 10,
    };
    const next = { mode: m, items: [...activeItems, item] };
    writeDraft(next);
    setDraft(next);
    toast.success(`${ex.name} pridané do tréningu`);
  };

  const removeFromDraft = (id: string) => {
    const next = { mode: m, items: activeItems.filter((i) => i.exerciseId !== id) };
    writeDraft(next);
    setDraft(next);
  };

  const resetDraft = () => {
    clearDraft();
    setDraft({ mode: "", items: [] });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24">
      <PageHeader title={modeInfo.label} subtitle="Katalóg cvikov s animáciami" backTo="/posilnovanie" />

      <main className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Hľadaj cvik (napr. drep, kliky, bench…)"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATALOG_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setGroup(group === g.id ? null : g.id);
                setEquipment(null);
                setLimit(PAGE);
              }}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                group === g.id ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span className="mr-1">{g.icon}</span>
              {g.name}
            </button>
          ))}
        </div>

        {equipmentOptions.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {equipmentOptions.map((e) => (
              <button
                key={e}
                onClick={() => setEquipment(equipment === e ? null : e)}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  equipment === e ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {equipmentLabel(e)}
              </button>
            ))}
          </div>
        )}

        {catalogLoading && <p className="text-sm text-muted-foreground">Načítavam katalóg cvikov…</p>}

        {!catalogLoading && !group && query.trim().length < 2 && (
          <p className="text-sm text-muted-foreground pt-2">Vyber partiu tela alebo napíš názov cviku – katalóg má vyše 1300 cvikov s animáciami.</p>
        )}

        {list.length > 0 && (
          <p className="text-xs text-muted-foreground">{list.length} cvikov</p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {list.slice(0, limit).map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="rounded-lg border border-border bg-card p-2.5 flex items-center gap-3"
            >
              <button onClick={() => setDetail(ex)} className="shrink-0">
                <img
                  src={IMG(ex.image)}
                  alt={ex.name}
                  loading="lazy"
                  className="h-14 w-14 rounded-md bg-white object-contain"
                />
              </button>
              <button className="text-left min-w-0 flex-1" onClick={() => setDetail(ex)}>
                <div className="font-display text-sm tracking-wide uppercase leading-tight line-clamp-2">{ex.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {muscleLabel(ex.target)} · {equipmentLabel(ex.equipment)}
                </div>
              </button>
              <Button
                size="icon"
                variant={inDraft(ex.id) ? "secondary" : "outline"}
                className="h-8 w-8 shrink-0"
                onClick={() => (inDraft(ex.id) ? removeFromDraft(ex.id) : addToDraft(ex))}
                title={inDraft(ex.id) ? "Odobrať z tréningu" : "Pridať do tréningu"}
              >
                {inDraft(ex.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </motion.div>
          ))}
        </div>

        {list.length > limit && (
          <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + PAGE)}>
            Zobraziť ďalšie
          </Button>
        )}

        {list.length > 0 && <p className="text-[10px] text-muted-foreground text-center pt-2">{CATALOG_ATTRIBUTION}</p>}
      </main>

      {activeItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-3">
          <div className="max-w-5xl mx-auto flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
              V tréningu: <span className="text-foreground">{activeItems.length} cvikov</span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={resetDraft} title="Vyprázdniť">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/posilnovanie/ai?draft=1")} className="gap-1">
              <Play className="h-4 w-4" /> Spustiť tréning
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{detail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <img src={IMG(detail.gif)} alt={detail.name} className="w-full rounded-lg bg-white object-contain" />
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{equipmentLabel(detail.equipment)}</Badge>
                  <Badge variant="outline">{muscleLabel(detail.target)}</Badge>
                  {catalog?.groupOf(detail) && <Badge variant="outline">{catalog.groupOf(detail)!.name}</Badge>}
                </div>
                {detail.secondary.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Zapojené svaly</div>
                    <p>{detail.secondary.map(muscleLabel).join(", ")}</p>
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ako to cvičiť</div>
                  <ol className="list-decimal pl-5 space-y-1">
                    {(catalog?.steps(detail) ?? detail.steps).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => openExternal(youtubeSearch(detail.name + " exercise technique"))}
                  >
                    <Youtube className="h-4 w-4" /> Video
                  </Button>

                  <Button
                    className="flex-1 gap-1"
                    onClick={() => {
                      addToDraft(detail);
                      setDetail(null);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Do tréningu
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrengthMode;
