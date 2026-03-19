import { describe, expect, it } from "vitest";

import {
  clothSimulationStageOrder,
  createClothSimulationPlan,
  getClothWorkerManifest,
} from "../src/index.js";

describe("getClothWorkerManifest", () => {
  it("emits a multi-root DAG manifest with join points", () => {
    const manifest = getClothWorkerManifest("interactive");

    const roots = manifest.jobs.filter(
      (job) => job.worker.dependencies.length === 0
    );
    const wrinkleHistory = manifest.jobs.find(
      (job) => job.key === "wrinkle-history"
    );
    const nearCloth = manifest.jobs.find((job) => job.key === "near-cloth");

    expect(manifest.schedulerMode).toBe("dag");
    expect(roots.map((job) => job.key).sort()).toEqual([
      "snapshot-ingest",
      "wind-field-advance",
    ]);
    expect(wrinkleHistory?.worker.dependencies).toEqual([
      "near-cloth",
      "mid-cloth",
    ]);
    expect(nearCloth?.performance.representationBand).toBe("near");
    expect(nearCloth?.performance.qualityDimensions?.deformation).toBe(1);
  });

  it("preserves attachment stability ahead of distant proxies", () => {
    const manifest = getClothWorkerManifest("interactive");

    const pinUpdate = manifest.jobs.find(
      (job) => job.key === "pin-constraint-update"
    );
    const farProxy = manifest.jobs.find((job) => job.key === "far-proxy");

    expect(pinUpdate?.performance.authority).toBe("authoritative");
    expect(pinUpdate?.worker.priority).toBeGreaterThan(
      farProxy?.worker.priority ?? 0
    );
  });
});

describe("createClothSimulationPlan", () => {
  it("requires a stable physics snapshot and exports stable render state", () => {
    const plan = createClothSimulationPlan("interactive");

    expect(plan.snapshotSource.packageName).toBe("@plasius/gpu-physics");
    expect(plan.snapshotSource.contract).toBe("physics.worldSnapshot");
    expect(plan.continuityContract.requiresSharedMotionField).toBe(true);
    expect(plan.stages.map((stage) => stage.id)).toEqual(
      clothSimulationStageOrder
    );
    expect(plan.stages.at(-1)?.id).toBe("render-snapshot");
    expect(plan.stages.at(-1)?.snapshotStable).toBe(true);
  });
});
