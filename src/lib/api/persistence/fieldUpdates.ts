/**
 * Wrapper pattern utilities for handling optional field updates.
 * Solves the ambiguity between "don't change" vs "clear field" in update requests.
 */

// Wrapper for optional fields that can be explicitly cleared
export interface FieldUpdate<T> {
  value: T;
  clear: boolean;
}

// Helper type to create update wrappers
export type OptionalFieldUpdate<T> = T | FieldUpdate<T> | undefined;

// Helper functions for working with field updates
export function clearField<T>(): FieldUpdate<T> {
  return { value: undefined as T, clear: true };
}

export function updateField<T>(value: T): FieldUpdate<T> {
  return { value, clear: false };
}

export function getFieldValue<T>(field: OptionalFieldUpdate<T>): T | undefined {
  if (field === undefined) {
    return undefined;
  }
  if (typeof field === 'object' && field !== null && 'clear' in field) {
    return field.clear ? undefined : field.value;
  }
  return field;
}

export function shouldUpdateField<T>(field: OptionalFieldUpdate<T>): boolean {
  if (field === undefined) {
    return false; // Don't update
  }
  if (typeof field === 'object' && field !== null && 'clear' in field) {
    return true; // Always update for explicit FieldUpdate
  }
  return true; // Update for direct values
}