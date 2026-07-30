import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Sparkles, History, ClipboardList } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { MODES } from "@/data/exercises";
import { readDraft } from "@/hooks/useWorkouts";

const Strength = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const draft = readDraft();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PageHeader title="Posilňovanie" subtitle="Vyber si, kde a ako budeš cvičiť" backTo="/" />

      <main className="max-w-5xl mx-auto px-3 py-4 space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => navigate("/posilnovanie/ai")}
            className="rounded-lg border border-primary/50 bg-primary/10 p-3 flex items-center gap-2 text-left hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-display text-sm tracking-wider uppercase">Tréning s AI</div>
              <div className="text-[11px] text-muted-foreground">Plán na mieru podľa tvojho profilu</div>
            </div>
          </button>
          <button
            onClick={() => navigate("/posilnovanie/vysledky")}
            className="rounded-lg border border-border bg-card p-3 flex items-center gap-2 text-left hover:border-primary/50 transition-colors"
          >
            <History className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-display text-sm tracking-wider uppercase">Výsledky</div>
              <div className="text-[11px] text-muted-foreground">História tréningov a váh</div>
            </div>
          </button>
          {draft.items.length > 0 && (
            <button
              onClick={() => navigate(`/posilnovanie/${draft.mode || "gym"}`)}
              className="rounded-lg border border-border bg-card p-3 flex items-center gap-2 text-left hover:border-primary/50 transition-colors"
            >
              <ClipboardList className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-display text-sm tracking-wider uppercase">Rozpracovaný tréning</div>
                <div className="text-[11px] text-muted-foreground">{draft.items.length} cvikov pripravených</div>
              </div>
            </button>
          )}
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
