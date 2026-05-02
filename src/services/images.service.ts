import { supabase } from "./supabaseClient";
import { compressImage } from "@/lib/imageCompress";

/* ============================
   INGRESOS
============================ */
export async function uploadIngresoImage(
  ingresoId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file);

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
  const path = `${ingresoId}/${fileName}`;

  // 1️⃣ subir imagen a storage
  const { error: uploadError } = await supabase.storage
    .from("img_ingresos")
    .upload(path, compressed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 2️⃣ obtener url pública
  const { data } = supabase.storage.from("img_ingresos").getPublicUrl(path);

  const publicUrl = data.publicUrl;

  // 3️⃣ guardar registro en tabla img_ingresos
  const { error: dbError } = await supabase.from("img_ingresos").insert({
    ruta: publicUrl,
    id_ingreso: ingresoId,
  });

  if (dbError) throw dbError;

  return publicUrl;
}

export interface ImagenIngresoDB {
  id_img: number;
  ruta: string;
  id_ingreso: number;
}

export async function getIngresoImages(ingresoId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("img_ingresos")
    .select("ruta")
    .eq("id_ingreso", ingresoId)
    .order("id_img", { ascending: true });

  if (error) throw error;

  // 🔥 solo devolver las rutas
  return data?.map((img) => img.ruta) ?? [];
}

/* ============================
   SALIDAS
============================ */

export async function uploadSalidaImage(
  ingresoId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file);

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
  const path = `${ingresoId}/${fileName}`;

  // subir imagen
  const { error: uploadError } = await supabase.storage
    .from("img_salidas")
    .upload(path, compressed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // obtener url
  const { data } = supabase.storage.from("img_salidas").getPublicUrl(path);

  const publicUrl = data.publicUrl;

  // guardar en tabla
  const { error: dbError } = await supabase.from("img_salidas").insert({
    ruta: publicUrl,
    id_ingreso: ingresoId,
  });

  if (dbError) throw dbError;

  return publicUrl;
}

export interface ImagenSalidaDB {
  id_img: number;
  ruta: string;
  id_ingreso: number;
}

export async function getSalidaImages(ingresoId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("img_salidas")
    .select("ruta")
    .eq("id_ingreso", ingresoId)
    .order("id_img", { ascending: true });

  if (error) throw error;

  return data?.map((img) => img.ruta) ?? [];
}


/* ============================
   DNIs CONDUCTOR
============================ */

export async function uploadDniImage(
  conductorId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file);

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
  const path = `${conductorId}/${fileName}`;

  // subir a storage
  const { error: uploadError } = await supabase.storage
    .from("img_dnis")
    .upload(path, compressed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // obtener url
  const { data } = supabase.storage.from("img_dnis").getPublicUrl(path);

  const publicUrl = data.publicUrl;

  // guardar en tabla
  const { error: dbError } = await supabase.from("img_dnis").insert({
    ruta: publicUrl,
    id_conductor: conductorId,
  });

  if (dbError) throw dbError;

  return publicUrl;
}

export interface ImagenDniDB {
  id_img: number;
  ruta: string;
  id_conductor: number;
}

export async function getDniImages(
  conductorId: number,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("img_dnis")
    .select("ruta")
    .eq("id_conductor", conductorId)
    .order("id_img", { ascending: true });

  if (error) throw error;

  return data?.map((img) => img.ruta) ?? [];
}