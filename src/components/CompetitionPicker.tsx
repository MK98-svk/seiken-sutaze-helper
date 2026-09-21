import { Competition } from "@/types/member";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { ChevronDown } from "lucide-react";

interface Props {
  competitions: Competition[];
  value: string;
  onChange: (value: string) => void;
}

const formatDate = (d: string) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "d.M.yyyy", { locale: sk });
  } catch {
    return d;
  }
};

/**
 * Výber súťaže cez natívny <select>.
 * Natívne menu funguje spoľahlivo v každom mobilnom prehliadači aj v PWA,
 * kde sa vlastné rozbaľovacie menu občas zobrazilo prázdne.
 */
export default function CompetitionPicker({ competitions, value, onChange }: Props) {
  return (
    <div className="relative w-full sm:w-[320px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Vybrať súťaž"
        className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">Všetky (prehľad členov)</option>
        <option value="stats">📊 Úspešnosť pretekárov</option>
        <option value="team-stats">👥 Úspešnosť tímov</option>
        {competitions.map((comp) => (
          <option key={comp.id} value={comp.id}>
            {comp.nazov} — {formatDate(comp.datum)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
