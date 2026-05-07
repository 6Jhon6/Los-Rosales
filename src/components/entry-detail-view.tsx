"use client";

import { useState, useEffect } from "react";
import type { VehicleEntry, Driver } from "@/types/parking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Maximize2, X, Pencil, User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  crearOActualizarConductor,
  buscarConductoresPorDni,
  getConductorPorId,
  type ConductorDB,
} from "@/services/conductores.service";
import { actualizarConductorEnIngreso } from "@/services/ingresos.service";
import { supabase } from "@/services/supabaseClient";
import {
  uploadIngresoImage,
  getIngresoImages,
  uploadDniImageFromBase64,
} from "@/services/images.service";

interface EntryDetailViewProps {
  entry: VehicleEntry;
  onUpdate: (id: string, updates: Partial<VehicleEntry>) => void;
  onBack: () => void;
}

export function EntryDetailView({
  entry,
  onUpdate,
  onBack,
}: EntryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "images" | "driver">(
    "detail",
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<string[]>(entry.images || []);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const [isEditingDriver, setIsEditingDriver] = useState(!entry.driver);

  const [driverForm, setDriverForm] = useState<Driver>(
    entry.driver || {
      name: "",
      lastname: "",
      dni: "",
      phone: "",
      dniFront: "",
      dniBack: "",
    },
  );

  const [dniSuggestions, setDniSuggestions] = useState<ConductorDB[]>([]);
  const [dniLocked, setDniLocked] = useState(false);

  const [dniFrontPreview, setDniFrontPreview] = useState<string | null>(null);
  const [dniBackPreview, setDniBackPreview] = useState<string | null>(null);

  const [originalDniFront, setOriginalDniFront] = useState<string | null>(null);
  const [originalDniBack, setOriginalDniBack] = useState<string | null>(null);

  const [driverSaveSuccess, setDriverSaveSuccess] = useState(false);

  useEffect(() => {
    const loadDriverData = async () => {
      if (!entry.driver?.id_conductor) return;

      if (entry.driver.id_conductor === 1) {
        setDriverForm({
          id_conductor: 1,
          name: "",
          lastname: "",
          dni: "",
          phone: "",
          dniFront: "",
          dniBack: "",
        });
        setDniFrontPreview(null);
        setDniBackPreview(null);
        setDniLocked(false);
        setDniSuggestions([]);
        setIsEditingDriver(true);
        return;
      }

      try {
        const conductor = await getConductorPorId(entry.driver.id_conductor);
        if (conductor) {
          setDriverForm({
            id_conductor: conductor.id_conductor,
            name: conductor.nombre,
            lastname: conductor.apellidos,
            dni: conductor.dni,
            phone: conductor.telefono,
            dniFront: conductor.ruta_anverso || "",
            dniBack: conductor.ruta_reverso || "",
          });

          if (conductor.ruta_anverso) {
            setDniFrontPreview(conductor.ruta_anverso);
            setOriginalDniFront(conductor.ruta_anverso);
          }
          if (conductor.ruta_reverso) {
            setDniBackPreview(conductor.ruta_reverso);
            setOriginalDniBack(conductor.ruta_reverso);
          }

          setIsEditingDriver(false);
        }
      } catch (err) {
        console.error("Error cargando datos del conductor", err);
      }
    };

    loadDriverData();
  }, [entry.driver?.id_conductor]);

  const [driverOriginal, setDriverOriginal] = useState(driverForm);

  const saveDriver = async () => {
    try {
      if (!driverForm.dni || !driverForm.name || !driverForm.lastname || !driverForm.phone) {
        alert("Por favor complete todos los campos requeridos");
        return;
      }

      const normalizedData = {
        nombre: driverForm.name?.trim().toUpperCase(),
        apellidos: driverForm.lastname?.trim().toUpperCase(),
        dni: driverForm.dni?.trim().toUpperCase(),
        telefono: driverForm.phone?.trim().toUpperCase(),
      };

      const idConductor = await crearOActualizarConductor({
        ...normalizedData,
        ruta_anverso: undefined,
        ruta_reverso: undefined,
      });

      let rutaAnverso: string | null = originalDniFront;
      let rutaReverso: string | null = originalDniBack;

      if (dniFrontPreview === null) {
        rutaAnverso = null;
      } else if (dniFrontPreview && dniFrontPreview.startsWith("data:")) {
        rutaAnverso = await uploadDniImageFromBase64(
          String(idConductor),
          dniFrontPreview,
          "anverso",
        );
      }

      if (dniBackPreview === null) {
        rutaReverso = null;
      } else if (dniBackPreview && dniBackPreview.startsWith("data:")) {
        rutaReverso = await uploadDniImageFromBase64(
          String(idConductor),
          dniBackPreview,
          "reverso",
        );
      }

      await supabase
        .from("conductores")
        .update({
          ruta_anverso: rutaAnverso,
          ruta_reverso: rutaReverso,
        })
        .eq("id_conductor", idConductor);

      await actualizarConductorEnIngreso(Number(entry.id), idConductor);

      const normalizedDriver = {
        id_conductor: idConductor,
        name: normalizedData.nombre,
        lastname: normalizedData.apellidos,
        dni: normalizedData.dni,
        phone: normalizedData.telefono,
        dniFront: rutaAnverso || "",
        dniBack: rutaReverso || "",
      };

      setDriverForm(normalizedDriver);

      setDniFrontPreview(rutaAnverso);
      setDniBackPreview(rutaReverso);
      setOriginalDniFront(rutaAnverso);
      setOriginalDniBack(rutaReverso);

      onUpdate(entry.id, {
        driver: normalizedDriver,
      });

      setIsEditingDriver(false);
      setDriverSaveSuccess(true);
      setTimeout(() => setDriverSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error guardando conductor:", error);
      alert("Error al guardar el conductor");
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      if (!entry.id || isNaN(Number(entry.id))) return;
      
      try {
        const imgs = await getIngresoImages(Number(entry.id));

        onUpdate(entry.id, {
          images: imgs,
        });

        setLocalImages(imgs);
      } catch (err) {
        console.error("Error cargando imágenes", err);
      }
    };

    loadImages();
  }, [entry.id]);

  useEffect(() => {
    setLocalImages(entry.images || []);
  }, [entry.images]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-muted/50"
          onClick={onBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-black font-mono">{entry.plate1}</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase">
            ID: {entry.id}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1.5 rounded-2xl border">
        {["detail", "images", "driver"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            className="rounded-xl h-10 font-bold text-xs"
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "detail" && "Detalle"}
            {tab === "images" && "Fotos"}
            {tab === "driver" && "Conductor"}
          </Button>
        ))}
      </div>

      {activeTab === "detail" && (
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* ID + ESTADO */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground">
                  ID Registro
                </p>
                <p className="text-xl font-black">{entry.id}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  entry.status === "active"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.status === "active"
                  ? "ESTACIONADO"
                  : "SALIDA REGISTRADA"}
              </span>
            </div>

            {/* PLACAS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Placa Principal
                </p>
                <p className="font-bold text-lg">{entry.plate1}</p>
              </div>

              <div className="p-3 bg-muted rounded-xl">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Placa Secundaria
                </p>
                <p className="font-bold text-lg">{entry.plate2 || "-"}</p>
              </div>
            </div>

            {/* DETALLE */}
            <div className="space-y-3">
              <DetailRow
                label="Tipo de Vehículo"
                value={entry.type}
                capitalize
              />
              <DetailRow label="Propiedad" value={entry.ownership} uppercase />
              <DetailRow
                label="Fecha de Ingreso"
                value={formatDateDMY(entry.entryDate)}
              />
              <DetailRow
                label="Hora de Ingreso"
                value={formatTimeAMPM(entry.entryTime)}
              />

              {entry.status === "exited" && (
                <>
                  <div className="flex justify-between text-sm py-1 border-b text-destructive font-bold">
                    <span>Hora de Salida</span>
                    <span>{entry.exitTime}</span>
                  </div>

                  <div className="flex justify-between text-sm py-1 border-b font-bold text-primary">
                    <span>Total Pagado</span>
                    <span>S/ {entry.totalToPay?.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "images" && (
        <div className="space-y-3">
          {uploadStatus === "uploading" && (
            <div className="bg-blue-500/20 text-blue-700 border border-blue-500/30 rounded-lg p-3 text-center font-bold text-sm flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Subiendo imagen...
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-lg p-3 text-center font-bold text-sm">
              Imagen subida exitosamente
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="bg-red-500/20 text-red-700 border border-red-500/30 rounded-lg p-3 text-center font-bold text-sm">
              Error al subir la imagen
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* BOTÓN AGREGAR */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              id="camera-input"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  setUploadStatus("uploading");

                  await uploadIngresoImage(String(entry.id), file);

                  const imgs = await getIngresoImages(Number(entry.id));

                  onUpdate(entry.id, {
                    images: imgs,
                  });

                  setLocalImages(imgs);
                  setUploadStatus("success");
                  setTimeout(() => setUploadStatus("idle"), 3000);
                } catch (err) {
                  console.error("Error subiendo imagen:", err);
                  setUploadStatus("error");
                  setTimeout(() => setUploadStatus("idle"), 3000);
                } finally {
                  e.target.value = "";
                }
              }}
            />

            <button
              onClick={() => document.getElementById("camera-input")?.click()}
              className="aspect-square rounded-md border-dashed border-2 flex flex-col items-center justify-center hover:bg-muted transition text-muted-foreground"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Agregar</span>
            </button>

            {/* IMÁGENES */}
            {localImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-md overflow-hidden border cursor-pointer group"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover object-center"
                  alt={`Imagen ${i + 1}`}
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="h-5 w-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRIVER */}
      {activeTab === "driver" && (
        <Card className="border-none shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Datos del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditingDriver ? (
              /* ====== MODO VISTA ====== */
              <div className="space-y-6">
                {driverSaveSuccess && (
                  <div className="bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-lg p-3 text-center font-bold text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    Conductor guardado exitosamente
                  </div>
                )}
                {" "}
                {/* Contenedor principal con separación vertical */}
                {/* Sección de Datos de Texto */}
                <div className="grid grid-cols-1 gap-3">
                  {/* DNI */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      DNI
                    </p>
                    <p className="font-bold">{driverForm.dni}</p>
                  </div>

                  {/* Nombre Completo */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Nombre Completo
                    </p>
                    <p className="font-bold">{`${driverForm.name} ${driverForm.lastname}`}</p>
                  </div>

                  {/* Teléfono */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Teléfono
                    </p>
                    <p className="font-bold">{driverForm.phone}</p>
                  </div>
                </div>

                {/* Fotos del DNI */}
                {(driverForm.dniFront || driverForm.dniBack) && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Fotos del DNI
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {driverForm.dniFront && (
                        <div
                          className="rounded-lg border overflow-hidden cursor-pointer"
                          onClick={() => setSelectedImage(driverForm.dniFront || null)}
                        >
                          <img
                            src={driverForm.dniFront}
                            className="w-full h-32 object-cover"
                            alt="DNI Frente"
                          />
                        </div>
                      )}
                      {driverForm.dniBack && (
                        <div
                          className="rounded-lg border overflow-hidden cursor-pointer"
                          onClick={() => setSelectedImage(driverForm.dniBack || null)}
                        >
                          <img
                            src={driverForm.dniBack}
                            className="w-full h-32 object-cover"
                            alt="DNI Reverso"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Botón Actualizar */}
                <Button
                  variant="outline"
                  className="w-full bg-primary border-2 h-12 text-white"
                  onClick={async () => {
                    setDriverOriginal(driverForm);

                    if (entry.driver?.id_conductor && entry.driver.id_conductor !== 1) {
                      const conductor = await getConductorPorId(entry.driver.id_conductor);
                      if (conductor) {
                        setDriverForm({
                          id_conductor: conductor.id_conductor,
                          name: conductor.nombre,
                          lastname: conductor.apellidos,
                          dni: conductor.dni,
                          phone: conductor.telefono,
                          dniFront: conductor.ruta_anverso || "",
                          dniBack: conductor.ruta_reverso || "",
                        });
                        setDniFrontPreview(conductor.ruta_anverso || null);
                        setDniBackPreview(conductor.ruta_reverso || null);
                      }
                    } else {
                      setDriverForm({
                        id_conductor: entry.driver?.id_conductor || 1,
                        name: "",
                        lastname: "",
                        dni: "",
                        phone: "",
                        dniFront: "",
                        dniBack: "",
                      });
                      setDniFrontPreview(null);
                      setDniBackPreview(null);
                    }

                    setIsEditingDriver(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Actualizar datos
                </Button>
              </div>
            ) : (
              /* ====== MODO EDICIÓN ====== */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="DNI">
                    <div className="relative">
                      <Input
                        value={driverForm.dni}
                        disabled={dniLocked}
                        className="uppercase"
                        onChange={async (e) => {
                          const value = e.target.value.toUpperCase();

                          setDriverForm({ ...driverForm, dni: value });

                          if (!value) {
                            setDniLocked(false);
                            setDniSuggestions([]);
                            return;
                          }

                          if (value.length >= 3) {
                            const results = await buscarConductoresPorDni(value);
                            setDniSuggestions(results);
                          } else {
                            setDniSuggestions([]);
                          }
                        }}
                      />

                      {dniSuggestions.length > 0 && !dniLocked && (
                        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-md max-h-40 overflow-y-auto">
                          {dniSuggestions.map((c) => (
                            <button
                              key={c.id_conductor}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-b-0"
                              onClick={async () => {
                                const conductorCompleto = await getConductorPorId(c.id_conductor);
                                
                                setDriverForm({
                                  id_conductor: c.id_conductor,
                                  name: (conductorCompleto?.nombre || c.nombre || "").toUpperCase(),
                                  lastname: (conductorCompleto?.apellidos || c.apellidos || "").toUpperCase(),
                                  dni: (c.dni || "").toUpperCase(),
                                  phone: (conductorCompleto?.telefono || c.telefono || "").toUpperCase(),
                                  dniFront: conductorCompleto?.ruta_anverso || "",
                                  dniBack: conductorCompleto?.ruta_reverso || "",
                                });

                                if (conductorCompleto?.ruta_anverso) {
                                  setDniFrontPreview(conductorCompleto.ruta_anverso);
                                  setOriginalDniFront(conductorCompleto.ruta_anverso);
                                }
                                if (conductorCompleto?.ruta_reverso) {
                                  setDniBackPreview(conductorCompleto.ruta_reverso);
                                  setOriginalDniBack(conductorCompleto.ruta_reverso);
                                }

                                setDniLocked(true);
                                setDniSuggestions([]);
                              }}
                            >
                              <p className="font-bold">{c.dni}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.nombre} {c.apellidos}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Teléfono">
                    <Input
                      value={driverForm.phone}
                      disabled={dniLocked}
                      className="uppercase"
                      onChange={(e) =>
                        setDriverForm({ ...driverForm, phone: e.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre">
                    <Input
                      value={driverForm.name}
                      disabled={dniLocked}
                      className="uppercase"
                      onChange={(e) =>
                        setDriverForm({ ...driverForm, name: e.target.value.toUpperCase() })
                      }
                    />
                  </Field>

                  <Field label="Apellidos">
                    <Input
                      value={driverForm.lastname}
                      disabled={dniLocked}
                      className="uppercase"
                      onChange={(e) =>
                        setDriverForm({
                          ...driverForm,
                          lastname: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </Field>
                </div>

                {/* IMÁGENES DEL DNI */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  id="dni-front"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setDniFrontPreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  id="dni-back"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setDniBackPreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />

                <div className="space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    Fotos del DNI (Opcional)
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* DNI FRONTAL */}
                    {dniFrontPreview ? (
                      <div 
                        className="relative rounded-lg border h-32 overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedImage(dniFrontPreview)}
                      >
                        <img
                          src={dniFrontPreview}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDniFrontPreview(null);
                            setDriverForm({ ...driverForm, dniFront: "" });
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("dni-front")?.click()
                        }
                        className="border-dashed border-2 rounded-lg h-32 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-xs">DNI Frente</span>
                      </button>
                    )}

                    {/* DNI POSTERIOR */}
                    {dniBackPreview ? (
                      <div 
                        className="relative rounded-lg border h-32 overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedImage(dniBackPreview)}
                      >
                        <img
                          src={dniBackPreview}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDniBackPreview(null);
                            setDriverForm({ ...driverForm, dniBack: "" });
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("dni-back")?.click()
                        }
                        className="border-dashed border-2 rounded-lg h-32 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-xs">DNI Reverso</span>
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full bg-primary border-2 h-12 text-white"
                  onClick={saveDriver}
                >
                  Guardar Conductor
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 h-12"
                  onClick={() => {
                    setDriverForm(driverOriginal);
                    setDniLocked(false);
                    setDniSuggestions([]);
                    setIsEditingDriver(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* IMAGE MODAL */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="p-0 border-none bg-black/90 hideClose={true}">
          <button
            className="absolute top-4 right-4 bg-white/20 rounded-full p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              className="w-full max-h-[85vh] object-cover object-center"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===== COMPONENTES AUX ===== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase font-black text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  uppercase,
  capitalize,
}: {
  label: string;
  value: string;
  uppercase?: boolean;
  capitalize?: boolean;
}) {
  let displayValue = value || "-";
  if (uppercase) displayValue = displayValue.toUpperCase();
  if (capitalize)
    displayValue =
      displayValue.charAt(0).toUpperCase() +
      displayValue.slice(1).toLowerCase();

  return (
    <div className="flex justify-between text-sm py-1 border-b">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className="font-bold">{displayValue}</span>
    </div>
  );
}

function formatTimeAMPM(time?: string) {
  if (!time) return "-";

  // Si viene ISO (2025-12-08T20:33:07.937Z)
  if (time.includes("T")) {
    const date = new Date(time);
    return date.toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Si viene HH:mm
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute);

  return date.toLocaleTimeString("es-PE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateDMY(date?: string) {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
