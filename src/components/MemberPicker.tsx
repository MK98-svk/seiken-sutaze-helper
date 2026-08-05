import { Member } from "@/types/member";

interface Props {
  members: Member[];
  value: string;
  onChange: (id: string) => void;
  /** Pridá voľbu „Všetci“ s hodnotou "all". */
  withAll?: boolean;
  label?: string;
}

/**
 * Jednoduchý prepínač cvičencov pomocou tlačidiel.
 * Natívne tlačidlá fungujú spoľahlivo aj v Safari / PWA na iPhone,
 * kde sa rozbaľovacie menu občas nedalo otvoriť.
 */
const MemberPicker = ({ members, value, onChange, withAll, label }: Props) => {
  if (members.length === 0) return null;
  if (members.length === 1 && !withAll) return null;

  const options = [
    ...(withAll ? [{ id: "all", name: "Všetci" }] : []),
    ...members.map((m) => ({ id: m.id, name: `${m.meno} ${m.priezvisko}` })),
  ];

  return (
    <div className="space-y-2">
      {label && <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              value === o.id ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemberPicker;
