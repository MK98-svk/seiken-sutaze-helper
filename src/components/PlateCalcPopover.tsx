import { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BAR_KEY = "seiken_bar_weight";
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

interface Props {
  onApply: (total: number) => void;
}

/** Pomôcka: hmotnosť tyče + kotúče na jednej strane => celková váha. */
export default function PlateCalcPopover({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [bar, setBar] = useState<string>("20");
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem(BAR_KEY);
    if (stored) setBar(stored);
  }, []);

  const total = useMemo(() => {
    const perSide = PLATES.reduce((sum, p) => sum + p * (counts[p] ?? 0), 0);
    return (Number(bar) || 0) + perSide * 2;
  }, [bar, counts]);

  const bump = (p: number, delta: number) =>
    setCounts((prev) => ({ ...prev, [p]: Math.max(0, (prev[p] ?? 0) + delta) }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="icon" variant="outline" className="h-9 w-9 shrink-0" title="Prepočet nakladania">
          <Calculator className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[17rem] space-y-3" align="end">
        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Hmotnosť tyče (kg)</label>
          <Input
            type="number"
            inputMode="decimal"
            value={bar}
            onChange={(e) => {
              setBar(e.target.value);
              localStorage.setItem(BAR_KEY, e.target.value);
            }}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Kotúče na jednej strane</div>
          <div className="space-y-1">
            {PLATES.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="w-14 text-sm tabular-nums">{p} kg</span>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => bump(p, -1)}>
                  −
                </Button>
                <span className="w-6 text-center text-sm tabular-nums">{counts[p] ?? 0}</span>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => bump(p, 1)}>
                  +
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <div className="font-display text-lg text-primary tabular-nums">{total} kg</div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(total);
              setOpen(false);
            }}
          >
            Použiť
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
