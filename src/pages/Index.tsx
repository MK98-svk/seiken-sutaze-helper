import { useProfiles, useCompetitions, useCompetitionEntries } from "@/hooks/useClubData";
import { useAuth } from "@/hooks/useAuth";
import AddCompetitionDialog from "@/components/AddCompetitionDialog";
import MemberTable from "@/components/MemberTable";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { profiles, updateProfile, deleteProfile } = useProfiles();
  const { competitions, addCompetition, deleteCompetition } = useCompetitions();
  const { isRegistered, toggleEntry } = useCompetitionEntries();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-wider text-foreground">KK SEIKEN</h1>
              <p className="text-xs text-muted-foreground">Bratislava • Checklist súťaží</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 items-center"
          >
            {isAdmin && (
              <AddCompetitionDialog onAdd={(comp) => addCompetition.mutate(comp)} />
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Členov", value: profiles.length },
            { label: "Kata", value: profiles.filter((m) => m.kata).length },
            { label: "Kumite", value: profiles.filter((m) => m.kumite).length },
            { label: "Súťaží", value: competitions.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MemberTable
            members={profiles}
            competitions={competitions}
            currentUserId={user?.id ?? null}
            isAdmin={isAdmin}
            onUpdateMember={(id, updates) => updateProfile.mutate({ id, updates })}
            onDeleteMember={(id) => deleteProfile.mutate(id)}
            onDeleteCompetition={(id) => deleteCompetition.mutate(id)}
            isRegistered={isRegistered}
            onToggleEntry={(profileId, competitionId) => toggleEntry.mutate({ profileId, competitionId })}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
