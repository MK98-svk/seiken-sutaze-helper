import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, RefreshCw, Users, Timer, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCatalog } from '@/hooks/useCatalog';
import { IMG, type CatalogExercise } from '@/lib/catalog';
import { CIRCUIT_GOALS, circuitExercises, type CircuitExercise, type CircuitGoal } from '@/data/circuitExercises';
import { karateActivities, type KarateActivity } from '@/data/karateActivities';
import { activityMotions } from '@/data/activityMotion';
import ActivityMotion from '@/components/ActivityMotion';
import ExerciseDetailDialog from '@/components/ExerciseDetailDialog';
import { buildCircuit, circuitGroups, circuitTiming, formatCircuitTime, type CircuitSettings } from '@/lib/circuitTraining';

type Props = { onOpenActivity: (activity: KarateActivity) => void };
const initial = { participants: '20', stations: '6', minutes: '30', work: '40', rest: '20', roundRest: '60' };
const fields: { key: keyof typeof initial; label: string }[] = [
  { key: 'participants', label: 'Počet cvičencov' },
  { key: 'stations', label: 'Počet stanovíšť' },
  { key: 'minutes', label: 'Čas na kruhový tréning (min)' },
  { key: 'work', label: 'Práca na stanovišti (s)' },
  { key: 'rest', label: 'Oddych a presun (s)' },
  { key: 'roundRest', label: 'Prestávka medzi kolami (s)' },
];

