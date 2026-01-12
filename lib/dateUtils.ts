/**
 * Date formatting utilities for UK date format (DD/MM/YYYY)
 */

/**
 * Format a date string to UK format (DD/MM/YYYY)
 */
export function formatDateUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

/**
 * Format a date string to UK format with time (DD/MM/YYYY, HH:MM)
 */
export function formatDateTimeUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date string to UK format with long month name (DD Month YYYY)
 */
export function formatDateLongUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
