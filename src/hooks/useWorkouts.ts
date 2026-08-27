import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { Member } from "@/types/member";

const db = supabase as any;

export interface WorkoutSession {
  id: string;
  memberId: string;
  performedAt: string;
  mode: string;
  goal: string | null;
  title: string | null;
  durationMin: number | null;
  note: string | null;
  completed: boolean;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string | null;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface PlannedItem {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  suggestedWeight?: number | null;
}


const mapSession = (r: any): WorkoutSession => ({
  id: r.id,
  memberId: r.member_id,
  performedAt: r.performed_at,
  mode: r.mode,
  goal: r.goal,
  title: r.title,
  durationMin: r.duration_min,
  note: r.note,
  completed: r.completed,
});

const mapSet = (r: any): WorkoutSet => ({
  id: r.id,
  sessionId: r.session_id,
  exerciseId: r.exercise_id,
  exerciseName: r.exercise_name,
  muscleGroup: r.muscle_group,
  setNumber: r.set_number,
  weight: r.weight === null ? null : Number(r.weight),
  reps: r.reps,
  done: r.done,
});

/** Members the logged-in user may train (own linked members; staff sees everyone). */
export function useTrainableMembers() {
  const { user, isAdmin, isCoach } = useAuth();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await db.from("members").select("*").order("priezvisko");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        meno: r.meno,
        priezvisko: r.priezvisko,
        stupen: r.stupen,
        datumNarodenia: r.datum_narodenia ?? "",
        pohlavie: r.pohlavie ?? null,
        vyska: r.vyska ? Number(r.vyska) : null,
        vaha: r.vaha ? Number(r.vaha) : null,
        kata: r.kata,
        kobudo: r.kobudo,
        kumite: r.kumite,
        zlato: r.zlato ?? 0,
        striebro: r.striebro ?? 0,
        bronz: r.bronz ?? 0,
        userId: r.user_id ?? null,
        email: r.email ?? null,
        isCompetitor: r.is_competitor ?? true,
        isTrainee: r.is_trainee ?? true,
      }));
    },
  });

  const mine = useMemo(() => members.filter((m) => m.userId && m.userId === user?.id && m.isTrainee !== false), [members, user?.id]);
  const selectable = useMemo(() => (mine.length > 0 ? mine : isAdmin || isCoach ? members : []), [mine, members, isAdmin, isCoach]);

  return { members, mine, selectable, isStaff: isAdmin || isCoach, isLoading };
}

export function useWorkoutSessions(memberId?: string | null) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["workout_sessions", memberId ?? "all"],
    queryFn: async (): Promise<WorkoutSession[]> => {
      let q = db.from("workout_sessions").select("*").order("performed_at", { ascending: false }).order("created_at", { ascending: false });
      if (memberId) q = q.eq("member_id", memberId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapSession);
    },
  });

  const { data: sets = [] } = useQuery({
    queryKey: ["workout_sets", memberId ?? "all", sessions.map((s) => s.id).join(",")],
    enabled: sessions.length > 0,
    queryFn: async (): Promise<WorkoutSet[]> => {
      const { data, error } = await db
        .from("workout_sets")
        .select("*")
        .in("session_id", sessions.map((s) => s.id))
        .order("set_number");
      if (error) throw error;
      return (data ?? []).map(mapSet);
    },
  });

  return { sessions, sets, isLoading };
}

export function useWorkoutSession(sessionId?: string) {
  const qc = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["workout_session", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<WorkoutSession | null> => {
      const { data, error } = await db.from("workout_sessions").select("*").eq("id", sessionId).maybeSingle();
      if (error) throw error;
      return data ? mapSession(data) : null;
    },
  });

  const { data: sets = [] } = useQuery({
    queryKey: ["workout_session_sets", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<WorkoutSet[]> => {
      const { data, error } = await db.from("workout_sets").select("*").eq("session_id", sessionId).order("set_number");
      if (error) throw error;
      return (data ?? []).map(mapSet);
    },
  });

  const updateSet = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkoutSet> }) => {
      const payload: Record<string, unknown> = {};
      if (updates.weight !== undefined) payload.weight = updates.weight;
      if (updates.reps !== undefined) payload.reps = updates.reps;
      if (updates.done !== undefined) payload.done = updates.done;
      const { error } = await db.from("workout_sets").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_session_sets", sessionId] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const addSet = useMutation({
    mutationFn: async (base: WorkoutSet) => {
      const { error } = await db.from("workout_sets").insert({
        session_id: base.sessionId,
        exercise_id: base.exerciseId,
        exercise_name: base.exerciseName,
        muscle_group: base.muscleGroup,
        set_number: base.setNumber,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_session_sets", sessionId] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const finish = useMutation({
    mutationFn: async (durationMin: number) => {
      const { error } = await db.from("workout_sessions").update({ completed: true, duration_min: durationMin }).eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout_session", sessionId] });
      qc.invalidateQueries({ queryKey: ["workout_sessions"] });
    },
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  return { session, sets, isLoading, updateSet, addSet, finish };
}

export function useCreateWorkout() {
  const qc = useQueryClient();

  const create = useCallback(
    async (input: { memberId: string; mode: string; goal: string | null; title: string; items: PlannedItem[] }) => {
      const { data, error } = await db
        .from("workout_sessions")
        .insert({
          member_id: input.memberId,
          mode: input.mode,
          goal: input.goal,
          title: input.title,
        })
        .select("id")
        .single();
      if (error) throw error;
      const sessionId = data.id as string;

      const rows = input.items.flatMap((it) =>
        Array.from({ length: Math.max(1, it.sets) }, (_, i) => ({
          session_id: sessionId,
          exercise_id: it.exerciseId,
          exercise_name: it.exerciseName,
          muscle_group: it.muscleGroup,
          set_number: i + 1,
          reps: it.reps || null,
          weight: it.suggestedWeight && it.suggestedWeight > 0 ? it.suggestedWeight : null,
        }))
      );

      if (rows.length) {
        const { error: setErr } = await db.from("workout_sets").insert(rows);
        if (setErr) throw setErr;
      }
      qc.invalidateQueries({ queryKey: ["workout_sessions"] });
      return sessionId;
    },
    [qc]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await db.from("workout_sessions").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["workout_sessions"] });
    },
    [qc]
  );

  return { create, remove };
}

// ─── Draft (rozpracovaný tréning v prehliadači) ───
const DRAFT_KEY = "seiken_workout_draft";

export interface Draft {
  mode: string;
  items: PlannedItem[];
}

export function readDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { mode: "", items: [] };
}

export function writeDraft(d: Draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  window.dispatchEvent(new Event("seiken-draft"));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  window.dispatchEvent(new Event("seiken-draft"));
}
