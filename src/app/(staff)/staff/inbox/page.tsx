import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import {
  getContactMessages,
  getEventRegistrations,
  type ContactMessage,
  type EventRegistrationItem,
} from "@/lib/data/inbox";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { MarkReadButton } from "./MarkReadButton";
import { markAllReadAction } from "./actions";

export const metadata: Metadata = {
  title: "Inbox | HEMA-Core Staff",
  robots: { index: false },
};

export default async function StaffInboxPage() {
  await requireStaff();

  const [registrations, messages] = await Promise.all([
    getEventRegistrations(),
    getContactMessages(),
  ]);

  const unreadRegistrations = registrations.filter((r) => !r.read_at).length;
  const unreadMessages = messages.filter((m) => !m.read_at).length;
  const totalUnread = unreadRegistrations + unreadMessages;

  return (
    <div className="space-y-xl">
      <SectionHeader
        title="Inbox"
        description="Submissions from the public site, sorted by type."
        action={
          totalUnread > 0 ? (
            <form action={markAllReadAction}>
              <button
                type="submit"
                className="border-outline-variant text-secondary hover:text-primary hover:border-primary focus-visible:ring-primary inline-flex items-center gap-xs rounded-full border px-lg py-2 text-label-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Icon name="done_all" className="text-[18px]" />
                Mark all read
              </button>
            </form>
          ) : null
        }
      />

      <InboxSection
        title="Event registrations"
        total={registrations.length}
        unread={unreadRegistrations}
        emptyLabel="No event registrations yet."
      >
        {registrations.map((item) => (
          <RegistrationRow key={item.id} item={item} />
        ))}
      </InboxSection>

      <InboxSection
        title="Contact messages"
        total={messages.length}
        unread={unreadMessages}
        emptyLabel="No contact messages yet."
      >
        {messages.map((item) => (
          <ContactRow key={item.id} item={item} />
        ))}
      </InboxSection>
    </div>
  );
}

function InboxSection({
  title,
  total,
  unread,
  emptyLabel,
  children,
}: {
  title: string;
  total: number;
  unread: number;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-sm flex items-center gap-sm">
        <h2 className="text-label text-on-surface-variant">{title}</h2>
        <span className="text-on-surface-variant text-label-md font-normal normal-case tracking-normal">
          {total}
        </span>
        {unread > 0 ? (
          <span className="text-tertiary text-label-md ml-auto font-bold normal-case tracking-normal">
            {unread} unopened
          </span>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="border-outline-variant text-on-surface-variant flex items-center gap-sm rounded-xl border border-dashed px-lg py-lg">
          <Icon name="inbox" className="text-[20px]" />
          <span className="text-body-sm">{emptyLabel}</span>
        </div>
      ) : (
        <ul className="border-outline-variant divide-outline-variant bg-surface-container-lowest divide-y overflow-hidden rounded-xl border">
          {children}
        </ul>
      )}
    </section>
  );
}

/** Leading column: solid red dot when unread, invisible placeholder otherwise,
 *  so read and unread rows stay aligned. */
function UnreadMarker({ unread }: { unread: boolean }) {
  return (
    <span className="flex w-2 shrink-0 justify-center pt-2">
      <span
        className={`size-2 rounded-full ${unread ? "bg-tertiary" : "bg-transparent"}`}
        aria-label={unread ? "Unopened" : undefined}
      />
    </span>
  );
}

function RegistrationRow({ item }: { item: EventRegistrationItem }) {
  const unread = !item.read_at;
  return (
    <li className="hover:bg-surface-container-low flex items-start gap-md px-lg py-md transition-colors">
      <UnreadMarker unread={unread} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-md">
          <p
            className={`text-body-md truncate ${unread ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}`}
          >
            {item.event_title ?? "Event"}
          </p>
          <span className="text-on-surface-variant text-label-md shrink-0 font-normal normal-case tracking-normal">
            {formatDate(item.registered_at)}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-xs truncate">
          {item.name}
          <span aria-hidden="true"> &middot; </span>
          <a
            href={`mailto:${item.email}`}
            className="hover:text-primary underline-offset-2 hover:underline"
          >
            {item.email}
          </a>
        </p>
      </div>
      <MarkReadButton kind="registration" id={item.id} isRead={!unread} />
    </li>
  );
}

function ContactRow({ item }: { item: ContactMessage }) {
  const unread = !item.read_at;
  return (
    <li className="hover:bg-surface-container-low flex items-start gap-md px-lg py-md transition-colors">
      <UnreadMarker unread={unread} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-md">
          <p
            className={`text-body-md truncate ${unread ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}`}
          >
            {item.subject || "(No subject)"}
          </p>
          <span className="text-on-surface-variant text-label-md shrink-0 font-normal normal-case tracking-normal">
            {formatDate(item.created_at)}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-xs truncate">
          {item.name}
          <span aria-hidden="true"> &middot; </span>
          <a
            href={`mailto:${item.email}`}
            className="hover:text-primary underline-offset-2 hover:underline"
          >
            {item.email}
          </a>
        </p>
        <p className="text-body-sm text-on-surface-variant mt-xs line-clamp-2">
          {item.body}
        </p>
      </div>
      <MarkReadButton kind="contact" id={item.id} isRead={!unread} />
    </li>
  );
}
