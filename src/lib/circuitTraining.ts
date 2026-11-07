import { circuitExercises, type CircuitExercise, type CircuitGoal } from '@/data/circuitExercises';

export type CircuitSettings = { participants: number; stations: number; minutes: number; work: number; rest: number; roundRest: number; goal: CircuitGoal };
export function circuitTiming({ stations, minutes, work, rest, roundRest }: CircuitSettings) {
  if (![stations, minutes, work, rest, roundRest].every(Number.isFinite) || !Number.isInteger(stations) || stations < 1 || minutes <= 0 || work <= 0 || rest < 0 || roundRest < 0) throw new Error('Skontrolujte čas a počet stanovíšť.');
  const budget = Math.floor(minutes * 60);
  const roundSeconds = stations * work + (stations - 1) * rest;
  const rounds = Math.max(0, Math.floor((budget + roundRest) / (roundSeconds + roundRest)));
  const totalSeconds = rounds ? rounds * roundSeconds + (rounds - 1) * roundRest : 0;
  return { rounds, roundSeconds, totalSeconds, spareSeconds: budget - totalSeconds };
}
export function circuitGroups(participants: number, stations: number) {
  if (!Number.isInteger(participants) || participants < 1 || !Number.isInteger(stations) || stations < 1) throw new Error('Zadajte kladný celý počet cvičencov a stanovíšť.');
  return Array.from({ length: Math.min(participants, stations) }, (_, i) => ({
    number: i + 1,
    size: Math.floor(participants / Math.min(participants, stations)) + (i < participants % Math.min(participants, stations) ? 1 : 0),
    route: Array.from({ length: stations }, (_, step) => (i + step) % stations + 1),
  }));
}
export function buildCircuit(goal: CircuitGoal, stations: number, variation = 0): CircuitExercise[] {
  const pool = circuitExercises.filter(e => e.goals.includes(goal));
  if (!Number.isInteger(stations) || stations < 1 || stations > pool.length) throw new Error(`Pre tento cieľ je dostupných ${pool.length} rôznych stanovíšť bez pomôcok.`);
  const shifted = [...pool.slice(variation % pool.length), ...pool.slice(0, variation % pool.length)];
  const chosen: CircuitExercise[] = [];
  while (chosen.length < stations) {
    const next = shifted.find(e => !chosen.some(c => c.id === e.id) && e.area !== chosen.at(-1)?.area)
      ?? shifted.find(e => !chosen.some(c => c.id === e.id));
    if (!next) break;
    chosen.push(next);
  }
  return chosen;
}
export function formatCircuitTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}