import type {
  ClothContinuityBandInput,
  ClothContinuityBandSettings,
  ClothContinuityEnvelope,
  ClothContinuityEnvelopeInput,
  ClothRepresentationBand,
} from "./types.js";
import { clothRepresentationBands } from "./types.js";
import {
  assertFinitePositiveNumber,
  assertIdentifier,
  assertRatio,
  normalizeClothContinuityStrategy,
} from "./validation.js";

const clothBandInheritance: Readonly<
  Record<ClothRepresentationBand, ClothRepresentationBand | undefined>
> = Object.freeze({
  near: undefined,
  mid: "near",
  far: "mid",
  horizon: "far",
});

const defaultBandInputs: Readonly<
  Record<ClothRepresentationBand, Required<ClothContinuityBandInput>>
> = Object.freeze({
  near: Object.freeze({
    blendWindowMeters: 3,
    silhouetteFloor: 1,
    broadMotionFloor: 1,
    wrinkleFloor: 1,
    retainPinnedAnchors: true,
    retainWindPhase: true,
  }),
  mid: Object.freeze({
    blendWindowMeters: 8,
    silhouetteFloor: 0.82,
    broadMotionFloor: 0.78,
    wrinkleFloor: 0.5,
    retainPinnedAnchors: true,
    retainWindPhase: true,
  }),
  far: Object.freeze({
    blendWindowMeters: 20,
    silhouetteFloor: 0.58,
    broadMotionFloor: 0.48,
    wrinkleFloor: 0.2,
    retainPinnedAnchors: true,
    retainWindPhase: true,
  }),
  horizon: Object.freeze({
    blendWindowMeters: 40,
    silhouetteFloor: 0.28,
    broadMotionFloor: 0.24,
    wrinkleFloor: 0.05,
    retainPinnedAnchors: true,
    retainWindPhase: false,
  }),
});

function buildBandSettings(
  band: ClothRepresentationBand,
  input: ClothContinuityBandInput | undefined
): ClothContinuityBandSettings {
  const defaults = defaultBandInputs[band];

  return Object.freeze({
    inheritsFromBand: clothBandInheritance[band],
    blendWindowMeters:
      input?.blendWindowMeters === undefined
        ? defaults.blendWindowMeters
        : assertFinitePositiveNumber(
            `continuity.bands.${band}.blendWindowMeters`,
            input.blendWindowMeters
          ),
    silhouetteFloor:
      input?.silhouetteFloor === undefined
        ? defaults.silhouetteFloor
        : assertRatio(
            `continuity.bands.${band}.silhouetteFloor`,
            input.silhouetteFloor
          ),
    broadMotionFloor:
      input?.broadMotionFloor === undefined
        ? defaults.broadMotionFloor
        : assertRatio(
            `continuity.bands.${band}.broadMotionFloor`,
            input.broadMotionFloor
          ),
    wrinkleFloor:
      input?.wrinkleFloor === undefined
        ? defaults.wrinkleFloor
        : assertRatio(
            `continuity.bands.${band}.wrinkleFloor`,
            input.wrinkleFloor
          ),
    retainPinnedAnchors:
      input?.retainPinnedAnchors ?? defaults.retainPinnedAnchors,
    retainWindPhase: input?.retainWindPhase ?? defaults.retainWindPhase,
  });
}

/**
 * Creates the normalized continuity envelope shared across all cloth
 * representation bands.
 */
export function createClothContinuityEnvelope(
  input: ClothContinuityEnvelopeInput
): ClothContinuityEnvelope {
  const garmentId = assertIdentifier("garmentId", input.garmentId);
  const continuityGroupId = input.continuityGroupId
    ? assertIdentifier("continuityGroupId", input.continuityGroupId)
    : `${garmentId}.continuity`;
  const motionFieldId = input.motionFieldId
    ? assertIdentifier("motionFieldId", input.motionFieldId)
    : `${garmentId}.motion-field`;
  const strategy = input.strategy
    ? normalizeClothContinuityStrategy(input.strategy)
    : "shared-motion-field";

  const bands = Object.freeze(
    Object.fromEntries(
      clothRepresentationBands.map((band) => [
        band,
        buildBandSettings(band, input.bands?.[band]),
      ])
    ) as Record<ClothRepresentationBand, ClothContinuityBandSettings>
  );

  return Object.freeze({
    schemaVersion: 1,
    owner: "cloth",
    garmentId,
    continuityGroupId,
    motionFieldId,
    strategy,
    bands,
  });
}
