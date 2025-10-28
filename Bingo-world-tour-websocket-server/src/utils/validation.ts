// Utility functions for validation

export function isValidSessionCode(code: string): boolean {
  // Example: 6-character alphanumeric
  return /^[A-Z0-9]{6}$/.test(code);
}

export function sanitizeUserId(id?: string): string | undefined {
  return id && typeof id === "string" ? id : undefined;
}