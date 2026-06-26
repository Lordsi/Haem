/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPublishedArticles, getUpcomingEvents } from "@/lib/data/content";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusChip } from "@/components/ui/StatusChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArticleCard } from "@/components/public/ArticleCard";
import { ArticleByline } from "@/components/public/ArticleByline";
import { EventRow } from "@/components/public/EventRow";

const EXPERTISE = [
  {
    icon: "science",
    title: "Malignant Hematology",
    body: "Specialized tracking and diagnostic management for leukemia, lymphoma, and multiple myeloma patients.",
  },
  {
    icon: "monitor_heart",
    title: "Hemostasis & Thrombosis",
    body: "Monitoring of coagulation panels and anticoagulant therapy optimization through structured workflows.",
  },
  {
    icon: "genetics",
    title: "Molecular Diagnostics",
    body: "Integration of genomic sequencing data into routine clinical workflows for personalized treatment paths.",
  },
];

export default async function LandingPage() {
  const [articles, events] = await Promise.all([
    getPublishedArticles(4),
    getUpcomingEvents(3),
  ]);

  const [feature, ...rest] = articles;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="from-surface-bright via-surface-bright/85 absolute inset-0 z-10 bg-gradient-to-r to-transparent" />
          <img
            src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-max relative z-20 px-lg py-xl">
          <div className="max-w-2xl">
            <StatusChip tone="critical" className="mb-md">
              Hematology Department
            </StatusChip>
            <h1 className="text-display-lg text-on-primary-fixed mb-md">
              Precision diagnostics for advanced hematology.
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-xl leading-relaxed">
              Our department bridges laboratory science and clinical
              decision-making, combining expert blood-sciences care, active
              research, and a secure patient management system.
            </p>
            <div className="flex flex-wrap gap-md">
              <Button href="/services" variant="critical" size="lg">
                Our Services
                <Icon name="arrow_forward" />
              </Button>
              <Button href="/news" variant="secondary" size="lg">
                Research &amp; News
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="bg-surface-container-lowest py-xl">
        <div className="container-max px-lg">
          <SectionHeader
            title="Expertise in blood sciences"
            description="We integrate clinical pathology with modern information systems to manage complex hematological conditions."
            action={
              <Link
                href="/services"
                className="text-on-tertiary-container inline-flex items-center gap-xs font-bold hover:underline"
              >
                Explore services <Icon name="north_east" className="text-[18px]" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
            {EXPERTISE.map((item) => (
              <div
                key={item.title}
                className="bg-surface-bright border-outline-variant rounded-xl border p-lg"
              >
                <div className="bg-secondary-container mb-md flex h-12 w-12 items-center justify-center rounded-lg">
                  <Icon name={item.icon} className="text-primary" />
                </div>
                <h3 className="text-headline-md mb-xs">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & research */}
      {articles.length > 0 ? (
        <section className="py-xl">
          <div className="container-max px-lg">
            <SectionHeader
              align="center"
              title="Innovations & research highlights"
              description="The latest publications and updates from the department."
            />
            <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
              {feature ? (
                <Link
                  href={`/news/${feature.slug}`}
                  className="group bg-primary-container relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-2xl p-xl"
                >
                  {feature.cover_image_url ? (
                    <img
                      src={feature.cover_image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="from-primary-container via-primary-container/50 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <div className="relative z-10">
                    <StatusChip tone="critical" className="mb-md">
                      Featured
                    </StatusChip>
                    <h3 className="text-headline-lg mb-sm text-white">
                      {feature.title}
                    </h3>
                    <ArticleByline
                      authorName={feature.author_name}
                      publicationDate={feature.publication_date}
                      tone="inverse"
                      className="mb-md"
                    />
                    {feature.excerpt ? (
                      <p className="text-on-primary-container text-body-md mb-md line-clamp-2">
                        {feature.excerpt}
                      </p>
                    ) : null}
                    <span className="inline-flex items-center gap-sm font-bold text-white">
                      Read publication
                      <Icon name="arrow_right_alt" />
                    </span>
                  </div>
                </Link>
              ) : null}

              <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Events */}
      {events.length > 0 ? (
        <section className="bg-surface-dim/20 py-xl">
          <div className="container-max px-lg">
            <div className="mb-xl flex items-center gap-md">
              <div className="bg-outline-variant h-px flex-1" />
              <h2 className="text-headline-lg text-primary shrink-0 px-md">
                Upcoming events &amp; seminars
              </h2>
              <div className="bg-outline-variant h-px flex-1" />
            </div>
            <div className="space-y-md">
              {events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-lg text-center">
              <Button href="/events" variant="secondary">
                View all events
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-xl">
        <div className="container-max px-lg">
          <div className="bg-primary relative overflow-hidden rounded-[2rem] p-xl text-center text-white">
            <h2 className="text-headline-lg mb-md">
              Questions about our services?
            </h2>
            <p className="text-on-primary-container text-body-lg mx-auto mb-xl max-w-[42rem]">
              Reach out to the department for referrals, research
              collaboration, or general enquiries.
            </p>
            <div className="flex flex-wrap justify-center gap-md">
              <Button href="/contact" variant="critical" size="lg">
                Contact the department
              </Button>
              <Button
                href="/about"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                About us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "HEMA-Core | Hematology Department",
  description:
    "Precision diagnostics, research, and patient management from the hematology department.",
};
