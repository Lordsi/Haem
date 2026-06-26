import Link from "next/link";
import type { EventItem } from "@/lib/data/content";
import { formatDate, formatTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group bg-surface-container-lowest border-outline-variant flex flex-col rounded-xl border p-lg transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <div className="mb-md flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-secondary font-mono text-data-mono">
            {formatDate(event.event_date)}
          </span>
          {event.location ? (
            <span className="text-on-surface-variant mt-xs text-label-md">
              {event.location}
            </span>
          ) : null}
        </div>
        {event.event_date ? (
          <span className="bg-surface-container-highest text-on-surface-variant rounded-full px-sm py-xs text-[10px] font-bold uppercase">
            {formatTime(event.event_date)}
          </span>
        ) : null}
      </div>

      <h3 className="text-headline-md text-primary mb-sm leading-snug">
        {event.title}
      </h3>
      {event.description ? (
        <p className="text-body-sm text-on-surface-variant line-clamp-3">
          {event.description}
        </p>
      ) : null}

      <div className="border-outline-variant mt-auto flex items-center justify-between border-t pt-md">
        {event.registration_limit ? (
          <span className="text-on-surface-variant text-label-md">
            {event.registration_limit} seats
          </span>
        ) : (
          <span />
        )}
        <Link
          href={`/events/${event.id}`}
          className="text-primary inline-flex items-center gap-xs text-label-md font-bold hover:underline"
        >
          View &amp; register
          <Icon name="arrow_right_alt" className="text-[18px]" />
        </Link>
      </div>
    </article>
  );
}
