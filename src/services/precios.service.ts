import { supabase } from "./supabaseClient";

export interface PrecioDB {
  id_precio: number;
  tipo_vehiculo: string;
  horas: number;
  diario: number;
}

export async function getPrecios(): Promise<PrecioDB[]> {
  const { data, error } = await supabase
    .from("precios")
    .select("id_precio, tipo_vehiculo, horas, diario");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
