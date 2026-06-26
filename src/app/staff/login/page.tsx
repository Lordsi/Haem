import { redirect } from "next/navigation";

/** Legacy route — staff sign-in is now unified at /login. */
export default async function StaffLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
