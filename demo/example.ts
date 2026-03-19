import {
  createClothRepresentationPlan,
  createClothSimulationPlan,
  getClothWorkerManifest,
  selectClothRepresentationBand,
} from "../src/index.js";

const representationPlan = createClothRepresentationPlan({
  garmentId: "hero-cape",
  kind: "cape",
  profile: "interactive",
  supportsRayTracing: true,
  nearFieldMaxMeters: 18,
  midFieldMaxMeters: 55,
  farFieldMaxMeters: 180,
});

const simulationPlan = createClothSimulationPlan("interactive");
const workerManifest = getClothWorkerManifest("interactive");
const band = selectClothRepresentationBand(72, representationPlan.thresholds);

console.log(
  JSON.stringify(
    {
      plan: {
        garmentId: representationPlan.garmentId,
        bands: representationPlan.bands,
        selectedBand: band,
      },
      selectedRepresentation: representationPlan.representations.find(
        (entry) => entry.band === band
      ),
      simulationStages: simulationPlan.stages.map((stage) => stage.id),
      workerJobs: workerManifest.jobs.map((job) => ({
        id: job.performance.id,
        priority: job.worker.priority,
        dependencies: job.worker.dependencies,
      })),
    },
    null,
    2
  )
);
