import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getUserProfile, getRoleHomePath } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | HEMA-Core",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in? Send them straight to their workspace.
  const profile = await getUserProfile();
  if (profile) {
    redirect(getRoleHomePath(profile.role));
  }

  return (
    <main className="bg-surface-dim/30 flex flex-1 items-center justify-center p-md sm:p-xl">
      <div className="bg-surface-container-lowest shadow-xl grid w-full max-w-[60rem] overflow-hidden rounded-3xl md:grid-cols-2">
        {/* Illustration panel */}
        <div className="from-secondary-container via-surface-container-low to-tertiary-fixed/40 relative hidden flex-col justify-between bg-gradient-to-br p-xl md:flex">
          <div>
            <Link
              href="/"
              className="text-tertiary inline-flex items-center gap-xs text-label-md font-bold uppercase tracking-wide hover:opacity-80"
            >
              <Icon name="biotech" className="text-[20px]" />
              HEMA-Core
            </Link>
            <h2 className="text-display-lg text-primary mt-lg tracking-[0.12em]">
              WELCOME
            </h2>
            <p className="text-body-md text-on-surface-variant mt-sm max-w-[24ch]">
              Sign in to your hematology workspace for clinical care, research,
              and patient management.
            </p>
          </div>

          <div className="relative mt-lg min-h-[18rem] flex-1">
            <Image
              src="/login-microscope.png"
              alt="Watercolor illustration of a microscope surrounded by flowers"
              fill
              priority
              sizes="(min-width: 768px) 30rem, 100vw"
              className="object-contain object-bottom mix-blend-multiply"
            />
          </div>
        </div>

        {/* Form panel */}
        <div className="relative flex flex-col justify-center overflow-hidden p-xl sm:p-[3rem]">
          {/* Faint microscope backdrop — small screens only (desktop uses the side panel) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 md:hidden"
          >
            <Image
              src="/login-microscope.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-[0.12] mix-blend-multiply"
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[22rem]">
            <h1 className="text-headline-lg text-on-surface mb-xl">Sign in</h1>
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
