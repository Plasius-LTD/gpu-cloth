# ADR 0005: Cloth Material And Wavefront Scene-Source Contract

## Status

Accepted

## Context

`@plasius/gpu-cloth` already modeled continuity, representation bands, and
worker planning, but it did not publish a deterministic renderer-facing cloth
material contract.

That prevented cloth outputs from explicitly carrying sheen, roughness,
double-sided surface intent, normal-map or height-map hints, and stable
representation metadata into the wavefront renderer integration path.

This package work inherits the parent site rollout control
`gpu-demo.scene-fidelity.enabled`, which remains the remotely controlled source
of truth for live exposure and rollback in `plasius-ltd-site`.

## Decision

`@plasius/gpu-cloth` will publish:

- deterministic cloth material descriptors on every representation band;
- a wavefront scene-source adapter payload that carries cloth geometry plus the
  material, representation-band, RT-participation, and acceleration-update
  metadata needed by the renderer boundary.

## Consequences

- cloth packages can now describe fabric appearance as part of the contract,
  not only cloth motion;
- near, mid, far, and horizon representations keep stable cloth-material
  defaults as fidelity changes;
- renderer execution of those descriptors remains downstream work, but the
  contract is now stable and testable.
