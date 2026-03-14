import { useState } from "react";
import { Member, Competition } from "@/types/member";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, X, UserMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import EditMemberDialog from "./EditMemberDialog";
import ImportResultsDialog from "./ImportResultsDialog";
import ImportStartlistDialog from "./ImportStartlistDialog";
import TeamResultsSection from "./TeamResultsSection";
import AddResultDialog from "./AddResultDialog";
import { useCompetitionResults } from "@/hooks/useCompetitionResults";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCompetitionView from "./MobileCompetitionView";
import MobileMemberList from "./MobileMemberList";

interface MemberTableProps {
  members: Member[];
  competitions: Competition[];
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onDeleteCompetition: (id: string) => void;
  isRegistered: (memberId: string, competitionId: string) => boolean;
  onToggleEntry: (memberId: string, competitionId: string) => void;
  isAdmin?: boolean;
  isCoach?: boolean;
  currentUserId?: string | null;
}

export default function MemberTable({
  members,
  competitions,
  onUpdateMember,
  onDeleteMember,
  onDeleteCompetition,
  isRegistered,
  onToggleEntry,
  isAdmin = false,
  isCoach = false,
  currentUserId,
}: MemberTableProps) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string>(() => {
    return localStorage.getItem("seiken_selectedCompId") || "all";
  });
  const isMobile = useIsMobile();

  const handleSelectComp = (value: string) => {
    setSelectedCompId(value);
    localStorage.setItem("seiken_selectedCompId", value);
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "d.M.yyyy", { locale: sk });
    } catch {
      return d;
    }
  };

  const showStats = selectedCompId === "stats";
  const selectedComp = !showStats && selectedCompId !== "all" ? competitions.find((c) => c.id === selectedCompId) : undefined;

  // Fetch competition results when a specific competition is selected
  const { getMemberMedals, teamResults, invalidate: invalidateResults, deleteResult, deleteTeamResult, addTeamResult, updateTeamResult } = useCompetitionResults(selectedComp?.id);

  // When a specific competition is selected
  if (selectedComp) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">Súťaž:</span>
          <Select value={selectedCompId} onValueChange={handleSelectComp}>
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder="Vybrať súťaž" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky (prehľad členov)</SelectItem>
              <SelectItem value="show-all">📋 Zobraziť všetky súťaže</SelectItem>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.nazov} — {formatDate(comp.datum)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(() => {
          const registeredMembers = members.filter(m => isRegistered(m.id, selectedComp.id));
          return isMobile ? (
          <MobileCompetitionView
            competition={selectedComp}
            members={registeredMembers}
            isAdmin={isAdmin}
            isCoach={isCoach}
            currentUserId={currentUserId ?? null}
            isRegistered={isRegistered}
            onToggleEntry={onToggleEntry}
            onDeleteCompetition={onDeleteCompetition}
            invalidateResults={invalidateResults}
          />
        ) : (
          /* Desktop table - unchanged */
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                 <TableHead className="font-display font-semibold text-foreground">Meno</TableHead>
                   <TableHead className="font-display font-semibold text-foreground">Priezvisko</TableHead>
                   
                   <TableHead className="font-display font-semibold text-foreground text-center">🥇</TableHead>
                   <TableHead className="font-display font-semibold text-foreground text-center">🥈</TableHead>
                   <TableHead className="font-display font-semibold text-foreground text-center">🥉</TableHead>
                   <TableHead className="font-display font-semibold text-foreground">Disciplíny</TableHead>
                   {(isAdmin || isCoach) && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {registeredMembers.length === 0 ? (
                   <TableRow>
                       <TableCell colSpan={(isAdmin || isCoach) ? 8 : 7} className="text-center text-muted-foreground py-12">
                         Žiadni registrovaní členovia na túto súťaž.
                       </TableCell>
                    </TableRow>
                  ) : (
                    registeredMembers.map((member) => {
                      const medals = getMemberMedals(member.id);
                      return (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-medium">{member.meno}</TableCell>
                          <TableCell className="font-medium">{member.priezvisko}</TableCell>
                          <TableCell className="text-center text-sm font-bold">{medals.zlato || "—"}</TableCell>
                          <TableCell className="text-center text-sm font-bold">{medals.striebro || "—"}</TableCell>
                          <TableCell className="text-center text-sm font-bold">{medals.bronz || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {(() => {
                              const canManage = isAdmin || isCoach || (currentUserId != null && member.userId === currentUserId);
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {medals.results.length > 0
                                    ? medals.results.map((r) => (
                                      <span key={r.id} className="inline-flex items-center gap-0.5 bg-secondary/80 rounded px-1.5 py-0.5">
                                        <span className="capitalize">{r.discipline}</span>
                                        {r.category && <span className="text-muted-foreground">({r.category})</span>}
                                        <span>— {r.placement}.</span>
                                        {r.numCompetitors && <span className="text-muted-foreground">z {r.numCompetitors}</span>}
                                        {canManage && (
                                          <button
                                            onClick={async () => {
                                              try { await deleteResult(r.id); toast.success("Výsledok zmazaný"); }
                                              catch { toast.error("Chyba pri mazaní"); }
                                            }}
                                            className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </span>
                                    ))
                                    : "—"}
                                  {canManage && selectedComp && (
                                    <AddResultDialog
                                      competitionId={selectedComp.id}
                                      competitionDate={selectedComp.datum}
                                      member={member}
                                      onAdded={invalidateResults}
                                    />
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                          {(isAdmin || isCoach) && (
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                title="Odstrániť zo súťaže"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
              {registeredMembers.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-secondary/60 font-semibold">
                    <TableCell colSpan={2} className="text-right text-xs uppercase tracking-wider text-muted-foreground">
                      Súčet
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold">
                      {registeredMembers.reduce((s, m) => s + getMemberMedals(m.id).zlato, 0)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold">
                      {registeredMembers.reduce((s, m) => s + getMemberMedals(m.id).striebro, 0)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold">
                      {registeredMembers.reduce((s, m) => s + getMemberMedals(m.id).bronz, 0)}
                    </TableCell>
                    <TableCell />
                    {(isAdmin || isCoach) && <TableCell />}
                  </tr>
                </tfoot>
              )}
            </Table>
            {(isAdmin || isCoach) && (
              <div className="p-2 flex gap-2">
                <ImportStartlistDialog
                  competitionId={selectedComp.id}
                  competitionName={selectedComp.nazov}
                  members={members}
                  onImported={invalidateResults}
                />
                <ImportResultsDialog
                  competitionId={selectedComp.id}
                  competitionName={selectedComp.nazov}
                  members={members}
                  onImported={invalidateResults}
                />
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => onDeleteCompetition(selectedComp.id)}
                    className="text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" /> Zmazať súťaž
                  </Button>
                )}
              </div>
            )}
            {/* Team results */}
            <div className="p-3 grid gap-3 sm:grid-cols-2">
              {(() => {
                const isRegisteredMember = currentUserId ? registeredMembers.some(m => m.userId === currentUserId) : false;
                const canManageTeam = isAdmin || isCoach || isRegisteredMember;
                return (
                  <>
                    <TeamResultsSection
                      competitionId={selectedComp.id}
                      discipline="kata"
                      teamResults={teamResults}
                      canManage={canManageTeam}
                      canDelete={isAdmin}
                      deleteTeamResult={deleteTeamResult}
                      addTeamResult={addTeamResult}
                      updateTeamResult={updateTeamResult}
                      invalidate={invalidateResults}
                    />
                    <TeamResultsSection
                      competitionId={selectedComp.id}
                      discipline="kumite"
                      teamResults={teamResults}
                      canManage={canManageTeam}
                      canDelete={isAdmin}
                      deleteTeamResult={deleteTeamResult}
                      addTeamResult={addTeamResult}
                      updateTeamResult={updateTeamResult}
                      invalidate={invalidateResults}
                    />
                  </>
                );
              })()}
            </div>
          </div>
        );
        })()}

        {/* Confirm remove dialog */}
        <AlertDialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Odstrániť zo súťaže?</AlertDialogTitle>
              <AlertDialogDescription>
                Naozaj chcete odstrániť <strong>{memberToRemove?.meno} {memberToRemove?.priezvisko}</strong> zo súťaže <strong>{selectedComp?.nazov}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white text-foreground border border-border hover:bg-secondary">Nie</AlertDialogCancel>
              <AlertDialogAction
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => {
                  if (memberToRemove && selectedComp) {
                    onToggleEntry(memberToRemove.id, selectedComp.id);
                    setMemberToRemove(null);
                  }
                }}
              >
                Áno
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Default view: full member table (no specific competition selected)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground font-medium">Súťaž:</span>
        <Select value={selectedCompId} onValueChange={handleSelectComp}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue placeholder="Vybrať súťaž" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky (prehľad členov)</SelectItem>
            <SelectItem value="show-all">📋 Zobraziť všetky súťaže</SelectItem>
            {competitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                {comp.nazov} — {formatDate(comp.datum)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isMobile ? (
        <MobileMemberList
          members={members}
          competitions={competitions}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onUpdateMember={onUpdateMember}
          onDeleteMember={onDeleteMember}
          isRegistered={isRegistered}
        />
      ) : (

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-display font-semibold text-foreground">Meno</TableHead>
              <TableHead className="font-display font-semibold text-foreground">Priezvisko</TableHead>
              <TableHead className="font-display font-semibold text-foreground">Stupeň</TableHead>
              <TableHead className="font-display font-semibold text-foreground">Nar.</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center">Výška</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center">Váha</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center">Kata</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center">Kobudo</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center">Kumite</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center min-w-[88px]">🥇</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center min-w-[88px]">🥈</TableHead>
              <TableHead className="font-display font-semibold text-foreground text-center min-w-[88px]">🥉</TableHead>
              {showAllComps && competitions.map((comp) => (
                <TableHead key={comp.id} className="font-display font-semibold text-primary text-center min-w-[120px]">
                  <div className="text-xs">{comp.nazov}</div>
                  <div className="text-xs font-normal text-muted-foreground">{formatDate(comp.datum)}</div>
                </TableHead>
              ))}
              {(isAdmin || currentUserId) && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={99} className="text-center text-muted-foreground py-12">
                    Zatiaľ žiadni členovia. Pridajte prvého člena klubu.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const canEditSelf = !isAdmin && currentUserId != null && member.userId === currentUserId;
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      <TableCell className="font-medium">{member.meno}</TableCell>
                      <TableCell className="font-medium">{member.priezvisko}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary whitespace-nowrap">
                          {member.stupen || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(member.datumNarodenia)}</TableCell>
                      <TableCell className="text-center text-sm">{member.vyska ? `${member.vyska} cm` : "—"}</TableCell>
                      <TableCell className="text-center text-sm">{member.vaha ? `${member.vaha} kg` : "—"}</TableCell>
                      {(["kata", "kobudo", "kumite"] as const).map((d) => (
                        <TableCell key={d} className="text-center">
                          <Checkbox
                            checked={member[d]}
                            onCheckedChange={(v) => isAdmin && onUpdateMember(member.id, { [d]: !!v })}
                            disabled={!isAdmin}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        {isAdmin ? (
                          <Input type="number" min={0} value={member.zlato ?? 0}
                            onChange={(e) => onUpdateMember(member.id, { zlato: Number(e.target.value) || 0 })}
                            className="w-20 h-8 text-center mx-auto" />
                        ) : (
                          <span className="inline-block min-w-[3ch] text-sm">{member.zlato ?? 0}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isAdmin ? (
                          <Input type="number" min={0} value={member.striebro ?? 0}
                            onChange={(e) => onUpdateMember(member.id, { striebro: Number(e.target.value) || 0 })}
                            className="w-20 h-8 text-center mx-auto" />
                        ) : (
                          <span className="inline-block min-w-[3ch] text-sm">{member.striebro ?? 0}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isAdmin ? (
                          <Input type="number" min={0} value={member.bronz ?? 0}
                            onChange={(e) => onUpdateMember(member.id, { bronz: Number(e.target.value) || 0 })}
                            className="w-20 h-8 text-center mx-auto" />
                        ) : (
                          <span className="inline-block min-w-[3ch] text-sm">{member.bronz ?? 0}</span>
                        )}
                      </TableCell>
                      {showAllComps && competitions.map((comp) => (
                        <TableCell key={comp.id} className="text-center">
                          <Checkbox
                            checked={isRegistered(member.id, comp.id)}
                            onCheckedChange={() => isAdmin && onToggleEntry(member.id, comp.id)}
                            disabled={!isAdmin}
                            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                          />
                        </TableCell>
                      ))}
                      {(isAdmin || (currentUserId && member.userId === currentUserId)) && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" onClick={() => onDeleteMember(member.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
          {members.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-secondary/60 font-semibold">
                <TableCell colSpan={6} className="text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Súčet
                </TableCell>
                {(["kata", "kobudo", "kumite"] as const).map((d) => (
                  <TableCell key={d} className="text-center text-sm font-bold text-foreground">
                    {members.filter((m) => m[d]).length}
                  </TableCell>
                ))}
                <TableCell className="text-center text-sm font-bold text-foreground">
                  {members.reduce((s, m) => s + (m.zlato ?? 0), 0)}
                </TableCell>
                <TableCell className="text-center text-sm font-bold text-foreground">
                  {members.reduce((s, m) => s + (m.striebro ?? 0), 0)}
                </TableCell>
                <TableCell className="text-center text-sm font-bold text-foreground">
                  {members.reduce((s, m) => s + (m.bronz ?? 0), 0)}
                </TableCell>
                {showAllComps && competitions.map((comp) => (
                  <TableCell key={comp.id} className="text-center text-sm font-bold text-primary">
                    {members.filter((m) => isRegistered(m.id, comp.id)).length}
                  </TableCell>
                ))}
                {(isAdmin || currentUserId) && <TableCell />}
              </tr>
            </tfoot>
          )}
        </Table>
        <EditMemberDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
          onSave={onUpdateMember}
        />
      </div>
      )}
    </div>
  );
}
