import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Staff Login | HEMA-Core",
  robots: { index: false },
};

export default function StaffLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-lg py-xl">
      <div className="bg-surface-container-lowest border-outline-variant w-full max-w-[26rem] rounded-2xl border p-xl text-center">
        <div className="bg-secondary-container text-primary mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-full">
          <Icon name="lock" className="text-[28px]" />
        </div>
        <h1 className="text-headline-md text-primary mb-sm">Staff Login</h1>
        <p className="text-body-sm text-on-surface-variant mb-lg">
          Secure staff authentication is coming in the next phase. This area will
          require sign-in with multi-factor authentication for clinical staff.
        </p>
        <Link
          href="/"
          className="text-primary inline-flex items-center gap-xs text-body-sm font-semibold hover:underline"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
