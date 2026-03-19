import { describe, expect, it } from "vitest";

import {
  createClothRepresentationPlan,
  selectClothRepresentationBand,
} from "../src/index.js";

describe("createClothRepresentationPlan", () => {
  it("creates a continuity-aware plan for all bands", () => {
    const plan = createClothRepresentationPlan({
      garmentId: "hero-cape",
      profile: "interactive",
      supportsRayTracing: true,
    });

    expect(plan.bands).toEqual(["near", "mid", "far", "horizon"]);
    expect(plan.representations).toHaveLength(4);

    const near = plan.representations.find((entry) => entry.band === "near");
    const far = plan.representations.find((entry) => entry.band === "far");
    const horizon = plan.representations.find(
      (entry) => entry.band === "horizon"
    );

    expect(near?.mesh.simulationVertices).toBeGreaterThan(
      far?.mesh.simulationVertices ?? 0
    );
    expect(near?.continuity.motionFieldId).toBe(far?.continuity.motionFieldId);
    expect(far?.continuity.silhouetteFloor).toBeGreaterThan(
      horizon?.continuity.silhouetteFloor ?? 0
    );
    expect(near?.rtParticipation).toBe("full");
    expect(horizon?.rtParticipation).toBe("disabled");
  });

  it("downgrades RT participation when the host does not support it", () => {
    const plan = createClothRepresentationPlan({
      garmentId: "banner",
      supportsRayTracing: false,
    });

    const near = plan.representations.find((entry) => entry.band === "near");
    const mid = plan.representations.find((entry) => entry.band === "mid");

    expect(near?.rtParticipation).toBe("selective");
    expect(mid?.rtParticipation).toBe("proxy");
  });

  it("selects bands from thresholds without gaps", () => {
    const plan = createClothRepresentationPlan({
      garmentId: "skirt",
      nearFieldMaxMeters: 12,
      midFieldMaxMeters: 40,
      farFieldMaxMeters: 120,
    });

    expect(selectClothRepresentationBand(4, plan.thresholds)).toBe("near");
    expect(selectClothRepresentationBand(24, plan.thresholds)).toBe("mid");
    expect(selectClothRepresentationBand(80, plan.thresholds)).toBe("far");
    expect(selectClothRepresentationBand(200, plan.thresholds)).toBe("horizon");
  });

  it("rejects threshold ordering that would cause popping or ambiguity", () => {
    expect(() =>
      createClothRepresentationPlan({
        garmentId: "broken",
        nearFieldMaxMeters: 50,
        midFieldMaxMeters: 45,
        farFieldMaxMeters: 120,
      })
    ).toThrow(/must satisfy/i);
  });
});
