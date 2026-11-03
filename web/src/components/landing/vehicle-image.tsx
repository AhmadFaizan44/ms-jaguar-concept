"use client";

import { AnimatePresence, motion } from "motion/react";
import imageData from "@/data/vehicle-images.json";

export type VehicleImageInfo = { width: number; height: number; widths: number[]; ground: number };

export const vehicleImages = imageData as Record<string, VehicleImageInfo>;

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const srcSet = (image: string, ext: "avif" | "webp") =>
  vehicleImages[image].widths.map((w) => `${BASE}/vehicles/${image}-${w}.${ext} ${w}w`).join(", ");

type PictureProps = {
  image: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** A vehicle photo from the pre-sized set, ready before it moves on screen. */
export function VehiclePicture({ image, alt, sizes, priority, className }: PictureProps) {
  const { width, height, widths } = vehicleImages[image];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, "webp")} sizes={sizes} />
      <img
        src={`${BASE}/vehicles/${image}-${widths[0]}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        className={className}
      />
    </picture>
  );
}

type Props = {
  image: string;
  alt: string;
  sizes: string;
  preload?: boolean;
};

/** A vehicle standing on the bottom of its box; a new finish crossfades over the old one. */
export function VehicleImage({ image, alt, sizes, preload }: Props) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={image}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      >
        <VehiclePicture
          image={image}
          alt={alt}
          sizes={sizes}
          priority={preload}
          className="h-full w-full object-contain object-bottom select-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}
