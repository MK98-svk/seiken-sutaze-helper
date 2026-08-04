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
  public: {
    Tables: {
      competition_entries: {
        Row: {
          competition_id: string
          id: string
          profile_id: string
          registered: boolean
        }
        Insert: {
          competition_id: string
          id?: string
          profile_id: string
          registered?: boolean
        }
        Update: {
          competition_id?: string
          id?: string
          profile_id?: string
          registered?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_results: {
        Row: {
          category: string | null
          competition_id: string
          created_at: string
          discipline: string
          id: string
          member_id: string
          num_competitors: number | null
          placement: number | null
        }
        Insert: {
          category?: string | null
          competition_id: string
          created_at?: string
          discipline: string
          id?: string
          member_id: string
          num_competitors?: number | null
          placement?: number | null
        }
        Update: {
          category?: string | null
          competition_id?: string
          created_at?: string
          discipline?: string
          id?: string
          member_id?: string
          num_competitors?: number | null
          placement?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_results_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_results_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          datum: string
          id: string
          nazov: string
        }
        Insert: {
          created_at?: string
          datum: string
          id?: string
          nazov: string
        }
        Update: {
          created_at?: string
          datum?: string
          id?: string
          nazov?: string
        }
        Relationships: []
      }
      member_competition_categories: {
        Row: {
          category: string
          competition_id: string
          created_at: string
          discipline: string
          id: string
          member_id: string
        }
        Insert: {
          category: string
          competition_id: string
          created_at?: string
          discipline: string
          id?: string
          member_id: string
        }
        Update: {
          category?: string
          competition_id?: string
          created_at?: string
          discipline?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_competition_categories_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_competition_categories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_competition_entries: {
        Row: {
          competition_id: string
          id: string
          member_id: string
          registered: boolean
        }
        Insert: {
          competition_id: string
          id?: string
          member_id: string
          registered?: boolean
        }
        Update: {
          competition_id?: string
          id?: string
          member_id?: string
          registered?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "member_competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_competition_entries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_competition_intents: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          kata: boolean
          kata_goju: boolean
          kata_open: boolean
          kobudo: boolean
          kumite: boolean
          member_id: string
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          kata?: boolean
          kata_goju?: boolean
          kata_open?: boolean
          kobudo?: boolean
          kumite?: boolean
          member_id: string
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          kata?: boolean
          kata_goju?: boolean
          kata_open?: boolean
          kobudo?: boolean
          kumite?: boolean
          member_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          bronz: number
          created_at: string
          datum_narodenia: string | null
          email: string | null
          id: string
          is_competitor: boolean
          is_trainee: boolean
          kata: boolean
          kobudo: boolean
          kumite: boolean
          meno: string
          pohlavie: string | null
          priezvisko: string
          striebro: number
          stupen: string
          updated_at: string
          user_id: string | null
          vaha: number | null
          vyska: number | null
          zlato: number
        }
        Insert: {
          bronz?: number
          created_at?: string
          datum_narodenia?: string | null
          email?: string | null
          id?: string
          is_competitor?: boolean
          is_trainee?: boolean
          kata?: boolean
          kobudo?: boolean
          kumite?: boolean
          meno?: string
          pohlavie?: string | null
          priezvisko?: string
          striebro?: number
          stupen?: string
          updated_at?: string
          user_id?: string | null
          vaha?: number | null
          vyska?: number | null
          zlato?: number
        }
        Update: {
          bronz?: number
          created_at?: string
          datum_narodenia?: string | null
          email?: string | null
          id?: string
          is_competitor?: boolean
          is_trainee?: boolean
          kata?: boolean
          kobudo?: boolean
          kumite?: boolean
          meno?: string
          pohlavie?: string | null
          priezvisko?: string
          striebro?: number
          stupen?: string
          updated_at?: string
          user_id?: string | null
          vaha?: number | null
          vyska?: number | null
          zlato?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          datum_narodenia: string | null
          id: string
          kata: boolean
          kobudo: boolean
          kumite: boolean
          meno: string
          priezvisko: string
          stupen: string
          updated_at: string
          vaha: number | null
          vyska: number | null
        }
        Insert: {
          created_at?: string
          datum_narodenia?: string | null
          id: string
          kata?: boolean
          kobudo?: boolean
          kumite?: boolean
          meno?: string
          priezvisko?: string
          stupen?: string
          updated_at?: string
          vaha?: number | null
          vyska?: number | null
        }
        Update: {
          created_at?: string
          datum_narodenia?: string | null
          id?: string
          kata?: boolean
          kobudo?: boolean
          kumite?: boolean
          meno?: string
          priezvisko?: string
          stupen?: string
          updated_at?: string
          vaha?: number | null
          vyska?: number | null
        }
        Relationships: []
      }
      team_competition_results: {
        Row: {
          category: string | null
          competition_id: string
          created_at: string
          discipline: string
          id: string
          members_text: string | null
          num_competitors: number | null
          placement: number | null
          team_name: string | null
        }
        Insert: {
          category?: string | null
          competition_id: string
          created_at?: string
          discipline: string
          id?: string
          members_text?: string | null
          num_competitors?: number | null
          placement?: number | null
          team_name?: string | null
        }
        Update: {
          category?: string | null
          competition_id?: string
          created_at?: string
          discipline?: string
          id?: string
          members_text?: string | null
          num_competitors?: number | null
          placement?: number | null
          team_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_competition_results_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          config: Json
          created_at: string
          goal: string | null
          id: string
          member_id: string
          mode: string
          name: string
          plan: Json
        }
        Insert: {
          config?: Json
          created_at?: string
          goal?: string | null
          id?: string
          member_id: string
          mode: string
          name?: string
          plan?: Json
        }
        Update: {
          config?: Json
          created_at?: string
          goal?: string | null
          id?: string
          member_id?: string
          mode?: string
          name?: string
          plan?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_min: number | null
          goal: string | null
          id: string
          member_id: string
          mode: string
          note: string | null
          performed_at: string
          title: string | null
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_min?: number | null
          goal?: string | null
          id?: string
          member_id: string
          mode: string
          note?: string | null
          performed_at?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_min?: number | null
          goal?: string | null
          id?: string
          member_id?: string
          mode?: string
          note?: string | null
          performed_at?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          created_at: string
          done: boolean
          exercise_id: string
          exercise_name: string
          id: string
          muscle_group: string | null
          reps: number | null
          session_id: string
          set_number: number
          weight: number | null
        }
        Insert: {
          created_at?: string
          done?: boolean
          exercise_id: string
          exercise_name: string
          id?: string
          muscle_group?: string | null
          reps?: number | null
          session_id: string
          set_number?: number
          weight?: number | null
        }
        Update: {
          created_at?: string
          done?: boolean
          exercise_id?: string
          exercise_name?: string
          id?: string
          muscle_group?: string | null
          reps?: number | null
          session_id?: string
          set_number?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "coach"
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
  public: {
    Enums: {
      app_role: ["admin", "member", "coach"],
    },
  },
} as const
