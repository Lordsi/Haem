import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "critical" | "success" | "category";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-container-highest text-on-surface-variant",
  primary: "bg-secondary-container text-on-secondary-container",
  critical: "bg-tertiary-fixed text-on-tertiary-container",
  success: "bg-emerald-100 text-emerald-800",
  category: "bg-secondary-container text-on-secondary-container",
};

/** Small pill-shaped categorical indicator (e.g. event category, status). */
export function StatusChip({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-label-md font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
