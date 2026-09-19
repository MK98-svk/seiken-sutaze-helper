import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarOff, Check, Pencil } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  useClubTrainings,
  TYPE_LABEL,
  DAY_LABEL,
  trainingHours,
  type ClubTraining,
} from "@/hooks/useClubTrainings";

const MONTHS = [
  "január", "február", "marec", "apríl", "máj", "jún",
  "júl", "august", "september", "október", "november", "december",
];

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const Trainings = () => {
  const { user, loading, isAdmin, isCoach } = useAuth();
  const { trainings, isLoading, toggleDone, setNote, setTrenujeme } = useClubTrainings();
  const canEdit = isAdmin || isCoach;

  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [editing, setEditing] = useState<ClubTraining | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const months = useMemo(
    () => Array.from(new Set(trainings.map((t) => t.datum.slice(0, 7)))).sort(),
    [trainings]
  );

  const activeMonth = months.includes(month) ? month : months[0] ?? month;
  const idx = months.indexOf(activeMonth);

  const list = useMemo(
    () => trainings.filter((t) => t.datum.startsWith(activeMonth)),
    [trainings, activeMonth]
  );

  const stats = useMemo(() => {
    const planned = list.filter((t) => t.trenujeme);
    const done = planned.filter((t) => t.odcvicene);
    return {
      planned: planned.length,
      done: done.length,
      cancelled: list.length - planned.length,
      hours: done.reduce((a, t) => a + trainingHours(t), 0),
    };
  }, [list]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const [y, m] = activeMonth.split("-");
  const monthTitle = `${MONTHS[Number(m) - 1]} ${y}`;

  const openEdit = (t: ClubTraining) => {
    setEditing(t);
    setNoteDraft(t.poznamka ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    await setNote(editing, noteDraft);
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-10">
      <PageHeader title="Tréningy" subtitle="Kalendár a dochádzka klubu" />

      <main className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={idx <= 0}
            onClick={() => setMonth(months[idx - 1])}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-display text-base sm:text-lg tracking-wider uppercase text-center truncate">
            {monthTitle}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={idx < 0 || idx >= months.length - 1}
            onClick={() => setMonth(months[idx + 1])}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Plánované", value: stats.planned },
            { label: "Odcvičené", value: stats.done, accent: true },
            { label: "Zrušené", value: stats.cancelled },
            { label: "Hodín spolu", value: stats.hours.toFixed(1).replace(".", ",") },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <div className={`font-display text-xl ${s.accent ? "text-primary" : ""}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Načítavam kalendár…</div>}

        <div className="space-y-2">
          {list.map((t, i) => {
            const d = new Date(t.datum + "T00:00:00");
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`rounded-lg border p-3 flex items-start gap-3 ${
                  t.trenujeme
                    ? t.odcvicene
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-card"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="shrink-0 text-center w-11">
                  <div className="font-display text-lg leading-none">{d.getDate()}.</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{DAY_LABEL[d.getDay()].slice(0, 3)}</div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {t.trenujeme ? TYPE_LABEL[t.typ] : "Netrénuje sa"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t.trenujeme ? (
                      <>
                        {t.casOd} – {t.casDo} · {trainingHours(t).toFixed(1).replace(".", ",")} h
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <CalendarOff className="h-3 w-3" /> {TYPE_LABEL[t.typ]}
                      </span>
                    )}
                  </div>
                  {t.poznamka && (
                    <Badge variant="outline" className="mt-1 text-[10px] whitespace-normal text-left">
                      {t.poznamka}
                    </Badge>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {canEdit ? (
                    <>
                      {t.trenujeme && (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={t.odcvicene}
                            onCheckedChange={() => toggleDone(t, user.id)}
                            className="h-5 w-5"
                          />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
                            Odcvičené
                          </span>
                        </label>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    t.odcvicene && <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider uppercase text-base">
              {editing && new Date(editing.datum + "T00:00:00").toLocaleDateString("sk-SK")}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Poznámka</div>
                <Input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="napr. sviatok, náhradná telocvičňa"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await setTrenujeme(editing, !editing.trenujeme);
                  setEditing(null);
                }}
              >
                {editing.trenujeme ? "Označiť ako zrušený tréning" : "Obnoviť tréning"}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={saveEdit}>Uložiť</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainings;
