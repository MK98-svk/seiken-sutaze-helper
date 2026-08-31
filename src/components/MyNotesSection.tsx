import { useState } from "react";
import { StickyNote, Trash2, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseNotes } from "@/hooks/useExerciseNotes";
import { useCatalog } from "@/hooks/useCatalog";
import { exerciseById } from "@/data/exercises";
import { toast } from "sonner";

interface Props {
  memberId: string | null;
}

/** Prehľad všetkých poznámok cvičenca ku cvikom – s možnosťou upraviť alebo vymazať. */
export default function MyNotesSection({ memberId }: Props) {
  const { noteList, isLoading, saveNote, deleteNote } = useExerciseNotes(memberId);
  const { catalog } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const nameOf = (id: string) => catalog?.get(id)?.name ?? exerciseById(id)?.name ?? id;

  const startEdit = (id: string, note: string) => {
    setEditingId(id);
    setText(note);
  };

  const save = async (id: string) => {
    try {
      await saveNote(id, text);
      setEditingId(null);
      toast.success("Poznámka uložená");
    } catch (e: any) {
      toast.error("Nepodarilo sa uložiť: " + e.message);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success("Poznámka vymazaná");
    } catch (e: any) {
      toast.error("Nepodarilo sa vymazať: " + e.message);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        <StickyNote className="h-3.5 w-3.5 text-primary" /> Moje poznámky
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Načítavam poznámky…</div>
      ) : noteList.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Zatiaľ žiadne poznámky. Pridaj si ich priamo pri cviku počas tréningu.
        </div>
      ) : (
        <div className="space-y-2">
          {noteList.map((n) => (
            <div key={n.exerciseId} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm tracking-wide uppercase break-words">{nameOf(n.exerciseId)}</div>
                  {n.updatedAt && (
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(n.updatedAt).toLocaleDateString("sk-SK")}
                    </div>
                  )}
                </div>
                {editingId !== n.exerciseId && (
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-9 w-9" title="Upraviť" onClick={() => startEdit(n.exerciseId, n.note)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" title="Vymazať" onClick={() => remove(n.exerciseId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {editingId === n.exerciseId ? (
                <div className="space-y-2">
                  <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-9 gap-1" onClick={() => save(n.exerciseId)}>
                      <Check className="h-4 w-4" /> Uložiť
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" /> Zrušiť
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground break-words">{n.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
