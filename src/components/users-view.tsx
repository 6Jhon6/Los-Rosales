"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { ArrowLeft, User, Car } from "lucide-react";

import { getConductores, type ConductorDB } from "@/services/conductores.service";
import { getVehiculos, type VehiculoDB } from "@/services/vehiculos.service";

interface UsersViewProps {
  onBack: () => void;
}

export function UsersView({ onBack }: UsersViewProps) {
  const [conductores, setConductores] = useState<ConductorDB[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [drivers, cars] = await Promise.all([
          getConductores(),
          getVehiculos(20),
        ]);

        setConductores(drivers);
        setVehiculos(cars);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-black">Registro de Usuarios</h2>
      </div>

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1">
          <TabsTrigger
            value="drivers"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Conductores
          </TabsTrigger>

          <TabsTrigger
            value="vehicles"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Vehículos
          </TabsTrigger>
        </TabsList>

        {/* =========================
            CONDUCTORES
        ========================= */}
        <TabsContent value="drivers" className="space-y-3 mt-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}

          {!loading && conductores.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay conductores registrados
            </p>
          )}

          {conductores.map((c) => (
            <DriverCard
              key={c.id_conductor}
              name={`${c.nombre} ${c.apellidos}`}
              dni={c.dni}
              phone={c.telefono}
            />
          ))}
        </TabsContent>

        {/* =========================
            VEHÍCULOS
        ========================= */}
        <TabsContent value="vehicles" className="space-y-3 mt-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}

          {!loading && vehiculos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay vehículos registrados
            </p>
          )}

          {vehiculos.map((v) => (
            <VehicleCard
              key={v.id_vehiculo}
              plate={v.placa_1}
              company={v.empresa}
              number={v.numero}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================
   CONDUCTOR CARD
========================= */
function DriverCard({
  name,
  dni,
  phone,
}: {
  name: string;
  dni: string;
  phone: string;
}) {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="font-bold leading-tight">{name}</p>
          <p className="text-xs text-muted-foreground">
            DNI: {dni} · Tel: {phone}
          </p>
        </div>

        <Badge variant="secondary" className="font-black text-xs">
          REGISTRADO
        </Badge>
      </CardContent>
    </Card>
  );
}

/* =========================
   VEHÍCULO CARD
========================= */
function VehicleCard({
  plate,
  company,
  number,
}: {
  plate: string;
  company: string;
  number: number | null;
}) {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Car className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="font-bold leading-tight">{plate}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {company}
            {number ? ` · ${number}` : ""}
          </p>
        </div>

        <Badge className="font-black text-xs">REGISTRADO</Badge>
      </CardContent>
    </Card>
  );
}
