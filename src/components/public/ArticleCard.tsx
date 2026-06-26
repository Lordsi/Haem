/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Article } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group bg-surface-container-lowest border-outline-variant hover:border-primary flex flex-col overflow-hidden rounded-xl border transition-colors"
    >
      {article.cover_image_url ? (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={article.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-lg">
        {article.publication_date ? (
          <span className="text-label-md text-secondary mb-sm font-bold uppercase">
            {formatDate(article.publication_date)}
          </span>
        ) : null}
        <h3 className="text-headline-md text-primary group-hover:text-on-tertiary-container mb-sm leading-tight transition-colors">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="text-body-sm text-on-surface-variant line-clamp-3">
            {article.excerpt}
          </p>
        ) : null}
        <span className="text-on-tertiary-container mt-md inline-flex items-center gap-xs text-body-sm font-bold">
          Read article
          <Icon name="arrow_right_alt" className="text-[18px]" />
        </span>
      </div>
    </Link>
  );
}
