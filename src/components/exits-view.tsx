"use client";

import { useEffect, useMemo, useState } from "react";
import type { VehicleEntry } from "@/types/parking";
import { Card, CardContent } from "@/components/ui/card";
import { Search, LogOut, ChevronRight, Ticket, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getIngresos, type IngresoDB } from "@/services/ingresos.service";

interface ExitsViewProps {
  entries?: VehicleEntry[];
  onSelectExit: (entry: VehicleEntry) => void;
  calculatePayment?: (timestamp: number, precio: any, ownership?: "particular" | "shon" | "abonado") => any;
}

export function ExitsView({ entries: externalEntries, onSelectExit, calculatePayment }: ExitsViewProps) {
  const [entries, setEntries] = useState<VehicleEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (externalEntries !== undefined) {
      setLoading(false);
      return;
    }

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
  }, [externalEntries]);

  let displayEntries: VehicleEntry[];
  if (externalEntries !== undefined) {
    displayEntries = externalEntries;
  } else {
    displayEntries = entries;
  }
  
  const filtered = useMemo(() => {
    return displayEntries.filter((e) => {
      const searchLower = search.toLowerCase();
      return (
        e.status === "active" &&
        (e.plate1.toLowerCase().includes(searchLower) ||
          e.id.toLowerCase().includes(searchLower))
      );
    });
  }, [displayEntries, search]);

  return (
    <div className="space-y-4">
      {/* BUSCADOR */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
          <Input
          placeholder="Buscar por placa o #ticket..."
          className="border-none shadow-none focus-visible:ring-0 p-0 h-8"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
        />
      </div>

      {/* LISTA */}
      <div className="grid gap-3">
        {loading || externalEntries === undefined ? (
          <p className="text-center text-muted-foreground py-10">
            Cargando vehículos...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No hay vehículos activos
          </p>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-500/20 text-red-700 border border-red-500/30 rounded-lg p-3 text-center font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            )}
            {filtered.map((entry) => {
              if (!entry.precio || !calculatePayment) return null;

              const payment = calculatePayment(
                entry.entryTimestamp,
                entry.precio,
                entry.ownership
              );

              const tieneConductor = entry.driver && entry.driver.id_conductor && entry.driver.id_conductor !== 1;

              const handleSelect = () => {
                if (!tieneConductor) {
                  setErrorMessage("Falta registrar conductor");
                  setTimeout(() => setErrorMessage(null), 3000);
                  return;
                }
                onSelectExit(entry);
              };

              return (
                <Card
                  key={entry.id}
                  className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer rounded-2xl overflow-hidden"
                  onClick={handleSelect}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch h-28">
                      <div className="w-20 bg-destructive/10 flex items-center justify-center border-r border-destructive/5">
                        <LogOut className="h-7 w-7 text-destructive" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black font-mono tracking-tighter">
                              {entry.plate1}
                            </h3>
                            <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              Ticket #{entry.id}
                            </p>
                          </div>
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
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {payment.timeString} transcurrido
                          </span>
                          <ChevronRight className="h-5 w-5 text-destructive/30" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function mapIngresoToEntry(i: IngresoDB): VehicleEntry {
  const vehiculo = i.vehiculos && i.vehiculos[0];
  const conductor = i.conductores;
  const precio = vehiculo?.precios?.[0];

  return {
    id: i.id_ingreso.toString(),
    plate1: vehiculo?.placa_1 ?? "SIN PLACA",
    plate2: vehiculo?.placa_2 ?? "",
    type: precio?.tipo_vehiculo ?? "",
    ownership: vehiculo?.empresa === "SHON" 
      ? "shon" 
      : vehiculo?.empresa === "ABONADO" 
        ? "abonado" 
        : "particular",

    // ⬇️ FECHAS
    entryDate: i.fecha_inicio,
    entryTime: i.hora_inicio,
    entryTimestamp: new Date(i.fecha_inicio).getTime(),

    // ⬇️ PRECIO REAL
    precio: precio
      ? {
          horas: precio.horas,
          diario: precio.diario,
          shon_horas: precio.shon_horas,
          shon_diario: precio.shon_diario,
        }
      : undefined,

    exitTime: undefined,
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
      : undefined,
  };
}
