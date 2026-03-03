import { Member, Competition, CompetitionEntry } from "@/types/member";
import { useState, useEffect, useCallback } from "react";

const MEMBERS_KEY = "seiken_members";
const COMPETITIONS_KEY = "seiken_competitions";
const ENTRIES_KEY = "seiken_entries";

const DEFAULT_COMPETITIONS: Competition[] = [
  { id: "sp2-pezinok", nazov: "2. kolo SP – Pezinok", datum: "2026-03-14" },
  { id: "wukf-british-open", nazov: "WUKF British Open", datum: "2026-03-21" },
  { id: "wukf-north-american", nazov: "WUKF North American Open", datum: "2026-04-03" },
  { id: "cyprus-international", nazov: "Cyprus International Championships", datum: "2026-04-18" },
  { id: "sp3-dubnica", nazov: "3. kolo SP – Dubnica", datum: "2026-04-25" },
  { id: "rovne-cup", nazov: "Rovne Cup 2026", datum: "2026-05-09" },
  { id: "slovakia-open", nazov: "XXIX Slovakia Open", datum: "2026-05-23" },
  { id: "wukf-scottish-open", nazov: "WUKF Scottish Open", datum: "2026-06-06" },
  { id: "ms-wukf-cluj", nazov: "14. MS WUKF – Cluj-Napoca", datum: "2026-07-22" },
  { id: "kanzen-cup", nazov: "12. Kanzen Cup", datum: "2026-09-05" },
  { id: "sp4-prievidza", nazov: "4. kolo SP – Prievidza Cup", datum: "2026-09-26" },
  { id: "baltic-open", nazov: "Baltic Open WUKF Championship", datum: "2026-09-26" },
  { id: "transylvania-cup", nazov: "Transylvania WUKF World Cup", datum: "2026-12-12" },
];

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
  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const stored = load<Competition[]>(COMPETITIONS_KEY, []);
    if (stored.length === 0) {
      save(COMPETITIONS_KEY, DEFAULT_COMPETITIONS);
      return DEFAULT_COMPETITIONS;
    }
    return stored;
  });

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
