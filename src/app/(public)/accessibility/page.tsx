import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility | HEMA-Core",
  description: "Our commitment to an accessible website for all users.",
};

export default function AccessibilityPage() {
  return (
    <div className="container-max px-lg py-xl">
      <div className="mx-auto max-w-[48rem]">
        <h1 className="text-headline-lg text-primary mb-lg">Accessibility</h1>
        <p className="text-body-md text-on-surface-variant mb-md">
          We aim to make this website usable by everyone, including people who
          rely on assistive technologies. We follow accessible design practices
          such as semantic markup, sufficient colour contrast, keyboard
          navigation, and descriptive labels.
        </p>
        <p className="text-body-sm text-on-surface-variant">
          This is a placeholder. If you encounter an accessibility barrier,
          please let us know via the contact page.
        </p>
      </div>
    </div>
  );
}
