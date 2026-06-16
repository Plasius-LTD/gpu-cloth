import type {
  ClothRepresentationBand,
  ClothRepresentationDescriptor,
  ClothRtParticipation,
  ClothWavefrontSceneSourceAdapterOutput,
  ClothWavefrontSceneSourceMeshInput,
} from "./types.js";

function freezeArray(values: readonly number[] | null | undefined) {
  return Array.isArray(values) ? Object.freeze([...values]) : null;
}

function normalizeBand(band: ClothRepresentationBand | undefined) {
  return band ?? "near";
}

function normalizeRtParticipation(
  representation: Pick<ClothRepresentationDescriptor, "rtParticipation">
): ClothRtParticipation {
  return representation.rtParticipation;
}

function normalizeDerivableUvs(input: {
  uvs?: readonly number[] | null;
  derivableUvs?: Partial<ClothWavefrontSceneSourceMeshInput["derivableUvs"]> | null;
}) {
  if (Array.isArray(input.uvs) && input.uvs.length > 0) {
    return Object.freeze({
      enabled: false,
      projection: "planar" as const,
      scale: Object.freeze([1, 1]),
    });
  }
  return Object.freeze({
    enabled: input.derivableUvs?.enabled ?? true,
    projection: input.derivableUvs?.projection ?? "world-xy",
    scale: Object.freeze([
      Number.isFinite(input.derivableUvs?.scale?.[0])
        ? Number(input.derivableUvs?.scale?.[0])
        : 1,
      Number.isFinite(input.derivableUvs?.scale?.[1])
        ? Number(input.derivableUvs?.scale?.[1])
        : 1,
    ]),
  });
}

export function createClothWavefrontSceneSourceAdapter(options: {
  garmentId: string;
  representation: ClothRepresentationDescriptor;
  mesh: {
    id?: string;
    positions: readonly number[];
    normals?: readonly number[] | null;
    tangents?: readonly number[] | null;
    uvs?: readonly number[] | null;
    derivableUvs?: Partial<ClothWavefrontSceneSourceMeshInput["derivableUvs"]> | null;
    indices: readonly number[];
  };
  representationBand?: ClothRepresentationBand;
  accelerationStructureUpdateClass?: ClothWavefrontSceneSourceMeshInput["accelerationStructureUpdateClass"];
}): ClothWavefrontSceneSourceAdapterOutput {
  const representationBand = normalizeBand(
    options.representationBand ?? options.representation.band
  );
  const mesh = Object.freeze({
    id: options.mesh.id ?? `${options.garmentId}.${representationBand}.surface`,
    garmentId: options.garmentId,
    representationBand,
    rtParticipation: normalizeRtParticipation(options.representation),
    accelerationStructureUpdateClass:
      options.accelerationStructureUpdateClass ??
      (representationBand === "far" || representationBand === "horizon"
        ? "proxy"
        : "deforming"),
    materialId: options.representation.material.id,
    positions: Object.freeze([...options.mesh.positions]),
    normals: freezeArray(options.mesh.normals),
    tangents: freezeArray(options.mesh.tangents),
    uvs: freezeArray(options.mesh.uvs),
    derivableUvs: normalizeDerivableUvs(options.mesh),
    indices: Object.freeze([...options.mesh.indices]),
  });

  return Object.freeze({
    schemaVersion: 1,
    owner: "cloth" as const,
    adapterId: `${options.garmentId}.${representationBand}.wavefront-scene-source`,
    garmentId: options.garmentId,
    material: options.representation.material,
    mesh,
  });
}
