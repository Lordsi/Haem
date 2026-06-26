import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Services | HEMA-Core",
  description:
    "Diagnostic and clinical services offered by the hematology department.",
};

const SERVICES = [
  {
    icon: "science",
    title: "Diagnostic Hematology",
    body: "Complete blood counts, blood film morphology, and a full range of routine and specialised haematology assays.",
  },
  {
    icon: "coronavirus",
    title: "Malignant Hematology",
    body: "Diagnosis and management of leukemia, lymphoma, and multiple myeloma, with structured case tracking.",
  },
  {
    icon: "monitor_heart",
    title: "Hemostasis & Thrombosis",
    body: "Coagulation testing, bleeding-disorder workups, and anticoagulant therapy monitoring and optimisation.",
  },
  {
    icon: "genetics",
    title: "Molecular Diagnostics",
    body: "Genomic and molecular testing integrated into clinical workflows for personalised treatment pathways.",
  },
  {
    icon: "bloodtype",
    title: "Transfusion Medicine",
    body: "Blood grouping, compatibility testing, and transfusion support for inpatients and clinics.",
  },
  {
    icon: "groups",
    title: "Outpatient Clinics",
    body: "Specialist consultations, follow-up reviews, and coordinated care for chronic haematological conditions.",
  },
];

export default function ServicesPage() {
  return (
    <div className="container-max px-lg py-xl">
      <SectionHeader
        title="Our services"
        description="The hematology department provides a comprehensive range of diagnostic and clinical services across blood sciences."
      />

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg"
          >
            <div className="bg-secondary-container mb-md flex h-12 w-12 items-center justify-center rounded-lg">
              <Icon name={s.icon} className="text-primary" />
            </div>
            <h3 className="text-headline-md text-primary mb-xs">{s.title}</h3>
            <p className="text-body-sm text-on-surface-variant">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low border-outline-variant mt-xl flex flex-col items-center gap-md rounded-2xl border p-xl text-center">
        <h2 className="text-headline-md text-primary">
          Need a referral or more information?
        </h2>
        <p className="text-body-md text-on-surface-variant max-w-[42rem]">
          Get in touch with the department and our team will help direct your
          enquiry.
        </p>
        <Button href="/contact" variant="primary" size="lg">
          Contact us
        </Button>
      </div>
    </div>
  );
}
