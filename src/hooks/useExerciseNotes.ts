import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export interface ExerciseNoteRow {
  exerciseId: string;
  note: string;
  updatedAt: string | null;
}

/** Poznámky viazané na dvojicu člen + cvik (pretrvávajú naprieč tréningami). */
export function useExerciseNotes(memberId?: string | null) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["exercise_notes", memberId ?? "none"],
    enabled: !!memberId,
    queryFn: async (): Promise<{ map: Record<string, string>; list: ExerciseNoteRow[] }> => {
      const { data, error } = await db
        .from("exercise_notes")
        .select("exercise_id, note, updated_at")
        .eq("member_id", memberId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      const list: ExerciseNoteRow[] = (data ?? []).map((r: any) => {
        map[r.exercise_id] = r.note ?? "";
        return { exerciseId: r.exercise_id, note: r.note ?? "", updatedAt: r.updated_at ?? null };
      });
      return { map, list };
    },
  });

  const notes = data?.map ?? {};
  const noteList = data?.list ?? [];

  const saveNote = useCallback(
    async (exerciseId: string, note: string) => {
      if (!memberId) return;
      const trimmed = note.trim();
      if (!trimmed) {
        const { error } = await db.from("exercise_notes").delete().eq("member_id", memberId).eq("exercise_id", exerciseId);
        if (error) throw error;
      } else {
        const { error } = await db
          .from("exercise_notes")
          .upsert({ member_id: memberId, exercise_id: exerciseId, note: trimmed }, { onConflict: "member_id,exercise_id" });
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["exercise_notes", memberId] });
    },
    [memberId, qc]
  );

  const deleteNote = useCallback(
    async (exerciseId: string) => {
      if (!memberId) return;
      const { error } = await db.from("exercise_notes").delete().eq("member_id", memberId).eq("exercise_id", exerciseId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["exercise_notes", memberId] });
    },
    [memberId, qc]
  );

  return { notes, noteList, isLoading, saveNote, deleteNote };
}
