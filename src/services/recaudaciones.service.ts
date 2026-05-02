import { supabase } from "./supabaseClient";

export interface RecaudacionDB {
  id_recaudacion: number;
  monto: number;
  id_salida: number;
}

/**
 * Registrar pago de una salida
 */
export async function registrarRecaudacion(
  idSalida: number,
  monto: number,
) {
  const { data, error } = await supabase
    .from("recaudaciones")
    .insert({
      monto: monto,
      id_salida: idSalida,
    })
    .select()
    .single();

  if (error) {
    console.error("Error registrando recaudación:", error);
    throw error;
  }

  return data;
}

/**
 * Obtener total recaudado del día
 */
export async function obtenerRecaudacionHoy(): Promise<number> {
  const hoy = new Date();

  const inicio = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    0,
    0,
    0
  ).toISOString();

  const fin = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    23,
    59,
    59
  ).toISOString();

  const { data, error } = await supabase
    .from("recaudaciones")
    .select("monto")
    .gte("created_at", inicio)
    .lte("created_at", fin);

  if (error) {
    console.error("Error obteniendo recaudación:", error);
    return 0;
  }

  const total = data.reduce((acc, row) => acc + Number(row.monto), 0);

  return total;
}