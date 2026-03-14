import { Member, Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Trash2, X, ChevronDown, ChevronUp, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImportResultsDialog from "./ImportResultsDialog";
import ImportStartlistDialog from "./ImportStartlistDialog";
import AddResultDialog from "./AddResultDialog";
import TeamResultsSection from "./TeamResultsSection";
import { useCompetitionResults } from "@/hooks/useCompetitionResults";
import { toast } from "sonner";
import { useState } from "react";

interface MobileCompetitionViewProps {
  competition: Competition;
  members: Member[];
  isAdmin: boolean;
  isCoach?: boolean;
  currentUserId: string | null;
  isRegistered: (memberId: string, competitionId: string) => boolean;
  onToggleEntry: (memberId: string, competitionId: string) => void;
  onDeleteCompetition: (id: string) => void;
  invalidateResults: () => void;
}

export default function MobileCompetitionView({
  competition,
  members,
  isAdmin,
  isCoach = false,
  currentUserId,
  isRegistered,
  onToggleEntry,
  onDeleteCompetition,
}: MobileCompetitionViewProps) {
  const isRegisteredMember = currentUserId ? members.some(m => m.userId === currentUserId) : false;
  const canManageResults = isAdmin || isCoach;
  const canManageTeamResults = canManageResults || isRegisteredMember;
  const canDeleteTeamResults = isAdmin;
  const { getMemberMedals, teamResults, invalidate: invalidateResults, deleteResult, deleteTeamResult, addTeamResult, updateTeamResult } = useCompetitionResults(competition.id);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const totalMedals = members.reduce((acc, m) => {
    const medals = getMemberMedals(m.id);
    return {
      zlato: acc.zlato + medals.zlato,
      striebro: acc.striebro + medals.striebro,
      bronz: acc.bronz + medals.bronz,
    };
  }, { zlato: 0, striebro: 0, bronz: 0 });

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="bg-card rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-sm">
            <span>🥇 <strong>{totalMedals.zlato}</strong></span>
            <span>🥈 <strong>{totalMedals.striebro}</strong></span>
            <span>🥉 <strong>{totalMedals.bronz}</strong></span>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onDeleteCompetition(competition.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {canManageResults && (
          <div className="flex gap-2">
            <ImportStartlistDialog
              competitionId={competition.id}
              competitionName={competition.nazov}
              members={members}
              onImported={invalidateResults}
            />
            <ImportResultsDialog
              competitionId={competition.id}
              competitionName={competition.nazov}
              members={members}
              onImported={invalidateResults}
            />
          </div>
        )}
      </div>

      {/* Member cards */}
      <AnimatePresence>
        {members.map((member) => {
          const medals = getMemberMedals(member.id);
          const registered = isRegistered(member.id, competition.id);
          const isExpanded = expandedMember === member.id;
          const hasResults = medals.results.length > 0;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              {/* Card header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer active:bg-secondary/30"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {member.meno} {member.priezvisko}
                  </div>
                  {hasResults && (
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      {medals.zlato > 0 && <span>🥇{medals.zlato}</span>}
                      {medals.striebro > 0 && <span>🥈{medals.striebro}</span>}
                      {medals.bronz > 0 && <span>🥉{medals.bronz}</span>}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    title="Odstrániť zo súťaže"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEntry(member.id, competition.id);
                    }}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                )}
                {(hasResults || canManageResults || (currentUserId && member.userId === currentUserId)) && (
                  isExpanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 border-t border-border space-y-2">
                      {(() => {
                        const canManage = canManageResults || (currentUserId != null && member.userId === currentUserId);
                        return (
                          <>
                            {medals.results.length > 0 ? (
                              <div className="space-y-1.5">
                                {medals.results.map((r) => (
                                  <div key={r.id} className="flex items-center justify-between bg-secondary/60 rounded px-2.5 py-1.5 text-sm">
                                    <div className="min-w-0 flex-1">
                                      <span className="capitalize font-medium">{r.discipline}</span>
                                      {r.category && <span className="text-muted-foreground ml-1 text-xs">({r.category})</span>}
                                      <span className="ml-1.5 font-bold">{r.placement}.</span>
                                      {r.numCompetitors && <span className="text-xs text-muted-foreground ml-1">z {r.numCompetitors}</span>}
                                    </div>
                                    {canManage && (
                                      <button
                                        onClick={async () => {
                                          try { await deleteResult(r.id); toast.success("Výsledok zmazaný"); }
                                          catch { toast.error("Chyba pri mazaní"); }
                                        }}
                                        className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Žiadne výsledky</p>
                            )}
                            {canManage && (
                              <AddResultDialog
                                competitionId={competition.id}
                                competitionDate={competition.datum}
                                member={member}
                                onAdded={invalidateResults}
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Team results - stacked vertically */}
      <div className="space-y-3">
        <TeamResultsSection
          competitionId={competition.id}
          discipline="kata"
          teamResults={teamResults}
          canManage={canManageTeamResults}
          canDelete={canDeleteTeamResults}
          deleteTeamResult={deleteTeamResult}
          addTeamResult={addTeamResult}
          updateTeamResult={updateTeamResult}
          invalidate={invalidateResults}
        />
        <TeamResultsSection
          competitionId={competition.id}
          discipline="kumite"
          teamResults={teamResults}
          canManage={canManageTeamResults}
          canDelete={canDeleteTeamResults}
          deleteTeamResult={deleteTeamResult}
          addTeamResult={addTeamResult}
          updateTeamResult={updateTeamResult}
          invalidate={invalidateResults}
        />
      </div>
    </div>
  );
}
