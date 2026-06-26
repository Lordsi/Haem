import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/content";
import { formatDate, formatTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { RegistrationForm } from "./RegistrationForm";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event not found | HEMA-Core" };
  return {
    title: `${event.title} | HEMA-Core`,
    description: event.description ?? undefined,
  };
}

export default async function EventPage({ params }: Params) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div className="container-max px-lg py-xl">
      <Link
        href="/events"
        className="text-secondary hover:text-primary mb-lg inline-flex items-center gap-xs text-body-sm font-semibold"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        Back to events
      </Link>

      <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h1 className="text-headline-lg text-primary mb-lg">{event.title}</h1>

          <dl className="border-outline-variant bg-surface-container-low mb-xl grid grid-cols-1 gap-md rounded-xl border p-lg sm:grid-cols-3">
            <div className="flex items-start gap-sm">
              <Icon name="event" className="text-primary" />
              <div>
                <dt className="text-label-md text-on-surface-variant font-bold uppercase">
                  Date
                </dt>
                <dd className="text-body-md text-on-surface">
                  {formatDate(event.event_date) || "TBA"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <Icon name="schedule" className="text-primary" />
              <div>
                <dt className="text-label-md text-on-surface-variant font-bold uppercase">
                  Time
                </dt>
                <dd className="text-body-md text-on-surface">
                  {formatTime(event.event_date) || "TBA"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <Icon name="location_on" className="text-primary" />
              <div>
                <dt className="text-label-md text-on-surface-variant font-bold uppercase">
                  Location
                </dt>
                <dd className="text-body-md text-on-surface">
                  {event.location ?? "TBA"}
                </dd>
              </div>
            </div>
          </dl>

          {event.description ? (
            <div className="space-y-md">
              <h2 className="text-headline-md text-primary">About this event</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                {event.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <RegistrationForm eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
