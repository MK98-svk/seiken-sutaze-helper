import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trash2 } from "lucide-react";
import { useWorkoutSessions, useCreateWorkout } from "@/hooks/useWorkouts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("sk-SK", { day: "numeric", month: "numeric" });

export default function MemberProgress({ memberId }: { memberId: string }) {
  const { sessions, sets, isLoading } = useWorkoutSessions(memberId);
  const [exercise, setExercise] = useState<string>("");
  const navigate = useNavigate();
  const { remove } = useCreateWorkout();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const deleteSession = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete);
      toast.success("Tréning zmazaný");
    } catch (e: any) {
      toast.error("Nepodarilo sa zmazať: " + e.message);
    } finally {
      setToDelete(null);
    }
  };

  const setsBySession = useMemo(() => {
    const m = new Map<string, typeof sets>();
    for (const s of sets) {
      const arr = m.get(s.sessionId) ?? [];
      arr.push(s);
      m.set(s.sessionId, arr);
    }
    return m;
  }, [sets]);

  const volumeOf = (sessionId: string) =>
    (setsBySession.get(sessionId) ?? []).reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);

  const weekly = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.performedAt);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + volumeOf(s.id));
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([week, objem]) => ({ week: fmtDate(week), objem: Math.round(objem) }));
  }, [sessions, setsBySession]);

  const byGroup = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sets) {
      const key = s.muscleGroup || "iné";
      map.set(key, (map.get(key) ?? 0) + (s.weight ?? 0) * (s.reps ?? 0));
    }
    return [...map.entries()]
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([partia, objem]) => ({ partia, objem: Math.round(objem) }));
  }, [sets]);

  const exerciseNames = useMemo(() => [...new Set(sets.map((s) => s.exerciseName))].sort(), [sets]);
  const activeExercise = exercise || exerciseNames[0] || "";

  const exerciseSeries = useMemo(() => {
    if (!activeExercise) return [];
    const dateOf = new Map(sessions.map((s) => [s.id, s.performedAt]));
    const map = new Map<string, number>();
    for (const s of sets) {
      if (s.exerciseName !== activeExercise || !s.weight) continue;
      const d = dateOf.get(s.sessionId);
      if (!d) continue;
      map.set(d, Math.max(map.get(d) ?? 0, s.weight));
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, kg]) => ({ datum: fmtDate(d), kg }));
  }, [activeExercise, sets, sessions]);

  const pr = useMemo(() => {
    let best = { weight: 0, reps: 0, e1rm: 0 };
    for (const s of sets) {
      if (s.exerciseName !== activeExercise || !s.weight) continue;
      const e1rm = s.weight * (1 + (s.reps ?? 1) / 30);
      if (e1rm > best.e1rm) best = { weight: s.weight, reps: s.reps ?? 0, e1rm };
    }
    return best;
  }, [activeExercise, sets]);

  const totalVolume = sessions.reduce((sum, s) => sum + volumeOf(s.id), 0);
  const thisMonth = sessions.filter((s) => s.performedAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;

  if (isLoading) return <div className="text-sm text-muted-foreground">Načítavam tréningy…</div>;
  if (sessions.length === 0) return <div className="text-sm text-muted-foreground">Zatiaľ žiadne odcvičené tréningy.</div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Tréningov", value: sessions.length },
          { label: "Tento mesiac", value: thisMonth },
          { label: "Objem (kg)", value: Math.round(totalVolume).toLocaleString("sk-SK") },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="font-display text-xl text-primary">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {weekly.length > 1 && (
        <section className="rounded-xl border border-border bg-card p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Objem po týždňoch (kg)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Line type="monotone" dataKey="objem" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {byGroup.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Objem podľa partie (kg)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byGroup} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="partia" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Bar dataKey="objem" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {exerciseNames.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-3 space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Progres pri cviku</div>
          <Select value={activeExercise} onValueChange={setExercise}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {exerciseNames.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {pr.weight > 0 && (
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">Rekord: {pr.weight} kg × {pr.reps}</Badge>
              <Badge variant="outline">Odhad 1RM: {Math.round(pr.e1rm)} kg</Badge>
            </div>
          )}
          {exerciseSeries.length > 1 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseSeries} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="datum" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Na graf treba aspoň dva tréningy so zapísanou váhou.</p>
          )}
        </section>
      )}

      <section className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Posledné tréningy</div>
        {sessions.slice(0, 15).map((s) => {
          const list = setsBySession.get(s.id) ?? [];
          const names = [...new Set(list.map((x) => x.exerciseName))];
          return (
            <div key={s.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-sm tracking-wide uppercase truncate">{s.title || "Tréning"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(s.performedAt).toLocaleDateString("sk-SK")} · {names.length} cvikov
                    {s.durationMin ? ` · ${s.durationMin} min` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={s.completed ? "default" : "outline"} className="text-[10px]">
                    {s.completed ? "hotové" : "rozpracované"}
                  </Badge>
                  {!s.completed && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Pokračovať v tréningu"
                      onClick={() => navigate(`/posilnovanie/trening/${s.id}`)}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Zmazať tréning" onClick={() => setToDelete(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {names.length > 0 && (
                <div className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{names.join(" · ")}</div>
              )}
              <div className="text-[11px] text-primary mt-1">Objem {Math.round(volumeOf(s.id)).toLocaleString("sk-SK")} kg</div>
            </div>
          );
        })}
      </section>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmazať tréning?</AlertDialogTitle>
            <AlertDialogDescription>Tréning aj so všetkými sériami sa nenávratne odstráni.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nie</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSession}>Áno, zmazať</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
