import { useMemo } from "react";
import { Member } from "@/types/member";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface CompetitorAnalyticsProps {
  members: Member[];
}

const AGE_GROUPS = [
  { label: "6–8", min: 6, max: 8 },
  { label: "9–10", min: 9, max: 10 },
  { label: "11–12", min: 11, max: 12 },
  { label: "13–15", min: 13, max: 15 },
  { label: "16–17", min: 16, max: 17 },
  { label: "18+", min: 18, max: 999 },
] as const;

const MEDAL_COLORS = {
  zlato: "#EAB308",
  striebro: "#9CA3AF",
  bronz: "#CD7F32",
};

function getMemberAge(m: Member): number | null {
  if (!m.datumNarodenia) return null;
  const parts = m.datumNarodenia.split("-");
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10);
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;
  const now = new Date();
  let age = now.getFullYear() - birthYear;
  if (now.getMonth() + 1 < birthMonth || (now.getMonth() + 1 === birthMonth && now.getDate() < birthDay)) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}


interface MedalStats {
  zlato: number;
  striebro: number;
  bronz: number;
  total: number;
  count: number;
}

function aggregateStats(members: Member[]): MedalStats {
  return members.reduce(
    (acc, m) => ({
      zlato: acc.zlato + m.zlato,
      striebro: acc.striebro + m.striebro,
      bronz: acc.bronz + m.bronz,
      total: acc.total + m.zlato + m.striebro + m.bronz,
      count: acc.count + 1,
    }),
    { zlato: 0, striebro: 0, bronz: 0, total: 0, count: 0 }
  );
}

function getTop3(members: Member[]): Member[] {
  return [...members]
    .sort((a, b) => {
      const totalA = a.zlato * 3 + a.striebro * 2 + a.bronz;
      const totalB = b.zlato * 3 + b.striebro * 2 + b.bronz;
      if (totalB !== totalA) return totalB - totalA;
      if (b.zlato !== a.zlato) return b.zlato - a.zlato;
      if (b.striebro !== a.striebro) return b.striebro - a.striebro;
      return b.bronz - a.bronz;
    })
    .filter(m => m.zlato + m.striebro + m.bronz > 0)
    .slice(0, 3);
}


const PODIUM_ICONS = ["🥇", "🥈", "🥉"];

