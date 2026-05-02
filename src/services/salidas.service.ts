import { supabase } from "./supabaseClient";

interface CrearSalidaParams {
  id_ingreso: number;
  tiempo: string;
  precio: number;
}

export async function registrarSalida({
  id_ingreso,
  tiempo,
  precio,
}: CrearSalidaParams) {
  const now = new Date();

  // 1️⃣ Insertar en tabla salidas
  const { data, error: salidaError } = await supabase
    .from("salidas")
    .insert({
      id_ingreso: id_ingreso,
      fecha_salida: now,
      hora_salida: now,
      tiempo: tiempo,
      precio: precio,
    })
    .select()
    .single(); // 🔥 devuelve el registro creado

  if (salidaError) {
    throw new Error(salidaError.message);
  }

  // 2️⃣ Actualizar ingresos
  const { error: ingresoError } = await supabase
    .from("ingresos")
    .update({ salida: true })
    .eq("id_ingreso", id_ingreso);

  if (ingresoError) {
    throw new Error(ingresoError.message);
  }

  // 🔥 devolver la salida creada
  return data;
}

export async function obtenerSalidasHoy(): Promise<number> {
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
    .from("salidas")
    .select("*", { count: "exact", head: true })
    .gte("created_at", inicio)
    .lte("created_at", fin);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}