import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, X, Pencil } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import EditMemberDialog from "./EditMemberDialog";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Competition = Tables<"competitions">;

interface MemberTableProps {
  members: Profile[];
  competitions: Competition[];
  currentUserId: string | null;
  isAdmin: boolean;
  onUpdateMember: (id: string, updates: Partial<Profile>) => void;
  onDeleteMember: (id: string) => void;
  onDeleteCompetition: (id: string) => void;
  isRegistered: (profileId: string, competitionId: string) => boolean;
  onToggleEntry: (profileId: string, competitionId: string) => void;
}

export default function MemberTable({
  members,
  competitions,
  currentUserId,
  isAdmin,
  onUpdateMember,
  onDeleteMember,
  onDeleteCompetition,
  isRegistered,
  onToggleEntry,
}: MemberTableProps) {
  const [editingMember, setEditingMember] = useState<Profile | null>(null);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "d.M.yyyy", { locale: sk });
    } catch {
      return d;
    }
  };

  const canEditMember = (memberId: string) => isAdmin || currentUserId === memberId;
  const canToggleEntry = (profileId: string) => isAdmin || currentUserId === profileId;

  return (
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
            {competitions.map((comp) => (
              <TableHead key={comp.id} className="font-display font-semibold text-primary text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  <span className="truncate">{comp.nazov}</span>
                  {isAdmin && (
                    <button
                      onClick={() => onDeleteCompetition(comp.id)}
                      className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="text-xs font-normal text-muted-foreground">{formatDate(comp.datum)}</div>
              </TableHead>
            ))}
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10 + competitions.length} className="text-center text-muted-foreground py-12">
                  Zatiaľ žiadni členovia.
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
                  <TableCell className="font-medium">{member.meno || "—"}</TableCell>
                  <TableCell className="font-medium">{member.priezvisko || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      {member.stupen || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(member.datum_narodenia)}</TableCell>
                  <TableCell className="text-center text-sm">{member.vyska ? `${member.vyska} cm` : "—"}</TableCell>
                  <TableCell className="text-center text-sm">{member.vaha ? `${member.vaha} kg` : "—"}</TableCell>
                  {(["kata", "kobudo", "kumite"] as const).map((d) => (
                    <TableCell key={d} className="text-center">
                      <Checkbox
                        checked={member[d]}
                        disabled={!canEditMember(member.id)}
                        onCheckedChange={(v) => onUpdateMember(member.id, { [d]: !!v })}
                      />
                    </TableCell>
                  ))}
                  {competitions.map((comp) => (
                    <TableCell key={comp.id} className="text-center">
                      <Checkbox
                        checked={isRegistered(member.id, comp.id)}
                        disabled={!canToggleEntry(member.id)}
                        onCheckedChange={() => onToggleEntry(member.id, comp.id)}
                        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      {canEditMember(member.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMember(member)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMember(member.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
      <EditMemberDialog
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSave={onUpdateMember}
      />
    </div>
  );
}
