import type {
  ClothPerformanceDomain,
  ClothPerformanceImportanceSignals,
  ClothPerformanceQualityDimensions,
  ClothProfileName,
  ClothRepresentationBand,
  ClothSimulationPlan,
  ClothSimulationPlanStage,
  ClothSimulationStageId,
  ClothWorkerAuthority,
  ClothWorkerBudgetLevel,
  ClothWorkerImportance,
  ClothWorkerManifest,
  ClothWorkerManifestJob,
  ClothWorkerQueueClass,
} from "./types.js";
import { clothProfileNames, clothRepresentationBands } from "./types.js";
import { normalizeClothProfile } from "./validation.js";

export const clothDebugOwner = "cloth";
export const defaultClothProfile = "interactive";

type BudgetPreset = {
  estimatedCostMs: number;
  maxDispatchesPerFrame: number;
  maxJobsPerDispatch: number;
  cadenceDivisor: number;
  workgroupScale: number;
  maxQueueDepth: number;
};

type WorkerLevelSpec = {
  low: BudgetPreset;
  medium: BudgetPreset;
  high: BudgetPreset;
};

type WorkerJobSpec = {
  label: string;
  queueClass: ClothWorkerQueueClass;
  priority: number;
  dependencies: readonly string[];
  domain: ClothPerformanceDomain;
  authority: ClothWorkerAuthority;
  importance: ClothWorkerImportance;
  representationBand?: ClothRepresentationBand;
  qualityDimensions?: Readonly<ClothPerformanceQualityDimensions>;
  importanceSignals?: Readonly<ClothPerformanceImportanceSignals>;
  suggestedAllocationIds: readonly string[];
  levels: WorkerLevelSpec;
};

type WorkerProfileSpec = {
  description: string;
  suggestedAllocationIds: readonly string[];
  jobs: Readonly<Record<string, WorkerJobSpec>>;
};

const simulationStageLabels: Readonly<Record<ClothSimulationStageId, string>> =
  Object.freeze({
    "snapshot-ingest": "Ingest stable physics snapshot",
    "wind-field-advance": "Advance wind and external force field",
    "pin-constraint-update": "Resolve pin and attachment constraints",
    "cloth-solve": "Solve cloth state",
    "near-cloth": "Prepare near-field cloth simulation output",
    "mid-cloth": "Prepare mid-field cloth simulation output",
    "far-proxy": "Prepare far-field garment proxy",
    "horizon-impression": "Prepare horizon silhouette impression",
    "wrinkle-history": "Propagate wrinkle and crease history",
    "render-snapshot": "Commit stable render snapshot",
  });

function createSimulationStage(
  stage: ClothSimulationPlanStage
): ClothSimulationPlanStage {
  return Object.freeze({
    ...stage,
    dependencies: Object.freeze([...stage.dependencies]),
  });
}

function buildBudgetLevels(
  jobType: string,
  queueClass: ClothWorkerQueueClass,
  levels: WorkerLevelSpec
): readonly ClothWorkerBudgetLevel[] {
  return Object.freeze(
    (["low", "medium", "high"] as const).map((quality) =>
      Object.freeze({
        id: quality,
        estimatedCostMs: levels[quality].estimatedCostMs,
        config: Object.freeze({
          maxDispatchesPerFrame: levels[quality].maxDispatchesPerFrame,
          maxJobsPerDispatch: levels[quality].maxJobsPerDispatch,
          cadenceDivisor: levels[quality].cadenceDivisor,
          workgroupScale: levels[quality].workgroupScale,
          maxQueueDepth: levels[quality].maxQueueDepth,
          metadata: Object.freeze({
            owner: "cloth",
            queueClass,
            jobType,
            quality,
          }),
        }),
      })
    )
  );
}

