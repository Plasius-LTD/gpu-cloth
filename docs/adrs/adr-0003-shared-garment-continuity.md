# ADR-0003: Shared Garment Continuity

## Status

Accepted

## Context

The user requirement is consistent with the fluid requirement: visual behavior
must not vanish just because the viewer moves between ranges. For cloth, that
means garments must retain silhouette, attachment identity, and broad motion
even when fine wrinkle detail is reduced.

## Decision

All representation bands must derive from a shared continuity envelope:

- a shared continuity group id
- a shared garment motion field id
- per-band silhouette, broad-motion, and wrinkle floors
- blend windows for range transitions
- retained anchor and directional motion continuity across all bands

The visual answer is allowed to lose fidelity with distance, but it must retain
shared garment identity.

## Consequences

- Range transitions are treated as part of the architecture, not as incidental
  LOD implementation detail.
- The package provides a clear contract for avoiding cloth popping or
  disappearance.
- Future solver or renderer work can plug into a stable continuity model.
