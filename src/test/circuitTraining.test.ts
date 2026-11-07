import { describe, expect, it } from 'vitest';
import { buildCircuit, circuitGroups, circuitTiming } from '@/lib/circuitTraining';
import { CIRCUIT_GOALS } from '@/data/circuitExercises';

describe('Kruhový tréning', () => {
  it('zmestí celé kolá do zadaných 30 minút vrátane prestávok', () => {
    const result = circuitTiming({ participants: 20, stations: 6, minutes: 30, work: 40, rest: 20, roundRest: 60, goal: 'strength' });
    expect(result).toEqual({ rounds: 4, roundSeconds: 340, totalSeconds: 1540, spareSeconds: 260 });
    expect(result.totalSeconds + result.roundSeconds + 60).toBeGreaterThan(1800);
  });
  it('rozdelí 20 cvičencov na 6 vyvážených skupín a každý prejde všetky stanovištia', () => {
    const groups = circuitGroups(20, 6);
    expect(groups.map(g => g.size)).toEqual([4, 4, 3, 3, 3, 3]);
    groups.forEach(g => expect([...g.route].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]));
    for (let step = 0; step < 6; step++) expect(new Set(groups.map(g => g.route[step])).size).toBe(6);
  });
  it('pri menšom počte ľudí nevytvára prázdne skupiny', () => {
    expect(circuitGroups(3, 6).map(g => g.size)).toEqual([1, 1, 1]);
  });
  it.each(CIRCUIT_GOALS)('vyberá rôzne stanovištia vhodné pre $name', ({ id }) => {
    const stations = buildCircuit(id, 6);
    expect(stations).toHaveLength(6);
    expect(new Set(stations.map(e => e.id)).size).toBe(6);
    expect(stations.every(e => e.goals.includes(id))).toBe(true);
  });
  it('nepredstiera kolo, ktoré sa nezmestí, a odmieta neplatné počty', () => {
    expect(circuitTiming({ participants: 20, stations: 6, minutes: 1, work: 40, rest: 20, roundRest: 60, goal: 'strength' }).rounds).toBe(0);
    expect(() => circuitGroups(0, 6)).toThrow();
    expect(() => buildCircuit('core', 50)).toThrow();
  });
});