function buildManifestJob(
  profile: ClothProfileName,
  key: string,
  spec: WorkerJobSpec
): ClothWorkerManifestJob {
  return Object.freeze({
    key,
    label: spec.label,
    worker: Object.freeze({
      jobType: spec.label,
      queueClass: spec.queueClass,
      priority: spec.priority,
      dependencies: Object.freeze([...spec.dependencies]),
      schedulerMode: "dag",
    }),
    performance: Object.freeze({
      id: spec.label,
      jobType: spec.label,
      queueClass: spec.queueClass,
      domain: spec.domain,
      authority: spec.authority,
      importance: spec.importance,
      representationBand: spec.representationBand,
      qualityDimensions: spec.qualityDimensions,
      importanceSignals: spec.importanceSignals,
      levels: buildBudgetLevels(spec.label, spec.queueClass, spec.levels),
    }),
    debug: Object.freeze({
      owner: "cloth",
      queueClass: spec.queueClass,
      jobType: spec.label,
      tags: Object.freeze([
        "cloth",
        profile,
        key,
        spec.authority,
        spec.domain,
        ...(spec.representationBand ? [spec.representationBand] : []),
      ]),
      suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    }),
  });
}

const interactiveWorkerProfileSpec: WorkerProfileSpec = Object.freeze({
  description:
    "Interactive cloth profile that preserves stable attachment and silhouette continuity while scaling distant garment cost before near-field fidelity.",
  suggestedAllocationIds: Object.freeze([
    "cloth.snapshot",
    "cloth.solve",
    "cloth.near",
  ]),
  jobs: Object.freeze({
    "snapshot-ingest": Object.freeze({
      label: "cloth.snapshot-ingest",
      queueClass: "simulation",
      priority: 500,
      dependencies: Object.freeze([]),
      domain: "cloth",
      authority: "authoritative",
      importance: "critical",
      suggestedAllocationIds: Object.freeze(["cloth.snapshot"]),
      levels: {
        low: { estimatedCostMs: 0.2, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 32, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 64 },
        medium: { estimatedCostMs: 0.3, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 48, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 96 },
        high: { estimatedCostMs: 0.4, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 64, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 128 },
      },
    }),
    "wind-field-advance": Object.freeze({
      label: "cloth.wind-field-advance",
      queueClass: "simulation",
      priority: 470,
      dependencies: Object.freeze([]),
      domain: "cloth",
      authority: "non-authoritative-simulation",
      importance: "high",
      suggestedAllocationIds: Object.freeze(["cloth.wind"]),
      levels: {
        low: { estimatedCostMs: 0.25, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 24, cadenceDivisor: 2, workgroupScale: 0.6, maxQueueDepth: 64 },
        medium: { estimatedCostMs: 0.45, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 32, cadenceDivisor: 1, workgroupScale: 0.8, maxQueueDepth: 96 },
        high: { estimatedCostMs: 0.7, maxDispatchesPerFrame: 2, maxJobsPerDispatch: 48, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 128 },
      },
    }),
    "pin-constraint-update": Object.freeze({
      label: "cloth.pin-constraint-update",
      queueClass: "simulation",
      priority: 450,
      dependencies: Object.freeze(["snapshot-ingest"]),
      domain: "cloth",
      authority: "authoritative",
      importance: "critical",
      suggestedAllocationIds: Object.freeze(["cloth.pins"]),
      levels: {
        low: { estimatedCostMs: 0.35, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 24, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 64 },
        medium: { estimatedCostMs: 0.55, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 32, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 96 },
        high: { estimatedCostMs: 0.8, maxDispatchesPerFrame: 2, maxJobsPerDispatch: 48, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 128 },
      },
    }),
    "cloth-solve": Object.freeze({
      label: "cloth.solve",
      queueClass: "simulation",
      priority: 430,
      dependencies: Object.freeze(["pin-constraint-update", "wind-field-advance"]),
      domain: "cloth",
      authority: "non-authoritative-simulation",
      importance: "high",
      suggestedAllocationIds: Object.freeze(["cloth.solve"]),
      levels: {
        low: { estimatedCostMs: 0.8, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 16, cadenceDivisor: 2, workgroupScale: 0.6, maxQueueDepth: 64 },
        medium: { estimatedCostMs: 1.3, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 24, cadenceDivisor: 1, workgroupScale: 0.8, maxQueueDepth: 96 },
        high: { estimatedCostMs: 1.9, maxDispatchesPerFrame: 2, maxJobsPerDispatch: 32, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 128 },
      },
    }),
    "near-cloth": Object.freeze({
      label: "cloth.near-cloth",
      queueClass: "render",
      priority: 420,
      dependencies: Object.freeze(["cloth-solve"]),
      domain: "geometry",
      authority: "visual",
      importance: "critical",
      representationBand: "near",
      qualityDimensions: Object.freeze({
        geometry: 1,
        deformation: 1,
        shading: 1,
        rayTracing: 0.85,
        updateCadence: 1,
        temporalReuse: 0.2,
      }),
      importanceSignals: Object.freeze({
        visible: true,
        playerRelevant: true,
        imageCritical: true,
        motionClass: "dynamic",
        shadowSignificance: "high",
      }),
      suggestedAllocationIds: Object.freeze(["cloth.near"]),
      levels: {
        low: { estimatedCostMs: 0.9, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 12, cadenceDivisor: 2, workgroupScale: 0.6, maxQueueDepth: 48 },
        medium: { estimatedCostMs: 1.5, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 16, cadenceDivisor: 1, workgroupScale: 0.8, maxQueueDepth: 64 },
        high: { estimatedCostMs: 2.2, maxDispatchesPerFrame: 2, maxJobsPerDispatch: 24, cadenceDivisor: 1, workgroupScale: 1, maxQueueDepth: 96 },
      },
    }),
    "mid-cloth": Object.freeze({
      label: "cloth.mid-cloth",
      queueClass: "render",
      priority: 320,
      dependencies: Object.freeze(["cloth-solve"]),
      domain: "geometry",
      authority: "visual",
      importance: "high",
      representationBand: "mid",
      qualityDimensions: Object.freeze({
        geometry: 0.68,
        deformation: 0.7,
        shading: 0.64,
        rayTracing: 0.45,
        updateCadence: 0.75,
        temporalReuse: 0.55,
      }),
      importanceSignals: Object.freeze({
        visible: true,
        playerRelevant: true,
        imageCritical: false,
        motionClass: "dynamic",
        shadowSignificance: "medium",
      }),
      suggestedAllocationIds: Object.freeze(["cloth.mid"]),
      levels: {
        low: { estimatedCostMs: 0.5, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 12, cadenceDivisor: 2, workgroupScale: 0.55, maxQueueDepth: 48 },
        medium: { estimatedCostMs: 0.9, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 16, cadenceDivisor: 1, workgroupScale: 0.72, maxQueueDepth: 64 },
        high: { estimatedCostMs: 1.3, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 20, cadenceDivisor: 1, workgroupScale: 0.9, maxQueueDepth: 96 },
      },
    }),
    "far-proxy": Object.freeze({
      label: "cloth.far-proxy",
      queueClass: "render",
      priority: 200,
      dependencies: Object.freeze(["wind-field-advance"]),
      domain: "geometry",
      authority: "visual",
      importance: "medium",
      representationBand: "far",
      qualityDimensions: Object.freeze({
        geometry: 0.28,
        deformation: 0.3,
        shading: 0.25,
        rayTracing: 0.1,
        updateCadence: 0.3,
        temporalReuse: 0.9,
      }),
      importanceSignals: Object.freeze({
        visible: true,
        playerRelevant: false,
        imageCritical: false,
        motionClass: "stable",
        shadowSignificance: "low",
      }),
      suggestedAllocationIds: Object.freeze(["cloth.far"]),
      levels: {
        low: { estimatedCostMs: 0.15, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 8, cadenceDivisor: 6, workgroupScale: 0.4, maxQueueDepth: 32 },
        medium: { estimatedCostMs: 0.25, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 8, cadenceDivisor: 4, workgroupScale: 0.55, maxQueueDepth: 32 },
        high: { estimatedCostMs: 0.4, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 12, cadenceDivisor: 3, workgroupScale: 0.7, maxQueueDepth: 48 },
      },
    }),
    "horizon-impression": Object.freeze({
      label: "cloth.horizon-impression",
      queueClass: "render",
      priority: 100,
      dependencies: Object.freeze(["wind-field-advance"]),
      domain: "geometry",
      authority: "visual",
      importance: "low",
      representationBand: "horizon",
      qualityDimensions: Object.freeze({
        geometry: 0.1,
        deformation: 0.12,
        shading: 0.08,
        rayTracing: 0,
        updateCadence: 0.1,
        temporalReuse: 1,
      }),
      importanceSignals: Object.freeze({
        visible: true,
        playerRelevant: false,
        imageCritical: false,
        motionClass: "stable",
        shadowSignificance: "low",
      }),
      suggestedAllocationIds: Object.freeze(["cloth.horizon"]),
      levels: {
        low: { estimatedCostMs: 0.08, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 4, cadenceDivisor: 10, workgroupScale: 0.25, maxQueueDepth: 16 },
        medium: { estimatedCostMs: 0.12, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 6, cadenceDivisor: 8, workgroupScale: 0.35, maxQueueDepth: 24 },
        high: { estimatedCostMs: 0.2, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 8, cadenceDivisor: 6, workgroupScale: 0.45, maxQueueDepth: 32 },
      },
    }),
    "wrinkle-history": Object.freeze({
      label: "cloth.wrinkle-history",
      queueClass: "render",
      priority: 300,
      dependencies: Object.freeze(["near-cloth", "mid-cloth"]),
      domain: "custom",
      authority: "visual",
      importance: "high",
      representationBand: "mid",
      qualityDimensions: Object.freeze({
        deformation: 0.5,
        shading: 0.4,
        updateCadence: 0.5,
        temporalReuse: 0.85,
      }),
      importanceSignals: Object.freeze({
        visible: true,
        playerRelevant: true,
        imageCritical: false,
        motionClass: "dynamic",
        shadowSignificance: "low",
      }),
      suggestedAllocationIds: Object.freeze(["cloth.wrinkles"]),
      levels: {
        low: { estimatedCostMs: 0.18, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 8, cadenceDivisor: 3, workgroupScale: 0.45, maxQueueDepth: 32 },
        medium: { estimatedCostMs: 0.3, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 12, cadenceDivisor: 2, workgroupScale: 0.65, maxQueueDepth: 48 },
        high: { estimatedCostMs: 0.45, maxDispatchesPerFrame: 1, maxJobsPerDispatch: 16, cadenceDivisor: 1, workgroupScale: 0.8, maxQueueDepth: 64 },
      },
    }),
  }),
});

