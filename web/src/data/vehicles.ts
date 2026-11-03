// Every figure here comes from msjaguarmotorcycles.com product pages (read November 2026).

export type Finish = {
  id: string;
  name: string;
  /** Paint colour for the swatch. */
  paint: string;
  /** Full-screen colour this finish takes over the page with. */
  field: string;
  /** Text colour that stays readable on the field. */
  ink: string;
  /** File in /public/vehicles, without extension. Empty when no photo of this finish exists. */
  image: string;
};

export type Battery = { id: string; name: string; price: number; note: string };

export type Vehicle = {
  id: string;
  name: string;
  kind: "scooter" | "bike";
  tagline: string;
  range: string;
  topSpeed: string;
  charging?: string;
  /** Which way the vehicle points in its photos. Motion always travels this way. */
  faces: "left" | "right";
  finishes: Finish[];
  batteries: Battery[];
  url: string;
};

const GRAPHENE = "Lower price, standard charging.";
const LFP = "Fast charging and a longer warranty.";
const base = "https://msjaguarmotorcycles.com/products/";

export const vehicles: Vehicle[] = [
  {
    id: "miso",
    name: "Miso",
    kind: "scooter",
    tagline: "Designed for comfort.",
    range: "70 km",
    topSpeed: "45 km/h",
    charging: "5-6 hours",
    faces: "right",
    url: base + "ms-jaguar-miso",
    batteries: [{ id: "graphene", name: "Graphene", price: 158000, note: GRAPHENE }],
    finishes: [
      { id: "blush-pink", name: "Blush Pink", paint: "#EFA6BE", field: "#F4B6C8", ink: "#2B0F1C", image: "miso-blush-pink" },
      { id: "cream-white", name: "Cream White", paint: "#EFE6D2", field: "#0F3D3E", ink: "#F5EBD8", image: "miso-cream-white" },
      { id: "deep-black", name: "Deep Black", paint: "#17171A", field: "#D9B48A", ink: "#1A1208", image: "miso-deep-black" },
    ],
  },
  {
    id: "bolt",
    name: "Bolt",
    kind: "scooter",
    tagline: "Engineered for control.",
    range: "80-100 km",
    topSpeed: "50 km/h",
    faces: "right",
    url: base + "ms-jaguar-bolt",
    batteries: [
      { id: "graphene", name: "Graphene", price: 174000, note: GRAPHENE },
      { id: "lfp", name: "LFP", price: 230000, note: LFP },
    ],
    finishes: [
      { id: "graphite-grey", name: "Graphite Grey", paint: "#7E8890", field: "#C8F04A", ink: "#10180A", image: "bolt-graphite-grey" },
      { id: "midnight-black", name: "Midnight Black", paint: "#17171A", field: "#D8C3A5", ink: "#17120A", image: "bolt-midnight-black" },
    ],
  },
  {
    id: "m1",
    name: "M1",
    kind: "scooter",
    tagline: "Refinement in motion.",
    range: "90-100 km",
    topSpeed: "60 km/h",
    faces: "right",
    url: base + "ms-jaguar-m1",
    batteries: [
      { id: "graphene", name: "Graphene", price: 204000, note: GRAPHENE },
      { id: "lfp", name: "LFP", price: 250000, note: LFP },
    ],
    finishes: [
      { id: "crimson-black", name: "Crimson Black", paint: "#C81E2D", field: "#D71F30", ink: "#FFFFFF", image: "m1-crimson-black" },
      { id: "pearl-white", name: "Pearl White", paint: "#F3F3F0", field: "#12244A", ink: "#FFFFFF", image: "m1-pearl-white" },
      { id: "matte-black", name: "Matte Black", paint: "#2A2B2E", field: "#E5AE27", ink: "#1A1204", image: "m1-matte-black" },
    ],
  },
  {
    id: "legacy",
    name: "Legacy",
    kind: "scooter",
    tagline: "Beyond the ordinary.",
    range: "115 km",
    topSpeed: "65 km/h",
    charging: "8-8.5 hours",
    faces: "left",
    url: base + "ms-jaguar-legacy",
    batteries: [{ id: "graphene", name: "Graphene", price: 245000, note: GRAPHENE }],
    finishes: [
      { id: "arctic-white", name: "Arctic White", paint: "#ECEFF1", field: "#0B6E7F", ink: "#FFFFFF", image: "legacy-arctic-white" },
      { id: "titanium-grey", name: "Titanium Grey", paint: "#7C8A99", field: "#F27A30", ink: "#1A0A02", image: "legacy-titanium-grey" },
      { id: "midnight-black", name: "Midnight Black", paint: "#15161A", field: "#5CE1D0", ink: "#06201D", image: "legacy-midnight-black" },
    ],
  },
  {
    id: "miso-3w",
    name: "Miso 3-W",
    kind: "scooter",
    tagline: "Three wheels, retro curves.",
    range: "80 km",
    topSpeed: "45 km/h",
    charging: "7 hours",
    faces: "right",
    url: base + "ms-jaguar-miso-3-w-electric-scooter",
    batteries: [{ id: "graphene", name: "Graphene", price: 228000, note: GRAPHENE }],
    finishes: [
      { id: "blush-pink", name: "Blush Pink", paint: "#EFA6BE", field: "#F7CBD8", ink: "#2B0F1C", image: "miso3w-blush-pink" },
      { id: "cream-white", name: "Cream White", paint: "#EFE6D2", field: "#0F3D3E", ink: "#F5EBD8", image: "" },
      { id: "deep-black", name: "Deep Black", paint: "#17171A", field: "#D9B48A", ink: "#1A1208", image: "" },
    ],
  },
  {
    id: "e70",
    name: "E-70",
    kind: "bike",
    tagline: "Built by the pioneers.",
    range: "90-100 km",
    topSpeed: "70 km/h",
    charging: "About 2.5 hours",
    faces: "left",
    url: base + "ms-jaguar-e-70",
    batteries: [{ id: "lfp", name: "LFP", price: 265000, note: LFP }],
    finishes: [
      { id: "red", name: "Red", paint: "#D81E1E", field: "#F5F0E6", ink: "#1B1B1B", image: "e70-red" },
      { id: "black", name: "Black", paint: "#15161A", field: "#E5AE27", ink: "#1A1204", image: "e70-black" },
    ],
  },
  {
    id: "e70-supreme",
    name: "E-70 Supreme",
    kind: "bike",
    tagline: "Elevated design.",
    range: "90-100 km",
    topSpeed: "70 km/h",
    charging: "About 2.5 hours",
    faces: "left",
    url: base + "ms-jaguar-e-70-supreme",
    batteries: [{ id: "lfp", name: "LFP", price: 275000, note: LFP }],
    finishes: [
      { id: "blue", name: "Blue", paint: "#1740D0", field: "#FFD21F", ink: "#0B1330", image: "e70s-blue" },
      { id: "red", name: "Red", paint: "#D81E1E", field: "#12244A", ink: "#FFFFFF", image: "e70s-red" },
      { id: "black", name: "Black", paint: "#15161A", field: "#C8F04A", ink: "#10180A", image: "e70s-black" },
    ],
  },
  {
    id: "e125",
    name: "E-125",
    kind: "bike",
    tagline: "Flagship power.",
    range: "150-170 km",
    topSpeed: "70 km/h",
    charging: "About 2.5 hours",
    faces: "right",
    url: base + "ms-jaguar-e-125",
    batteries: [{ id: "lfp", name: "LFP", price: 370000, note: LFP }],
    finishes: [
      { id: "red", name: "Red", paint: "#B3121C", field: "#101418", ink: "#FFFFFF", image: "e125-red" },
      { id: "black", name: "Black", paint: "#15161A", field: "#D71F30", ink: "#FFFFFF", image: "e125-black" },
    ],
  },
];

