# TDR-0001: Cloth Representation Plan Contract

## Status

Accepted

## Problem

Consumers need a deterministic way to request cloth planning for a garment and
to inspect how that garment is represented across distance bands.

## Direction

Expose `createClothRepresentationPlan(...)` and
`selectClothRepresentationBand(...)` as the primary public contract.

The plan must include:

- garment id and kind
- selected profile
- near/mid/far/horizon thresholds
- a normalized continuity envelope
- one representation descriptor per band
- performance hints for each representation

## Validation

- Contract tests assert four band descriptors are always produced.
- Unit tests assert threshold ordering and band selection behavior.
- Contract tests assert shared continuity ids and retained silhouette and
  broad-motion floors across bands.
