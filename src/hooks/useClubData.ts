import { useEffect } from "react";
import { Member, Competition, CompetitionEntry } from "@/types/member";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

// ─── Members ───────────────────────────────────────────

export function useMembers() {
  const qc = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await (supabase as any)
        .from("members")
        .select("*")
        .order("priezvisko");
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
      }));
    },
  });

  // Realtime: auto-refresh members when any user changes them
  useEffect(() => {
    const channel = supabase
      .channel('members-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        qc.invalidateQueries({ queryKey: ["members"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const addMutation = useMutation({
    mutationFn: async (member: Omit<Member, "id">) => {
      const { error } = await (supabase as any).from("members").insert({
        meno: member.meno,
        priezvisko: member.priezvisko,
        stupen: member.stupen,
        datum_narodenia: member.datumNarodenia || null,
        pohlavie: member.pohlavie,
        vyska: member.vyska,
        vaha: member.vaha,
        kata: member.kata,
        kobudo: member.kobudo,
        kumite: member.kumite,
        zlato: member.zlato,
        striebro: member.striebro,
        bronz: member.bronz,
        user_id: member.userId,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
    onError: (e: any) => toast.error("Chyba pri pridávaní: " + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.meno !== undefined) dbUpdates.meno = updates.meno;
      if (updates.priezvisko !== undefined) dbUpdates.priezvisko = updates.priezvisko;
      if (updates.stupen !== undefined) dbUpdates.stupen = updates.stupen;
      if (updates.datumNarodenia !== undefined) dbUpdates.datum_narodenia = updates.datumNarodenia || null;
      if (updates.pohlavie !== undefined) dbUpdates.pohlavie = updates.pohlavie;
      if (updates.vyska !== undefined) dbUpdates.vyska = updates.vyska;
      if (updates.vaha !== undefined) dbUpdates.vaha = updates.vaha;
      if (updates.kata !== undefined) dbUpdates.kata = updates.kata;
      if (updates.kobudo !== undefined) dbUpdates.kobudo = updates.kobudo;
      if (updates.kumite !== undefined) dbUpdates.kumite = updates.kumite;
      if (updates.zlato !== undefined) dbUpdates.zlato = updates.zlato;
      if (updates.striebro !== undefined) dbUpdates.striebro = updates.striebro;
      if (updates.bronz !== undefined) dbUpdates.bronz = updates.bronz;
      if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
      const { error } = await (supabase as any).from("members").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
    onError: (e: any) => toast.error("Chyba pri aktualizácii: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
    onError: (e: any) => toast.error("Chyba pri mazaní: " + e.message),
  });

  const addMember = useCallback((m: Omit<Member, "id">) => addMutation.mutate(m), [addMutation]);
  const updateMember = useCallback((id: string, updates: Partial<Member>) => updateMutation.mutate({ id, updates }), [updateMutation]);
  const deleteMember = useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]);

  return { members, isLoading, addMember, updateMember, deleteMember };
}

// ─── Competitions ──────────────────────────────────────

export function useCompetitions() {
  const qc = useQueryClient();

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: async (): Promise<Competition[]> => {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("datum");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        nazov: r.nazov,
        datum: r.datum,
      }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (comp: Omit<Competition, "id">) => {
      const { error } = await supabase.from("competitions").insert({
        nazov: comp.nazov,
        datum: comp.datum,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("competitions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const addCompetition = useCallback((c: Omit<Competition, "id">) => addMutation.mutate(c), [addMutation]);
  const deleteCompetition = useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]);

  return { competitions, isLoading, addCompetition, deleteCompetition };
}

// ─── Competition Entries ───────────────────────────────

export function useCompetitionEntries() {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["member_competition_entries"],
    queryFn: async (): Promise<CompetitionEntry[]> => {
      const { data, error } = await (supabase as any)
        .from("member_competition_entries")
        .select("*");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        competitionId: r.competition_id,
        registered: r.registered,
      }));
    },
  });

  // Realtime: auto-refresh entries when any user changes them
  useEffect(() => {
    const channel = supabase
      .channel('entries-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_competition_entries' }, () => {
        qc.invalidateQueries({ queryKey: ["member_competition_entries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const toggleMutation = useMutation({
    mutationFn: async ({ memberId, competitionId }: { memberId: string; competitionId: string }) => {
      const existing = entries.find(
        (e) => e.memberId === memberId && e.competitionId === competitionId
      );
      if (existing) {
        const { error } = await (supabase as any)
          .from("member_competition_entries")
          .update({ registered: !existing.registered })
          .eq("member_id", memberId)
          .eq("competition_id", competitionId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("member_competition_entries")
          .insert({ member_id: memberId, competition_id: competitionId, registered: true });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member_competition_entries"] }),
    onError: (e: any) => toast.error("Chyba: " + e.message),
  });

  const toggleEntry = useCallback(
    (memberId: string, competitionId: string) => toggleMutation.mutate({ memberId, competitionId }),
    [toggleMutation]
  );

  const isRegistered = useCallback(
    (memberId: string, competitionId: string) =>
      entries.some((e) => e.memberId === memberId && e.competitionId === competitionId && e.registered),
    [entries]
  );

  return { entries, toggleEntry, isRegistered };
}
