import { describe, expect, it } from "vitest";

import { createClothContinuityEnvelope } from "../src/index.js";

describe("createClothContinuityEnvelope", () => {
  it("builds a shared continuity contract across all bands", () => {
    const continuity = createClothContinuityEnvelope({
      garmentId: "hero-cape",
    });

    expect(continuity.continuityGroupId).toBe("hero-cape.continuity");
    expect(continuity.motionFieldId).toBe("hero-cape.motion-field");
    expect(continuity.bands.mid.inheritsFromBand).toBe("near");
    expect(continuity.bands.far.inheritsFromBand).toBe("mid");
    expect(continuity.bands.horizon.inheritsFromBand).toBe("far");
    expect(continuity.bands.mid.silhouetteFloor).toBeGreaterThan(
      continuity.bands.horizon.silhouetteFloor
    );
    expect(continuity.bands.far.broadMotionFloor).toBeGreaterThan(
      continuity.bands.horizon.broadMotionFloor
    );
  });

  it("accepts band overrides without losing garment identity", () => {
    const continuity = createClothContinuityEnvelope({
      garmentId: "banner",
      continuityGroupId: "banner.wind",
      motionFieldId: "banner.shared-motion",
      bands: {
        far: {
          blendWindowMeters: 24,
          silhouetteFloor: 0.65,
        },
      },
    });

    expect(continuity.continuityGroupId).toBe("banner.wind");
    expect(continuity.motionFieldId).toBe("banner.shared-motion");
    expect(continuity.bands.far.blendWindowMeters).toBe(24);
    expect(continuity.bands.far.silhouetteFloor).toBe(0.65);
    expect(continuity.bands.far.retainPinnedAnchors).toBe(true);
  });

  it("rejects invalid ratios", () => {
    expect(() =>
      createClothContinuityEnvelope({
        garmentId: "bad",
        bands: {
          near: {
            silhouetteFloor: 1.4,
          },
        },
      })
    ).toThrow(/must be less than or equal to 1/i);
  });
});
