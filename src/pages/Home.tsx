import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, Trophy, Dumbbell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import seikenLogo from "@/assets/seiken-logo.jpg";

const tiles = [
  {
    to: "/sutaze",
    label: "Súťaže",
    desc: "Súpisky, kategórie, výsledky a medaily",
    icon: Trophy,
    ready: true,
  },
  {
    to: "/posilnovanie",
    label: "Posilňovanie",
    desc: "Fitko, doma s pomôckami aj bez nich + AI tréning",
    icon: Dumbbell,
    ready: true,
  },
];

const Home = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={seikenLogo} alt="KK SEIKEN logo" className="h-10 w-10 rounded-lg object-cover ring-1 ring-primary/30" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-display font-bold tracking-wider truncate">KK SEIKEN</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Bratislava • klubová aplikácia</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Odhlásiť sa" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 py-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Vyber si sekciu</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((t, i) => (
            <motion.button
              key={t.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: t.ready ? 0.98 : 1 }}
              disabled={!t.ready}
              onClick={() => t.ready && navigate(t.to)}
              className={`text-left rounded-xl border p-5 min-h-[140px] flex flex-col justify-between transition-colors ${
                t.ready
                  ? "bg-card border-border hover:border-primary/60 hover:bg-card/80"
                  : "bg-muted/30 border-border opacity-60 cursor-not-allowed"
              }`}
            >
              <t.icon className={`h-8 w-8 ${t.ready ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <div className="font-display text-lg tracking-wider uppercase">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                {!t.ready && (
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground rounded px-2 py-0.5">
                    Čoskoro
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
