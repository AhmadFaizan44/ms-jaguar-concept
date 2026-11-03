"use client";

import { motion } from "motion/react";
import { formatPrice, vehicles } from "@/data/vehicles";
import { scrollToId, useSelection } from "./selection";
import { VehicleImage } from "./vehicle-image";

export function Studio() {
  const { vehicle, finish, battery, choose, setFinish, setBattery } = useSelection();
  const dir = vehicle.faces === "right" ? 1 : -1;
  const shown = vehicle.finishes.filter((f) => f.image);
  const noPhoto = vehicle.finishes.filter((f) => !f.image);

  return (
    <motion.section
      id="colours"
      className="scroll-mt-16 overflow-hidden"
      animate={{ backgroundColor: finish.field, color: finish.ink }}
      initial={false}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="px-[var(--margin)] py-14 md:py-12">
        <h2 className="display text-[length:var(--step-head)]">Pick your colour</h2>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 lg:col-span-2 lg:flex-col lg:gap-1">
            {vehicles.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  aria-pressed={v.id === vehicle.id}
                  onClick={() => choose(v.id)}
                  className={`press py-1.5 text-left text-[length:var(--step-lead)] leading-tight ${v.id === vehicle.id ? "font-bold" : "font-medium opacity-75 hover-opacity"}`}
                >
                  {v.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="relative h-[52svh] lg:col-span-7 lg:h-auto lg:min-h-[36rem]">
            <motion.div
              className="relative mx-auto h-full max-w-[44rem]"
              whileHover={{ x: dir * 30, rotate: dir * 1.2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
            >
              <VehicleImage
                image={finish.image || shown[0].image}
                alt={`MS Jaguar ${vehicle.name} in ${finish.name}`}
                sizes="(max-width: 768px) 92vw, 50vw"
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3 lg:justify-end">
            <div>
              <p className="display text-[length:var(--step-tile)]">{vehicle.name}</p>
              <p className="mt-2 font-medium">
                {vehicle.tagline} {vehicle.range} range, {vehicle.topSpeed} top speed.
              </p>
              <p className="mt-3 text-[length:var(--step-lead)] font-bold tabular-nums" aria-live="polite">
                {formatPrice(battery.price)}
              </p>
            </div>

            <fieldset>
              <legend className="font-bold">{finish.name}</legend>
              <div className="mt-2 flex flex-wrap gap-1">
                {shown.map((f) => (
                  <label key={f.id} className="swatch-large" style={{ "--paint": f.paint } as React.CSSProperties}>
                    <input
                      type="radio"
                      name="finish"
                      className="sr-only"
                      checked={f.id === finish.id}
                      onChange={() => setFinish(f.id)}
                      aria-label={f.name}
                    />
                  </label>
                ))}
              </div>
              {noPhoto.length > 0 && (
                <p className="mt-2">Also sold in {noPhoto.map((f) => f.name).join(" and ")}.</p>
              )}
            </fieldset>

            <fieldset>
              <legend className="font-bold">Battery</legend>
              <div className="mt-2 flex gap-1">
                {vehicle.batteries.map((b) => (
                  <label
                    key={b.id}
                    className="battery press"
                    data-checked={b.id === battery.id}
                    style={{ "--ink": finish.ink, "--field": finish.field } as React.CSSProperties}
                  >
                    <input
                      type="radio"
                      name="battery"
                      className="sr-only"
                      checked={b.id === battery.id}
                      onChange={() => setBattery(b.id)}
                    />
                    {b.name}
                  </label>
                ))}
              </div>
              <p className="mt-2">{battery.note}</p>
            </fieldset>

            <div>
              <button
                type="button"
                className="btn w-full"
                style={{ backgroundColor: finish.ink, color: finish.field }}
                onClick={() => scrollToId("test-ride")}
              >
                Ride this one
              </button>
              <a href={vehicle.url} target="_blank" rel="noreferrer" className="link mt-3 inline-block">
                Full specs on the MS Jaguar site
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
