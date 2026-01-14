import type { JsonObject, JsonValue } from './types/json';

export function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) return true;

  if (Array.isArray(value)) return value.every(isJsonValue);

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).every(
      (key) => isJsonValue((value as Record<string, unknown>)[key])
    );
  }

  return false;
}

export function isJsonObject(value: unknown): value is JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.keys(value as Record<string, unknown>).every(
    (key) => isJsonValue((value as Record<string, unknown>)[key])
  );
}
