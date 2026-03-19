import {
  clothContinuityStrategies,
  clothGarmentKinds,
  clothProfileNames,
  clothRepresentationBands,
} from "./types.js";

type EnumValues = readonly string[];

export function assertIdentifier(name: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }

  return value.trim();
}

export function assertFinitePositiveNumber(
  name: string,
  value: unknown
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero.`);
  }

  return value;
}

export function assertFiniteNonNegativeNumber(
  name: string,
  value: unknown
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite number greater than or equal to zero.`);
  }

  return value;
}

export function assertRatio(name: string, value: unknown): number {
  const parsed = assertFiniteNonNegativeNumber(name, value);
  if (parsed > 1) {
    throw new Error(`${name} must be less than or equal to 1.`);
  }
  return parsed;
}

export function assertEnumValue<T extends EnumValues>(
  name: string,
  value: unknown,
  allowed: T
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}.`);
  }

  return value as T[number];
}

export function normalizeClothProfile(value: unknown) {
  return assertEnumValue("profile", value, clothProfileNames);
}

export function normalizeClothGarmentKind(value: unknown) {
  return assertEnumValue("kind", value, clothGarmentKinds);
}

export function normalizeClothContinuityStrategy(value: unknown) {
  return assertEnumValue("continuity.strategy", value, clothContinuityStrategies);
}

export function normalizeClothRepresentationBand(value: unknown) {
  return assertEnumValue("band", value, clothRepresentationBands);
}
