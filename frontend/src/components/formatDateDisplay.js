import { format } from "date-fns";
import { parseISO, isValid } from "date-fns";

/**
 * Convierte cualquier entrada a un Date válido
 */
function toDate(input) {
  if (!input) return null;
  if (input instanceof Date && isValid(input)) return input;

  try {
    const parsed = parseISO(input);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Format: "Monday, May 26 2025"
 */
export function formatDateDisplay(dateInput) {
  const date = new Date(dateInput);
  return date
    ? date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      timeZone: 'UTC',
    })
    : '';
}

/**
 * Format: "Monday, May 26 2025 09:15 AM"
 */
export function formatDateTimeDisplayHours(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "EEEE, MMMM dd yyyy hh:mm a") : "";
}

/**
 * Format: "26/05/2025"
 */
export function formatDateShort(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "dd/MM/yyyy") : "";
}

/**
 * Format: "2025-05-26" (for input[type="date"])
 */
export function formatDateInput(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "yyyy-MM-dd") : "";
}

/**
 * Format: "May 26, 2025"
 */
export function formatDatePretty(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "MMMM dd, yyyy") : "";
}

/**
 * Format: "Monday 26 May 2025"
 */
export function formatDateFull(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "EEEE dd MMMM yyyy") : "";
}

/**
 * Format: ISO local datetime: "2025-05-26T14:30"
 */
export function formatDateISO(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
}
/**
 * Format: ISO local datetime: "2025-05-26T14:30"
 */
export function formatDateISONoHours(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "yyyy-MM-dd") : "";
}

/**
 * Format: ISO local datetime: "2025-05-26T14:30"
 */
export function formatEndOfDayDateISO(dateInput) {
  const date = toDate(dateInput);
  date.setHours(23, 59, 59, 999);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
}

export function endOfDayUTC(dateInput) {
  const date = new Date(dateInput);
  date.setUTCHours(23, 59, 59, 999); // <- UTC en vez de local time
  return date;
}

/**
 * Format: ISO local datetime: "2025-05-26T14:30"
 */
export function formatDateISOShort(dateInput) {
  if (!dateInput) return '';
  return new Date(dateInput).toISOString().split('T')[0]; // devuelve solo YYYY-MM-DD
}

/**
 * Format: "2025-05"
 */
export function formatYearMonth(dateInput) {
  const date = toDate(dateInput);
  return date ? format(date, "yyyy-MM") : "";
}

