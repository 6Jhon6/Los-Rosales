"use client";

import { useEffect, useState } from "react";
import {
  registrarVehiculoYIngreso,
  buscarVehiculosPorPlaca,
} from "@/services/vehiculos.service";
import { getPrecios, type PrecioDB } from "@/services/precios.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

type Ownership = "particular" | "shon" | "abonado";

interface RegistrationViewProps {
  onRegister: (data: any) => void;
  onCancel: () => void;
}

export function RegistrationView({
  onRegister,
  onCancel,
}: RegistrationViewProps) {
  /* =========================
      ESTADOS
   ========================= */
  const [precios, setPrecios] = useState<PrecioDB[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const [formData, setFormData] = useState({
    plate1: "",
    plate2: "",
    ownership: "particular" as Ownership,
    type: "",
  });

  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(false);

  const resetForm = () => {
    setFormData({
      plate1: "",
      plate2: "",
      ownership: "particular",
      type: precios[0]?.tipo_vehiculo || "",
    });
    setVehiculoSeleccionado(false);
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  /* =========================
     CARGAR PRECIOS
  ========================= */
  useEffect(() => {
    async function fetchPrecios() {
      try {
        const data = await getPrecios();
        setPrecios(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            type: data[0].tipo_vehiculo,
          }));
        }
      } catch (error) {
        console.error("Error cargando precios", error);
      } finally {
        setLoadingPrices(false);
      }
    }

    fetchPrecios();
  }, []);

  /* =========================
     BUSCAR PLACAS (AUTOCOMPLETE)
  ========================= */
  useEffect(() => {
    async function buscar() {
      if (vehiculoSeleccionado) return;

      if (formData.plate1.length < 2) {
        setSugerencias([]);
        setMostrarSugerencias(false);
        return;
      }

      const data = await buscarVehiculosPorPlaca(formData.plate1);

      setSugerencias(data);
      setMostrarSugerencias(true);
    }

    buscar();
  }, [formData.plate1, vehiculoSeleccionado]);

  /* =========================
     SELECCIONAR SUGERENCIA
  ========================= */
  const seleccionarVehiculo = (v: any) => {
    setFormData({
      plate1: v.placa_1,
      plate2: v.placa_2 || "",
      ownership:
        v.empresa === "SHON"
          ? "shon"
          : v.empresa === "ABONADO"
            ? "abonado"
            : "particular",
      type:
        precios.find((p) => p.id_precio === v.id_precio)?.tipo_vehiculo || "",
    });

    setVehiculoSeleccionado(true); // 🔑 IMPORTANTE
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  /* =========================
     TARIFA ACTUAL
  ========================= */
  const currentRate = precios.find((p) => p.tipo_vehiculo === formData.type);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    try {
      const precioSeleccionado = precios.find(
        (p) => p.tipo_vehiculo === formData.type,
      );

      if (!precioSeleccionado) {
        alert("No se encontró el precio del vehículo");
        return;
      }

      const idIngreso = await registrarVehiculoYIngreso({
        placa_1: formData.plate1,
        placa_2: formData.plate2 || null,
        empresa:
          formData.ownership === "shon"
            ? "SHON"
            : formData.ownership === "abonado"
              ? "ABONADO"
              : "PARTICULAR",
        id_precio: precioSeleccionado.id_precio,
      });

      onRegister({
        ...formData,
        images: [],
        id: idIngreso.toString(),
        precio: {
          horas: precioSeleccionado.horas,
          diario: precioSeleccionado.diario,
          shon_horas: precioSeleccionado.shon_horas,
          shon_diario: precioSeleccionado.shon_diario,
        },
      });
    } catch (error) {
      console.error(error);
      alert("Error al registrar el ingreso");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-4 pb-10 max-w-lg mx-auto">
      <h2 className="text-2xl font-black">Registrar Vehículo</h2>

      <Card className="rounded-3xl shadow-xl">
        <CardContent className="p-6 space-y-6">
          {/* PLACAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Label className="text-xs font-bold">PLACA</Label>
              <Input
                value={formData.plate1}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();

                  const soloLetrasNumeros = value.replace(/[^A-Z0-9]/g, "");

                  if (soloLetrasNumeros.length > 3 && value.indexOf("-") === -1) {
                    value = soloLetrasNumeros.slice(0, 3) + "-" + soloLetrasNumeros.slice(3, 7);
                  } else if (soloLetrasNumeros.length <= 3) {
                    value = soloLetrasNumeros;
                  }

                  if (value === "" || value === "-") {
                    resetForm();
                    return;
                  }

                  setFormData({
                    ...formData,
                    plate1: value,
                  });

                  setVehiculoSeleccionado(false);
                }}
              />

              {/* SUGERENCIAS */}
              {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="absolute z-50 w-full bg-white border rounded-md shadow-md">
                  {sugerencias.map((v) => (
                    <button
                      key={v.id_vehiculo}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                      onClick={() => seleccionarVehiculo(v)}
                    >
                      <p className="font-bold">{v.placa_1}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.empresa}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-bold">PLACA 2</Label>
              <Input
                value={formData.plate2}
                disabled={vehiculoSeleccionado}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();

                  const soloLetrasNumeros = value.replace(/[^A-Z0-9]/g, "");

                  if (soloLetrasNumeros.length > 3 && value.indexOf("-") === -1) {
                    value = soloLetrasNumeros.slice(0, 3) + "-" + soloLetrasNumeros.slice(3, 7);
                  } else if (soloLetrasNumeros.length <= 3) {
                    value = soloLetrasNumeros;
                  }

                  setFormData({
                    ...formData,
                    plate2: value,
                  });
                }}
              />
            </div>
          </div>

          {/* PROPIEDAD */}
          <div>
            <Label className="text-xs font-bold">PROPIEDAD</Label>
            <Select
              value={formData.ownership}
              disabled={vehiculoSeleccionado}
              onValueChange={(v: Ownership) =>
                setFormData({ ...formData, ownership: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particular">Particular</SelectItem>
                <SelectItem value="shon">Empresa SHON</SelectItem>
                <SelectItem value="abonado">Abonado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TIPO VEHÍCULO */}
          <div>
            <Label className="text-xs font-bold">TIPO DE VEHÍCULO</Label>
            <Select
              value={formData.type}
              disabled={vehiculoSeleccionado}
              onValueChange={(v) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {precios.map((p) => (
                  <SelectItem key={p.id_precio} value={p.tipo_vehiculo}>
                    {p.tipo_vehiculo.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TARIFAS */}
          <div className="bg-primary/5 rounded-xl p-4 border">
            {loadingPrices ? (
              <p>Cargando tarifas...</p>
            ) : currentRate ? (
              formData.ownership === "shon" ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    Tarifa Empresa SHON
                  </p>
                  <div className="flex justify-between font-bold">
                    <span>Horas: S/ {currentRate.shon_horas?.toFixed(2) ?? currentRate.horas.toFixed(2)}</span>
                    <span>Día: S/ {currentRate.shon_diario?.toFixed(2) ?? currentRate.diario.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between font-bold">
                  <span>Horas: S/ {currentRate.horas.toFixed(2)}</span>
                  <span>Día: S/ {currentRate.diario.toFixed(2)}</span>
                </div>
              )
            ) : (
              <p className="text-red-500">No hay tarifa</p>
            )}
          </div>

          {/* BOTONES */}
          <Button
            className="w-full text-lg"
            onClick={handleSubmit}
            disabled={!formData.plate1}
          >
            Confirmar Ingreso <FileText className="ml-2" />
          </Button>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
