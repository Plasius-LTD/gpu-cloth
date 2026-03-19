import { mountGpuShowcase } from "../../gpu-demo-viewer/shared/showcase-runtime.js";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Cloth demo root element was not found.");
}

await mountGpuShowcase({
  root,
  focus: "cloth",
  packageName: "@plasius/gpu-cloth",
  title: "Cloth Continuity in 3D",
  subtitle:
    "Near-field cloth now renders in the same 3D harbor scene as the other GPU packages, with the flag surface showing band continuity instead of a flat mesh sketch.",
});
