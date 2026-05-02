import type { ReactNode } from "react"

export type VehicleType = string

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "operator"
  avatar?: string
}


export type Driver = {
  id_conductor: number;
  dni: string;
  name: string;
  lastname: string;
  phone: string;
  dniFront?: string;
  dniBack?: string;
};

export type VehicleEntry = {
  exitId: any
  precio: any
  exitTime: ReactNode
  driver: any
  id: string;
  plate1: string;
  plate2: string;
  ownership: "particular" | "shon" | "abonado";
  type: string; // viene desde BD
  entryTime: string;
  entryDate: string;
  entryTimestamp: number;
  images: string[];
  status: "active" | "exited";
  totalToPay?: number;
};
