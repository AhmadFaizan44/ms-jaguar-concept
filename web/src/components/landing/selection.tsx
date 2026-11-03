"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { getVehicle, type Battery, type Finish, type Vehicle } from "@/data/vehicles";

type Selection = {
  vehicle: Vehicle;
  finish: Finish;
  battery: Battery;
  /** Pick a vehicle, optionally in a given finish. */
  choose: (vehicleId: string, finishId?: string) => void;
  setFinish: (finishId: string) => void;
  setBattery: (batteryId: string) => void;
};

const SelectionContext = createContext<Selection | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [vehicleId, setVehicleId] = useState("m1");
  const [finishId, setFinishId] = useState("pearl-white");
  const [batteryId, setBatteryId] = useState("graphene");

  const choose = useCallback((id: string, finish?: string) => {
    const next = getVehicle(id);
    setVehicleId(id);
    setFinishId(finish ?? next.finishes[0].id);
    setBatteryId(next.batteries[0].id);
  }, []);

  const value = useMemo<Selection>(() => {
    const vehicle = getVehicle(vehicleId);
    return {
      vehicle,
      finish: vehicle.finishes.find((f) => f.id === finishId) ?? vehicle.finishes[0],
      battery: vehicle.batteries.find((b) => b.id === batteryId) ?? vehicle.batteries[0],
      choose,
      setFinish: setFinishId,
      setBattery: setBatteryId,
    };
  }, [vehicleId, finishId, batteryId, choose]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const value = useContext(SelectionContext);
  if (!value) throw new Error("useSelection must be used inside SelectionProvider");
  return value;
}

/** False on the server, so the first paint is always the motion-free markup. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