const cinematicWorkerProfileSpec: WorkerProfileSpec = Object.freeze({
  description:
    "Cinematic cloth profile that spends more budget on near and mid-field garment deformation before degrading distant cloth work.",
  suggestedAllocationIds: Object.freeze([
    "cloth.snapshot",
    "cloth.solve",
    "cloth.mid",
  ]),
  jobs: Object.freeze(
    Object.fromEntries(
      Object.entries(interactiveWorkerProfileSpec.jobs).map(([key, spec]) => [
        key,
        Object.freeze({
          ...spec,
          priority:
            key === "near-cloth" || key === "mid-cloth"
              ? spec.priority + 30
              : spec.priority,
          levels: {
            low: { ...spec.levels.low, estimatedCostMs: Number((spec.levels.low.estimatedCostMs * 1.1).toFixed(2)) },
            medium: { ...spec.levels.medium, estimatedCostMs: Number((spec.levels.medium.estimatedCostMs * 1.15).toFixed(2)) },
            high: { ...spec.levels.high, estimatedCostMs: Number((spec.levels.high.estimatedCostMs * 1.2).toFixed(2)) },
          },
        }),
      ])
    ) as Record<string, WorkerJobSpec>
  ),
});

const clothWorkerProfileSpecs: Readonly<Record<ClothProfileName, WorkerProfileSpec>> =
  Object.freeze({
    interactive: interactiveWorkerProfileSpec,
    cinematic: cinematicWorkerProfileSpec,
  });

