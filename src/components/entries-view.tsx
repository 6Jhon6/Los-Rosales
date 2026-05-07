"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getIngresos, type IngresoDB } from "@/services/ingresos.service";
import { EntryDetailView } from "./entry-detail-view";
import type { VehicleEntry } from "@/types/parking";

interface EntriesViewProps {
  entries?: VehicleEntry[];
  onSelectEntry?: (entry: VehicleEntry) => void;
}

export function EntriesView({ entries: externalEntries, onSelectEntry }: EntriesViewProps = {}) {
  const [ingresos, setIngresos] = useState<IngresoDB[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedEntry, setSelectedEntry] = useState<VehicleEntry | null>(null);

  useEffect(() => {
    if (externalEntries !== undefined) {
      setLoading(false);
      return;
    }

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
  }, [externalEntries]);

  let displayEntries: VehicleEntry[];
  if (externalEntries !== undefined) {
    displayEntries = externalEntries;
  } else {
    displayEntries = ingresos.map(mapIngresoToEntry);
  }
  
  const filtered = displayEntries.filter((item) =>
    item.id.includes(search)
  );

  const handleSelect = (entry: VehicleEntry) => {
    if (onSelectEntry) {
      onSelectEntry(entry);
    } else {
      setSelectedEntry(entry);
    }
  };

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
        {loading || externalEntries === undefined ? (
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
          filtered.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer border-gray-300 shadow-md rounded-2xl overflow-hidden hover:scale-[1.01] transition"
              onClick={() => handleSelect(item)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg">
                    Ingreso de Vehiculo #{item.id}
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-none">
                    Activo
                  </Badge>
                </div>

                <div className="flex gap-6 text-sm font-bold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {item.entryDate}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.entryTime}
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
  const vehiculo = i.vehiculos && i.vehiculos[0];
  const conductor = i.conductores;

  return {
    id: i.id_ingreso.toString(),
    plate1: vehiculo?.placa_1 ?? "NO ENCONTRADO",
    plate2: vehiculo?.placa_2 ?? "",
    type: vehiculo?.precios?.[0]?.tipo_vehiculo ?? "",
    ownership: (vehiculo?.empresa?.toLowerCase() as "particular" | "shon" | "abonado") ?? "particular",
    entryDate: i.fecha_inicio,
    entryTime: i.hora_inicio,
    entryTimestamp: new Date(i.fecha_inicio).getTime(),
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

