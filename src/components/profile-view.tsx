"use client"

import { ArrowLeft, UserIcon, Mail, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types/parking"

interface ProfileViewProps {
  user: User
  onBack: () => void
  onLogout: () => void
}

export function ProfileView({ user, onBack, onLogout }: ProfileViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Mi Perfil</h2>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">
            {user.role === "admin" ? "Administrador del Sistema" : "Operador de Estacionamiento"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Correo Electrónico</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Nivel de Acceso</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <UserIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">ID de Usuario</p>
                <p className="font-medium">{user.id}</p>
              </div>
            </div>
          </div>

          <Button variant="destructive" className="w-full mt-4" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
