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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      hourly_reports: {
        Row: {
          auto_count: number | null
          bike_count: number | null
          bus_count: number | null
          car_count: number | null
          hour_slot: string | null
          id: string
          lcv_count: number | null
          truck_count: number | null
          video_id: string | null
        }
        Insert: {
          auto_count?: number | null
          bike_count?: number | null
          bus_count?: number | null
          car_count?: number | null
          hour_slot?: string | null
          id?: string
          lcv_count?: number | null
          truck_count?: number | null
          video_id?: string | null
        }
        Update: {
          auto_count?: number | null
          bike_count?: number | null
          bus_count?: number | null
          car_count?: number | null
          hour_slot?: string | null
          id?: string
          lcv_count?: number | null
          truck_count?: number | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hourly_reports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_jobs: {
        Row: {
          completed_at: string | null
          id: string
          logs: string | null
          progress: number | null
          started_at: string | null
          status: string | null
          video_id: string | null
          worker_node: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          logs?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          video_id?: string | null
          worker_node?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          logs?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          video_id?: string | null
          worker_node?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_jobs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          direction: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          road_junction: string | null
          status: string | null
          survey_date: string | null
        }
        Insert: {
          created_at?: string | null
          direction?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          road_junction?: string | null
          status?: string | null
          survey_date?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          road_junction?: string | null
          status?: string | null
          survey_date?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          file_size: string | null
          file_url: string | null
          format: string
          generated_at: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          file_size?: string | null
          file_url?: string | null
          format: string
          generated_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          file_size?: string | null
          file_url?: string | null
          format?: string
          generated_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_counts: {
        Row: {
          direction: string | null
          id: string
          timestamp_seconds: number | null
          vehicle_class: string | null
          video_id: string | null
        }
        Insert: {
          direction?: string | null
          id?: string
          timestamp_seconds?: number | null
          vehicle_class?: string | null
          video_id?: string | null
        }
        Update: {
          direction?: string | null
          id?: string
          timestamp_seconds?: number | null
          vehicle_class?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_counts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          duration: number | null
          filename: string | null
          id: string
          project_id: string | null
          resolution: string | null
          status: string | null
          storage_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          duration?: number | null
          filename?: string | null
          id?: string
          project_id?: string | null
          resolution?: string | null
          status?: string | null
          storage_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          duration?: number | null
          filename?: string | null
          id?: string
          project_id?: string | null
          resolution?: string | null
          status?: string | null
          storage_url?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
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
  public: {
    Enums: {},
  },
} as const