export const getVehicle = (id: string) => vehicles.find((v) => v.id === id) ?? vehicles[0];

export const formatPrice = (rs: number) => `Rs ${rs.toLocaleString("en-US")}`;

export const startingPrice = (v: Vehicle) => Math.min(...v.batteries.map((b) => b.price));

export const dealerLinks = [
  { name: "Lahore", href: "https://msjaguarmotorcycles.com/pages/ms-jaguar-electric-bike-scooter-dealers-in-lahore" },
  { name: "Faisalabad", href: "https://msjaguarmotorcycles.com/pages/ms-jaguar-electric-bike-scooter-dealers-in-faisalabad" },
  { name: "Islamabad & Rawalpindi", href: "https://msjaguarmotorcycles.com/pages/ms-jaguar-electric-bike-scooter-dealer-in-islamabad-rawalpindi" },
  { name: "Multan", href: "https://msjaguarmotorcycles.com/pages/ms-jaguar-electric-bike-scooter-dealer-in-multan" },
  { name: "Bahawalpur", href: "https://msjaguarmotorcycles.com/pages/electric-bike-electric-scooter-dealer-in-bahawalpur-ms-jaguar-3s-flagship-showroom" },
  { name: "All 60+ cities", href: "https://msjaguarmotorcycles.com/pages/find-a-dealer" },
];
