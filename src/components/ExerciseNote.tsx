import { useEffect, useRef, useState } from "react";
import { StickyNote, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onSave: (note: string) => Promise<void> | void;
  disabled?: boolean;
}

/** Malé okienko na poznámku k cviku (napr. nakladanie tyče, plán progresie). */
export default function ExerciseNote({ value, onSave, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const schedule = (next: string) => {
    setText(next);
    setSaved(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      await onSave(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    }, 700);
  };

  const flush = async () => {
    if (timer.current) window.clearTimeout(timer.current);
    if ((text ?? "").trim() === (value ?? "").trim()) return;
    await onSave(text);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const hasNote = (value ?? "").trim().length > 0;

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={disabled}
        className="h-8 w-full justify-start gap-1.5 px-2 text-left text-[11px] text-muted-foreground"
        onClick={() => setOpen(true)}
        title="Poznámka k cviku"
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate">{hasNote ? value : "Pridať poznámku"}</span>
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <StickyNote className="h-3.5 w-3.5 text-primary" /> Poznámka
        {saved && (
          <span className="ml-auto inline-flex items-center gap-1 text-primary">
            <Check className="h-3 w-3" /> uložené
          </span>
        )}
      </div>
      <Textarea
        value={text}
        onChange={(e) => schedule(e.target.value)}
        onBlur={async () => {
          await flush();
          setOpen(false);
        }}
        placeholder="napr. tyč 12 kg + 2×10 kg = 32 kg, nabudúce pridať 2,5 kg"
        rows={2}
        autoFocus
        className="min-h-[56px] text-sm"
      />
    </div>
  );
}
