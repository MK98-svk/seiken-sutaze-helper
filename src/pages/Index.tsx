import { useMembers, useCompetitions, useCompetitionEntries } from "@/hooks/useClubData";
import { useAuth } from "@/hooks/useAuth";
import AddMemberDialog from "@/components/AddMemberDialog";
import AddSelfDialog from "@/components/AddSelfDialog";
import AddCompetitionDialog from "@/components/AddCompetitionDialog";
import MemberTable from "@/components/MemberTable";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { members, isLoading: membersLoading, addMember, updateMember, deleteMember } = useMembers();
  const { competitions, isLoading: compsLoading, addCompetition, deleteCompetition } = useCompetitions();
  const { isRegistered, toggleEntry } = useCompetitionEntries();

  // Check if current user already has a member record
  const userHasMemberRecord = members.some((m) => m.userId === user?.id);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <h1 className="text-xl font-display font-bold tracking-wider text-foreground">
                KK SEIKEN
              </h1>
              <p className="text-xs text-muted-foreground">Bratislava • Checklist súťaží</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 items-center"
          >
            {isAdmin && (
              <>
                <AddCompetitionDialog onAdd={addCompetition} />
                <AddMemberDialog onAdd={addMember} />
              </>
            )}
            {!isAdmin && !userHasMemberRecord && user && (
              <AddSelfDialog onAdd={addMember} userId={user.id} />
            )}
            <Button variant="ghost" size="icon" onClick={signOut} title="Odhlásiť sa">
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6"
        >
          {[
            { label: "Členov", value: members.length },
            { label: "Kata", value: members.filter((m) => m.kata).length },
            { label: "Kobudo", value: members.filter((m) => m.kobudo).length },
            { label: "Kumite", value: members.filter((m) => m.kumite).length },
            { label: "Súťaží", value: competitions.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {(membersLoading || compsLoading) ? (
          <div className="text-center text-muted-foreground py-12">Načítavam dáta…</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MemberTable
              members={members}
              competitions={competitions}
              onUpdateMember={updateMember}
              onDeleteMember={isAdmin ? deleteMember : () => {}}
              onDeleteCompetition={isAdmin ? deleteCompetition : () => {}}
              isRegistered={isRegistered}
              onToggleEntry={isAdmin ? toggleEntry : () => {}}
              isAdmin={isAdmin}
              currentUserId={user?.id ?? null}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
