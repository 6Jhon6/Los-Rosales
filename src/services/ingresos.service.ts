// services/ingresos.service.ts
import { supabase } from "./supabaseClient";

export interface IngresoDB {
  conductores: any;
  id_ingreso: number;
  id_conductor: number | null;
  fecha_inicio: string;
  hora_inicio: string;
  vehiculos: {
    empresa: "PARTICULAR" | "SHON" | "ABONADO";
    placa_1: string;
    placa_2: string | null;
    precios:
      | {
          tipo_vehiculo: string;
          horas: number;
          diario: number;
          shon_horas: number;
          shon_diario: number;
        }[]
      | null;
  }[];
}

export async function getIngresos(): Promise<IngresoDB[]> {
  const { data, error } = await supabase
    .from("ingresos")
    .select(
      `
    id_ingreso,
    id_conductor,
    fecha_inicio,
    hora_inicio,
    vehiculos (
      placa_1,
      placa_2,
      empresa,
      precios ( 
        tipo_vehiculo,
        horas,
        diario,
        shon_horas,
        shon_diario
       )
    ),
    conductores (
      nombre,
      apellidos,
      dni,
      telefono
    )
  `,
    )
    .eq("salida", false)
    .order("fecha_inicio", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function actualizarConductorEnIngreso(
  idIngreso: number,
  idConductor: number,
) {
  const { error } = await supabase
    .from("ingresos")
    .update({ id_conductor: idConductor })
    .eq("id_ingreso", idIngreso);

  if (error) throw error;
}

export async function obtenerIngresosHoy(): Promise<number> {
  const hoy = new Date();

  const inicio = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    0,0,0
  ).toISOString();

  const fin = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    23,59,59
  ).toISOString();

  const { count, error } = await supabase
    .from("ingresos")
    .select("*", { count: "exact", head: true })
    .gte("created_at", inicio)
    .lte("created_at", fin);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}