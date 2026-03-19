# Continuity Strategy

## Problem

Cloth identity is legible at long range. If distant cloth loses silhouette,
anchor identity, or broad motion, range transitions look like popping rather
than graceful LOD.

## Strategy

Every plan uses one continuity envelope:

- `continuityGroupId` groups all band outputs
- `motionFieldId` keeps the garment motion source stable
- silhouette floors ensure distant bands still express garment shape
- broad-motion floors ensure large-scale sways persist
- wrinkle floors allow detail to reduce without making the cloth feel frozen
- blend windows define the handoff span between adjacent bands

## Practical Outcome

The package allows fidelity to fall with distance without making the garment
look like a different asset or vanish from the scene.

## Follow-On Work

Future runtime slices can map this contract onto:

- cloth solver state
- proxy pose fields
- wrinkle history buffers
- far-field garment caches
