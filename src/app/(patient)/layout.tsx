import type { ReactNode } from "react";
import Link from "next/link";
import { requirePatient } from "@/lib/auth/session";
import { signOut } from "@/app/auth/actions";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requirePatient();

  return (
    <div className="bg-surface-bright min-h-full">
      <header className="bg-surface-container-lowest border-outline-variant border-b">
        <div className="container-max flex items-center justify-between px-lg py-md">
          <Link href="/patient" className="flex items-center gap-sm">
            <Icon name="biotech" className="text-primary text-[24px]" />
            <span className="text-body-md text-primary font-bold">
              HEMA-Core Patient Portal
            </span>
          </Link>
          <div className="flex items-center gap-md">
            <span className="text-body-sm text-on-surface-variant hidden sm:inline">
              {profile.name ?? profile.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-max px-lg py-xl">{children}</main>
    </div>
  );
}
