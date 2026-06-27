/** Shared formatting helpers for dates used across the public site. */

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Short month + day, e.g. { month: "OCT", day: "14" } for date pills. */
export function dateParts(value: string | null | undefined): {
  month: string;
  day: string;
} {
  if (!value) return { month: "", day: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { month: "", day: "" };
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
  };
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const HONORIFIC = /^(dr|prof|mr|mrs|ms|miss|sr|sister|nurse)\.?$/i;

/**
 * Short, friendly name for dashboard greetings.
 * - Titled names keep the honorific + surname, e.g. "Prof. Naledi Khumalo" -> "Prof. Khumalo".
 * - Untitled names use the first name, e.g. "Jordan Mbeki" -> "Jordan".
 * Falls back to "there" when no usable name is available.
 */
export function greetingName(fullName: string | null | undefined): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "there";
  if (HONORIFIC.test(parts[0]) && parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  return parts[0];
}