function Top3List({ members, title }: { members: Member[]; title: string }) {
  const top = getTop3(members);
  if (top.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
      {top.map((m, i) => (
        <div key={m.id} className="flex items-center gap-2 bg-secondary/30 rounded-md px-3 py-2">
          <span className="text-lg">{PODIUM_ICONS[i]}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate block">
              {m.meno} {m.priezvisko}
            </span>
          </div>
          <div className="flex gap-2 text-xs font-bold shrink-0">
            <span style={{ color: MEDAL_COLORS.zlato }}>{m.zlato}</span>
            <span style={{ color: MEDAL_COLORS.striebro }}>{m.striebro}</span>
            <span style={{ color: MEDAL_COLORS.bronz }}>{m.bronz}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MedalBar({ stats, label }: { stats: MedalStats; label: string }) {
  const max = Math.max(stats.total, 1);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{stats.count} člen{stats.count === 1 ? "" : stats.count < 5 ? "ovia" : "ov"} · {stats.total} medailí</span>
      </div>
      <div className="flex h-5 rounded-md overflow-hidden bg-secondary/50">
        {stats.zlato > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.zlato / max) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full flex items-center justify-center text-[10px] font-bold text-black"
            style={{ backgroundColor: MEDAL_COLORS.zlato }}
            title={`🥇 ${stats.zlato}`}
          >
            {stats.zlato > 0 && stats.zlato}
          </motion.div>
        )}
        {stats.striebro > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.striebro / max) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="h-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: MEDAL_COLORS.striebro }}
            title={`🥈 ${stats.striebro}`}
          >
            {stats.striebro > 0 && stats.striebro}
          </motion.div>
        )}
        {stats.bronz > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.bronz / max) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="h-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: MEDAL_COLORS.bronz }}
            title={`🥉 ${stats.bronz}`}
          >
            {stats.bronz > 0 && stats.bronz}
          </motion.div>
        )}
        {stats.total === 0 && (
          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
            Žiadne medaily
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompetitorAnalytics({ members }: CompetitorAnalyticsProps) {
  const totalStats = useMemo(() => aggregateStats(members), [members]);

  const pieData = useMemo(() => [
    { name: "🥇 Zlato", value: totalStats.zlato, color: MEDAL_COLORS.zlato },
    { name: "🥈 Striebro", value: totalStats.striebro, color: MEDAL_COLORS.striebro },
    { name: "🥉 Bronz", value: totalStats.bronz, color: MEDAL_COLORS.bronz },
  ].filter(d => d.value > 0), [totalStats]);

  const genderStats = useMemo(() => {
    const chlapci = members.filter(m => m.pohlavie === "CH");
    const dievcata = members.filter(m => m.pohlavie === "D");
    const nezname = members.filter(m => !m.pohlavie);
    return [
      { label: "Chlapci / Muži", stats: aggregateStats(chlapci) },
      { label: "Dievčatá / Ženy", stats: aggregateStats(dievcata) },
      ...(nezname.length > 0 ? [{ label: "Neurčené", stats: aggregateStats(nezname) }] : []),
    ];
  }, [members]);

  const ageGroupStats = useMemo(() => {
    const groups = AGE_GROUPS.map(g => ({
      label: `${g.label} rokov`,
      stats: aggregateStats(members.filter(m => {
        const age = getMemberAge(m);
        return age !== null && age >= g.min && age <= g.max;
      })),
    }));
    const unknown = members.filter(m => getMemberAge(m) === null);
    if (unknown.length > 0) {
      groups.push({ label: "Neznámy vek", stats: aggregateStats(unknown) });
    }
    return groups.filter(g => g.stats.count > 0);
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Overall pie chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-1">Celková medailová bilancia</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {totalStats.total} medailí od {members.length} členov
        </p>

        {totalStats.total > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-48 h-48 sm:w-56 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} ks`, name]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-display font-bold" style={{ color: MEDAL_COLORS.zlato }}>
                  {totalStats.zlato}
                </div>
                <div className="text-xs text-muted-foreground">🥇 Zlato</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold" style={{ color: MEDAL_COLORS.striebro }}>
                  {totalStats.striebro}
                </div>
                <div className="text-xs text-muted-foreground">🥈 Striebro</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold" style={{ color: MEDAL_COLORS.bronz }}>
                  {totalStats.bronz}
                </div>
                <div className="text-xs text-muted-foreground">🥉 Bronz</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Zatiaľ žiadne medaily</p>
        )}
      </motion.div>

      {/* By gender */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-3">Podľa pohlavia</h3>
        <div className="space-y-3">
          {genderStats.map(g => (
            <MedalBar key={g.label} label={g.label} stats={g.stats} />
          ))}
        </div>
      </motion.div>

      {/* Top 3 by gender */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-3">🏆 Top 3 podľa pohlavia</h3>
        <div className="space-y-4">
          <Top3List members={members.filter(m => m.pohlavie === "CH")} title="Chlapci / Muži" />
          <Top3List members={members.filter(m => m.pohlavie === "D")} title="Dievčatá / Ženy" />
        </div>
      </motion.div>

      {/* By age group */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-3">Podľa vekovej kategórie</h3>
        <div className="space-y-3">
          {ageGroupStats.map(g => (
            <MedalBar key={g.label} label={g.label} stats={g.stats} />
          ))}
        </div>
      </motion.div>

      {/* Top 3 by age group */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card rounded-lg border border-border p-4"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-3">🏆 Top 3 podľa vekovej kategórie</h3>
        <div className="space-y-4">
          {AGE_GROUPS.map(g => (
            <Top3List
              key={g.label}
              members={members.filter(m => {
                const age = getMemberAge(m);
                return age !== null && age >= g.min && age <= g.max;
              })}
              title={`${g.label} rokov`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
