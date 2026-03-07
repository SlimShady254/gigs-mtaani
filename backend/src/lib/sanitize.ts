const htmlTagPattern = /<\/?[^>]+(>|$)/g;
const controlCharsPattern = /[\u0000-\u001F\u007F]/g;

export function sanitizeString(input: string, maxLength = 20000): string {
  return input
    .replace(controlCharsPattern, "")
    .replace(htmlTagPattern, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeUnknown<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item)) as T;
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeUnknown(entry);
    }
    return sanitized as T;
  }

  return value;
}
