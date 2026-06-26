/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data/content";
import { ArticleByline } from "@/components/public/ArticleByline";
import { Icon } from "@/components/ui/Icon";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found | HEMA-Core" };
  return {
    title: `${article.title} | HEMA-Core`,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const paragraphs = (article.content ?? "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="container-max px-lg py-xl">
      <Link
        href="/news"
        className="text-secondary hover:text-primary mb-lg inline-flex items-center gap-xs text-body-sm font-semibold"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        Back to news
      </Link>

      <div className="mx-auto max-w-[48rem]">
        <ArticleByline
          authorName={article.author_name}
          publicationDate={article.publication_date}
          className="mb-md"
        />
        <h1 className="text-headline-lg text-primary mb-lg">
          {article.title}
        </h1>

        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt=""
            className="border-outline-variant mb-xl h-auto w-full rounded-xl border object-cover"
          />
        ) : null}

        <div className="space-y-md">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-body-lg text-on-surface-variant leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
