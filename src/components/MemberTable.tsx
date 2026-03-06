import { useState } from "react";
import { Member, Competition } from "@/types/member";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import EditMemberDialog from "./EditMemberDialog";

interface MemberTableProps {
  members: Member[];
  competitions: Competition[];
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onDeleteCompetition: (id: string) => void;
  isRegistered: (memberId: string, competitionId: string) => boolean;
  onToggleEntry: (memberId: string, competitionId: string) => void;
  isAdmin?: boolean;
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
  currentUserId,
}: MemberTableProps) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string>("all");

  const formatDate = (d: string) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "d.M.yyyy", { locale: sk });
    } catch {
      return d;
    }
  };

  const showAllComps = selectedCompId === "show-all";
  const selectedComp = !showAllComps ? competitions.find((c) => c.id === selectedCompId) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground font-medium">Súťaž:</span>
        <Select value={selectedCompId} onValueChange={setSelectedCompId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Vybrať súťaž" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky (bez stĺpca súťaže)</SelectItem>
            <SelectItem value="show-all">📋 Zobraziť všetky súťaže</SelectItem>
            {competitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                {comp.nazov} — {formatDate(comp.datum)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedComp && isAdmin && (
          <Button variant="ghost" size="sm" onClick={() => onDeleteCompetition(selectedComp.id)}
            className="text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1" /> Zmazať súťaž
          </Button>
        )}
      </div>

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
              {selectedComp && (
                <TableHead className="font-display font-semibold text-primary text-center min-w-[120px]">
                  <div>{selectedComp.nazov}</div>
                  <div className="text-xs font-normal text-muted-foreground">{formatDate(selectedComp.datum)}</div>
                </TableHead>
              )}
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
                members.map((member) => (
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
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                        {member.stupen || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(member.datumNarodenia)}</TableCell>
                    {(() => {
                      const canEditSelf = !isAdmin && currentUserId != null && member.userId === currentUserId;
                      const canEdit = isAdmin || canEditSelf;
                      return (
                        <>
                          <TableCell className="text-center text-sm">
                            {member.vyska ? `${member.vyska} cm` : "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {member.vaha ? `${member.vaha} kg` : "—"}
                          </TableCell>
                          {(["kata", "kobudo", "kumite"] as const).map((d) => (
                            <TableCell key={d} className="text-center">
                              <Checkbox
                                checked={member[d]}
                                onCheckedChange={(v) => isAdmin && onUpdateMember(member.id, { [d]: !!v })}
                                disabled={!isAdmin}
                              />
                            </TableCell>
                          ))}
                        </>
                      );
                    })()}
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
                    {selectedComp && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isRegistered(member.id, selectedComp.id)}
                          onCheckedChange={() => isAdmin && onToggleEntry(member.id, selectedComp.id)}
                          disabled={!isAdmin}
                          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                        />
                      </TableCell>
                    )}
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
                ))
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
                {selectedComp && (
                  <TableCell className="text-center text-sm font-bold text-primary">
                    {members.filter((m) => isRegistered(m.id, selectedComp.id)).length}
                  </TableCell>
                )}
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
    </div>
  );
}
