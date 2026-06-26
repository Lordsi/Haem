import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/data/content";
import { EventCard } from "@/components/public/EventCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Events & Seminars | HEMA-Core",
  description:
    "Hematology seminars, workshops, and research events. Browse and register.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="container-max px-lg py-xl">
      <SectionHeader
        title="Events & seminars"
        description="Explore specialized hematological seminars and workshops, and register to attend."
      />

      {events.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          There are no upcoming events scheduled right now. Please check back
          soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
