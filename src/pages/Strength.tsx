import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Sparkles, History, ClipboardList, TrendingUp, Users, Dumbbell } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { readDraft } from "@/hooks/useWorkouts";

const MODES = [
  { id: "gym", label: "Fitko", icon: "🏋️", desc: "Činky, stroje, kladky – plný katalóg" },
  { id: "pomocky", label: "Doma s pomôckami", icon: "🏠", desc: "Jednoručky, gumy, kettlebell, fitlopta" },
  { id: "bezpomocok", label: "Doma bez pomôcok", icon: "🤸", desc: "Iba vlastná váha" },
];

const Strength = () => {
  const { user, loading, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();
  const draft = readDraft();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const tiles = [
    { to: "/posilnovanie/ai", icon: Sparkles, title: "Tréning s AI", desc: "Plán na mieru podľa tvojho profilu", accent: true },
    { to: "/posilnovanie/plany", icon: Dumbbell, title: "Moje plány", desc: "Uložené zostavy cvikov" },
    { to: "/posilnovanie/progres", icon: TrendingUp, title: "Progres", desc: "Grafy váh, objemu a rekordov" },
    { to: "/posilnovanie/vysledky", icon: History, title: "Výsledky", desc: "História tréningov a váh" },
    ...(isAdmin || isCoach
      ? [{ to: "/posilnovanie/cvicenci", icon: Users, title: "Cvičenci", desc: "Progres celého klubu" }]
      : []),
    ...(draft.items.length > 0
      ? [{
          to: `/posilnovanie/${draft.mode || "gym"}`,
          icon: ClipboardList,
          title: "Rozpracovaný tréning",
          desc: `${draft.items.length} cvikov pripravených`,
        }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PageHeader title="Posilňovanie" subtitle="Vyber si, kde a ako budeš cvičiť" backTo="/" />

      <main className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {tiles.map((t) => (
            <button
              key={t.to}
              onClick={() => navigate(t.to)}
              className={`rounded-lg border p-3 flex items-center gap-2 text-left transition-colors ${
                t.accent ? "border-primary/50 bg-primary/10 hover:bg-primary/20" : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <t.icon className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="font-display text-sm tracking-wider uppercase">{t.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>


        <p className="text-xs uppercase tracking-widest text-muted-foreground pt-2">Kde cvičíš?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/posilnovanie/${m.id}`)}
              className="text-left rounded-xl border border-border bg-card p-5 min-h-[130px] flex flex-col justify-between hover:border-primary/60 transition-colors"
            >
              <span className="text-3xl">{m.icon}</span>
              <div>
                <div className="font-display text-base tracking-wider uppercase">{m.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Strength;
