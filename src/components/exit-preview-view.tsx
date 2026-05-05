"use client";

import { useEffect, useState } from "react";
import type { VehicleEntry } from "@/types/parking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Timer,
  ReceiptText,
  ChevronLeft,
  Wallet,
  LogOut,
  Calendar,
  Maximize2,
  X,
  Plus,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSalidaImages, uploadSalidaImage } from "@/services/images.service";

interface ExitPreviewViewProps {
  entry: VehicleEntry;
  payment: any;
  onConfirm: (id: string) => void;
  onBack: (showAlert?: boolean) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function ExitPreviewView({
  entry,
  payment,
  onConfirm,
  onBack,
  showToast: _showToast,
}: ExitPreviewViewProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "images">("detail");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [exitImages, setExitImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (!entry.id) return;

      try {
        const imgs = await getSalidaImages(Number(entry.id));
        setExitImages(imgs);
      } catch (err) {
        console.error("Error cargando fotos de salida", err);
      }
    };

    loadImages();
  }, [entry.id]);

  return (
    <div className="space-y-4 pb-20 animate-in zoom-in-95 duration-300">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-muted/50"
          onClick={() => onBack(false)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-black">Previsualización de Salida</h2>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1.5 rounded-2xl border">
        {["detail", "images"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            className="rounded-xl h-10 font-bold text-xs"
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "detail" && "Detalle"}
            {tab === "images" && "Fotos"}
          </Button>
        ))}
      </div>

      {/* DETALLE */}
      {activeTab === "detail" && (
        <Card className="overflow-hidden border-2 border-primary/20 rounded-3xl shadow-xl">
          {/* TOP BAR */}
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              <span className="font-black uppercase text-sm tracking-tight">
                Resumen
              </span>
            </div>
            <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-black">
              {entry.id}
            </span>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* VEHICLE + DRIVER */}
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Vehículo
                </p>
                <p className="font-black text-lg font-mono">{entry.plate1}</p>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-muted font-bold capitalize">
                  {entry.type}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Conductor
                </p>
                <p className="font-bold">
                  {entry.driver
                    ? `${entry.driver.name} ${entry.driver.lastname}`
                    : "No asignado"}
                </p>
                {entry.driver && (
                  <p className="text-xs text-muted-foreground">
                    DNI: {entry.driver.dni}
                  </p>
                )}
              </div>
            </div>

            {/* TIMES */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de Ingreso</span>
                </div>
                <span className="font-semibold">
                  {formatDateOnly(entry.entryDate)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Hora de Ingreso</span>
                </div>
                <span className="font-semibold">
                  {formatTimeAMPM(entry.entryTime)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                  <span>Salida (Actual)</span>
                </div>
                <span className="font-semibold">
                  {new Date().toLocaleTimeString("es-PE", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>Tiempo Transcurrido</span>
                </div>
                <span className="font-black text-primary bg-primary/10 px-2 py-1 rounded">
                  {payment.timeString}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-primary">
                  <Wallet className="h-5 w-5" />
                  <span className="text-lg font-black uppercase">
                    Total a Pagar
                  </span>
                </div>
                <span className="text-3xl font-black text-primary">
                  S/ {payment.total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>

          {/* FOOTER */}
          <div className="bg-muted/50 p-6 space-y-3">
            <Button
              className="w-full py-4 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => onConfirm(entry.id)}
            >
              <LogOut className="h-5 w-5" />
              Confirmar Salida
            </Button>

            <Button
              variant="ghost"
              className="w-full h-10 rounded-lg font-bold text-muted-foreground"
              onClick={() => onBack(true)}
            >
              Cancelar y volver
            </Button>
          </div>
        </Card>
      )}

      {/* FOTOS */}
      {activeTab === "images" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {/* INPUT CAMARA */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            id="exit-camera-input"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                await uploadSalidaImage(String(entry.id), file);

                const imgs = await getSalidaImages(Number(entry.id));

                setExitImages(imgs);
              } catch (err) {
                alert("Error subiendo imagen");
                console.error(err);
              } finally {
                e.target.value = "";
              }
            }}
          />

          {/* BOTON AGREGAR */}
          <button
            onClick={() =>
              document.getElementById("exit-camera-input")?.click()
            }
            className="aspect-square rounded-md border-dashed border-2 flex flex-col items-center justify-center hover:bg-muted transition text-muted-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Agregar</span>
          </button>

          {/* IMAGENES */}
          {exitImages.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden border cursor-pointer group"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="h-5 w-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL IMAGEN */}
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

function formatTimeAMPM(time?: string) {
  if (!time) return "-";

  if (time.includes("T")) {
    const date = new Date(time);
    return date.toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute);

  return date.toLocaleTimeString("es-PE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateOnly(date?: string) {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
