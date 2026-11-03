"use client";

import { memo, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Lenis from "lenis";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { formatPrice, getVehicle, startingPrice } from "@/data/vehicles";
import { useMediaQuery } from "./selection";
import { VehiclePicture, vehicleImages } from "./vehicle-image";

/** The wheel's order, each with the finish it rides in and the pale colour it gives the studio. */
const RIDES = [
  { vehicle: "miso", finish: "blush-pink", stage: "#F8EDF0" },
  { vehicle: "bolt", finish: "graphite-grey", stage: "#EDF0F3" },
  { vehicle: "m1", finish: "crimson-black", stage: "#F7EEEC" },
  { vehicle: "legacy", finish: "arctic-white", stage: "#E8F1F4" },
  { vehicle: "miso-3w", finish: "blush-pink", stage: "#F9F0F3" },
  { vehicle: "e70", finish: "red", stage: "#F6F0E8" },
  { vehicle: "e70-supreme", finish: "blue", stage: "#EAF0F9" },
  { vehicle: "e125", finish: "red", stage: "#F5EFEA" },
].map((ride) => {
  const vehicle = getVehicle(ride.vehicle);
  const finish = vehicle.finishes.find((f) => f.id === ride.finish) ?? vehicle.finishes[0];
  return { ...ride, data: vehicle, finishData: finish };
});

const COUNT = RIDES.length;
/** Scroll spent on the opening words, then on each vehicle, then after the last, in wheel steps. */
const INTRO_STEPS = 0.8;
const TAIL_STEPS = 0.4;
const SCROLL_STEPS = INTRO_STEPS + (COUNT - 1) + TAIL_STEPS;
/** How far apart the vehicles sit on the wheel. */
const STEP_DEGREES = 25;
const HEADER = 64;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Scroll distance to wheel position. The wheel dwells on each vehicle so it always rests centred. */
function wheelPosition(steps: number) {
  if (steps <= INTRO_STEPS) return -0.28 * (1 - smooth(steps / INTRO_STEPS));
  const after = Math.min(steps - INTRO_STEPS, COUNT - 1);
  const whole = Math.floor(after);
  return whole + smooth(clamp01((after - whole - 0.14) / 0.72));
}

/** The shortest way round: vehicles past the back of the wheel come in again from the other side. */
const offsetOnWheel = (index: number, position: number) => {
  const raw = (index - position) % COUNT;
  if (raw > COUNT / 2) return raw - COUNT;
  if (raw < -COUNT / 2) return raw + COUNT;
  return raw;
};

const lean = { stiffness: 260, damping: 22, mass: 0.7 };

type RideProps = {
  index: number;
  load: boolean;
  register: (index: number, el: HTMLElement | null) => void;
  offsets: RefObject<number[]>;
  onBringForward: (index: number) => void;
};

const Ride = memo(function Ride({ index, load, register, offsets, onBringForward }: RideProps) {
  const ride = RIDES[index];
  const image = ride.finishData.image;
  const { ground } = vehicleImages[image];
  const faces = ride.data.faces === "right" ? 1 : -1;

  const x = useSpring(0, lean);
  const y = useSpring(0, lean);
  const rotate = useSpring(0, lean);
  const scale = useSpring(1, lean);

  const hover = (entering: boolean) => {
    if (!entering) {
      x.set(0);
      y.set(0);
      rotate.set(0);
      scale.set(1);
      return;
    }
    const offset = offsets.current[index] ?? 0;
    if (Math.abs(offset) < 0.5) {
      // The front vehicle lifts and leans the way it points.
      x.set(faces * 22);
      y.set(-16);
      rotate.set(faces * 1.4);
      scale.set(1.035);
    } else {
      // A side vehicle leans in toward the centre.
      const towardCentre = offset > 0 ? -1 : 1;
      x.set(towardCentre * 34);
      rotate.set(towardCentre * 3);
      scale.set(1.06);
    }
  };

  return (
    <button
      type="button"
      ref={(el) => register(index, el)}
      aria-label={`Bring the ${ride.data.name} to the front`}
      data-ride={index}
      className="wheel-ride"
      style={{ opacity: index === 0 ? 1 : 0, visibility: index === 0 ? "visible" : "hidden" }}
      onClick={() => onBringForward(index)}
      onPointerEnter={(e) => e.pointerType === "mouse" && hover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(false)}
    >
      <motion.span className="wheel-ride-lean" style={{ x, y, rotate, scale }}>
        {/* Sinks the photo so its tyres stand on the wheel, with shadow and reflection below. */}
        <span className="wheel-ride-photo" style={{ transform: `translateY(${ground * 100}%)` }}>
          {load && (
            <VehiclePicture
              image={image}
              alt={`MS Jaguar ${ride.data.name} in ${ride.finishData.name}`}
              sizes="(max-width: 768px) 90vw, 640px"
              priority={index === 0}
              className="h-full w-full object-contain object-bottom select-none"
            />
          )}
        </span>
      </motion.span>
    </button>
  );
});

/** Only this part re-renders, and only when a new vehicle reaches the front. */
function FrontDetails({ front, onStep }: { front: MotionValue<number>; onStep: (by: number) => void }) {
  const [index, setIndex] = useState(0);
  useMotionValueEvent(front, "change", (value) => setIndex(value));
  const ride = RIDES[index];
  const { data } = ride;
  const swap = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const },
  };

  return (
    <>
      <div className="wheel-name">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={data.id} {...swap}>
            <h2 className="display text-[clamp(3rem,8.4vw,8rem)]">{data.name}</h2>
            <p className="mt-2 text-[length:var(--step-lead)] leading-snug font-medium md:mt-4">{data.tagline}</p>
            <a href={data.url} target="_blank" rel="noreferrer" className="wheel-specs link mt-1 inline-block md:mt-2">
              Full specs <ArrowUpRight aria-hidden="true" className="inline size-4" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="wheel-facts">
        <AnimatePresence mode="wait" initial={false}>
          <motion.dl key={data.id} className="wheel-fact-list" {...swap}>
            <div>
              <dt>Range</dt>
              <dd>{data.range}</dd>
            </div>
            <div>
              <dt>Top speed</dt>
              <dd>{data.topSpeed}</dd>
            </div>
            <div>
              <dt>{data.batteries.length > 1 ? "From" : "Price"}</dt>
              <dd className="tabular-nums">{formatPrice(startingPrice(data))}</dd>
            </div>
          </motion.dl>
        </AnimatePresence>
      </div>

      <div className="wheel-controls">
        <button type="button" className="wheel-arrow" aria-label="Previous vehicle" onClick={() => onStep(-1)}>
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <ul className="wheel-names">
          {RIDES.map((r, i) => (
            <li key={r.vehicle}>
              <button
                type="button"
                data-jump={i}
                aria-current={i === index ? "true" : undefined}
                className={`press whitespace-nowrap ${i === index ? "font-bold" : "font-medium opacity-65 hover-opacity"}`}
              >
                {r.data.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="wheel-count tabular-nums md:hidden" aria-hidden="true">
          {index + 1} / {COUNT}
        </p>
        <button type="button" className="wheel-arrow" aria-label="Next vehicle" onClick={() => onStep(1)}>
          <ArrowRight aria-hidden="true" className="size-5" />
        </button>
      </div>

    </>
  );
}

function StillList() {
  return (
    <section aria-label="Meet the vehicles" className="bg-bone px-[var(--margin)] py-10">
      <h1 className="display text-[clamp(3rem,10vw,8rem)]">Petrol se azaadi</h1>
      <p className="mt-5 max-w-[36ch] text-[length:var(--step-lead)] font-medium">
        Electric scooters and bikes built in Pakistan, from Rs 158,000.
      </p>
      <ul className="mt-10 grid gap-10 md:grid-cols-2">
        {RIDES.map((r) => (
          <li key={r.vehicle}>
            <div className="relative h-80">
              <VehiclePicture
                image={r.finishData.image}
                alt={`MS Jaguar ${r.data.name} in ${r.finishData.name}`}
                sizes="(max-width: 768px) 90vw, 45vw"
                className="h-full w-full object-contain object-bottom"
              />
            </div>
            <h2 className="display mt-4 text-[length:var(--step-tile)]">{r.data.name}</h2>
            <p className="mt-1">
              {r.data.tagline} {r.data.range} range, {r.data.topSpeed}, {formatPrice(startingPrice(r.data))}.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Hero() {
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  return still ? <StillList /> : <Wheel />;
}

function Wheel() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const ticks = useRef<HTMLCanvasElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const tintRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsets = useRef<number[]>(RIDES.map(() => 0));
  const lenis = useRef<Lenis | null>(null);
  const shown = useRef(-1);
  const justDragged = useRef(false);
  const shownPosition = useRef(-0.28);

  const front = useMotionValue(0);
  const { scrollY } = useScroll();
  const [loadAll, setLoadAll] = useState(false);
  // Measured once and on resize, so turning the wheel never forces a layout.
  const metrics = useRef({ top: 0, stepPixels: 1, radius: 1, tickWidth: 0, tickHeight: 0, rimOffset: 0, dpr: 1 });
  const lastDrawn = useRef({ position: Number.NaN, steps: Number.NaN });
  const written = useRef<{ z: string[]; tints: string[] }>({ z: RIDES.map(() => ""), tints: RIDES.map(() => "") });

  // One scroll source for everything: wheel, drag, arrows and keys all move the page.
  useEffect(() => {
    const instance = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 0.9 });
    lenis.current = instance;
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  const stopAt = (index: number) => {
    const stop = INTRO_STEPS + index + (index === COUNT - 1 ? 0.04 : 0);
    return metrics.current.top + stop * metrics.current.stepPixels;
  };
  const goTo = (index: number) => {
    const target = Math.max(0, Math.min(COUNT - 1, index));
    lenis.current?.scrollTo(stopAt(target), { duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3), force: true });
  };
  const current = () => Math.round(Math.max(0, shownPosition.current));

  const register = useCallback((index: number, el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  const bringForward = (index: number) => {
    if (justDragged.current) return;
    goTo(index);
  };

  // The ticks are drawn only where the rim is on screen, instead of one giant rotating layer.
  const drawTicks = (position: number) => {
    const canvas = ticks.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { radius, tickWidth, tickHeight, rimOffset, dpr } = metrics.current;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, tickWidth, tickHeight);
    context.fillStyle = "#12244a";
    const spacing = 5;
    const reach = (Math.asin(Math.min(1, tickWidth / 2 / radius)) * 180) / Math.PI + spacing;
    const turned = position * STEP_DEGREES;
    const first = Math.ceil((turned - reach) / spacing);
    const last = Math.floor((turned + reach) / spacing);
    for (let tick = first; tick <= last; tick++) {
      const long = tick % 5 === 0;
      const angle = ((tick * spacing - turned) * Math.PI) / 180;
      context.save();
      context.translate(tickWidth / 2 + Math.sin(angle) * radius, rimOffset + radius * (1 - Math.cos(angle)));
      context.rotate(angle);
      context.globalAlpha = long ? 1 : 0.45;
      context.fillRect(-1, 2, 2, long ? 32 : 14);
      context.restore();
    }
  };

  useEffect(() => {
    const measure = () => {
      const el = section.current;
      const rimEl = rim.current;
      const canvas = ticks.current;
      if (!el || !rimEl || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      metrics.current = {
        top: el.getBoundingClientRect().top + window.scrollY - HEADER,
        stepPixels: (el.offsetHeight - (window.innerHeight - HEADER)) / SCROLL_STEPS,
        radius: rimEl.offsetWidth / 2,
        tickWidth: box.width,
        tickHeight: box.height,
        rimOffset: rimEl.getBoundingClientRect().top - box.top,
        dpr,
      };
      lastDrawn.current = { position: Number.NaN, steps: Number.NaN };
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  // The rest of the photos follow once the first screen is up.
  useEffect(() => {
    const go = () => setTimeout(() => setLoadAll(true), 300);
    if (document.readyState === "complete") {
      const timer = go();
      return () => clearTimeout(timer);
    }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  // Everything per-frame goes straight to the element's transform: no React work while turning.
  useAnimationFrame((_, delta) => {
    const { top, stepPixels, radius } = metrics.current;
    const steps = Math.max(0, (scrollY.get() - top) / stepPixels);
    const target = wheelPosition(steps);
    const blend = 1 - Math.exp(-Math.min(delta, 50) / 70);
    shownPosition.current += (target - shownPosition.current) * blend;
    if (Math.abs(target - shownPosition.current) < 0.0004) shownPosition.current = target;
    const position = shownPosition.current;

    // At rest nothing changes, so nothing is written.
    if (position === lastDrawn.current.position && steps === lastDrawn.current.steps) return;
    lastDrawn.current = { position, steps };

    const stepRadians = (STEP_DEGREES * Math.PI) / 180;

    RIDES.forEach((_, i) => {
      const item = itemRefs.current[i];
      if (!item) return;
      const offset = offsetOnWheel(i, position);
      offsets.current[i] = offset;
      const distance = Math.abs(offset);
      if (distance > 1.75) {
        if (item.style.visibility !== "hidden") item.style.visibility = "hidden";
        return;
      }
      if (item.style.visibility !== "visible") item.style.visibility = "visible";
      const angle = offset * stepRadians;
      const size = 1 - 0.42 * Math.min(1, distance) - 0.16 * clamp01(distance - 1);
      const opening = offset < 0 ? smooth(clamp01((steps - INTRO_STEPS * 0.25) / (INTRO_STEPS * 0.55))) : 1;
      const opacity = (1 - smooth(clamp01((distance - 1.25) / 0.5))) * opening;
      item.style.transform = `translate3d(${(Math.sin(angle) * radius).toFixed(2)}px, ${(radius * (1 - Math.cos(angle))).toFixed(2)}px, 0) rotate(${(offset * STEP_DEGREES).toFixed(3)}deg) scale(${size.toFixed(4)})`;
      item.style.opacity = opacity.toFixed(3);
      const z = String(100 - Math.round(distance * 10));
      if (written.current.z[i] !== z) {
        written.current.z[i] = z;
        item.style.zIndex = z;
      }
    });

    drawTicks(position);

    const wrapped = ((position % COUNT) + COUNT) % COUNT;
    RIDES.forEach((_, i) => {
      const tint = tintRefs.current[i];
      if (!tint) return;
      const away = Math.abs(offsetOnWheel(i, wrapped));
      const show = (1 - clamp01(away)).toFixed(3);
      if (written.current.tints[i] === show) return;
      written.current.tints[i] = show;
      tint.style.opacity = show;
      tint.style.visibility = show === "0.000" ? "hidden" : "visible";
    });

    const introAmount = clamp01(steps / (INTRO_STEPS * 0.7));
    if (intro.current) {
      intro.current.style.opacity = (1 - smooth(clamp01(introAmount * 1.5))).toFixed(3);
      intro.current.style.transform = `translate3d(0, ${(-28 * introAmount).toFixed(1)}px, 0)`;
      intro.current.style.visibility = introAmount >= 0.67 ? "hidden" : "visible";
      intro.current.inert = introAmount >= 0.67;
    }
    if (details.current) {
      const showDetails = smooth(clamp01((introAmount - 0.45) / 0.55));
      details.current.style.opacity = showDetails.toFixed(3);
      details.current.inert = showDetails < 0.5;
    }

    const nearest = ((Math.round(position) % COUNT) + COUNT) % COUNT;
    if (nearest !== shown.current) {
      shown.current = nearest;
      front.set(nearest);
    }
  });

  // Sideways drag or swipe turns the wheel; vertical swipes stay with the browser (touch-action: pan-y).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let startScroll = 0;
    let active = false;
    let dragging = false;
    let pointerId = -1;

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, [data-jump], .wheel-arrow")) return;
      active = true;
      dragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startScroll = window.scrollY;
      pointerId = e.pointerId;
    };
    const move = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - startY)) return;
        dragging = true;
        el.setPointerCapture(pointerId);
        el.classList.add("is-dragging");
      }
      const perStep = Math.max(180, el.clientWidth * 0.42);
      const next = startScroll - (dx / perStep) * metrics.current.stepPixels;
      lenis.current?.scrollTo(Math.max(metrics.current.top, Math.min(stopAt(COUNT - 1), next)), { immediate: true, force: true });
    };
    const up = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      el.classList.remove("is-dragging");
      if (!dragging) return;
      dragging = false;
      justDragged.current = true;
      window.setTimeout(() => {
        justDragged.current = false;
      }, 60);
      goTo(Math.round(Math.max(0, shownPosition.current + Math.sign(startX - e.clientX) * 0.2)));
    };
    const cancel = () => {
      active = false;
      dragging = false;
      el.classList.remove("is-dragging");
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
    };
    // Helpers read refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow keys turn the wheel while it is on screen.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const el = section.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (box.top > HEADER + 1 || box.bottom < window.innerHeight) return;
      e.preventDefault();
      goTo(current() + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Name list clicks arrive here so FrontDetails needs no knowledge of scrolling.
  const onDetailsClick = (e: React.MouseEvent) => {
    const jump = (e.target as HTMLElement).closest<HTMLElement>("[data-jump]");
    if (jump) goTo(Number(jump.dataset.jump));
  };

  // Decode every photo up front so none appears late when it first rides in.
  useEffect(() => {
    itemRefs.current.forEach((item) => {
      const img = item?.querySelector("img");
      img?.decode?.().catch(() => {});
    });
  }, [loadAll]);

  return (
    <section ref={section} aria-label="Meet the vehicles" className="wheel-scroll">
      <div ref={stage} className="wheel-stage">
        {RIDES.map((ride, i) => (
          <div
            key={ride.vehicle}
            ref={(el) => {
              tintRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundColor: ride.stage, opacity: i === 0 ? 1 : 0 }}
          />
        ))}

        <div ref={rim} aria-hidden="true" className="wheel-rim" />
        <canvas ref={ticks} aria-hidden="true" className="wheel-ticks" />

        <div className="wheel-rides">
          {RIDES.map((ride, i) => (
            <Ride key={ride.vehicle} index={i} load={i < 2 || loadAll} register={register} offsets={offsets} onBringForward={bringForward} />
          ))}
        </div>

        <div ref={intro} className="wheel-intro">
          <h1 className="display text-[clamp(3.1rem,9.4vw,9rem)]">
            Petrol se
            <br />
            azaadi
          </h1>
          <p className="mt-4 max-w-[30ch] text-[length:var(--step-lead)] leading-snug font-medium md:mt-6">
            Electric scooters and bikes built in Pakistan, from Rs 158,000.
          </p>
          <a href="https://msjaguarmotorcycles.com/pages/find-a-dealer" target="_blank" rel="noreferrer" className="btn btn-navy mt-5 md:mt-7">
            Book a test ride
          </a>
        </div>

        <div ref={details} className="wheel-details" style={{ opacity: 0 }} onClick={onDetailsClick}>
          <FrontDetails front={front} onStep={(by) => goTo(current() + by)} />
        </div>
      </div>
    </section>
  );
}
