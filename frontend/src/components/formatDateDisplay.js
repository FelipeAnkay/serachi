
/**
 * Format: "Monday, May 26 2025"
 */
export function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${weekday}, ${month} ${day} ${year}`;
}

/**
 * Format: "26/05/2025"
 */
export function formatDateShort(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Format: "2025-05-26" (for input[type="date"])
 */
export function formatDateInput(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

/**
 * Format: "May 26, 2025"
 */
export function formatDatePretty(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
}

/**
 * Format: "Monday 26 May 2025"
 */
export function formatDateFull(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${weekday} ${day} ${month} ${year}`;
}

export function formatDateISO(dateStr) {
    if (!dateStr) return "";
        const date = new Date(dateStr);
        const tzOffset = date.getTimezoneOffset() * 60000; // en milisegundos
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
}