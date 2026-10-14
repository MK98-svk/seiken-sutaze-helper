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

  it("provides an explicit motion scenario for every one of the 112 activities", () => {
    expect(karateActivities).toHaveLength(112);
    expect(Object.keys(activityMotions).sort()).toEqual(karateActivities.map((a) => a.id).sort());
    for (const activity of karateActivities) {
      const demonstration = activityMotions[activity.id];
      expect(demonstration.frames.length, activity.id).toBeGreaterThanOrEqual(4);
      expect(demonstration.frames.some((frame, index, frames) => index > 0 &&
        (frame.a !== frames[index - 1].a || frame.pose !== frames[index - 1].pose ||
        frame.lane !== frames[index - 1].lane || frame.technique !== frames[index - 1].technique ||
        frame.facing !== frames[index - 1].facing)), activity.id).toBe(true);
    }
  });

  it("does not invent a specific kata sequence for any of the 16 unspecified kata tasks", () => {
    const kata = karateActivities.filter((a) => a.category === "Kata");
    expect(kata).toHaveLength(16);
    for (const activity of kata) {
      const demonstration = activityMotions[activity.id];
      expect(demonstration.coachSequence, activity.id).toBe(true);
      expect(demonstration.frames.some((frame) => frame.technique !== undefined)).toBe(true);
      expect(demonstration.frames.filter((frame) => frame.technique !== undefined).every((frame) => frame.pose === "neutral")).toBe(true);
    }
  });

  it("uses no partner or contact target for the two air-kick exercises", () => {
    for (const id of ["mae-geri-cez-tri-fazy", "rychly-navrat-kolena"]) {
      expect(activityMotions[id].solo).toBe(true);
      expect(activityMotions[id].frames.every((frame) => !frame.target)).toBe(true);
      expect(activityMotions[id].frames.at(-1)?.pose).toBe("guard");
    }
  });

  it("demonstrates kumite kick retraction and landing before retreat", () => {
    expect(activityMotions["kumite-mae-geri-odchod"].frames.map((frame) => [frame.pose, frame.a])).toEqual([
      ["guard", 130], ["chamber", 130], ["kick", 130], ["chamber", 130], ["guard", 130], ["guard", 95],
    ]);
  });

  it("can retrieve newly added activities through the existing filters", () => {
    expect(filterActivities("embusen", "Kata", "Pokročilí").map((a) => a.id)).toEqual(["embusen-na-paske"]);
    expect(filterActivities("loptička", "Reflex", "Všetky úrovne").length).toBeGreaterThanOrEqual(3);
    expect(filterActivities("embusen", "Rýchlosť", "Všetky úrovne")).toEqual([]);
  });
});