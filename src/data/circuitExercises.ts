export type CircuitGoal = 'strength' | 'power' | 'endurance' | 'core';
export const CIRCUIT_GOALS: { id: CircuitGoal; name: string }[] = [
  { id: 'strength', name: 'Sila celého tela' },
  { id: 'power', name: 'Výbušnosť pre karate' },
  { id: 'endurance', name: 'Silová vytrvalosť' },
  { id: 'core', name: 'Stabilita a stred tela' },
];
export type CircuitExercise = {
  id: string; source: 'activity' | 'catalog'; name: string;
  area: 'legs' | 'push' | 'core' | 'posterior'; goals: CircuitGoal[];
  easier: string; harder: string; instruction: string;
};
// Explicit, coach-reviewable bodyweight allowlist: no assisted, bench or suspended exercises.
export const circuitExercises: CircuitExercise[] = [
  { id: 'silovy-vaha-vypady', source: 'activity', name: 'Výpady do strany', area: 'legs', goals: ['strength', 'endurance'], easier: 'Kratší krok a menšia hĺbka.', harder: 'Dvojsekundová výdrž dole.', instruction: 'Striedajte strany, koleno v smere chodidla.' },
  { id: 'silovy-vaha-plank-dotyky', source: 'activity', name: 'Plank s dotykmi ramien', area: 'core', goals: ['core', 'strength', 'endurance'], easier: 'Opora z kolien, prípadne bez dotykov.', harder: 'Pomalšie dotyky bez rotácie panvy.', instruction: 'Pevný trup; pri strate polohy oddych v kľaku.' },
  { id: 'silovy-vaha-mrtvy-chrobak', source: 'activity', name: 'Mŕtvy chrobák', area: 'core', goals: ['core', 'strength', 'power'], easier: 'Pohyb iba jednej končatiny.', harder: 'Dlhšia páka rúk a nôh.', instruction: 'Pomalý pohyb, driek sa neodlepuje. Pri výbušnosti stabilizačné stanovište medzi rýchlymi cvikmi.' },
  { id: 'silovy-vaha-doskoky', source: 'activity', name: 'Kontrolované doskoky', area: 'legs', goals: ['power'], easier: 'Výpon bez výskoku.', harder: 'Krátky skok vpred a stabilný postoj.', instruction: 'Len 3–5 kvalitných doskokov, potom oddych do konca intervalu. Žiadne skákanie do vyčerpania.' },
  { id: '3211', source: 'catalog', name: 'Kliky z kolien', area: 'push', goals: ['strength', 'endurance'], easier: 'Menší rozsah; bez bolesti ramien.', harder: 'Klik v plnej opore.', instruction: 'Pevný trup, kontrolované spúšťanie, výdych hore.' },
  { id: '1685', source: 'catalog', name: 'Drep s vystretím rúk', area: 'legs', goals: ['strength', 'endurance', 'power'], easier: 'Plytký drep.', harder: 'Pomalý návrat do drepu.', instruction: 'Kolená sledujú chodidlá. Pri výbušnosti svižne hore bez výskoku, 3–5 opakovaní a oddych.' },
  { id: '3013', source: 'catalog', name: 'Mostík na zemi', area: 'posterior', goals: ['strength', 'core', 'endurance'], easier: 'Menší rozsah zdvihnutia panvy.', harder: 'Výdrž dve sekundy hore.', instruction: 'Panvu zdvihnite bez prehnutia drieku, plynulo dýchajte.' },
  { id: '1373', source: 'catalog', name: 'Výpony na špičky', area: 'legs', goals: ['strength', 'endurance', 'power'], easier: 'Menší rozsah a pomalé tempo.', harder: 'Pomalé spúšťanie päty.', instruction: 'Stabilný stoj. Pri výbušnosti 3–5 svižných výponov a oddych; bez poskakovania.' },
  { id: '3239', source: 'catalog', name: 'Dotyky ramien v opore z kolien', area: 'core', goals: ['core', 'endurance'], easier: 'Výdrž v opore bez dotykov.', harder: 'Predĺženie páky posunutím kolien dozadu.', instruction: 'Prenášajte váhu pomaly, neotáčajte boky.' },
  { id: '3021', source: 'catalog', name: 'Lopatkové kliky', area: 'push', goals: ['core', 'strength', 'power'], easier: 'Opora z kolien.', harder: 'Plná opora s krátkou výdržou.', instruction: 'Malý kontrolovaný pohyb lopatiek s vystretými lakťami; pri výbušnosti aktivačné stanovište, nie maximálny výkon.' },
  { id: '2368', source: 'catalog', name: 'Drep vo výpadovom postoji', area: 'legs', goals: ['strength', 'endurance', 'core'], easier: 'Kratší rozsah a širšia opora.', harder: 'Dvojsekundová výdrž dole.', instruction: 'Polovicu času jedna strana, potom druhá; koleno nepadá dovnútra.' },
  { id: '3561', source: 'catalog', name: 'Mostík so striedaním nôh', area: 'posterior', goals: ['core', 'strength', 'power'], easier: 'Obe chodidlá zostávajú na zemi.', harder: 'Krátka výdrž pri zdvihnutej nohe.', instruction: 'Panva zostáva rovná; pri výbušnosti stabilizačné stanovište medzi rýchlymi cvikmi.' },
];