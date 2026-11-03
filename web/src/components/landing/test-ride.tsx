"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { dealerLinks } from "@/data/vehicles";
import { useSelection } from "./selection";

export function TestRide() {
  const { vehicle, finish } = useSelection();

  return (
    <section id="test-ride" className="scroll-mt-16 bg-gold py-20 text-navy md:py-32">
      <div className="grid gap-10 px-[var(--margin)] lg:grid-cols-2 lg:gap-4">
        <div>
          <h2 className="display text-[length:var(--step-head)]">
            Ride it before
            <br />
            you decide
          </h2>
          <p className="mt-6 max-w-[36ch] text-[length:var(--step-lead)] leading-snug font-medium">
            Ask for the {vehicle.name} in {finish.name} at any of 80+ authorised dealers across 60+ cities.
          </p>
        </div>
        <ul>
          {dealerLinks.map((d, i) => (
            <motion.li
              key={d.name}
              initial={{ y: 22 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <a href={d.href} target="_blank" rel="noreferrer" className="city press flex items-center justify-between gap-4 py-2.5">
                <span className="text-[length:var(--step-lead)] font-bold">{d.name}</span>
                <ArrowUpRight aria-hidden="true" className="size-6 shrink-0" />
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
