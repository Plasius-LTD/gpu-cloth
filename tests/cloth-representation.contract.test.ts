import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

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

  it("uses the public gpu-shared package surface for the browser demo", () => {
    const demoSource = fs.readFileSync(
      path.resolve(process.cwd(), "demo", "main.js"),
      "utf8"
    );
    const demoHtml = fs.readFileSync(
      path.resolve(process.cwd(), "demo", "index.html"),
      "utf8"
    );

    expect(demoSource).toContain('from "@plasius/gpu-shared"');
    expect(demoSource).not.toContain("node_modules/@plasius/gpu-shared/dist");
    expect(demoHtml).toContain('<script type="importmap">');
    expect(demoHtml).toContain(
      '"@plasius/gpu-shared": "../node_modules/@plasius/gpu-shared/dist/index.js"'
    );
  });
});
