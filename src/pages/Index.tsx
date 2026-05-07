import { useMembers, useCompetitions, useCompetitionEntries } from "@/hooks/useClubData";
import { useAuth } from "@/hooks/useAuth";
import AddMemberDialog from "@/components/AddMemberDialog";
import AddSelfDialog from "@/components/AddSelfDialog";
import SelfRegisterDialog from "@/components/SelfRegisterDialog";
import AddCompetitionDialog from "@/components/AddCompetitionDialog";
import MemberTable from "@/components/MemberTable";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import seikenLogo from "@/assets/seiken-logo.jpg";

const Index = () => {
  const { user, loading: authLoading, isAdmin, isCoach, signOut } = useAuth();
  const { members, isLoading: membersLoading, addMember, updateMember, deleteMember } = useMembers();
  const { competitions, isLoading: compsLoading, addCompetition, deleteCompetition } = useCompetitions();
  const { isRegistered, toggleEntry } = useCompetitionEntries();

  const linkedMembersCount = members.filter((m) => m.userId === user?.id).length;

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between gap-1 sm:gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 min-w-0"
          >
            <img src={seikenLogo} alt="KK SEIKEN logo" className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg object-cover ring-1 ring-primary/30 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-display font-bold tracking-wider text-foreground truncate">
                KK SEIKEN
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Bratislava • Checklist súťaží</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-1 items-center shrink-0"
          >
            {isAdmin && (
              <>
                <AddCompetitionDialog onAdd={addCompetition} />
                <AddMemberDialog onAdd={addMember} />
              </>
            )}
            {user && <AddSelfDialog onAdd={addMember} userId={user.id} linkedMembersCount={linkedMembersCount} />}
            {user && (linkedMembersCount > 0 || isAdmin) && (
              <SelfRegisterDialog
                members={members}
                competitions={competitions}
                currentUserId={user.id}
                isAdmin={isAdmin}
              />
            )}
            <Button variant="ghost" size="icon" onClick={signOut} title="Odhlásiť sa" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-3 sm:mb-6"
        >
          {[
            { label: "Členov", value: members.length },
            { label: "Kata", value: members.filter((m) => m.kata).length },
            { label: "Kobudo", value: members.filter((m) => m.kobudo).length },
            { label: "Kumite", value: members.filter((m) => m.kumite).length },
            { label: "Súťaží", value: competitions.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider leading-tight">{stat.label}</div>
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
              isCoach={isCoach}
              currentUserId={user?.id ?? null}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
