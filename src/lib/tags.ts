export function normalizeTags(input: string[]): string[] {
  const unique = new Set<string>();
  for (const raw of input) {
    const normalized = raw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    if (normalized) {
      unique.add(normalized);
    }
  }
  return Array.from(unique);
}

export function isLicenseAllowed(license: string) {
  return ["cc_by", "cc_by_sa", "cc0", "custom"].includes(license);
}
