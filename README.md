# @plasius/gpu-cloth

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-cloth.svg)](https://www.npmjs.com/package/@plasius/gpu-cloth)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-cloth/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-cloth/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-cloth)](https://codecov.io/gh/Plasius-LTD/gpu-cloth)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-cloth)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

Continuity-aware cloth simulation and rendering contracts for Plasius WebGPU
stacks.

Apache-2.0. ESM + CJS builds. TypeScript types included.

## Install

```bash
npm install @plasius/gpu-cloth
```

## What It Solves

- Defines near, mid, far, and horizon cloth representation bands.
- Preserves silhouette, broad motion, and pinned-anchor continuity so garments
  do not pop or collapse when range selection changes.
- Separates stable physics snapshot inputs from derived visual cloth state.
- Emits worker-manifest DAGs compatible with `@plasius/gpu-worker`.
- Emits performance metadata compatible with `@plasius/gpu-performance`.
- Keeps the first package slice focused on contracts, planning, and integration
  surfaces rather than pretending to ship a full solver on day one.

## Usage

```ts
import {
  createClothRepresentationPlan,
  createClothSimulationPlan,
  getClothWorkerManifest,
  selectClothRepresentationBand,
} from "@plasius/gpu-cloth";

const representationPlan = createClothRepresentationPlan({
  garmentId: "hero-cape",
  kind: "cape",
  profile: "interactive",
  supportsRayTracing: true,
  nearFieldMaxMeters: 18,
  midFieldMaxMeters: 55,
  farFieldMaxMeters: 180,
});

const activeBand = selectClothRepresentationBand(32, representationPlan.thresholds);
const activeRepresentation = representationPlan.representations.find(
  (entry) => entry.band === activeBand
);

console.log(activeBand, activeRepresentation?.continuity);

const simulationPlan = createClothSimulationPlan("interactive");
const workerManifest = getClothWorkerManifest("interactive");

console.log(simulationPlan.snapshotSource.stage, workerManifest.jobs.length);
```

## Continuity Model

Cloth bands share a continuity group and motion field identity. Each band
retains a non-zero silhouette floor and broad-motion floor from the same shared
source so the garment still reads as the same object when the view changes:

- `near`: full live simulation, highest mesh density, highest update rate
- `mid`: reduced live simulation, lower wrinkle detail, same broad motion
- `far`: pose or sway proxy, same silhouette and pinned-anchor identity
- `horizon`: silhouette impression with retained directional motion

The continuity model is designed so the visual answer changes in fidelity, not
in whether the cloth still appears attached, moving, or present.

## Worker and Performance Integration

The package emits multi-root DAG manifests rather than flat FIFO job lists.

Typical roots:

- `snapshot-ingest`
- `wind-field-advance`

Typical downstream joins:

- `near-cloth` depends on both the stable physics snapshot and the current
  cloth solve state
- `wrinkle-history` depends on both `near-cloth` and `mid-cloth`

Each job carries:

- worker queue metadata for `@plasius/gpu-worker`
- performance levels and ray-tracing-first metadata for
  `@plasius/gpu-performance`
- debug metadata suitable for future `@plasius/gpu-debug` adoption

## Package Scope

`@plasius/gpu-cloth` currently provides:

- cloth representation-band planning
- continuity envelope generation
- stable snapshot and scene-preparation planning
- worker-manifest and budget-contract generation

It does not yet provide:

- a production cloth solver
- actual GPU kernels
- renderer pass execution
- debug transport or analytics delivery

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```
