import type { ReactNode } from "react";
import { TopNavBar } from "@/components/public/TopNavBar";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
