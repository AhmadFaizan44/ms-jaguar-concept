"use client";

import Image from "next/image";
import { MotionConfig } from "motion/react";
import { Hero } from "./hero";
import { SelectionProvider } from "./selection";

const DEALERS = "https://msjaguarmotorcycles.com/pages/find-a-dealer";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-white px-[var(--margin)] text-navy">
      <a href="#top" aria-label="MS Jaguar, back to top" className="press flex items-center">
        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/ms-jaguar-logo.png`} alt="MS Jaguar" width={52} height={52} preload />
      </a>
      <a href={DEALERS} target="_blank" rel="noreferrer" className="btn btn-navy">Book a test ride</a>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-navy text-white">
      <div className="px-[var(--margin)] pt-16 pb-10">
        <p className="max-w-[62ch]">
          Concept for MS Jaguar. Not an official site. Specs, prices and photos are from
          msjaguarmotorcycles.com; check with a dealer before buying.
        </p>
      </div>
      <p aria-hidden="true" className="display -mb-[0.16em] whitespace-nowrap text-center text-[17.6vw] text-gold">
        MS Jaguar
      </p>
    </footer>
  );
}

export function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <SelectionProvider>
        <div id="top" />
        <SiteHeader />
        <main>
          <Hero />
        </main>
        <SiteFooter />
      </SelectionProvider>
    </MotionConfig>
  );
}
