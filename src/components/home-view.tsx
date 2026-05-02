"use client";

import type React from "react";

import { Plus, List, LogOut, Wallet, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HomeViewProps {
  stats: {
    active: number;
    capacity: number;
    revenue: number;
  };
  onNavigate: (view: any) => void;
}

export function HomeView({ stats, onNavigate }: HomeViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido</h1>
        <p className="text-muted-foreground">
          Panel de control de estacionamiento
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card
          className="bg-emerald-600 text-white overflow-hidden"
          onClick={() => onNavigate("stats")}
        >
          <CardContent className="p-6 relative cursor-pointer">
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                Cajero (Recaudación)
              </p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-4xl font-black">
                  S/ {stats.revenue.toFixed(2)}
                </span>
              </div>
            </div>
            <Wallet className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 -rotate-12" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <MenuCard
          icon={<Plus className="h-6 w-6" />}
          title="Registrar Ingreso"
          description="Nuevo vehículo al estacionamiento"
          onClick={() => onNavigate("register")}
        />
        <MenuCard
          icon={<List className="h-6 w-6" />}
          title="Lista de Vehículos"
          description="Ver todos los ingresos activos"
          onClick={() => onNavigate("list")}
        />
        <MenuCard
          icon={<LogOut className="h-6 w-6" />}
          title="Salidas"
          description="Gestionar salida de vehículos"
          onClick={() => onNavigate("exits")}
        />
        <MenuCard
          icon={<Users className="h-6 w-6" />}
          title="Usuarios"
          description="Administrar conductores y vehículos"
          onClick={() => onNavigate("users")}
        />
      </div>
    </div>
  );
}

function MenuCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="group hover:border-primary transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
