import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CompetitionIntent {
  id: string;
  memberId: string;
  competitionId: string;
  kata: boolean;
  kataGoju: boolean;
  kataOpen: boolean;
  kobudo: boolean;
  kumite: boolean;
}

export function useCompetitionIntents() {
  const qc = useQueryClient();

  const { data: intents = [], isLoading } = useQuery({
    queryKey: ["member_competition_intents"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    queryFn: async (): Promise<CompetitionIntent[]> => {
      const { data, error } = await (supabase as any)
        .from("member_competition_intents")
        .select("*");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        memberId: r.member_id,
        competitionId: r.competition_id,
        kata: !!r.kata,
        kataGoju: !!r.kata_goju,
        kataOpen: !!r.kata_open,
        kobudo: !!r.kobudo,
        kumite: !!r.kumite,
      }));
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("intents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "member_competition_intents" }, () => {
        qc.invalidateQueries({ queryKey: ["member_competition_intents"] });
        qc.invalidateQueries({ queryKey: ["member_competition_entries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const upsertMutation = useMutation({
    mutationFn: async (i: Omit<CompetitionIntent, "id">) => {
      const payload = {
        member_id: i.memberId,
        competition_id: i.competitionId,
        kata: i.kata,
        kata_goju: i.kata && i.kataGoju,
        kata_open: i.kata && i.kataOpen,
        kobudo: i.kobudo,
        kumite: i.kumite,
      };
      const { error } = await (supabase as any)
        .from("member_competition_intents")
        .upsert(payload, { onConflict: "member_id,competition_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member_competition_intents"] });
      qc.invalidateQueries({ queryKey: ["member_competition_entries"] });
    },
    onError: (e: any) => toast.error("Chyba pri ukladaní: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ memberId, competitionId }: { memberId: string; competitionId: string }) => {
      const { error } = await (supabase as any)
        .from("member_competition_intents")
        .delete()
        .eq("member_id", memberId)
        .eq("competition_id", competitionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member_competition_intents"] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const getIntent = (memberId: string, competitionId: string) =>
    intents.find((i) => i.memberId === memberId && i.competitionId === competitionId);

  return {
    intents,
    isLoading,
    getIntent,
    upsertIntent: (i: Omit<CompetitionIntent, "id">) => upsertMutation.mutateAsync(i),
    deleteIntent: (memberId: string, competitionId: string) => deleteMutation.mutateAsync({ memberId, competitionId }),
  };
}
