import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "About | HEMA-Core",
  description:
    "About the hematology department: our mission, expertise, and team.",
};

const STATS = [
  { value: "24/7", label: "Diagnostic lab coverage" },
  { value: "12+", label: "Specialist clinicians" },
  { value: "50k+", label: "Samples processed yearly" },
  { value: "15+", label: "Active research studies" },
];

const TEAM = [
  {
    name: "Dr. Elena Vance",
    role: "Department Head",
    specialty: "Chief Hematopathologist",
  },
  {
    name: "Prof. Marcus Thorne",
    role: "Consultant Hematologist",
    specialty: "Molecular & Genomic Diagnostics",
  },
  {
    name: "Dr. Lisa Choi",
    role: "Consultant Hematologist",
    specialty: "Malignant Hematology",
  },
  {
    name: "Sarah Jenkins, MSc",
    role: "Laboratory Director",
    specialty: "Coagulation & Diagnostics",
  },
];

export default function AboutPage() {
  return (
    <div className="container-max px-lg py-xl">
      {/* Overview */}
      <div className="mx-auto mb-xl max-w-[52rem] text-center">
        <h1 className="text-headline-lg text-primary mb-md">
          About the Hematology Department
        </h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          We combine world-class blood-sciences expertise with modern
          information systems to diagnose, treat, and manage complex
          hematological conditions. Our work spans routine diagnostics,
          malignant hematology, hemostasis, and molecular medicine, all
          underpinned by a commitment to precision, safety, and patient privacy.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-xl grid grid-cols-2 gap-md md:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-low border-outline-variant rounded-xl border p-lg text-center"
          >
            <div className="text-headline-lg text-primary font-mono font-bold">
              {s.value}
            </div>
            <div className="text-body-sm text-on-surface-variant mt-xs">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="bg-primary-container mb-xl grid grid-cols-1 gap-lg rounded-2xl p-xl text-white md:grid-cols-3">
        {[
          {
            icon: "target",
            title: "Our mission",
            body: "To deliver accurate, timely hematological diagnoses and compassionate clinical care.",
          },
          {
            icon: "verified_user",
            title: "Patient privacy",
            body: "Sensitive health data is protected with encryption, strict access control, and audit trails.",
          },
          {
            icon: "experiment",
            title: "Research",
            body: "We advance blood sciences through active research and open collaboration.",
          },
        ].map((item) => (
          <div key={item.title}>
            <Icon name={item.icon} className="text-on-tertiary-container mb-sm text-[28px]" />
            <h3 className="text-headline-md mb-xs text-white">{item.title}</h3>
            <p className="text-on-primary-container text-body-sm">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <SectionHeader
        title="Our team"
        description="A multidisciplinary team of clinicians, scientists, and laboratory specialists."
      />
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <div
            key={member.name}
            className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg text-center"
          >
            <div className="bg-secondary-container text-primary mx-auto mb-md flex h-16 w-16 items-center justify-center rounded-full">
              <Icon name="person" className="text-[32px]" />
            </div>
            <h3 className="text-body-md text-primary font-bold">{member.name}</h3>
            <p className="text-label-md text-on-tertiary-container mt-xs font-bold uppercase">
              {member.role}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-xs">
              {member.specialty}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-xl flex flex-col items-center gap-md text-center">
        <h2 className="text-headline-md text-primary">Work with us</h2>
        <p className="text-body-md text-on-surface-variant max-w-[42rem]">
          Interested in collaboration or a referral? We&apos;d love to hear from
          you.
        </p>
        <Button href="/contact" variant="primary" size="lg">
          Get in touch
        </Button>
      </div>
    </div>
  );
}
