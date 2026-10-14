import { describe, expect, it } from "vitest";
import { karateActivities, filterActivities } from "@/data/karateActivities";

describe("karate activity catalog", () => {
  it("offers at least 100 distinct activities", () => {
    expect(karateActivities.length).toBeGreaterThanOrEqual(100);
    expect(new Set(karateActivities.map((a) => a.id)).size).toBe(karateActivities.length);
    expect(new Set(karateActivities.map((a) => a.name)).size).toBe(karateActivities.length);
  });

  it("can retrieve newly added activities through the existing filters", () => {
    expect(filterActivities("embusen", "Kata", "Pokročilí").map((a) => a.id)).toEqual(["embusen-na-paske"]);
    expect(filterActivities("loptička", "Reflex", "Všetky úrovne").length).toBeGreaterThanOrEqual(3);
    expect(filterActivities("embusen", "Rýchlosť", "Všetky úrovne")).toEqual([]);
  });
});