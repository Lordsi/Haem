import { redirect } from "next/navigation";

/** Legacy route — patient sign-in is now unified at /login. */
export default async function PatientLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
