import {
  createClothContinuityEnvelope,
  createClothRepresentationPlan,
  defaultClothProfile,
  selectClothRepresentationBand,
} from "../dist/index.js";
import { mountGpuShowcase as mountHarborShowcase } from "../node_modules/@plasius/gpu-shared/dist/index.js";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Cloth demo root element was not found.");
}

function createState() {
  return {
    profile: defaultClothProfile,
    distanceMeters: 14,
  };
}

function updateState(state, scene) {
  return {
    ...state,
    distanceMeters: 14 + ((Math.sin(scene.time * 0.24) + 1) * 0.5) * 120,
  };
}

function describeState(state) {
  const plan = createClothRepresentationPlan({
    garmentId: "shore-flag",
    kind: "flag",
    profile: state.profile,
    supportsRayTracing: true,
    nearFieldMaxMeters: 18,
    midFieldMaxMeters: 55,
    farFieldMaxMeters: 180,
  });
  const band = selectClothRepresentationBand(state.distanceMeters, plan.thresholds);
  const representation =
    plan.representations.find((entry) => entry.band === band) ?? plan.representations[0];
  const continuity = createClothContinuityEnvelope({ garmentId: "shore-flag" });
  const continuityBand = continuity.bands[band];

  return {
    status: `Cloth live · ${band} band · ${representation.output}`,
    details:
      `The flag stays phase-linked while the cloth contract moves between near, mid, far, and horizon representations without dropping the silhouette.`,
    sceneMetrics: [
      `distance: ${state.distanceMeters.toFixed(1)} m`,
      `band: ${band}`,
      `output: ${representation.output}`,
      `rt: ${representation.rtParticipation}`,
    ],
    qualityMetrics: [
      `blend window: ${continuityBand.blendWindowMeters} m`,
      `silhouette floor: ${continuityBand.silhouetteFloor.toFixed(2)}`,
      `motion floor: ${continuityBand.broadMotionFloor.toFixed(2)}`,
      `wrinkle floor: ${continuityBand.wrinkleFloor.toFixed(2)}`,
    ],
    debugMetrics: [
      `solver cadence: ${representation.updateCadenceDivisor}x`,
      `shadow mode: ${representation.shadowMode}`,
      `wrinkle retention: ${continuityBand.retainWindPhase ? "phase locked" : "impression only"}`,
      `reflection mode: ${representation.shading.reflectionMode}`,
    ],
    notes: [
      "This demo now runs on the shared @plasius/gpu-shared harbor runtime instead of carrying its own local scene implementation.",
      "The flag motion visibly softens as the active representation band moves farther from the camera.",
      "Silhouette continuity stays intact even when wrinkle detail is reduced.",
    ],
    textState: {
      profile: state.profile,
      distanceMeters: Number(state.distanceMeters.toFixed(2)),
      band,
      representation,
      continuityBand,
    },
    visuals: {
      waveAmplitude: band === "near" ? 0.72 : band === "mid" ? 0.62 : band === "far" ? 0.54 : 0.48,
      flagMotion: continuityBand.broadMotionFloor,
      flagColor: band === "near" ? { r: 0.82, g: 0.26, b: 0.18 } : { r: 0.7, g: 0.24, b: 0.18 },
      reflectionStrength: representation.shading.reflectionMode === "selective" ? 0.18 : 0.08,
      shadowAccent: representation.shadowMode === "ray-traced-primary" ? 0.1 : 0.04,
      skyTop: "#eef5f9",
      skyMid: "#c0d2de",
      skyBottom: "#819fb2",
      seaTop: "#235366",
      seaMid: "#123d52",
      seaBottom: "#082331",
    },
  };
}

await mountHarborShowcase({
  root,
  packageName: "@plasius/gpu-cloth",
  title: "Cloth Continuity in a 3D Harbor",
  subtitle:
    "Family-coordinated 3D validation for cloth representation bands, with the flag acting as the near-field hero asset next to colliding GLTF ships.",
  createState,
  updateState,
  describeState,
});
