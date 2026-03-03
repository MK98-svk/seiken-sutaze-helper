import { useMembers, useCompetitions, useCompetitionEntries } from "@/hooks/useClubData";
import AddMemberDialog from "@/components/AddMemberDialog";
import AddCompetitionDialog from "@/components/AddCompetitionDialog";
import MemberTable from "@/components/MemberTable";
import { motion } from "framer-motion";

const Index = () => {
  const { members, addMember, updateMember, deleteMember } = useMembers();
  const { competitions, addCompetition, deleteCompetition } = useCompetitions();
  const { isRegistered, toggleEntry } = useCompetitionEntries();

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
            className="flex gap-2"
          >
            <AddCompetitionDialog onAdd={addCompetition} />
            <AddMemberDialog onAdd={addMember} />
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Členov", value: members.length },
            { label: "Kata", value: members.filter((m) => m.kata).length },
            { label: "Kumite", value: members.filter((m) => m.kumite).length },
            { label: "Súťaží", value: competitions.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MemberTable
            members={members}
            competitions={competitions}
            onUpdateMember={updateMember}
            onDeleteMember={deleteMember}
            onDeleteCompetition={deleteCompetition}
            isRegistered={isRegistered}
            onToggleEntry={toggleEntry}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
