import Link from "next/link";
import type { EventItem } from "@/lib/data/content";
import { dateParts, formatTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { StatusChip } from "@/components/ui/StatusChip";

export function EventRow({ event }: { event: EventItem }) {
  const { month, day } = dateParts(event.event_date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-surface-container-lowest border-outline-variant hover:border-primary group flex flex-col items-center gap-md rounded-xl border p-md transition-colors md:flex-row"
    >
      <div className="flex items-center gap-lg md:w-1/4">
        <div className="text-center">
          <div className="text-label-md text-secondary font-bold uppercase">
            {month}
          </div>
          <div className="text-headline-lg text-primary font-bold">{day}</div>
        </div>
        <div className="bg-outline-variant h-12 w-px" />
        <div className="text-body-sm text-secondary font-mono">
          {formatTime(event.event_date)}
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-headline-md text-primary group-hover:text-on-tertiary-container transition-colors">
          {event.title}
        </h4>
        {event.description ? (
          <p className="text-body-sm text-on-surface-variant line-clamp-1">
            {event.description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-sm">
        {event.location ? (
          <StatusChip tone="neutral">{event.location}</StatusChip>
        ) : null}
        <span className="border-outline-variant group-hover:bg-primary rounded-full border p-2 transition-all group-hover:text-white">
          <Icon name="arrow_forward" className="block text-[18px]" />
        </span>
      </div>
    </Link>
  );
}
