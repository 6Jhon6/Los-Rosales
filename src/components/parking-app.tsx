"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { HomeView } from "@/components/home-view";
import { RegistrationView } from "@/components/registration-view";
import { EntriesView } from "@/components/entries-view";
import { ExitsView } from "@/components/exits-view";
import { EntryDetailView } from "@/components/entry-detail-view";
import { ExitPreviewView } from "@/components/exit-preview-view";
import { UsersView } from "@/components/users-view";
import { useParking } from "@/hooks/use-parking";
import type { User } from "@/types/parking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, FileText } from "lucide-react";
import { getPrecios, type PrecioDB } from "@/services/precios.service";
import { registrarSalida } from "@/services/salidas.service";
import {
  registrarRecaudacion,
  obtenerRecaudacionHoy,
} from "@/services/recaudaciones.service";
import { obtenerIngresosHoy } from "@/services/ingresos.service";
import { obtenerSalidasHoy } from "@/services/salidas.service";
import { obtenerActividadReciente } from "@/services/dashboard.service";
import { DashboardView } from "@/components/dashboard-view";

// Mock user for testing
const MOCK_USER: User = {
  id: "USR-001",
  name: "Juan Pérez",
  email: "juan.perez@parking.com",
  role: "admin",
  avatar: "/diverse-avatars.png",
};

type View =
  | "home"
  | "register"
  | "ticket"
  | "list"
  | "detail"
  | "exits"
  | "exit-preview"
  | "stats"
  | "profile"
  | "users";

