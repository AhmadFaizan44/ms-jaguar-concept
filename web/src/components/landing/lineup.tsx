"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { formatPrice, startingPrice, vehicles, type Vehicle } from "@/data/vehicles";
import { scrollToId, useSelection } from "./selection";
import { VehicleImage } from "./vehicle-image";

const GROUPS = {
  scooter: { label: "Scooters", spans: ["md:col-span-7", "md:col-span-5", "md:col-span-4", "md:col-span-4", "md:col-span-4"], order: ["legacy", "m1", "bolt", "miso", "miso-3w"] },
  bike: { label: "E-bikes", spans: ["md:col-span-12", "md:col-span-6", "md:col-span-6"], order: ["e125", "e70-supreme", "e70"] },
} as const;

type Kind = keyof typeof GROUPS;

function Tile({ vehicle, span, wide, index }: { vehicle: Vehicle; span: string; wide: boolean; index: number }) {
  const { choose } = useSelection();
  const finishes = vehicle.finishes.filter((f) => f.image);
  const [finishId, setFinishId] = useState(finishes[0].id);
  const finish = finishes.find((f) => f.id === finishId) ?? finishes[0];
  const raised = finish.id !== finishes[0].id;
  const dir = vehicle.faces === "right" ? 1 : -1;

  const ride: Variants = {
    rest: { x: 0, rotate: 0, scale: 1 },
    rev: { x: dir * 26, rotate: dir * 1.2, scale: 1.05 },
    press: { scale: 0.97 },
  };

  return (
    <motion.div
      className={`w-[84vw] shrink-0 snap-center md:w-auto ${wide ? "h-[33rem] md:h-[42rem]" : "h-[33rem] md:h-[34rem]"} ${span}`}
      initial={{ y: 36 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.article
        className="tile relative flex h-full flex-col overflow-hidden"
        style={{
          "--tile-base": finishes[0].field,
          "--tile-field": finish.field,
          "--tile-ink": finish.ink,
        } as React.CSSProperties}
        initial="rest"
        animate="rest"
        whileHover="rev"
        whileTap="press"
        // Hovering shows the next finish: its colour rises from the floor as the photo crossfades.
        onHoverStart={() => finishes[1] && setFinishId(finishes[1].id)}
        onHoverEnd={() => setFinishId(finishes[0].id)}
      >
        <span aria-hidden="true" data-raised={raised} className="tile-field absolute inset-0" />

        <div className="relative z-10 flex items-start justify-between gap-4 p-5 md:p-6">
          <div>
            <h3 className="display text-[length:var(--step-tile)]">{vehicle.name}</h3>
            <p className="tile-detail mt-2 text-[length:var(--step-body)] font-medium">{vehicle.tagline}</p>
          </div>
          <p className="text-[length:var(--step-body)] font-bold whitespace-nowrap tabular-nums">
            {vehicle.batteries.length > 1 ? "From " : ""}
            {formatPrice(startingPrice(vehicle))}
          </p>
        </div>

        <div className="relative z-10 mx-4 min-h-0 flex-1">
          <motion.div
            className="absolute inset-0"
            variants={ride}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
          >
            <VehicleImage
              image={finish.image}
              alt={`MS Jaguar ${vehicle.name} in ${finish.name}`}
              sizes="(max-width: 768px) 84vw, (max-width: 1200px) 50vw, 40vw"
            />
          </motion.div>
        </div>

        <div className="tile-detail relative z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-5 md:p-6">
          <p className="text-[length:var(--step-body)] font-medium">
            {vehicle.range} range · {vehicle.topSpeed}
          </p>
          <div className="flex items-center gap-1" role="group" aria-label={`${vehicle.name} colours`}>
            {finishes.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-label={f.name}
                aria-pressed={f.id === finish.id}
                title={f.name}
                onPointerEnter={(e) => e.pointerType === "mouse" && setFinishId(f.id)}
                onClick={() => setFinishId(f.id)}
                className="swatch"
                style={{ "--paint": f.paint } as React.CSSProperties}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn w-full"
            style={{ backgroundColor: finish.ink, color: finish.field }}
            onClick={() => {
              choose(vehicle.id, finish.id);
              scrollToId("colours");
            }}
          >
            Choose this one
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Lineup() {
  const [kind, setKind] = useState<Kind>("scooter");
  const group = GROUPS[kind];

  return (
    <section id="line-up" className="scroll-mt-16 bg-bone py-20 text-navy md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6 px-[var(--margin)]">
        <h2 className="display text-[length:var(--step-head)]">
          Eight rides.
          <br />
          One less pump.
        </h2>
        <div role="group" aria-label="Show" className="flex">
          {(Object.keys(GROUPS) as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`btn ${kind === k ? "btn-navy" : "btn-quiet"}`}
            >
              {GROUPS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex snap-x snap-mandatory scroll-px-[var(--margin)] gap-3 overflow-x-auto overflow-y-hidden px-[var(--margin)] pb-2 md:mt-14 md:grid md:grid-cols-12 md:overflow-visible md:pb-0">
        {group.order.map((id, i) => {
          const vehicle = vehicles.find((v) => v.id === id);
          if (!vehicle) return null;
          return <Tile key={id} vehicle={vehicle} span={group.spans[i]} wide={kind === "bike" ? i === 0 : i < 2} index={i} />;
        })}
      </div>
    </section>
  );
}
