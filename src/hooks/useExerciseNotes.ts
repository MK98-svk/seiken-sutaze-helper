import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

/** Poznámky viazané na dvojicu člen + cvik (pretrvávajú naprieč tréningami). */
export function useExerciseNotes(memberId?: string | null) {
  const qc = useQueryClient();

  const { data: notes = {}, isLoading } = useQuery({
    queryKey: ["exercise_notes", memberId ?? "none"],
    enabled: !!memberId,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await db.from("exercise_notes").select("exercise_id, note").eq("member_id", memberId);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => {
        map[r.exercise_id] = r.note ?? "";
      });
      return map;
    },
  });

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

  return { notes, isLoading, saveNote };
}