export default function ParkingApp() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("home");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const {
    entries,
    stats,
    registerEntry,
    updateEntry,
    confirmExit,
    calculatePayment,
  } = useParking();

  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const activeEntries = entries.filter((e) => e.status === "active");

  // Simple Login logic for the demo
  const [loginEmail, setLoginEmail] = useState("juan.perez@parking.com");
  const [loginPass, setLoginPass] = useState("admin123");

  const [successEntry, setSuccessEntry] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated auth
    if (loginEmail === MOCK_USER.email) {
      setUser(MOCK_USER);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView("home");
  };

  const [dashboardStats, setDashboardStats] = useState({
    ingresosHoy: 0,
    salidasHoy: 0,
    revenueHoy: 0,
  });

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (view !== "stats") return;

    async function cargarDashboard() {
      const ingresos = await obtenerIngresosHoy();
      const salidas = await obtenerSalidasHoy();
      const revenue = await obtenerRecaudacionHoy();
      const actividad = await obtenerActividadReciente();

      setDashboardStats({
        ingresosHoy: ingresos,
        salidasHoy: salidas,
        revenueHoy: revenue,
      });

      setActivities(actividad);
    }

    cargarDashboard();
  }, [view]);

  const [revenueHoy, setRevenueHoy] = useState(0);

  useEffect(() => {
    obtenerRecaudacionHoy()
      .then(setRevenueHoy)
      .catch((err) => console.error("Error cargando recaudación:", err));
  }, []);

  const [precios, setPrecios] = useState<PrecioDB[]>([]);

  useEffect(() => {
    getPrecios()
      .then(setPrecios)
      .catch((err) => console.error("Error cargando precios:", err));
  }, []);

  function obtenerPrecioPorTipo(tipo?: string) {
    if (!tipo) return undefined;

    return precios.find(
      (p) => p.tipo_vehiculo.toLowerCase().trim() === tipo.toLowerCase().trim(),
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Car className="text-primary-foreground h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">ParkingSystem</CardTitle>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
              <div className="text-center mt-4 p-2 bg-primary/5 rounded border border-primary/10 text-xs text-muted-foreground">
                <p className="font-bold">Usuario de prueba:</p>
                <p>Email: {MOCK_USER.email}</p>
                <p>Pass: admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 font-sans">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999">
          <div
            className={`px-6 py-3 rounded-xl shadow-xl font-semibold text-white backdrop-blur-sm border
  ${
    toast.type === "error"
      ? "bg-red-600/90 border-red-400"
      : "bg-emerald-600/90 border-emerald-400"
  }
`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <Header
        user={user}
        onLogout={handleLogout}
        onViewStats={() => setView("stats")}
        onGoHome={() => setView("home")}
        onViewProfile={() => setView("profile")}
      />

      <main className="container max-w-4xl mx-auto p-4 space-y-6">
        {view === "home" && (
          <HomeView
            stats={{
              ...stats,
              revenue: revenueHoy,
            }}
            onNavigate={setView}
          />
        )}
        {view === "register" && (
          <RegistrationView
            onCancel={() => setView("home")}
            onRegister={(data) => {
              const entry = registerEntry(data);
              setSuccessEntry(entry);
              setView("ticket");
            }}
          />
        )}
        {view === "ticket" && successEntry && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            {/* HEADER */}
            <div className="text-center py-4">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black">¡Ingreso Exitoso!</h2>
              <p className="text-muted-foreground text-sm">
                Ticket generado correctamente
              </p>
            </div>

            {/* TICKET */}
            <Card className="border-2 border-dashed relative overflow-hidden bg-card rounded-3xl shadow-xl">
              {/* BARRA SUPERIOR */}
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>

              <CardHeader className="text-center pb-2">
                <CardTitle className="uppercase tracking-widest text-xs text-muted-foreground">
                  Comprobante de Ingreso
                </CardTitle>
                <div className="text-3xl font-black mt-2 tracking-tighter">
                  #{successEntry.id}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 border-t border-dashed">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Placa 1
                    </p>
                    <p className="font-black text-lg font-mono">
                      {successEntry.plate1}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Placa 2
                    </p>
                    <p className="font-black text-lg font-mono">
                      {successEntry.plate2 || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Tipo
                    </p>
                    <p className="font-semibold capitalize">
                      {successEntry.type}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Propiedad
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                        successEntry.ownership === "shon"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {successEntry.ownership.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Fecha
                    </p>
                    <p className="font-semibold">{successEntry.entryDate}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">
                      Hora
                    </p>
                    <p className="font-semibold">{successEntry.entryTime}</p>
                  </div>
                </div>
              </CardContent>

              {/* SEPARADOR TIPO TICKET */}
              <div className="p-4 bg-muted/50 flex justify-center">
                <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,black_0,black_2px,transparent_2px,transparent_4px)] opacity-20"></div>
              </div>
            </Card>

            {/* BOTONES */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                className="w-full py-6 rounded-2xl font-bold"
                onClick={() => setView("list")}
              >
                Ver Lista de Vehículos
              </Button>

              <Button
                variant="outline"
                className="w-full py-6 rounded-2xl bg-transparent font-bold"
                onClick={() => setView("home")}
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        )}
        {view === "list" && (
          <EntriesView
            entries={activeEntries}
            onSelectEntry={(entry) => {
              setSelectedItem(entry);
              setView("detail");
            }}
          />
        )}
        {view === "stats" && (
          <DashboardView stats={dashboardStats} activities={activities} />
        )}
        {view === "detail" && selectedItem && (
          <EntryDetailView
            entry={selectedItem}
            onUpdate={updateEntry}
            onBack={() => setView("list")}
          />
        )}
        {view === "exits" && (
          <ExitsView
            entries={activeEntries}
            onSelectExit={(entry) => {
              setSelectedItem(entry);
              setView("exit-preview");
            }}
            calculatePayment={calculatePayment}
          />
        )}
        {view === "exit-preview" &&
          selectedItem &&
          (() => {
            const precioDB = obtenerPrecioPorTipo(selectedItem.type);

            if (!precioDB) {
              return (
                <div className="p-6 text-center text-red-600 font-bold">
                  No se encontró precio para este tipo de vehículo
                </div>
              );
            }

            return (
              <ExitPreviewView
                entry={selectedItem}
                payment={calculatePayment(selectedItem.entryTimestamp, {
                  horas: precioDB.horas,
                  diario: precioDB.diario,
                })}
                onConfirm={async (id) => {
                  try {
                    const payment = calculatePayment(
                      selectedItem.entryTimestamp,
                      {
                        horas: precioDB.horas,
                        diario: precioDB.diario,
                      },
                    );

                    const playSuccessSound = () => {
                      const audio = new Audio("/sounds/pay-success.mp3");
                      audio.volume = 0.6;
                      audio.play();
                    };

                    const salida = await registrarSalida({
                      id_ingreso: Number(id),
                      tiempo: payment.timeString,
                      precio: payment.total,
                    });

                    await registrarRecaudacion(salida.id_salida, payment.total);
                    const nuevoTotal = await obtenerRecaudacionHoy();
                    setRevenueHoy(nuevoTotal);

                    await confirmExit(id, {
                      horas: precioDB.horas,
                      diario: precioDB.diario,
                    });

                    playSuccessSound();

                    showToast("Salida registrada correctamente", "success");
                    setView("exits");
                  } catch (error) {
                    showToast("Error registrando la salida", "error");
                  }
                }}
                onBack={() => setView("exits")}
                showToast={function (
                  msg: string,
                  type?: "success" | "error",
                ): void {
                  throw new Error("Function not implemented.");
                }}
              />
            );
          })()}

        {view === "users" && <UsersView onBack={() => setView("home")} />}

        {![
          "home",
          "register",
          "ticket",
          "list",
          "detail",
          "exits",
          "exit-preview",
          "stats",
          "profile",
          "users",
        ].includes(view) && (
          <div className="p-8 text-center bg-muted rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">
              Esta función estará disponible próximamente.
            </p>
            <Button variant="link" onClick={() => setView("home")}>
              Volver al inicio
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
function boardStats(arg0: {
  ingresosHoy: number;
  salidasHoy: number;
  revenueHoy: number;
}) {
  throw new Error("Function not implemented.");
}
