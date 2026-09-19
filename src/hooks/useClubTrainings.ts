import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TrainingType = "vsetci" | "kata" | "kumite";

export interface ClubTraining {
  id: string;
  datum: string;
  typ: TrainingType;
  casOd: string;
  casDo: string;
  trenujeme: boolean;
  poznamka: string | null;
  odcvicene: boolean;
  odcviceneAt: string | null;
}

const db = supabase as any;

export const TYPE_LABEL: Record<TrainingType, string> = {
  vsetci: "Tréning pre všetkých",
  kata: "Repre kata",
  kumite: "Kumite",
};

export const DAY_LABEL = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

export function trainingHours(t: ClubTraining) {
  const [h1, m1] = t.casOd.split(":").map(Number);
  const [h2, m2] = t.casDo.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export function useClubTrainings() {
  const qc = useQueryClient();

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["club_trainings"],
    queryFn: async (): Promise<ClubTraining[]> => {
      const { data, error } = await db.from("club_trainings").select("*").order("datum");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        datum: r.datum,
        typ: r.typ,
        casOd: String(r.cas_od).slice(0, 5),
        casDo: String(r.cas_do).slice(0, 5),
        trenujeme: r.trenujeme,
        poznamka: r.poznamka ?? null,
        odcvicene: r.odcvicene,
        odcviceneAt: r.odcvicene_at ?? null,
      }));
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("club-trainings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "club_trainings" }, () => {
        qc.invalidateQueries({ queryKey: ["club_trainings"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await db.from("club_trainings").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club_trainings"] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const toggleDone = async (t: ClubTraining, userId: string) => {
    const next = !t.odcvicene;
    await updateMutation.mutateAsync({
      id: t.id,
      updates: {
        odcvicene: next,
        odcvicene_at: next ? new Date().toISOString() : null,
        odcvicene_by: next ? userId : null,
      },
    });
  };

  const setNote = async (t: ClubTraining, poznamka: string) =>
    updateMutation.mutateAsync({ id: t.id, updates: { poznamka: poznamka.trim() || null } });

  const setTrenujeme = async (t: ClubTraining, trenujeme: boolean) =>
    updateMutation.mutateAsync({
      id: t.id,
      updates: trenujeme ? { trenujeme } : { trenujeme, odcvicene: false, odcvicene_at: null, odcvicene_by: null },
    });

  return { trainings, isLoading, toggleDone, setNote, setTrenujeme };
}
