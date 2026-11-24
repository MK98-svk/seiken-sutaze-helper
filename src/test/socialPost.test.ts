import { describe, it, expect } from "vitest";
import { buildSocialPost, medalCounts } from "@/lib/socialPost";

const base = {
  competitionName: "Prievidza Cup", dateLabel: "V sobotu 26. septembra", participants: 33,
  individuals: [
    { name: "Michal", surname: "Horňák", placement: 1 },
    { name: "Michal", surname: "Horňák", placement: 1 },
    { name: "Jakub", surname: "Artner", placement: 3 },
    { name: "Jakub", surname: "Artner", placement: 2 },
    { name: "Eva", surname: "Nová", placement: 5 },
  ],
  teams: [{ discipline: "kata", members: "Hurban, Šamudovský, Hargaš", placement: 1 }, { discipline: "kumite", members: "A, B, C", placement: 4 }],
};

describe("socialPost", () => {
  it("counts only places 1-3", () => expect(medalCounts(base.individuals)).toEqual({ gold: 2, silver: 1, bronze: 1 }));
  it("groups medals per person, best first, skips non-medal", () => {
    const t = buildSocialPost({ ...base, platform: "fb" });
    expect(t).toContain("Jakub Artner – 🥈🥉");
    expect(t).toContain("Michal Horňák – 🥇🥇");
    expect(t).not.toContain("Eva Nová");
    expect(t).toContain("🥇 Hurban – Šamudovský – Hargaš");
    expect(t).not.toContain("KUMITE TEAM");
  });
  it("uses @tags only on instagram", () => {
    expect(buildSocialPost({ ...base, platform: "ig" })).toContain("@slovakfederationofkarate");
    expect(buildSocialPost({ ...base, platform: "fb" })).toContain("finančnou podporou");
  });
});
