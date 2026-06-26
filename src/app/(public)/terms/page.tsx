import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | HEMA-Core",
  description: "Terms governing use of the hematology department website.",
};

export default function TermsPage() {
  return (
    <div className="container-max px-lg py-xl">
      <div className="mx-auto max-w-[48rem]">
        <h1 className="text-headline-lg text-primary mb-lg">Terms of Service</h1>
        <p className="text-body-md text-on-surface-variant mb-md">
          By using this website you agree to use it for lawful purposes only.
          The public content is provided for informational purposes and is not a
          substitute for professional medical advice.
        </p>
        <p className="text-body-sm text-on-surface-variant">
          This is a placeholder. Full terms of service will be published here
          before launch.
        </p>
      </div>
    </div>
  );
}
