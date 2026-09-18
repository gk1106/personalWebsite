/** Formats an ISO date string as "SEPTEMBER 2026". */
export function formatPostDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}
