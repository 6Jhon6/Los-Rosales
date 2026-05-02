export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      conductores: {
        Row: {
          apellidos: string
          created_at: string
          dni: string
          id_conductor: number
          nombre: string
          telefono: string | null
        }
        Insert: {
          apellidos: string
          created_at?: string
          dni: string
          id_conductor?: number
          nombre: string
          telefono?: string | null
        }
        Update: {
          apellidos?: string
          created_at?: string
          dni?: string
          id_conductor?: number
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      img_ingresos: {
        Row: {
          created_at: string
          id_img: number
          id_ingreso: number | null
          ruta: string | null
        }
        Insert: {
          created_at?: string
          id_img?: number
          id_ingreso?: number | null
          ruta?: string | null
        }
        Update: {
          created_at?: string
          id_img?: number
          id_ingreso?: number | null
          ruta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "img-ingresos_id_ingreso_fkey"
            columns: ["id_ingreso"]
            isOneToOne: false
            referencedRelation: "ingresos"
            referencedColumns: ["id_ingreso"]
          },
        ]
      }
      img_salidas: {
        Row: {
          created_at: string
          id_img: number
          id_ingreso: number | null
          ruta: string | null
        }
        Insert: {
          created_at?: string
          id_img?: number
          id_ingreso?: number | null
          ruta?: string | null
        }
        Update: {
          created_at?: string
          id_img?: number
          id_ingreso?: number | null
          ruta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "img_salidas_id_ingreso_fkey"
            columns: ["id_ingreso"]
            isOneToOne: false
            referencedRelation: "ingresos"
            referencedColumns: ["id_ingreso"]
          },
        ]
      }
      ingresos: {
        Row: {
          created_at: string
          fecha_inicio: string | null
          hora_inicio: string
          id_conductor: number | null
          id_ingreso: number
          id_vehiculo: number | null
          salida: boolean | null
        }
        Insert: {
          created_at?: string
          fecha_inicio?: string | null
          hora_inicio: string
          id_conductor?: number | null
          id_ingreso?: number
          id_vehiculo?: number | null
          salida?: boolean | null
        }
        Update: {
          created_at?: string
          fecha_inicio?: string | null
          hora_inicio?: string
          id_conductor?: number | null
          id_ingreso?: number
          id_vehiculo?: number | null
          salida?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ingresos_id_conductor_fkey"
            columns: ["id_conductor"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id_conductor"]
          },
          {
            foreignKeyName: "ingresos_id_vehiculo_fkey"
            columns: ["id_vehiculo"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id_vehiculo"]
          },
        ]
      }
      precios: {
        Row: {
          diario: number | null
          horas: number | null
          id_precio: number
          tipo_vehiculo: string
        }
        Insert: {
          diario?: number | null
          horas?: number | null
          id_precio?: number
          tipo_vehiculo: string
        }
        Update: {
          diario?: number | null
          horas?: number | null
          id_precio?: number
          tipo_vehiculo?: string
        }
        Relationships: []
      }
      recaudaciones: {
        Row: {
          created_at: string
          id_recaudacion: number
          id_salida: number | null
          monto: number | null
        }
        Insert: {
          created_at?: string
          id_recaudacion?: number
          id_salida?: number | null
          monto?: number | null
        }
        Update: {
          created_at?: string
          id_recaudacion?: number
          id_salida?: number | null
          monto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recaudaciones_id_salida_fkey"
            columns: ["id_salida"]
            isOneToOne: false
            referencedRelation: "salidas"
            referencedColumns: ["id_salida"]
          },
        ]
      }
      salidas: {
        Row: {
          created_at: string
          fecha_salida: string | null
          hora_salida: string | null
          id_ingreso: number | null
          id_salida: number
          precio: number | null
          tiempo: string | null
        }
        Insert: {
          created_at?: string
          fecha_salida?: string | null
          hora_salida?: string | null
          id_ingreso?: number | null
          id_salida?: number
          precio?: number | null
          tiempo?: string | null
        }
        Update: {
          created_at?: string
          fecha_salida?: string | null
          hora_salida?: string | null
          id_ingreso?: number | null
          id_salida?: number
          precio?: number | null
          tiempo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salidas_id_ingreso_fkey"
            columns: ["id_ingreso"]
            isOneToOne: false
            referencedRelation: "ingresos"
            referencedColumns: ["id_ingreso"]
          },
        ]
      }
      vehiculos: {
        Row: {
          created_at: string
          empresa: string
          id_precio: number | null
          id_vehiculo: number
          numero: number | null
          placa_1: string
          placa_2: string | null
        }
        Insert: {
          created_at?: string
          empresa: string
          id_precio?: number | null
          id_vehiculo?: number
          numero?: number | null
          placa_1: string
          placa_2?: string | null
        }
        Update: {
          created_at?: string
          empresa?: string
          id_precio?: number | null
          id_vehiculo?: number
          numero?: number | null
          placa_1?: string
          placa_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_id_precio_fkey"
            columns: ["id_precio"]
            isOneToOne: false
            referencedRelation: "precios"
            referencedColumns: ["id_precio"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
