import { supabase } from "./supabaseClient";

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
      placa: i.vehiculos?.[0]?.placa_1 ?? "???",
      fecha: i.created_at,
    })),

    ...(salidas ?? []).map((s) => ({
      tipo: "salida",
      placa: s.ingresos?.[0]?.vehiculos?.[0]?.placa_1 ?? "???",
      monto: s.precio,
      fecha: s.created_at,
    })),
  ];

  return actividades
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 10);
}
