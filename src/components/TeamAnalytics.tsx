import { useMemo } from "react";
import { Competition } from "@/types/member";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getPlacementScore } from "@/lib/competitionScoring";

interface TeamAnalyticsProps {
  competitions: Competition[];
}

interface TeamRow {
  id: string;
  competitionId: string;
  discipline: string;
  category: string;
  placement: number | null;
  numCompetitors: number | null;
  membersText: string | null;
}

const MEDAL_COLORS = {
  zlato: "#EAB308",
  striebro: "#9CA3AF",
  bronz: "#CD7F32",
};

const PODIUM_ICONS = ["🥇", "🥈", "🥉"];

const AGE_GROUPS = [
  { label: "6–8", min: 6, max: 8 },
  { label: "9–10", min: 9, max: 10 },
  { label: "11–12", min: 11, max: 12 },
  { label: "13", min: 13, max: 13 },
  { label: "14–17", min: 14, max: 17 },
  { label: "18+", min: 18, max: 999 },
] as const;

type Gender = "CH" | "D" | "MIXED";

const GENDER_LABEL: Record<Gender, string> = {
  CH: "Chlapci / Muži",
  D: "Dievčatá / Ženy",
  MIXED: "Mixed",
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseAge(category: string): { min: number; max: number } | null {
  const c = normalizeText(category);

  // "+18" / "18+"
  if (/\+\s*18|18\s*\+/.test(c)) return { min: 18, max: 999 };

  // English patterns
  if (/8\s*years?\s*&?\s*under/.test(c)) return { min: 6, max: 8 };
  const enRange = c.match(/(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*years?/);
  if (enRange) return { min: +enRange[1], max: +enRange[2] };
  const enSingle = c.match(/(\d{1,2})\s*years?/);
  if (enSingle) return { min: +enSingle[1], max: +enSingle[1] };

  // Slovak ranges: "8-9", "9 – 10", "11 – 12", "14 - 17"
  const skRange = c.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);
  if (skRange) return { min: +skRange[1], max: +skRange[2] };

  // Single year: "13 rokov", "12 rocni"
  const skSingle = c.match(/(\d{1,2})\s*(?:rok|roc)/);
  if (skSingle) return { min: +skSingle[1], max: +skSingle[1] };

  return null;
}

function parseGender(category: string): Gender {
  const c = normalizeText(category);
  if (/\bmixed\b/.test(c)) return "MIXED";
  // Check after OPEN or end of string for CH/D marker
  if (/\b(ch|chlapci|muzi|boys|men)\b/.test(c)) return "CH";
  if (/\b(d|dievcata|zeny|girls|women)\b/.test(c)) return "D";
  return "MIXED";
}

function ageGroupOf(min: number, max: number): typeof AGE_GROUPS[number] | null {
  // Find best-fitting group: prefer one that contains the midpoint
  const mid = Math.round((min + max) / 2);
  return AGE_GROUPS.find(g => mid >= g.min && mid <= g.max) ?? null;
}

function normalizeMembers(text: string | null): string {
  if (!text) return "—";
  return text
    .split(/[,;/]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .sort()
    .join(" · ");
}

interface AggregatedTeam {
  key: string;
  membersDisplay: string;
  zlato: number;
  striebro: number;
  bronz: number;
  score: number;
  appearances: number;
}

function aggregateTeams(
  rows: TeamRow[],
  competitionMap: Map<string, Competition>
): AggregatedTeam[] {
  const map = new Map<string, AggregatedTeam>();
  for (const r of rows) {
    const key = normalizeMembers(r.membersText);
    if (key === "—") continue;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        key,
        membersDisplay: r.membersText ?? "—",
        zlato: 0,
        striebro: 0,
        bronz: 0,
        score: 0,
        appearances: 0,
      };
      map.set(key, entry);
    }
    entry.appearances += 1;
    if (r.placement === 1) entry.zlato += 1;
    if (r.placement === 2) entry.striebro += 1;
    if (r.placement === 3) entry.bronz += 1;
    const comp = competitionMap.get(r.competitionId);
    if (comp && r.placement) {
      entry.score += getPlacementScore(r.placement, comp.nazov);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

function TeamGroup({
  title,
  teams,
}: {
  title: string;
  teams: AggregatedTeam[];
}) {
  if (teams.length === 0) return null;
  const top = teams.slice(0, 5);
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
      {top.map((t, i) => (
        <div key={t.key} className="flex items-center gap-2 bg-secondary/30 rounded-md px-3 py-2">
          <span className="text-lg shrink-0">{i < 3 ? PODIUM_ICONS[i] : `${i + 1}.`}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground block truncate">
              {t.membersDisplay}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t.appearances} účas{t.appearances === 1 ? "ť" : t.appearances < 5 ? "ti" : "tí"}
            </span>
          </div>
          <div className="flex gap-2 text-xs font-bold shrink-0">
            <span className="text-muted-foreground">{t.score.toFixed(1)} b.</span>
            {t.zlato > 0 && <span style={{ color: MEDAL_COLORS.zlato }}>🥇{t.zlato}</span>}
            {t.striebro > 0 && <span style={{ color: MEDAL_COLORS.striebro }}>🥈{t.striebro}</span>}
            {t.bronz > 0 && <span style={{ color: MEDAL_COLORS.bronz }}>🥉{t.bronz}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamAnalytics({ competitions }: TeamAnalyticsProps) {
  const { data: teamRows = [], isLoading } = useQuery({
    queryKey: ["all_team_results_for_analytics"],
    queryFn: async (): Promise<TeamRow[]> => {
      const { data, error } = await (supabase as any)
        .from("team_competition_results")
        .select("*");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        competitionId: r.competition_id,
        discipline: (r.discipline ?? "").toLowerCase(),
        category: r.category ?? "",
        placement: r.placement,
        numCompetitors: r.num_competitors,
        membersText: r.members_text,
      }));
    },
  });

  const competitionMap = useMemo(() => {
    const map = new Map<string, Competition>();
    competitions.forEach(c => map.set(c.id, c));
    return map;
  }, [competitions]);

  // Group rows by (discipline, ageGroup, gender)
  const grouped = useMemo(() => {
    const buckets = new Map<string, TeamRow[]>();
    for (const r of teamRows) {
      const disc = r.discipline.includes("kumite") ? "kumite" : r.discipline.includes("kata") ? "kata" : null;
      if (!disc) continue;
      const age = parseAge(r.category);
      if (!age) continue;
      const ag = ageGroupOf(age.min, age.max);
      if (!ag) continue;
      const gender = parseGender(r.category);
      const key = `${disc}|${ag.label}|${gender}`;
      let arr = buckets.get(key);
      if (!arr) {
        arr = [];
        buckets.set(key, arr);
      }
      arr.push(r);
    }
    return buckets;
  }, [teamRows]);

  const renderDiscipline = (discipline: "kata" | "kumite", title: string, emoji: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border p-4"
    >
      <h3 className="text-sm font-display font-bold text-foreground mb-4">{emoji} {title}</h3>
      <div className="space-y-6">
        {AGE_GROUPS.map(ag => {
          const sections = (["CH", "D", "MIXED"] as Gender[])
            .map(g => {
              const rows = grouped.get(`${discipline}|${ag.label}|${g}`) ?? [];
              const teams = aggregateTeams(rows, competitionMap);
              return { gender: g, teams };
            })
            .filter(s => s.teams.length > 0);
          if (sections.length === 0) return null;
          return (
            <div key={ag.label} className="space-y-3">
              <h4 className="text-sm font-display font-semibold text-primary">{ag.label} rokov</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map(s => (
                  <TeamGroup key={s.gender} title={GENDER_LABEL[s.gender]} teams={s.teams} />
                ))}
              </div>
            </div>
          );
        })}
        {Array.from(grouped.keys()).filter(k => k.startsWith(discipline + "|")).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Zatiaľ žiadne tímové výsledky</p>
        )}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-12">Načítavam tímové výsledky…</div>;
  }

  const totalParsed = Array.from(grouped.values()).reduce((a, arr) => a + arr.length, 0);
  const unparsed = teamRows.length - totalParsed;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-1">👥 Úspešnosť tímov</h3>
        <p className="text-xs text-muted-foreground">
          Tímy sú zoskupené podľa zostavy (priezvisk členov) naprieč všetkými súťažami. Top 5 v každej kategórii podľa vážených bodov.
          {unparsed > 0 && ` (${unparsed} výsledkov sa nepodarilo zaradiť do vekovej kategórie)`}
        </p>
      </motion.div>

      {renderDiscipline("kata", "Kata tímy", "🥋")}
      {renderDiscipline("kumite", "Kumite tímy", "🥊")}
    </div>
  );
}
