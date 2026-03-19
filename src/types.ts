/**
 * Supported cloth planning profiles.
 */
export const clothProfileNames = ["interactive", "cinematic"] as const;

/**
 * Cloth planning profile identifier.
 */
export type ClothProfileName = (typeof clothProfileNames)[number];

/**
 * Cloth asset categories currently modeled by the package.
 */
export const clothGarmentKinds = [
  "cape",
  "skirt",
  "flag",
  "curtain",
  "custom",
] as const;

/**
 * Cloth garment kind.
 */
export type ClothGarmentKind = (typeof clothGarmentKinds)[number];

/**
 * Distance-banded representation tiers.
 */
export const clothRepresentationBands = [
  "near",
  "mid",
  "far",
  "horizon",
] as const;

/**
 * Supported distance band name.
 */
export type ClothRepresentationBand = (typeof clothRepresentationBands)[number];

/**
 * Supported render outputs for each cloth band.
 */
export const clothRepresentationOutputs = [
  "fullSimulation",
  "reducedSimulation",
  "poseProxy",
  "silhouetteImpression",
] as const;

/**
 * Render output type for a banded cloth representation.
 */
export type ClothRepresentationOutput =
  (typeof clothRepresentationOutputs)[number];

/**
 * Cloth continuity strategies across range transitions.
 */
export const clothContinuityStrategies = [
  "shared-solver-state",
  "shared-motion-field",
  "phase-locked-proxy",
] as const;

/**
 * Continuity strategy identifier.
 */
export type ClothContinuityStrategy =
  (typeof clothContinuityStrategies)[number];

/**
 * Coarse RT participation level for a representation.
 */
export const clothRtParticipationModes = [
  "full",
  "selective",
  "proxy",
  "disabled",
] as const;

/**
 * RT participation mode.
 */
export type ClothRtParticipation = (typeof clothRtParticipationModes)[number];

/**
 * Shadow-source mode for a cloth representation.
 */
export const clothShadowModes = [
  "ray-traced-primary",
  "selective-raster",
  "proxy-caster",
  "baked-impression",
] as const;

/**
 * Shadow mode identifier.
 */
export type ClothShadowMode = (typeof clothShadowModes)[number];

/**
 * Worker queues used by cloth preparation.
 */
export const clothWorkerQueueClasses = ["simulation", "render"] as const;

/**
 * Worker queue class.
 */
export type ClothWorkerQueueClass =
  (typeof clothWorkerQueueClasses)[number];

/**
 * Safety classification for cloth jobs.
 */
export const clothWorkerAuthorities = [
  "visual",
  "non-authoritative-simulation",
  "authoritative",
] as const;

/**
 * Worker authority classification.
 */
export type ClothWorkerAuthority =
  (typeof clothWorkerAuthorities)[number];

/**
 * Importance ranking for cloth jobs.
 */
export const clothWorkerImportances = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

/**
 * Worker importance classification.
 */
export type ClothWorkerImportance =
  (typeof clothWorkerImportances)[number];

/**
 * Domains aligned with `@plasius/gpu-performance`.
 */
export const clothPerformanceDomains = [
  "cloth",
  "geometry",
  "custom",
] as const;

/**
 * Performance domain used by cloth jobs.
 */
export type ClothPerformanceDomain =
  (typeof clothPerformanceDomains)[number];

/**
 * Motion classes aligned with `@plasius/gpu-performance`.
 */
export const clothMotionClasses = ["stable", "dynamic", "volatile"] as const;

/**
 * Motion class.
 */
export type ClothMotionClass = (typeof clothMotionClasses)[number];

/**
 * Quality emphasis weights aligned with `@plasius/gpu-performance`.
 */
export interface ClothPerformanceQualityDimensions {
  geometry?: number;
  deformation?: number;
  shading?: number;
  rayTracing?: number;
  updateCadence?: number;
  temporalReuse?: number;
}

/**
 * Additional signals aligned with `@plasius/gpu-performance`.
 */
