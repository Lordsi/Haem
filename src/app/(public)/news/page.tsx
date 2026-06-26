import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/data/content";
import { ArticleCard } from "@/components/public/ArticleCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "News & Research | HEMA-Core",
  description:
    "Publications, research highlights, and updates from the hematology department.",
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="container-max px-lg py-xl">
      <SectionHeader
        title="News & research"
        description="Publications, research highlights, and educational articles from the department."
      />

      {articles.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          No articles have been published yet. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
