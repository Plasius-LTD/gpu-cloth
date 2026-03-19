# TDR-0002: Cloth Worker Manifest Contract

## Status

Accepted

## Problem

Cloth preparation must schedule discrete work across worker jobs without
inventing a package-local queue model.

## Direction

Expose `getClothWorkerManifest(...)` and require it to emit a multi-root DAG
manifest with at least:

- snapshot ingest as a root
- wind-field advance as a root
- dependency joins for near and mid cloth work
- a final stable render snapshot stage

Each job must carry worker metadata, performance levels, and debug metadata.

## Validation

- Contract tests assert multiple roots exist.
- Contract tests assert join dependencies exist for downstream jobs.
- Contract tests assert near-field jobs carry higher priority and stronger
  performance metadata than distant proxy jobs.
