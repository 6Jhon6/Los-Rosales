import { supabase } from "./supabaseClient";

function getPlaca(data: any): string {
  if (!data) return "???";
  
  if (Array.isArray(data)) {
    const v = data[0];
    if (v && typeof v === 'object' && 'placa_1' in v) {
      return v.placa_1;
    }
    if (v && typeof v === 'object' && v.vehiculos) {
      return Array.isArray(v.vehiculos) ? v.vehiculos[0]?.placa_1 : v.vehiculos.placa_1;
    }
  }
  
  if (typeof data === 'object' && 'placa_1' in data) {
    return data.placa_1;
  }
  
  if (typeof data === 'object' && data.vehiculos) {
    return Array.isArray(data.vehiculos) ? data.vehiculos[0]?.placa_1 : data.vehiculos.placa_1;
  }
  
  return "???";
}

export async function obtenerActividadReciente() {
  const { data: ingresos } = await supabase
    .from("ingresos")
    .select(
      `
    created_at,
    vehiculos ( placa_1 )
  `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: salidas } = await supabase
    .from("salidas")
    .select(
      `
    precio,
    created_at,
    ingresos (
      vehiculos (
        placa_1
      )
    )
  `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const actividades = [
    ...(ingresos ?? []).map((i) => ({
      tipo: "ingreso",
      placa: getPlaca(i.vehiculos),
      fecha: i.created_at,
    })),

    ...(salidas ?? []).map((s) => ({
      tipo: "salida",
      placa: getPlaca(s.ingresos),
      monto: s.precio,
      fecha: s.created_at,
    })),
  ];

  return actividades
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 10);
}
