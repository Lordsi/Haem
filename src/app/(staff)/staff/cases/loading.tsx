export default function Loading() {
  return (
    <div>
      <div className="mb-xl max-w-[42rem]">
        <div className="bg-surface-container-high h-8 w-56 rounded motion-safe:animate-pulse" />
        <div className="bg-surface-container-high mt-sm h-5 w-80 max-w-full rounded motion-safe:animate-pulse" />
      </div>
      <div className="bg-surface-container-lowest border-outline-variant divide-outline-variant divide-y overflow-hidden rounded-xl border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-lg py-md">
            <div className="bg-surface-container-high h-5 w-40 rounded motion-safe:animate-pulse" />
            <div className="bg-surface-container-high h-6 w-24 rounded-full motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
