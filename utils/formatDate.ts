// Converts an ISO timestamp to a readable format: 10 Jun 2026, 9:30 AM
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Converts an ISO date to a readable date-only format: 10 Jun 2026
export function formatDateOnly(isoString: string | null | undefined): string {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
