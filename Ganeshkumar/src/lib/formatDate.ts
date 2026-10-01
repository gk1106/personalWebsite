/** Formats an ISO date string as "SEPTEMBER 2026". */
export function formatPostDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

/** Formats an ISO timestamp as "18 Sep 2026" — more precise, for admin tables. */
export function formatAdminDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