export interface ClothPerformanceImportanceSignals {
  visible?: boolean;
  playerRelevant?: boolean;
  imageCritical?: boolean;
  motionClass?: ClothMotionClass;
  shadowSignificance?: ClothWorkerImportance;
}

/**
 * User-supplied band continuity overrides.
 */
export interface ClothContinuityBandInput {
  blendWindowMeters?: number;
  silhouetteFloor?: number;
  broadMotionFloor?: number;
  wrinkleFloor?: number;
  retainPinnedAnchors?: boolean;
  retainWindPhase?: boolean;
}

/**
 * User-supplied continuity envelope input.
 */
export interface ClothContinuityEnvelopeInput {
  garmentId: string;
  continuityGroupId?: string;
  motionFieldId?: string;
  strategy?: ClothContinuityStrategy;
  bands?: Partial<Record<ClothRepresentationBand, ClothContinuityBandInput>>;
}

/**
 * Normalized continuity settings for one band.
 */
export interface ClothContinuityBandSettings {
  inheritsFromBand?: ClothRepresentationBand;
  blendWindowMeters: number;
  silhouetteFloor: number;
  broadMotionFloor: number;
  wrinkleFloor: number;
  retainPinnedAnchors: boolean;
  retainWindPhase: boolean;
}

/**
 * Shared continuity contract across all bands.
 */
export interface ClothContinuityEnvelope {
  schemaVersion: 1;
  owner: "cloth";
  garmentId: string;
  continuityGroupId: string;
  motionFieldId: string;
  strategy: ClothContinuityStrategy;
  bands: Readonly<Record<ClothRepresentationBand, ClothContinuityBandSettings>>;
}

/**
 * Range thresholds used to select a cloth band.
 */
export interface ClothRangeThresholds {
  nearMaxMeters: number;
  midMaxMeters: number;
  farMaxMeters: number;
}

/**
 * Mesh and solver hints for a representation band.
 */
export interface ClothMeshResolution {
  simulationVertices: number;
  collisionSamples: number;
  solverIterations: number;
  wrinkleLayers: number;
}

/**
 * Shading hints for a representation band.
 */
export interface ClothShadingPlan {
  mode: "full" | "balanced" | "proxy" | "horizon";
  selfShadowing: boolean;
  reflectionMode: "full" | "selective" | "proxy" | "disabled";
}

/**
 * Per-band scheduling and performance hints.
 */
export interface ClothRepresentationPerformanceHints {
  owner: "cloth";
  queueClass: "render";
  priorityHint: number;
  importance: ClothWorkerImportance;
  representationBand: ClothRepresentationBand;
  qualityDimensions: Readonly<ClothPerformanceQualityDimensions>;
  importanceSignals: Readonly<ClothPerformanceImportanceSignals>;
}

/**
 * Normalized representation descriptor for a single band.
 */
export interface ClothRepresentationDescriptor {
  id: string;
  garmentId: string;
  kind: ClothGarmentKind;
  profile: ClothProfileName;
  band: ClothRepresentationBand;
  output: ClothRepresentationOutput;
  mesh: Readonly<ClothMeshResolution>;
  updateCadenceDivisor: number;
  rtParticipation: ClothRtParticipation;
  shadowMode: ClothShadowMode;
  shading: Readonly<ClothShadingPlan>;
  continuity: Readonly<ClothContinuityBandSettings> & {
    continuityGroupId: string;
    motionFieldId: string;
    strategy: ClothContinuityStrategy;
  };
  performance: Readonly<ClothRepresentationPerformanceHints>;
}

/**
 * Options for creating a representation plan.
 */
export interface ClothRepresentationPlanOptions {
  garmentId: string;
  kind?: ClothGarmentKind;
  profile?: ClothProfileName;
  supportsRayTracing?: boolean;
  nearFieldMaxMeters?: number;
  midFieldMaxMeters?: number;
  farFieldMaxMeters?: number;
  continuity?: Partial<Omit<ClothContinuityEnvelopeInput, "garmentId">>;
}

/**
 * Full cloth representation plan.
 */
