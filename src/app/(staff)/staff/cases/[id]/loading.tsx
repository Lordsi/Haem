export default function Loading() {
  return (
    <div className="space-y-xl">
      <div>
        <div className="bg-surface-container-high mb-md h-5 w-24 rounded motion-safe:animate-pulse" />
        <div className="bg-surface-container-high h-9 w-64 max-w-full rounded motion-safe:animate-pulse" />
        <div className="bg-surface-container-high mt-xs h-4 w-48 rounded motion-safe:animate-pulse" />
      </div>
      <div className="bg-surface-container-lowest border-outline-variant h-24 rounded-xl border motion-safe:animate-pulse" />
      <div className="grid gap-xl lg:grid-cols-2">
        <div className="bg-surface-container-lowest border-outline-variant h-40 rounded-xl border motion-safe:animate-pulse" />
        <div className="bg-surface-container-lowest border-outline-variant h-40 rounded-xl border motion-safe:animate-pulse" />
      </div>
      <div className="bg-surface-container-lowest border-outline-variant h-56 rounded-xl border motion-safe:animate-pulse" />
    </div>
  );
}
