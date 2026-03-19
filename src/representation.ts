import { createClothContinuityEnvelope } from "./continuity.js";
import type {
  ClothGarmentKind,
  ClothProfileName,
  ClothRangeThresholds,
  ClothRepresentationBand,
  ClothRepresentationDescriptor,
  ClothRepresentationPlan,
  ClothRepresentationPlanOptions,
} from "./types.js";
import { clothRepresentationBands } from "./types.js";
import {
  assertFiniteNonNegativeNumber,
  assertFinitePositiveNumber,
  assertIdentifier,
  normalizeClothGarmentKind,
  normalizeClothProfile,
} from "./validation.js";

type BandDescriptorSpec = Omit<
  ClothRepresentationDescriptor,
  | "id"
  | "garmentId"
  | "kind"
  | "profile"
  | "band"
  | "continuity"
>;

type ProfileRepresentationSpec = Record<ClothRepresentationBand, BandDescriptorSpec>;

const profileRepresentationSpecs: Readonly<
  Record<ClothProfileName, ProfileRepresentationSpec>
> = Object.freeze({
  interactive: Object.freeze({
    near: Object.freeze({
      output: "fullSimulation",
      mesh: Object.freeze({
        simulationVertices: 12000,
        collisionSamples: 96,
        solverIterations: 10,
        wrinkleLayers: 3,
      }),
      updateCadenceDivisor: 1,
      rtParticipation: "full",
      shadowMode: "ray-traced-primary",
      shading: Object.freeze({
        mode: "full",
        selfShadowing: true,
        reflectionMode: "selective",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 450,
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
      }),
    }),
    mid: Object.freeze({
      output: "reducedSimulation",
      mesh: Object.freeze({
        simulationVertices: 4200,
        collisionSamples: 40,
        solverIterations: 6,
        wrinkleLayers: 2,
      }),
      updateCadenceDivisor: 1,
      rtParticipation: "selective",
      shadowMode: "selective-raster",
      shading: Object.freeze({
        mode: "balanced",
        selfShadowing: true,
        reflectionMode: "proxy",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 320,
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
      }),
    }),
    far: Object.freeze({
      output: "poseProxy",
      mesh: Object.freeze({
        simulationVertices: 700,
        collisionSamples: 8,
        solverIterations: 2,
        wrinkleLayers: 1,
      }),
      updateCadenceDivisor: 3,
      rtParticipation: "proxy",
      shadowMode: "proxy-caster",
      shading: Object.freeze({
        mode: "proxy",
        selfShadowing: false,
        reflectionMode: "disabled",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 200,
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
      }),
    }),
    horizon: Object.freeze({
      output: "silhouetteImpression",
      mesh: Object.freeze({
        simulationVertices: 80,
        collisionSamples: 0,
        solverIterations: 0,
        wrinkleLayers: 0,
      }),
      updateCadenceDivisor: 8,
      rtParticipation: "disabled",
      shadowMode: "baked-impression",
      shading: Object.freeze({
        mode: "horizon",
        selfShadowing: false,
        reflectionMode: "disabled",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 100,
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
      }),
    }),
  }),
  cinematic: Object.freeze({
    near: Object.freeze({
      output: "fullSimulation",
      mesh: Object.freeze({
        simulationVertices: 18000,
        collisionSamples: 128,
        solverIterations: 14,
        wrinkleLayers: 4,
      }),
      updateCadenceDivisor: 1,
      rtParticipation: "full",
      shadowMode: "ray-traced-primary",
      shading: Object.freeze({
        mode: "full",
        selfShadowing: true,
        reflectionMode: "selective",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 490,
        importance: "critical",
        representationBand: "near",
        qualityDimensions: Object.freeze({
          geometry: 1,
          deformation: 1,
          shading: 1,
          rayTracing: 0.9,
          updateCadence: 1,
          temporalReuse: 0.1,
        }),
        importanceSignals: Object.freeze({
          visible: true,
          playerRelevant: true,
          imageCritical: true,
          motionClass: "dynamic",
          shadowSignificance: "critical",
        }),
      }),
    }),
    mid: Object.freeze({
      output: "reducedSimulation",
      mesh: Object.freeze({
        simulationVertices: 6800,
        collisionSamples: 56,
        solverIterations: 8,
        wrinkleLayers: 3,
      }),
      updateCadenceDivisor: 1,
      rtParticipation: "selective",
      shadowMode: "selective-raster",
      shading: Object.freeze({
        mode: "balanced",
        selfShadowing: true,
        reflectionMode: "proxy",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 350,
        importance: "high",
        representationBand: "mid",
        qualityDimensions: Object.freeze({
          geometry: 0.76,
          deformation: 0.8,
          shading: 0.7,
          rayTracing: 0.5,
          updateCadence: 0.82,
          temporalReuse: 0.5,
        }),
        importanceSignals: Object.freeze({
          visible: true,
          playerRelevant: true,
          imageCritical: true,
          motionClass: "dynamic",
          shadowSignificance: "high",
        }),
      }),
    }),
    far: Object.freeze({
      output: "poseProxy",
      mesh: Object.freeze({
        simulationVertices: 1200,
        collisionSamples: 12,
        solverIterations: 3,
        wrinkleLayers: 1,
      }),
      updateCadenceDivisor: 2,
      rtParticipation: "proxy",
      shadowMode: "proxy-caster",
      shading: Object.freeze({
        mode: "proxy",
        selfShadowing: false,
        reflectionMode: "disabled",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 220,
        importance: "medium",
        representationBand: "far",
        qualityDimensions: Object.freeze({
          geometry: 0.35,
          deformation: 0.38,
          shading: 0.3,
          rayTracing: 0.12,
          updateCadence: 0.35,
          temporalReuse: 0.88,
        }),
        importanceSignals: Object.freeze({
          visible: true,
          playerRelevant: false,
          imageCritical: false,
          motionClass: "stable",
          shadowSignificance: "low",
        }),
      }),
    }),
    horizon: Object.freeze({
      output: "silhouetteImpression",
      mesh: Object.freeze({
        simulationVertices: 120,
        collisionSamples: 0,
        solverIterations: 0,
        wrinkleLayers: 0,
      }),
      updateCadenceDivisor: 6,
      rtParticipation: "disabled",
      shadowMode: "baked-impression",
      shading: Object.freeze({
        mode: "horizon",
        selfShadowing: false,
        reflectionMode: "disabled",
      }),
      performance: Object.freeze({
        owner: "cloth",
        queueClass: "render",
        priorityHint: 110,
        importance: "low",
        representationBand: "horizon",
        qualityDimensions: Object.freeze({
          geometry: 0.12,
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
      }),
    }),
  }),
});

function normalizeThresholds(
  nearFieldMaxMeters: unknown,
  midFieldMaxMeters: unknown,
  farFieldMaxMeters: unknown
): ClothRangeThresholds {
  const nearMaxMeters = assertFinitePositiveNumber(
    "nearFieldMaxMeters",
    nearFieldMaxMeters
  );
  const midMaxMeters = assertFinitePositiveNumber(
    "midFieldMaxMeters",
    midFieldMaxMeters
  );
  const farMaxMeters = assertFinitePositiveNumber(
    "farFieldMaxMeters",
    farFieldMaxMeters
  );

  if (!(nearMaxMeters < midMaxMeters && midMaxMeters < farMaxMeters)) {
    throw new Error(
      "Cloth range thresholds must satisfy nearFieldMaxMeters < midFieldMaxMeters < farFieldMaxMeters."
    );
  }

  return Object.freeze({
    nearMaxMeters,
    midMaxMeters,
    farMaxMeters,
  });
}

function buildRepresentationDescriptor(
  garmentId: string,
  kind: ClothGarmentKind,
  profile: ClothProfileName,
  band: ClothRepresentationBand,
  supportsRayTracing: boolean,
  options: ClothRepresentationPlanOptions
): ClothRepresentationDescriptor {
  const continuityEnvelope = createClothContinuityEnvelope({
    garmentId,
    continuityGroupId: options.continuity?.continuityGroupId,
    motionFieldId: options.continuity?.motionFieldId,
    strategy: options.continuity?.strategy,
    bands: options.continuity?.bands,
  });
  const profileSpec = profileRepresentationSpecs[profile][band];
  const continuity = continuityEnvelope.bands[band];
  const rtParticipation =
    supportsRayTracing || profileSpec.rtParticipation === "disabled"
      ? profileSpec.rtParticipation
      : band === "near"
        ? "selective"
        : band === "mid"
          ? "proxy"
          : "disabled";

  return Object.freeze({
    id: `${garmentId}.${band}.${profileSpec.output}`,
    garmentId,
    kind,
    profile,
    band,
    output: profileSpec.output,
    mesh: profileSpec.mesh,
    updateCadenceDivisor: profileSpec.updateCadenceDivisor,
    rtParticipation,
    shadowMode:
      rtParticipation === "disabled" && band === "near"
        ? "selective-raster"
        : profileSpec.shadowMode,
    shading: profileSpec.shading,
    continuity: Object.freeze({
      continuityGroupId: continuityEnvelope.continuityGroupId,
      motionFieldId: continuityEnvelope.motionFieldId,
      strategy: continuityEnvelope.strategy,
      inheritsFromBand: continuity.inheritsFromBand,
      blendWindowMeters: continuity.blendWindowMeters,
      silhouetteFloor: continuity.silhouetteFloor,
      broadMotionFloor: continuity.broadMotionFloor,
      wrinkleFloor: continuity.wrinkleFloor,
      retainPinnedAnchors: continuity.retainPinnedAnchors,
      retainWindPhase: continuity.retainWindPhase,
    }),
    performance: profileSpec.performance,
  });
}

/**
 * Selects the active cloth representation band for a given distance.
 */
export function selectClothRepresentationBand(
  distanceMeters: number,
  thresholds: ClothRangeThresholds
): ClothRepresentationBand {
  const distance = assertFiniteNonNegativeNumber("distanceMeters", distanceMeters);

  if (distance <= thresholds.nearMaxMeters) {
    return "near";
  }
  if (distance <= thresholds.midMaxMeters) {
    return "mid";
  }
  if (distance <= thresholds.farMaxMeters) {
    return "far";
  }
  return "horizon";
}

/**
 * Creates a continuity-aware cloth representation plan spanning near, mid, far,
 * and horizon bands.
 */
export function createClothRepresentationPlan(
  options: ClothRepresentationPlanOptions
): ClothRepresentationPlan {
  const garmentId = assertIdentifier("garmentId", options.garmentId);
  const kind = options.kind
    ? normalizeClothGarmentKind(options.kind)
    : "cape";
  const profile = options.profile
    ? normalizeClothProfile(options.profile)
    : "interactive";
  const supportsRayTracing = options.supportsRayTracing ?? true;
  const thresholds = normalizeThresholds(
    options.nearFieldMaxMeters ?? 18,
    options.midFieldMaxMeters ?? 55,
    options.farFieldMaxMeters ?? 180
  );
  const continuity = createClothContinuityEnvelope({
    garmentId,
    continuityGroupId: options.continuity?.continuityGroupId,
    motionFieldId: options.continuity?.motionFieldId,
    strategy: options.continuity?.strategy,
    bands: options.continuity?.bands,
  });

  return Object.freeze({
    schemaVersion: 1,
    owner: "cloth",
    garmentId,
    kind,
    profile,
    supportsRayTracing,
    thresholds,
    continuity,
    bands: clothRepresentationBands,
    representations: Object.freeze(
      clothRepresentationBands.map((band) =>
        buildRepresentationDescriptor(garmentId, kind, profile, band, supportsRayTracing, options)
      )
    ),
  });
}
