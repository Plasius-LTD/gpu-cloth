# Cloth Rendering Architecture

## Overview

`@plasius/gpu-cloth` models cloth as a continuity-aware system that spans
simulation inputs, banded scene preparation, and future renderer consumption.

The initial package slice does not render frames directly. Instead, it defines
the contracts needed to do that safely later.

## Core Model

The package treats cloth in three linked layers:

1. Stable snapshot input from `gpu-physics`
2. Shared garment continuity model
3. Distance-banded representation outputs

This keeps authoritative motion separate from visual derivation while still
letting the renderer consume cloth state that feels continuous.

## Representation Bands

- `near`: full live cloth simulation and highest fidelity
- `mid`: reduced live cloth simulation with shared broad motion
- `far`: pose or sway proxy retaining silhouette
- `horizon`: low-cost silhouette impression

## Worker Scheduling

Cloth scene preparation is modeled as a multi-root DAG:

- `snapshot-ingest` and `wind-field-advance` can start independently
- `pin-constraint-update` depends on the stable physics snapshot
- `cloth-solve` joins the snapshot and wind paths
- band-specific cloth preparation fans out from `cloth-solve`
- `wrinkle-history` joins near and mid outputs
- `render-snapshot` joins all visual outputs into a stable answer

## Integration Points

- `gpu-physics`: stable snapshot source
- `gpu-worker`: worker DAG execution contract
- `gpu-performance`: worker budget and representation metadata
- `gpu-renderer`: future consumer of prepared cloth representations
- `gpu-debug`: future diagnostics for phase timing and band state
