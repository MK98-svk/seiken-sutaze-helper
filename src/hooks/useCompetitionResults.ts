import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CompetitionResult {
  id: string;
  competitionId: string;
  memberId: string;
  discipline: string;
  category: string;
  placement: number;
}

export function useCompetitionResults(competitionId?: string) {
  const qc = useQueryClient();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["competition_results", competitionId],
    enabled: !!competitionId,
    queryFn: async (): Promise<CompetitionResult[]> => {
      const { data, error } = await (supabase as any)
        .from("competition_results")
        .select("*")
        .eq("competition_id", competitionId);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        competitionId: r.competition_id,
        memberId: r.member_id,
        discipline: r.discipline,
        category: r.category ?? "",
        placement: r.placement ?? 0,
      }));
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["competition_results", competitionId] });

  const deleteResult = async (resultId: string) => {
    const { error } = await (supabase as any)
      .from("competition_results")
      .delete()
      .eq("id", resultId);
    if (error) throw error;
    invalidate();
  };

  // Get medals for a specific member in this competition
  const getMemberMedals = (memberId: string) => {
    const memberResults = results.filter((r) => r.memberId === memberId);
    return {
      zlato: memberResults.filter((r) => r.placement === 1).length,
      striebro: memberResults.filter((r) => r.placement === 2).length,
      bronz: memberResults.filter((r) => r.placement === 3).length,
      results: memberResults,
    };
  };

  return { results, isLoading, invalidate, getMemberMedals, deleteResult };
}
