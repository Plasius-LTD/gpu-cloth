# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to SemVer.

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.11] - 2026-07-01

- **Added**
  - (placeholder)

- **Changed**
  - Updated the runtime `@plasius/gpu-shared` dependency baseline to
    `^1.0.2`.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-06-29

- **Added**
  - (placeholder)

- **Changed**
  - Updated `@plasius/gpu-shared` to the latest stable `1.x` baseline and
    regenerated the package lockfile from a clean install.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.9] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-06-16

- **Added**
  - Added deterministic cloth material descriptors to cloth representation
    plans so renderer integrations can carry sheen, roughness, normal-detail,
    and double-sided surface intent per band.
  - Added `createClothWavefrontSceneSourceAdapter(...)` so cloth geometry can
    emit wavefront-compatible mesh, material, and representation-band metadata.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.4] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.3] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-04-02

- **Added**
  - Contract tests that lock the browser demo to the public
    `@plasius/gpu-shared` package surface.

- **Changed**
  - Updated the README to clarify that the cloth harbor demo consumes the
    shared runtime through the published package surface.

- **Fixed**
  - Removed the cloth demo's deep import of `@plasius/gpu-shared` internals in
    favor of an import-map-backed package import.

- **Security**
  - (placeholder)

## [0.1.1] - 2026-03-23

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-03-21

### Added

- A browser-based 3D harbor demo focused on cloth continuity.

### Changed

- `gpu-cloth/demo/` now delegates its 3D harbor scene to the shared
  `@plasius/gpu-shared` showcase runtime instead of carrying a package-local copy
  of the renderer and loader logic.
- `npm run demo` still serves the browser demo, while `npm run demo:example`
  keeps the original console example path.
- The harbor runtime now renders stronger near-field shadow projection and
  reflection accents so cloth continuity is shown under a more ray-traced
  lighting look.

## [0.1.0] - 2026-03-19

### Added

- Initial `@plasius/gpu-cloth` package scaffold.
- Cloth representation-band planning for near, mid, far, and horizon ranges.
- Continuity envelope contracts for shared silhouette and motion identity across
  range changes.
- Stable snapshot and worker-manifest planning compatible with
  `@plasius/gpu-worker` and `@plasius/gpu-performance`.
- ADRs, TDRs, design documentation, demo example, and contract/unit tests.

[0.1.0]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.0
[0.1.1]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.1
[0.1.2]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.2
[0.1.3]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.3
[0.1.4]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.4
[0.1.7]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.8
[0.1.9]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.10
[0.1.11]: https://github.com/Plasius-LTD/gpu-cloth/releases/tag/v0.1.11
