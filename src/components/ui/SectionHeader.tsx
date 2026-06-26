import type { ReactNode } from "react";

/** Section heading + optional description and trailing action, used on the
 *  public pages to introduce content blocks. */
export function SectionHeader({
  title,
  description,
  action,
  align = "start",
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  if (align === "center") {
    return (
      <div className={`mb-xl text-center ${className}`}>
        <h2 className="text-headline-lg text-primary">{title}</h2>
        {description ? (
          <p className="text-body-md text-on-surface-variant mx-auto mt-sm max-w-[42rem]">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div className="max-w-[42rem]">
        <h2 className="text-headline-lg text-primary">{title}</h2>
        {description ? (
          <p className="text-body-md text-on-surface-variant mt-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