export interface ClothRepresentationPlan {
  schemaVersion: 1;
  owner: "cloth";
  garmentId: string;
  kind: ClothGarmentKind;
  profile: ClothProfileName;
  supportsRayTracing: boolean;
  thresholds: Readonly<ClothRangeThresholds>;
  continuity: Readonly<ClothContinuityEnvelope>;
  bands: readonly ClothRepresentationBand[];
  representations: readonly ClothRepresentationDescriptor[];
}

/**
 * One quality level in a worker budget ladder.
 */
export interface ClothWorkerBudgetLevel {
  id: string;
  estimatedCostMs: number;
  config: Readonly<{
    maxDispatchesPerFrame: number;
    maxJobsPerDispatch: number;
    cadenceDivisor: number;
    workgroupScale: number;
    maxQueueDepth: number;
    metadata: Readonly<{
      owner: "cloth";
      queueClass: ClothWorkerQueueClass;
      jobType: string;
      quality: "low" | "medium" | "high";
    }>;
  }>;
}

/**
 * Single worker job emitted by the cloth package.
 */
export interface ClothWorkerManifestJob {
  key: string;
  label: string;
  worker: Readonly<{
    jobType: string;
    queueClass: ClothWorkerQueueClass;
    priority: number;
    dependencies: readonly string[];
    schedulerMode: "dag";
  }>;
  performance: Readonly<{
    id: string;
    jobType: string;
    queueClass: ClothWorkerQueueClass;
    domain: ClothPerformanceDomain;
    authority: ClothWorkerAuthority;
    importance: ClothWorkerImportance;
    representationBand?: ClothRepresentationBand;
    qualityDimensions?: Readonly<ClothPerformanceQualityDimensions>;
    importanceSignals?: Readonly<ClothPerformanceImportanceSignals>;
    levels: readonly ClothWorkerBudgetLevel[];
  }>;
  debug: Readonly<{
    owner: "cloth";
    queueClass: ClothWorkerQueueClass;
    jobType: string;
    tags: readonly string[];
    suggestedAllocationIds: readonly string[];
  }>;
}

/**
 * Worker manifest compatible with `@plasius/gpu-worker` and
 * `@plasius/gpu-performance`.
 */
export interface ClothWorkerManifest {
  schemaVersion: 1;
  owner: "cloth";
  profile: ClothProfileName;
  schedulerMode: "dag";
  description: string;
  suggestedAllocationIds: readonly string[];
  jobs: readonly ClothWorkerManifestJob[];
}

/**
 * Ordered cloth simulation stages.
 */
export const clothSimulationStageOrder = [
  "snapshot-ingest",
  "wind-field-advance",
  "pin-constraint-update",
  "cloth-solve",
  "near-cloth",
  "mid-cloth",
  "far-proxy",
  "horizon-impression",
  "wrinkle-history",
  "render-snapshot",
] as const;

/**
 * Cloth simulation stage identifier.
 */
export type ClothSimulationStageId =
  (typeof clothSimulationStageOrder)[number];

/**
 * One stage in the cloth simulation/scene-prep plan.
 */
export interface ClothSimulationPlanStage {
  id: ClothSimulationStageId;
  label: string;
  queueClass: ClothWorkerQueueClass;
  root: boolean;
  dependencies: readonly ClothSimulationStageId[];
  output: string;
  snapshotStable: boolean;
}

/**
 * High-level simulation plan for the cloth package.
 */
export interface ClothSimulationPlan {
  schemaVersion: 1;
  owner: "cloth";
  profile: ClothProfileName;
  description: string;
  snapshotSource: Readonly<{
    packageName: "@plasius/gpu-physics";
    contract: "physics.worldSnapshot";
    stage: "snapshot-ingest";
    required: true;
  }>;
  continuityContract: Readonly<{
    strategy: ClothContinuityStrategy;
    requiresSharedMotionField: true;
    bands: readonly ClothRepresentationBand[];
  }>;
  stages: readonly ClothSimulationPlanStage[];
}
