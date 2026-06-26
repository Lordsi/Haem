import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | HEMA-Core",
  description: "How the hematology department handles personal and health data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-max px-lg py-xl">
      <div className="mx-auto max-w-[48rem]">
        <h1 className="text-headline-lg text-primary mb-lg">Privacy Policy</h1>
        <p className="text-body-md text-on-surface-variant mb-md">
          The hematology department is committed to protecting personal and
          health information. Patient health data is handled as sensitive data
          with encryption, strict role-based access control, and audit logging.
        </p>
        <p className="text-body-sm text-on-surface-variant">
          This is a placeholder. A full privacy policy aligned with the
          applicable data-protection regulations for our jurisdiction will be
          published here before launch.
        </p>
      </div>
    </div>
  );
}
