"use client";

import { useEffect, useMemo, useState } from "react";
import type { VehicleEntry } from "@/types/parking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, LogOut, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getIngresos, type IngresoDB } from "@/services/ingresos.service";

interface ExitsViewProps {
  onSelectExit: (entry: VehicleEntry) => void;
  calculatePayment: (timestamp: number, type: any) => any;
}

export function ExitsView({ onSelectExit, calculatePayment }: ExitsViewProps) {
  const [entries, setEntries] = useState<VehicleEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 TRAER INGRESOS
  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        const data = await getIngresos();
        const mapped = data.map(mapIngresoToEntry);
        setEntries(mapped);
      } catch (e) {
        console.error("Error cargando ingresos", e);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, []);

  // 🔍 FILTRO
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      return (
        e.status === "active" &&
        e.plate1.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [entries, search]);

  return (
    <div className="space-y-4">
      {/* BUSCADOR */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Placa para dar salida..."
          className="border-none shadow-none focus-visible:ring-0 p-0 h-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LISTA */}
      <div className="grid gap-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">
            Cargando vehículos...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No hay vehículos activos
          </p>
        ) : (
          filtered.map((entry) => {
            if (!entry.precio) return null;

            const payment = calculatePayment(
              entry.entryTimestamp,
              entry.precio,
            );

            return (
              <Card
                key={entry.id}
                className="border-none shadow-md rounded-2xl overflow-hidden"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                      <LogOut className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black font-mono text-lg">
                        {entry.plate1}
                      </h3>
                      <p className="text-xs font-bold text-muted-foreground">
                        {payment.timeString} transcurrido
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">
                        Total
                      </p>
                      {payment && (
                        <p className="text-lg font-black text-primary">
                          S/ {payment.total.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      onClick={() => onSelectExit(entry)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function mapIngresoToEntry(i: IngresoDB): VehicleEntry {
  const vehiculo = i.vehiculos;
  const conductor = i.conductores;
  const precio = vehiculo?.precios;

  return {
    id: i.id_ingreso.toString(),
    plate1: vehiculo?.placa_1 ?? "SIN PLACA",
    plate2: vehiculo?.placa_2 ?? "",
    type: precio?.tipo_vehiculo ?? "",
    ownership: vehiculo?.empresa ?? "PARTICULAR",

    // ⬇️ FECHAS
    entryDate: i.fecha_inicio,
    entryTime: i.hora_inicio,
    entryTimestamp: new Date(i.fecha_inicio).getTime(),

    // ⬇️ PRECIO REAL
    precio: precio
      ? {
          horas: precio.horas,
          diario: precio.diario,
        }
      : null,

    exitTime: null,
    status: "active",
    images: [],

    driver: conductor
      ? {
          name: conductor.nombre,
          lastname: conductor.apellidos,
          dni: conductor.dni,
          phone: conductor.telefono,
          dniFront: "",
          dniBack: "",
        }
      : null,
  };
}
