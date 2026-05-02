import { supabase } from "./supabaseClient";

export interface ConductorDB {
  id_conductor: number;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  ruta_anverso?: string;
  ruta_reverso?: string;
}

export async function crearOActualizarConductor(data: {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  ruta_anverso?: string;
  ruta_reverso?: string;
}): Promise<number> {
  // ✅ Normalizar datos
  const normalizado = {
    nombre: data.nombre.trim().toUpperCase(),
    apellidos: data.apellidos.trim().toUpperCase(),
    dni: data.dni.trim().toUpperCase(),
    telefono: data.telefono.trim(),
    ruta_anverso: data.ruta_anverso || null,
    ruta_reverso: data.ruta_reverso || null,
  };

  // 1️⃣ Verificar si ya existe por DNI
  const { data: existente } = await supabase
    .from("conductores")
    .select("id_conductor")
    .eq("dni", normalizado.dni)
    .maybeSingle();

  if (existente) {
    // 2️⃣ Actualizar
    await supabase
      .from("conductores")
      .update({
        nombre: normalizado.nombre,
        apellidos: normalizado.apellidos,
        telefono: normalizado.telefono,
        ruta_anverso: normalizado.ruta_anverso,
        ruta_reverso: normalizado.ruta_reverso,
      })
      .eq("id_conductor", existente.id_conductor);

    return existente.id_conductor;
  }

  // 3️⃣ Crear
  const { data: nuevo, error } = await supabase
    .from("conductores")
    .insert(normalizado)
    .select("id_conductor")
    .single();

  if (error) throw error;

  return nuevo.id_conductor;
}

export async function getConductores(): Promise<ConductorDB[]> {
  const { data, error } = await supabase
    .from("conductores")
    .select("id_conductor, nombre, apellidos, dni, telefono")
    .neq("id_conductor", 1) // ❌ excluir id 1
    .order("apellidos", { ascending: true })
    .limit(20); // 🔢 solo 20

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function buscarConductoresPorDni(
  dni: string,
): Promise<ConductorDB[]> {
  if (!dni || dni.length < 2) return [];

  const { data, error } = await supabase
    .from("conductores")
    .select("id_conductor, nombre, apellidos, dni, telefono")
    .ilike("dni", `%${dni}%`)
    .limit(3);

  if (error) {
    console.error("Error buscando conductores:", error);
    return [];
  }

  return data ?? [];
}
