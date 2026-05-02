"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Activity {
  tipo: "ingreso" | "salida";
  placa: string;
  monto?: number;
}

interface DashboardViewProps {
  stats: {
    ingresosHoy: number;
    salidasHoy: number;
    revenueHoy: number;
  };
  activities: Activity[];
}

export function DashboardView({ stats, activities }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground">
          Resumen general del estacionamiento
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Recaudación del Día</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              S/ {stats.revenueHoy.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Ingresos del Día</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stats.ingresosHoy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Salidas del Día</CardTitle>
            <Car className="h-4 w-4 text-orange-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stats.salidasHoy}</div>
          </CardContent>
        </Card>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${
                    act.tipo === "salida"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {act.tipo === "salida" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {act.tipo === "salida"
                      ? "Salida registrada"
                      : "Nuevo ingreso"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Vehículo {act.placa}
                  </p>
                </div>

                {act.tipo === "salida" && (
                  <div className="text-sm font-medium">
                    +S/ {act.monto}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}