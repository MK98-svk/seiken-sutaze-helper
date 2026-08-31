import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, Trophy, Dumbbell, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useClubData";
import AddSelfDialog from "@/components/AddSelfDialog";
import { hardRefreshApp, APP_VERSION } from "@/lib/appUpdate";
import { showSupplements } from "@/config/features";
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
  ...(showSupplements
    ? [
        {
          to: "/doplnky",
          label: "Doplnky",
          desc: "Výživové doplnky od Zdravý svet",
          icon: ShoppingCart,
          ready: true,
        },
      ]
    : []),
];

const Home = () => {
  const { user, loading, isAdmin, isCoach, signOut } = useAuth();
  const { members, isLoading: membersLoading, addMember } = useMembers();
  const navigate = useNavigate();

  const myMembers = members.filter((m) => m.userId && m.userId === user?.id);
  const needsProfile = !!user && !membersLoading && myMembers.length === 0 && !isAdmin && !isCoach;
  const meta = (user?.user_metadata ?? {}) as { is_competitor?: boolean; is_trainee?: boolean };

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
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={hardRefreshApp} title="Aktualizovať appku" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Odhlásiť sa" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 py-6 space-y-3">
        {needsProfile && (
          <div className="rounded-xl border border-primary/50 bg-primary/10 p-4 space-y-2">
            <div className="font-display text-base tracking-wider uppercase">Vytvor si profil</div>
            <p className="text-xs text-muted-foreground">
              Zatiaľ nemáš vytvorený profil. Vyplň si základné údaje a vyber, či budeš pretekár, cvičenec, alebo oboje.
            </p>
            <AddSelfDialog
              onAdd={addMember}
              userId={user!.id}
              linkedMembersCount={0}
              title="Môj profil"
              defaultCompetitor={meta.is_competitor ?? true}
              defaultTrainee={meta.is_trainee ?? true}
              trigger={<Button className="mt-1">Vytvoriť profil</Button>}
            />
          </div>
        )}

        <p className="text-xs uppercase tracking-widest text-muted-foreground">Vyber si sekciu</p>
        <div className="grid gap-3 sm:grid-cols-2">
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

        <p className="pt-6 text-center text-[10px] text-muted-foreground">Verzia {APP_VERSION}</p>
      </main>
    </div>
  );
};

export default Home;
