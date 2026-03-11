import { Member, Competition } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditMemberDialog from "./EditMemberDialog";
import { useState } from "react";

interface MobileMemberListProps {
  members: Member[];
  competitions: Competition[];
  isAdmin: boolean;
  currentUserId: string | null;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  isRegistered: (memberId: string, competitionId: string) => boolean;
}

export default function MobileMemberList({
  members,
  competitions,
  isAdmin,
  currentUserId,
  onUpdateMember,
  onDeleteMember,
  isRegistered,
}: MobileMemberListProps) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <>
      <div className="space-y-2">
        <AnimatePresence>
          {members.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-lg border border-border">
              Zatiaľ žiadni členovia. Pridajte prvého člena klubu.
            </div>
          ) : (
            members.map((member) => {
              const canEdit = isAdmin || (currentUserId != null && member.userId === currentUserId);
              const compCount = competitions.filter((c) => isRegistered(member.id, c.id)).length;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {member.meno} {member.priezvisko}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium whitespace-nowrap">
                          {member.stupen || "—"}
                        </span>
                        {member.kata && <span>Kata</span>}
                        {member.kobudo && <span>Kobudo</span>}
                        {member.kumite && <span>Kumite</span>}
                      </div>
                      <div className="flex gap-3 mt-1.5 text-xs">
                        {(member.zlato > 0 || member.striebro > 0 || member.bronz > 0) ? (
                          <>
                            {member.zlato > 0 && <span>🥇 {member.zlato}</span>}
                            {member.striebro > 0 && <span>🥈 {member.striebro}</span>}
                            {member.bronz > 0 && <span>🥉 {member.bronz}</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Žiadne medaily</span>
                        )}
                        {compCount > 0 && (
                          <span className="text-muted-foreground">• {compCount} súťaží</span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setEditingMember(member)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteMember(member.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer summary */}
      {members.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-3 mt-3">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Členov: <strong className="text-foreground">{members.length}</strong></span>
            <span>Kata: <strong className="text-foreground">{members.filter((m) => m.kata).length}</strong></span>
            <span>Kobudo: <strong className="text-foreground">{members.filter((m) => m.kobudo).length}</strong></span>
            <span>Kumite: <strong className="text-foreground">{members.filter((m) => m.kumite).length}</strong></span>
            <span>🥇 <strong className="text-foreground">{members.reduce((s, m) => s + (m.zlato ?? 0), 0)}</strong></span>
            <span>🥈 <strong className="text-foreground">{members.reduce((s, m) => s + (m.striebro ?? 0), 0)}</strong></span>
            <span>🥉 <strong className="text-foreground">{members.reduce((s, m) => s + (m.bronz ?? 0), 0)}</strong></span>
          </div>
        </div>
      )}

      <EditMemberDialog
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSave={onUpdateMember}
      />
    </>
  );
}
