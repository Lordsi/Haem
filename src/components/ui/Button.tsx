import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "critical" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  critical: "bg-on-tertiary-container text-white hover:brightness-110",
  secondary:
    "bg-surface-container-lowest text-primary border border-outline-variant hover:bg-surface-container",
  ghost: "text-primary hover:bg-surface-container-high",
};

const SIZES: Record<Size, string> = {
  sm: "px-md py-sm text-label-md",
  md: "px-lg py-2.5 text-body-sm font-semibold",
  lg: "px-xl py-3.5 text-body-md font-semibold",
};

const BASE =
  "inline-flex items-center justify-center gap-sm rounded-lg transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

function classes(variant: Variant, size: Size, className?: string) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`;
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentProps<"button">, "className" | "children">;

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  if (props.href !== undefined) {
    const { href, variant = "primary", size = "md", className, children, ...rest } =
      props as ButtonAsLink;
    return (
      <Link href={href} className={classes(variant, size, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant = "primary", size = "md", className, children, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
