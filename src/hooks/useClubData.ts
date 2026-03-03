import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export function useProfiles() {
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("priezvisko");
      if (error) throw error;
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      // Delete the auth user (cascades to profile via FK)
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  return { profiles, isLoading, updateProfile, deleteProfile };
}

export function useCompetitions() {
  const queryClient = useQueryClient();

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("competitions").select("*").order("datum");
      if (error) throw error;
      return data;
    },
  });

  const addCompetition = useMutation({
    mutationFn: async (comp: { nazov: string; datum: string }) => {
      const { error } = await supabase.from("competitions").insert(comp);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["competitions"] }),
  });

  const deleteCompetition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("competitions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["competitions"] }),
  });

  return { competitions, isLoading, addCompetition, deleteCompetition };
}

export function useCompetitionEntries() {
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["competition_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("competition_entries").select("*");
      if (error) throw error;
      return data;
    },
  });

  const toggleEntry = useMutation({
    mutationFn: async ({ profileId, competitionId }: { profileId: string; competitionId: string }) => {
      const existing = entries.find(
        (e) => e.profile_id === profileId && e.competition_id === competitionId
      );
      if (existing) {
        const { error } = await supabase
          .from("competition_entries")
          .update({ registered: !existing.registered })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("competition_entries")
          .insert({ profile_id: profileId, competition_id: competitionId, registered: true });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["competition_entries"] }),
  });

  const isRegistered = useCallback(
    (profileId: string, competitionId: string) => {
      return entries.some(
        (e) => e.profile_id === profileId && e.competition_id === competitionId && e.registered
      );
    },
    [entries]
  );

  return { entries, toggleEntry, isRegistered };
}
