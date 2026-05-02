"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getIngresos, type IngresoDB } from "@/services/ingresos.service";
import { EntryDetailView } from "./entry-detail-view";
import type { VehicleEntry } from "@/types/parking";

export function EntriesView() {
  const [ingresos, setIngresos] = useState<IngresoDB[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedEntry, setSelectedEntry] = useState<VehicleEntry | null>(null);

  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        const data = await getIngresos();
        setIngresos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, []);

  // 🔥 si hay un ingreso seleccionado → mostrar detalle
  if (selectedEntry) {
    return (
      <EntryDetailView
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
        onUpdate={(_id, updates) => {
          setSelectedEntry((prev) => (prev ? { ...prev, ...updates } : prev));
        }}
      />
    );
  }

  const filtered = ingresos.filter((i) =>
    i.id_ingreso.toString().includes(search),
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* BUSCADOR */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID de ingreso..."
          className="border-none shadow-none focus-visible:ring-0 p-0 h-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LISTA */}
      <div className="grid gap-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">
            Cargando ingresos...
          </p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">
              No hay ingresos registrados
            </p>
          </div>
        ) : (
          filtered.map((ingreso) => (
            <Card
              key={ingreso.id_ingreso}
              className="cursor-pointer border-gray-300 shadow-md rounded-2xl overflow-hidden hover:scale-[1.01] transition"
              onClick={() => setSelectedEntry(mapIngresoToEntry(ingreso))}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg">
                    Ingreso #{ingreso.id_ingreso}
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-none">
                    Activo
                  </Badge>
                </div>

                <div className="flex gap-6 text-sm font-bold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(ingreso.fecha_inicio).toLocaleDateString("es-PE")}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(ingreso.hora_inicio).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/* ===== MAPEO BD → UI ===== */
function mapIngresoToEntry(i: IngresoDB): VehicleEntry {
  const vehiculo = i.vehiculos;
  const conductor = i.conductores;

  return {
    id: i.id_ingreso.toString(),
    plate1: vehiculo?.placa_1 ?? "NO ENCONTRADO",
    plate2: vehiculo?.placa_2 ?? "",
    type: vehiculo?.precios?.tipo_vehiculo ?? "",
    ownership: vehiculo?.empresa ?? "PARTICULAR",
    entryDate: i.fecha_inicio,
    entryTime: i.hora_inicio,
    entryTimestamp: new Date(i.fecha_inicio).getTime(),
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

