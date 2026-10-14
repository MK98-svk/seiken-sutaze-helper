import { describe, expect, it } from "vitest";
import { canAccessActivities } from "@/lib/activityAccess";

describe("Aktivity pre trénerov", () => {
  it("povolí trénera bez roly admin", () => expect(canAccessActivities(false, true)).toBe(true));
  it("povolí admina bez roly tréner", () => expect(canAccessActivities(true, false)).toBe(true));
  it("nepovolí bežného člena", () => expect(canAccessActivities(false, false)).toBe(false));
});