import { Member, Competition, CompetitionEntry } from "@/types/member";
import { useState, useEffect, useCallback } from "react";

const MEMBERS_KEY = "seiken_members";
const COMPETITIONS_KEY = "seiken_competitions";
const ENTRIES_KEY = "seiken_entries";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => load(MEMBERS_KEY, []));

  useEffect(() => save(MEMBERS_KEY, members), [members]);

  const addMember = useCallback((member: Omit<Member, "id">) => {
    setMembers((prev) => [...prev, { ...member, id: crypto.randomUUID() }]);
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { members, addMember, updateMember, deleteMember };
}

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>(() => load(COMPETITIONS_KEY, []));

  useEffect(() => save(COMPETITIONS_KEY, competitions), [competitions]);

  const addCompetition = useCallback((comp: Omit<Competition, "id">) => {
    setCompetitions((prev) => [...prev, { ...comp, id: crypto.randomUUID() }]);
  }, []);

  const deleteCompetition = useCallback((id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { competitions, addCompetition, deleteCompetition };
}

export function useCompetitionEntries() {
  const [entries, setEntries] = useState<CompetitionEntry[]>(() => load(ENTRIES_KEY, []));

  useEffect(() => save(ENTRIES_KEY, entries), [entries]);

  const toggleEntry = useCallback((memberId: string, competitionId: string) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.memberId === memberId && e.competitionId === competitionId);
      if (existing) {
        return prev.map((e) =>
          e.memberId === memberId && e.competitionId === competitionId
            ? { ...e, registered: !e.registered }
            : e
        );
      }
      return [...prev, { memberId, competitionId, registered: true }];
    });
  }, []);

  const isRegistered = useCallback(
    (memberId: string, competitionId: string) => {
      return entries.some((e) => e.memberId === memberId && e.competitionId === competitionId && e.registered);
    },
    [entries]
  );

  return { entries, toggleEntry, isRegistered };
}
