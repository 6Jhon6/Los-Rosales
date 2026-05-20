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
  id_conductor?: number;
  dni: string;
  name: string;
  lastname: string;
  phone: string;
  dniFront?: string;
  dniBack?: string;
};

export type VehicleEntry = {
  id: string;
  plate1: string;
  plate2: string;
  ownership: "particular" | "shon" | "abonado";
  type: string;
  entryTime: string;
  entryDate: string;
  entryTimestamp: number;
  images: string[];
  status: "active" | "exited";
  exitId?: string;
  precio?: Precio;
  exitTime?: ReactNode;
  exitTimestamp?: number;
  driver?: Driver;
  id_conductor?: number;
  totalToPay?: number;
  vehicleImage?: string;
};

export type Precio = {
  horas: number;
  diario: number;
  shon_horas: number;
  shon_diario: number;
};
