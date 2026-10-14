import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ActivityMotion from "@/components/ActivityMotion";
import { activityMotions } from "@/data/activityMotion";
import type { MotionPose } from "@/data/motionTypes";

afterEach(cleanup);

describe("motion pose runtime compatibility", () => {
  it("renders every catalog frame without dereferencing missing limbs", () => {
    for (const [id, data] of Object.entries(activityMotions)) {
      for (const frame of data.frames) {
        expect(() => {
          const view = render(<ActivityMotion name={id} compact data={{ ...data, frames: [frame] }} />);
          view.unmount();
        }, `${id}: ${frame.pose}`).not.toThrow();
      }
    }
  });

  it.each(["obsolete-pose", "toString", undefined])("does not crash on stale participant or partner pose %s", (value) => {
    // Simulate stale runtime data despite the current TypeScript contract.
    const unknownPose = value as MotionPose;
    expect(() => render(<ActivityMotion name="Stale preview state" data={{
      note: "", frames: [{ label: "Stale frame", a: 145, b: 340, pose: unknownPose, partnerPose: unknownPose }],
    }} />)).not.toThrow();
  });
});