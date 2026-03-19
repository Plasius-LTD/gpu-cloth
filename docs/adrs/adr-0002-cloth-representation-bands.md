# ADR-0002: Cloth Representation Bands

## Status

Accepted

## Context

Cloth is sensitive to visible popping because silhouette, attachment, and broad
motion remain legible even when the viewer is not close. A flat
single-representation approach either overspends on distant garments or
produces obvious quality cliffs.

## Decision

Use explicit `near`, `mid`, `far`, and `horizon` representation bands:

- `near`: full live cloth simulation and highest fidelity
- `mid`: reduced live cloth simulation with shared broad motion
- `far`: pose or sway proxy retaining silhouette and attachment identity
- `horizon`: silhouette impression or distant cloth representation

Band selection is distance-based, but each band is planned together so the
system can preserve continuity between them.

## Consequences

- The package can scale cloth quality without pretending every meter needs the
  same simulation answer.
- Cloth planning aligns with the existing range-banded GPU architecture.
- Consumer packages can reason about cloth like any other banded visual system.
