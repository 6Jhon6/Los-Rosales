import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */
export interface VehiculoDB {
  id_vehiculo: number;
  placa_1: string;
  placa_2: string | null;
  empresa: string;
  numero: number | null;
  id_precio: number;
}

/* =========================
   BUSCAR VEHÍCULOS POR PLACA
========================= */
export async function buscarVehiculosPorPlaca(placa: string) {
  if (!placa || placa.length < 2) return [];

  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .ilike("placa_1", `%${placa}%`)
    .limit(3);

  if (error) {
    console.error("Error buscando placas:", error);
    return [];
  }

  return data as VehiculoDB[];
}

/* =========================
   REGISTRAR INGRESO
========================= */
export async function registrarIngreso(id_vehiculo: number): Promise<number> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("ingresos")
    .insert({
      id_vehiculo,
      fecha_inicio: timestamp,
      hora_inicio: timestamp,
    })
    .select("id_ingreso")
    .single();

  if (error) {
    console.error("Error registrando ingreso:", error);
    throw error;
  }

  return data.id_ingreso;
}

/* =========================
   REGISTRAR VEHÍCULO + INGRESO
========================= */
interface RegistrarVehiculoParams {
  placa_1: string;
  placa_2?: string | null;
  empresa: string;
  numero?: number | null;
  id_precio: number;
}

export async function registrarVehiculoYIngreso(
  vehiculo: RegistrarVehiculoParams
): Promise<number> {
  // 1️⃣ Verificar si ya existe
  const { data: existente } = await supabase
    .from("vehiculos")
    .select("id_vehiculo")
    .eq("placa_1", vehiculo.placa_1)
    .maybeSingle();

  let id_vehiculo: number;

  if (existente) {
    // ✔ Ya existe → solo ingreso
    id_vehiculo = existente.id_vehiculo;
  } else {
    // 🆕 Registrar vehículo
    const { data, error } = await supabase
      .from("vehiculos")
      .insert({
        placa_1: vehiculo.placa_1,
        placa_2: vehiculo.placa_2 ?? null,
        empresa: vehiculo.empresa,
        numero: vehiculo.numero ?? null,
        id_precio: vehiculo.id_precio,
      })
      .select("id_vehiculo")
      .single();

    if (error) throw error;
    id_vehiculo = data.id_vehiculo;
  }

  // 2️⃣ Registrar ingreso y obtener ID
  const id_ingreso = await registrarIngreso(id_vehiculo);

  return id_ingreso;
}

export async function getVehiculos(limit: number = 20) {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .order("id_vehiculo", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error trayendo vehículos:", error);
    throw error;
  }

  return data as VehiculoDB[];
}