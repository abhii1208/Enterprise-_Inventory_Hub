export function normalizeSku(value: string) {
  return value.trim().toLowerCase();
}

export function cleanText(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

export function toOptionalText(value: unknown) {
  const text = cleanText(value);
  return text.length ? text : null;
}