const interactiveSimulationStages: readonly ClothSimulationPlanStage[] = Object.freeze([
  createSimulationStage({ id: "snapshot-ingest", label: simulationStageLabels["snapshot-ingest"], queueClass: "simulation", root: true, dependencies: [], output: "physics-snapshot", snapshotStable: true }),
  createSimulationStage({ id: "wind-field-advance", label: simulationStageLabels["wind-field-advance"], queueClass: "simulation", root: true, dependencies: [], output: "wind-field", snapshotStable: false }),
  createSimulationStage({ id: "pin-constraint-update", label: simulationStageLabels["pin-constraint-update"], queueClass: "simulation", root: false, dependencies: ["snapshot-ingest"], output: "pin-constraints", snapshotStable: true }),
  createSimulationStage({ id: "cloth-solve", label: simulationStageLabels["cloth-solve"], queueClass: "simulation", root: false, dependencies: ["pin-constraint-update", "wind-field-advance"], output: "cloth-state", snapshotStable: true }),
  createSimulationStage({ id: "near-cloth", label: simulationStageLabels["near-cloth"], queueClass: "render", root: false, dependencies: ["cloth-solve"], output: "near-cloth-representation", snapshotStable: true }),
  createSimulationStage({ id: "mid-cloth", label: simulationStageLabels["mid-cloth"], queueClass: "render", root: false, dependencies: ["cloth-solve"], output: "mid-cloth-representation", snapshotStable: true }),
  createSimulationStage({ id: "far-proxy", label: simulationStageLabels["far-proxy"], queueClass: "render", root: false, dependencies: ["wind-field-advance"], output: "far-proxy-representation", snapshotStable: true }),
  createSimulationStage({ id: "horizon-impression", label: simulationStageLabels["horizon-impression"], queueClass: "render", root: false, dependencies: ["wind-field-advance"], output: "horizon-cloth-impression", snapshotStable: true }),
  createSimulationStage({ id: "wrinkle-history", label: simulationStageLabels["wrinkle-history"], queueClass: "render", root: false, dependencies: ["near-cloth", "mid-cloth"], output: "wrinkle-history-state", snapshotStable: true }),
  createSimulationStage({ id: "render-snapshot", label: simulationStageLabels["render-snapshot"], queueClass: "render", root: false, dependencies: ["near-cloth", "mid-cloth", "far-proxy", "horizon-impression", "wrinkle-history"], output: "cloth-render-snapshot", snapshotStable: true }),
]);

