import { formatDate } from "@/lib/format";

/** Article attribution line: author name and optional publication date. */
export function ArticleByline({
  authorName,
  publicationDate,
  className = "",
  tone = "default",
}: {
  authorName: string | null;
  publicationDate?: string | null;
  className?: string;
  tone?: "default" | "inverse";
}) {
  if (!authorName && !publicationDate) return null;

  const textTone =
    tone === "inverse" ? "text-on-primary-container" : "text-on-surface-variant";
  const authorTone =
    tone === "inverse" ? "text-white" : "text-primary";

  return (
    <p className={`text-body-sm ${textTone} ${className}`}>
      {authorName ? (
        <>
          By <span className={`font-semibold ${authorTone}`}>{authorName}</span>
        </>
      ) : null}
      {authorName && publicationDate ? (
        <span className="mx-sm opacity-60">·</span>
      ) : null}
      {publicationDate ? (
        <time dateTime={publicationDate}>{formatDate(publicationDate)}</time>
      ) : null}
    </p>
  );
}
