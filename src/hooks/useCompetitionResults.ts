import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CompetitionResult {
  id: string;
  competitionId: string;
  memberId: string;
  discipline: string;
  category: string;
  placement: number;
  numCompetitors: number | null;
}

export interface TeamResult {
  id: string;
  competitionId: string;
  discipline: string;
  category: string;
  placement: number | null;
  numCompetitors: number | null;
  membersText: string | null;
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
        numCompetitors: r.num_competitors ?? null,
      }));
    },
  });

  const { data: teamResults = [], isLoading: teamLoading } = useQuery({
    queryKey: ["team_competition_results", competitionId],
    enabled: !!competitionId,
    queryFn: async (): Promise<TeamResult[]> => {
      const { data, error } = await (supabase as any)
        .from("team_competition_results")
        .select("*")
        .eq("competition_id", competitionId);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        competitionId: r.competition_id,
        discipline: r.discipline,
        category: r.category ?? "",
        placement: r.placement ?? null,
        numCompetitors: r.num_competitors ?? null,
        membersText: r.members_text ?? null,
      }));
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["competition_results", competitionId] });
    qc.invalidateQueries({ queryKey: ["team_competition_results", competitionId] });
  };

  const deleteResult = async (resultId: string) => {
    const { error } = await (supabase as any)
      .from("competition_results")
      .delete()
      .eq("id", resultId);
    if (error) throw error;
    invalidate();
  };

  const deleteTeamResult = async (resultId: string) => {
    const { error } = await (supabase as any)
      .from("team_competition_results")
      .delete()
      .eq("id", resultId);
    if (error) throw error;
    invalidate();
  };

  const addTeamResult = async (result: { competitionId: string; discipline: string; category?: string; placement?: number; numCompetitors?: number }) => {
    const { error } = await (supabase as any)
      .from("team_competition_results")
      .insert({
        competition_id: result.competitionId,
        discipline: result.discipline,
        category: result.category || null,
        placement: result.placement || null,
        num_competitors: result.numCompetitors || null,
      });
    if (error) throw error;
    invalidate();
  };

  const updateTeamResult = async (id: string, updates: { placement?: number | null; numCompetitors?: number | null }) => {
    const { error } = await (supabase as any)
      .from("team_competition_results")
      .update({
        ...(updates.placement !== undefined && { placement: updates.placement }),
        ...(updates.numCompetitors !== undefined && { num_competitors: updates.numCompetitors }),
      })
      .eq("id", id);
    if (error) throw error;
    invalidate();
  };

  const getMemberMedals = (memberId: string) => {
    const memberResults = results.filter((r) => r.memberId === memberId);
    return {
      zlato: memberResults.filter((r) => r.placement === 1).length,
      striebro: memberResults.filter((r) => r.placement === 2).length,
      bronz: memberResults.filter((r) => r.placement === 3).length,
      results: memberResults,
    };
  };

  return { results, teamResults, isLoading, teamLoading, invalidate, getMemberMedals, deleteResult, deleteTeamResult, addTeamResult, updateTeamResult };
}