const cinematicSimulationStages: readonly ClothSimulationPlanStage[] = Object.freeze(
  interactiveSimulationStages.map((stage) =>
    stage.id === "far-proxy" || stage.id === "horizon-impression"
      ? createSimulationStage({
          ...stage,
          output:
            stage.id === "far-proxy"
              ? "far-proxy-representation-cinematic"
              : "horizon-cloth-impression-cinematic",
        })
      : stage
  )
);

const clothSimulationPlanSpecs: Readonly<
  Record<ClothProfileName, readonly ClothSimulationPlanStage[]>
> = Object.freeze({
  interactive: interactiveSimulationStages,
  cinematic: cinematicSimulationStages,
});

/**
 * Returns the normalized worker manifest for the selected cloth profile.
 */
export function getClothWorkerManifest(
  profile: ClothProfileName = defaultClothProfile
): ClothWorkerManifest {
  const profileName = normalizeClothProfile(profile);
  const spec = clothWorkerProfileSpecs[profileName];

  return Object.freeze({
    schemaVersion: 1,
    owner: "cloth",
    profile: profileName,
    schedulerMode: "dag",
    description: spec.description,
    suggestedAllocationIds: spec.suggestedAllocationIds,
    jobs: Object.freeze(
      Object.entries(spec.jobs).map(([key, jobSpec]) =>
        buildManifestJob(profileName, key, jobSpec)
      )
    ),
  });
}

/**
 * Creates the high-level cloth simulation and scene-preparation plan for the
 * selected profile.
 */
export function createClothSimulationPlan(
  profile: ClothProfileName = defaultClothProfile
): ClothSimulationPlan {
  const profileName = normalizeClothProfile(profile);
  const stages = clothSimulationPlanSpecs[profileName];

  return Object.freeze({
    schemaVersion: 1,
    owner: "cloth",
    profile: profileName,
    description: clothWorkerProfileSpecs[profileName].description,
    snapshotSource: Object.freeze({
      packageName: "@plasius/gpu-physics",
      contract: "physics.worldSnapshot",
      stage: "snapshot-ingest",
      required: true,
    }),
    continuityContract: Object.freeze({
      strategy: "shared-motion-field",
      requiresSharedMotionField: true,
      bands: clothRepresentationBands,
    }),
    stages,
  });
}
