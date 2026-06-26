/** Material Symbols icon. Decorative by default (aria-hidden). */
export function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none ${filled ? "fill-icon" : ""} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
