import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | HEMA-Core",
  description: "Get in touch with the hematology department.",
};

const DETAILS = [
  { icon: "call", label: "Phone", value: "+1 (555) 010-0100" },
  { icon: "mail", label: "Email", value: "hematology@example.org" },
  {
    icon: "location_on",
    label: "Address",
    value: "Hematology Department, Level 4, Main Hospital Building",
  },
  { icon: "schedule", label: "Hours", value: "Mon to Fri, 8:00 AM to 5:00 PM" },
];

export default function ContactPage() {
  return (
    <div className="container-max px-lg py-xl">
      <SectionHeader
        title="Contact the department"
        description="For referrals, research collaboration, or general enquiries, send us a message and we'll respond as soon as we can."
      />

      <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-md">
          {DETAILS.map((d) => (
            <div
              key={d.label}
              className="border-outline-variant bg-surface-container-low flex items-start gap-md rounded-xl border p-lg"
            >
              <div className="bg-secondary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon name={d.icon} className="text-primary" />
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase">
                  {d.label}
                </p>
                <p className="text-body-md text-on-surface">{d.value}</p>
              </div>
            </div>
          ))}
          <p className="text-body-sm text-on-surface-variant px-sm">
            For medical emergencies, please contact emergency services directly.
            This form is not monitored 24/7.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
