/**
 * Wrapper pattern utilities for handling optional field updates.
 * Solves the ambiguity between "don't change" vs "clear field" in update requests.
 */

// Wrapper for optional fields that can be explicitly cleared
export interface FieldUpdate<T> {
  value: T;
  clear: boolean;
}


// Helper functions for working with field updates
export function clearField<T>(): FieldUpdate<T> {
  return { value: undefined as T, clear: true };
}

export function updateField<T>(value: T): FieldUpdate<T> {
  return { value, clear: false };
}

export function getFieldValue<T>(field: FieldUpdate<T> | undefined): T | undefined {
  if (field === undefined) {
    return undefined;
  }
  return field.clear ? undefined : field.value;
}

export function shouldUpdateField<T>(field: FieldUpdate<T> | undefined): boolean {
  return field !== undefined; // Update if FieldUpdate is provided
}

export function wrapFieldUpdate<T>(
  value: T | undefined,
  clearFields?: string[],
  fieldName?: string
): FieldUpdate<T> | undefined {
  if (clearFields?.includes(fieldName!)) {
    return clearField<T>();
  }
  if (value !== undefined) {
    return updateField(value);
  }
  return undefined;
}