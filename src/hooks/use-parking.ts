"use client";

import { useState, useMemo } from "react";
import {
  type VehicleEntry,
  type VehicleType,
  type Driver,
} from "@/types/parking";

export interface Precio {
  horas: number;
  diario: number;
}

export function useParking() {
  const [entries, setEntries] = useState<VehicleEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<VehicleEntry | null>(null);

  /* =========================
     REGISTRAR INGRESO
  ========================== */
  const registerEntry = (data: {
    plate1: string;
    plate2: string;
    ownership: "particular" | "shon" | "abonado";
    type: VehicleType;
    driver?: Driver;
    images?: string[];
    vehicleImage?: string;
  }) => {
    const now = new Date();

    const newEntry: VehicleEntry = {
      id: `PK-${Math.floor(1000 + Math.random() * 9000)}`,
      plate1: data.plate1,
      plate2: data.plate2,
      ownership: data.ownership,
      type: data.type,
      entryDate: now.toLocaleDateString("es-ES"),
      entryTime: now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      entryTimestamp: now.getTime(),
      status: "active",
      images: data.images || [],
      vehicleImage: data.vehicleImage,
      driver: data.driver,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setCurrentEntry(newEntry);

    return newEntry;
  };

  /* =========================
     ACTUALIZAR REGISTRO
  ========================== */
  const updateEntry = (id: string, updates: Partial<VehicleEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );

    if (currentEntry?.id === id) {
      setCurrentEntry((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  /* =========================
     CALCULAR PAGO (DINÁMICO)
  ========================== */
  const calculatePayment = (entryTimestamp: number, precio: Precio) => {
    const now = Date.now();
    const diffMs = now - entryTimestamp;

    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    const days = Math.floor(diffMs / DAY);
    const hours = Math.floor((diffMs % DAY) / HOUR);
    const minutes = Math.floor((diffMs % HOUR) / MINUTE);

    /* =========================
     CÁLCULO DE PAGO (igual que antes)
  ========================== */
    const totalHours = Math.ceil(diffMs / HOUR);
    const diffDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    let total = 0;

    if (diffDays > 0) {
      total += diffDays * precio.diario;
      if (remainingHours > 0) {
        total += precio.horas;
      }
    } else {
      total = precio.horas;
    }

    /* =========================
     FORMATO DE TIEMPO
  ========================== */
    const timeString = [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      total,
      days,
      hours,
      minutes,
      timeString,
    };
  };

  /* =========================
     CONFIRMAR SALIDA
  ========================== */
  const confirmExit = (id: string, precio: Precio) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    const now = new Date();
    const { total } = calculatePayment(entry.entryTimestamp, precio);

    updateEntry(id, {
      status: "exited",
      exitTime: now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      exitTimestamp: now.getTime(),
      totalToPay: total,
    });
  };

  /* =========================
     DERIVADOS
  ========================== */
  const activeEntries = useMemo(
    () => entries.filter((e) => e.status === "active"),
    [entries],
  );

  const exitedEntries = useMemo(
    () => entries.filter((e) => e.status === "exited"),
    [entries],
  );

  const totalRevenue = exitedEntries.reduce(
    (acc, curr) => acc + (curr.totalToPay || 0),
    0,
  );

  return {
    entries,
    currentEntry,
    setCurrentEntry,
    registerEntry,
    updateEntry,
    confirmExit,
    calculatePayment,
    activeEntries,
    exitedEntries,
    stats: {
      total: entries.length,
      active: activeEntries.length,
      exited: exitedEntries.length,
      revenue: totalRevenue,
      capacity: 50,
      occupancy: Math.round((activeEntries.length / 50) * 100),
    },
  };
}
