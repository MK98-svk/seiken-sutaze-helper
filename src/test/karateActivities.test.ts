import { describe, expect, it } from "vitest";
import { karateActivities, filterActivities } from "@/data/karateActivities";
import { activityMotions } from "@/data/activityMotion";

describe("karate activity catalog", () => {
  it("offers a dedicated populated Kumite category with motion demonstrations", () => {
    const kumite = filterActivities("", "Kumite", "Všetky úrovne");
    expect(kumite.length).toBeGreaterThan(0);
    expect(kumite.every((a) => a.category === "Kumite" && activityMotions[a.id]?.frames.length >= 4)).toBe(true);
    expect(filterActivities("hranic", "Kumite", "Všetky úrovne").map((a) => a.id)).toEqual(["kumite-hranica"]);
  });
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