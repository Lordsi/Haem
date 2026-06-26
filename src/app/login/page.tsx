import type { Metadata } from "next";
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
    <main className="flex flex-1 items-center justify-center px-lg py-xl">
      <div className="bg-surface-container-lowest border-outline-variant w-full max-w-[26rem] rounded-2xl border p-xl">
        <div className="mb-lg text-center">
          <div className="bg-secondary-container text-primary mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-full">
            <Icon name="lock" className="text-[28px]" />
          </div>
          <h1 className="text-headline-md text-primary mb-sm">Sign in</h1>
          <p className="text-body-sm text-on-surface-variant">
            Sign in with your HEMA-Core credentials. You&apos;ll be taken to
            your workspace automatically — staff to the clinical dashboard,
            patients to the portal.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