export default function CircuitBuilder({ onOpenActivity }: Props) {
  const [goal, setGoal] = useState<CircuitGoal>('strength');
  const [values, setValues] = useState(initial);
  const [stations, setStations] = useState<CircuitExercise[]>([]);
  const [variation, setVariation] = useState(0);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<CatalogExercise | null>(null);
  const { catalog, isLoading, error: catalogError } = useCatalog();
  const available = circuitExercises.filter(e => e.goals.includes(goal));
  const calculation = useMemo(() => {
    try {
      if (Object.values(values).some(v => v.trim() === '')) throw new Error('Doplňte všetky počty a časy.');
      const settings: CircuitSettings = { ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)])), goal } as CircuitSettings;
      const groups = circuitGroups(settings.participants, settings.stations);
      const timing = circuitTiming(settings);
      if (settings.stations > available.length) throw new Error(`Pre tento cieľ máme ${available.length} rôznych cvikov bez pomôcok. Znížte počet stanovíšť.`);
      return { settings, groups, timing, error: '' };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Skontrolujte zadanie.' };
    }
  }, [values, goal, available.length]);

  const generate = () => {
    if (!calculation.settings || !calculation.timing?.rounds) { setError(calculation.error || 'Do zadaného času sa nezmestí ani jedno celé kolo.'); return; }
    setStations(buildCircuit(goal, calculation.settings.stations, variation));
    setVariation(v => v + 1);
    setError('');
  };
  const move = (index: number, direction: number) => {
    const next = index + direction;
    if (next < 0 || next >= stations.length) return;
    setStations(items => { const result = [...items]; [result[index], result[next]] = [result[next], result[index]]; return result; });
  };
  const open = (station: CircuitExercise) => {
    if (station.source === 'activity') {
      const activity = karateActivities.find(a => a.id === station.id);
      if (activity) onOpenActivity(activity);
    } else {
      const exercise = catalog?.get(station.id);
      if (exercise) setSelectedExercise(exercise);
    }
  };

  return <section className="space-y-6" aria-label="Kruhový tréning">
    <div className="border-b border-border pb-4 space-y-2">
      <h2 className="font-display text-2xl flex items-center gap-2"><Dumbbell className="text-primary h-6 w-6" />Kruhový tréning</h2>
      <p className="text-sm text-muted-foreground">Bez pomôcok · zmiešaná skupina</p>
    </div>
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium mb-3">Čo chcete silovým tréningom dosiahnuť?</legend>
      <div className="flex flex-wrap gap-2">{CIRCUIT_GOALS.map(g => <Button key={g.id} variant={goal === g.id ? 'default' : 'outline'} aria-pressed={goal === g.id} onClick={() => { setGoal(g.id); setStations([]); setError(''); }}>{g.name}</Button>)}</div>
    </fieldset>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
      {fields.map(f => <div key={f.key} className="min-w-0 space-y-2"><Label htmlFor={`circuit-${f.key}`} className="block leading-snug min-h-10 sm:min-h-8">{f.label}</Label><Input id={`circuit-${f.key}`} type="number" inputMode="numeric" min={f.key === 'rest' || f.key === 'roundRest' ? 0 : 1} step={1} value={values[f.key]} onChange={e => { setValues(v => ({ ...v, [f.key]: e.target.value })); setStations([]); setError(''); }} /></div>)}
    </div>
    <div className="space-y-2 text-sm border-b border-border pb-4">
      <p className="text-muted-foreground">Pomôcky: žiadne. Klubové vybavenie zatiaľ nie je zaevidované.</p>
      <p className="text-muted-foreground">Tréner zvolí každému jednoduchšiu alebo ťažšiu verziu. Pri bolesti cvičenie zastaviť; kvalita pohybu má prednosť pred počtom opakovaní.</p>
      {goal === 'power' && <p className="text-primary">Výbušné cviky: 3–5 kvalitných opakovaní, potom oddych do konca intervalu. Medzi nimi sú stabilizačné stanovištia.</p>}
    </div>
    {calculation.timing && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-live="polite">
      {[['Celé kolá', calculation.timing.rounds], ['Jedno kolo', formatCircuitTime(calculation.timing.roundSeconds)], ['Čas cvičenia', formatCircuitTime(calculation.timing.totalSeconds)], ['Zostáva na vysvetlenie', formatCircuitTime(calculation.timing.spareSeconds)]].map(([label, value]) => <div key={label} className="border-l-2 border-primary pl-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl tabular-nums">{value}</p></div>)}
    </div>}
    <p className="text-xs text-muted-foreground">Oddych a presun je medzi stanovišťami; po poslednom stanovišti sa počíta iba prestávka medzi kolami. Po poslednom kole sa ďalšia prestávka nepripočítava.</p>
    {(calculation.error || error || (calculation.timing && !calculation.timing.rounds)) && <p role="alert" className="text-sm text-destructive">{calculation.error || error || 'Do zadaného času sa nezmestí ani jedno celé kolo.'}</p>}
    <Button onClick={generate} disabled={!!calculation.error || !calculation.timing?.rounds} className="w-full sm:w-auto gap-2"><RefreshCw className="h-4 w-4" />{stations.length ? 'Navrhnúť inú zostavu' : 'Zostaviť kruhový tréning'}</Button>
    {stations.length > 0 && calculation.groups && calculation.timing && <>
      <div className="border-t border-border pt-5 space-y-3">
        <h3 className="font-display text-xl flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Rozdelenie cvičencov</h3>
        <div className="flex flex-wrap gap-2">{calculation.groups.map(g => <span key={g.number} className="text-sm border-l border-border pl-3 pr-3">Skupina {g.number}: <strong>{g.size}</strong> · štart {g.number}</span>)}</div>
        <p className="text-sm text-muted-foreground">Po každom intervale prechod na ďalšie stanovište; z posledného na prvé. Každá skupina prejde všetky stanovištia v každom kole.</p>
        {calculation.groups.length < stations.length && <p className="text-sm text-muted-foreground">Niektoré stanovištia zostanú v každom intervale voľné.</p>}
        {calculation.groups.some(g => g.size > 1) && <p className="text-sm text-muted-foreground">Cvičenci na stanovišti pracujú súčasne, každý vo vlastnom voľnom priestore.</p>}
      </div>
      <div className="flex items-center gap-2 text-sm"><Timer className="h-4 w-4 text-primary" />{calculation.timing.rounds} kolá · {values.work} s práca · {values.rest} s presun · {values.roundRest} s medzi kolami</div>
      {catalogError && <p role="alert" className="text-sm text-destructive">Ukážky z Posilňovania sa nepodarilo načítať. Zostava a pokyny sú dostupné.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stations.map((station, i) => {
          const exercise = station.source === 'catalog' ? catalog?.get(station.id) : null;
          return <article key={station.id} className="border border-border rounded-md overflow-hidden bg-card flex flex-col">
            {station.source === 'activity' && activityMotions[station.id] ? <ActivityMotion data={activityMotions[station.id]} name={station.name} compact /> : exercise ? <img src={IMG(exercise.image)} alt={station.name} className="w-full h-40 object-contain bg-background" loading="lazy" /> : <div className="h-40 flex items-center justify-center bg-muted text-muted-foreground"><Dumbbell className="h-10 w-10" /></div>}
            <div className="p-4 flex-1 space-y-3">
              <div className="flex justify-between items-start gap-2"><h4 className="font-display text-lg min-w-0">{i + 1}. {station.name}</h4><div className="flex shrink-0"><Button size="icon" variant="ghost" title="Posunúť vyššie" aria-label={`Posunúť ${station.name} vyššie`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Posunúť nižšie" aria-label={`Posunúť ${station.name} nižšie`} disabled={i === stations.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button></div></div>
              <p className="text-sm">{station.instruction}</p>
              <p className="text-xs text-muted-foreground"><span className="text-primary">Jednoduchšie:</span> {station.easier}</p>
              <p className="text-xs text-muted-foreground"><span className="text-primary">Ťažšie:</span> {station.harder}</p>
              <div className="space-y-2 pt-2"><Label htmlFor={`station-${i}`}>Cvik na stanovišti {i + 1}</Label><select id={`station-${i}`} value={station.id} className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground" onChange={e => { const next = available.find(a => a.id === e.target.value); if (next) setStations(items => items.map((a, index) => index === i ? next : a)); }}>{available.filter(a => a.id === station.id || !stations.some(s => s.id === a.id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <Button variant="outline" className="w-full justify-between" disabled={station.source === 'catalog' && !exercise} onClick={() => open(station)}>{station.source === 'catalog' && isLoading ? 'Načítavam ukážku…' : 'Postup a pohybová ukážka'}<ArrowUpRight className="h-4 w-4 shrink-0" /></Button>
            </div>
          </article>;
        })}
      </div>
    </>}
    <ExerciseDetailDialog exercise={selectedExercise} onOpenChange={open => { if (!open) setSelectedExercise(null); }} />
  </section>;
}