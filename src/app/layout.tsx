import type { Metadata } from "next";
import { Lexend, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "HEMA-Core | Hematology Department",
    template: "%s",
  },
  description:
    "Hematology Department Management & Information System for clinical care, research, and patient management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preload the self-hosted Material Symbols font so glyphs are ready as
            early as possible — no third-party round-trip and no flash of the
            raw ligature names on slow connections. */}
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-surface-bright text-on-surface min-h-full flex flex-col font-sans text-body-md">
        {children}
      </body>
    </html>
  );
}
