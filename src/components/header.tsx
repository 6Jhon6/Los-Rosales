"use client"

import { Car, BarChart3, UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/types/parking"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  user: User | null
  onLogout: () => void
  onViewStats: () => void
  onGoHome: () => void
  onViewProfile: () => void
}

export function Header({ user, onLogout, onViewStats, onGoHome, onViewProfile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-4xl">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={onGoHome}>
          <div className="bg-primary p-1.5 rounded-lg">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>
            Parking<span className="text-primary">System</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onViewStats}>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onViewProfile}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Ver mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
