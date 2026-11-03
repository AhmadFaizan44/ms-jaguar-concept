import type { Metadata, Viewport } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";

const display = Red_Hat_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["900"],
});

const text = Red_Hat_Text({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Petrol se azaadi | MS Jaguar electric scooters and bikes (concept)",
  description:
    "Concept landing page for MS Jaguar: electric scooters and bikes built in Pakistan. Pick a model and colour, then ride one at a dealer near you.",
  // Unsolicited concept: stays out of search until MS Jaguar approves it.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
