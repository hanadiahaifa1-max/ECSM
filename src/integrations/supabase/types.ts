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
      activity_plans: {
        Row: {
          account_name: string | null
          activity_date: string
          agenda: string | null
          am_name: string | null
          attachment_url: string | null
          contract_value: number | null
          created_at: string
          est_close_month: string | null
          id: string
          next_action: string | null
          opportunity_name: string | null
          output: string | null
          pipeline_entry_id: string | null
          rev_plan_fy26: number | null
          se_name: string
          solution_offer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          activity_date: string
          agenda?: string | null
          am_name?: string | null
          attachment_url?: string | null
          contract_value?: number | null
          created_at?: string
          est_close_month?: string | null
          id?: string
          next_action?: string | null
          opportunity_name?: string | null
          output?: string | null
          pipeline_entry_id?: string | null
          rev_plan_fy26?: number | null
          se_name: string
          solution_offer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          activity_date?: string
          agenda?: string | null
          am_name?: string | null
          attachment_url?: string | null
          contract_value?: number | null
          created_at?: string
          est_close_month?: string | null
          id?: string
          next_action?: string | null
          opportunity_name?: string | null
          output?: string | null
          pipeline_entry_id?: string | null
          rev_plan_fy26?: number | null
          se_name?: string
          solution_offer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_plans_pipeline_entry_id_fkey"
            columns: ["pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "pipeline_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          dept_in_charge: string | null
          description: string | null
          highlight_date: string | null
          id: string
          pipeline_entry_id: string | null
          potential_rev: number | null
          presales_lob: string | null
          related_account: string | null
          related_opportunity: string | null
          se_name: string | null
          stage: string | null
          status: string
          support_needed: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          dept_in_charge?: string | null
          description?: string | null
          highlight_date?: string | null
          id?: string
          pipeline_entry_id?: string | null
          potential_rev?: number | null
          presales_lob?: string | null
          related_account?: string | null
          related_opportunity?: string | null
          se_name?: string | null
          stage?: string | null
          status?: string
          support_needed?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          dept_in_charge?: string | null
          description?: string | null
          highlight_date?: string | null
          id?: string
          pipeline_entry_id?: string | null
          potential_rev?: number | null
          presales_lob?: string | null
          related_account?: string | null
          related_opportunity?: string | null
          se_name?: string | null
          stage?: string | null
          status?: string
          support_needed?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_pipeline_entry_id_fkey"
            columns: ["pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "pipeline_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_entries: {
        Row: {
          account_name: string
          am_name: string
          apr_plan: number | null
          attachment_url: string | null
          aug_plan: number | null
          bespoke_project: boolean | null
          close_month: string | null
          contract_period: number | null
          contract_value: number | null
          created_at: string
          dec_plan: number | null
          feb_plan: number | null
          id: string
          jan_plan: number | null
          jul_plan: number | null
          jun_plan: number | null
          mar_plan: number | null
          may_plan: number | null
          nov_plan: number | null
          oct_plan: number | null
          opportunity_name: string
          pilar: string
          po_month: string | null
          po_release: string | null
          po_release_date: string | null
          presales_lob: string | null
          product_family: string | null
          project_id: string | null
          se_name: string
          sep_plan: number | null
          si_name: string | null
          stage: string
          telkom_si: string | null
          tower: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          am_name: string
          apr_plan?: number | null
          attachment_url?: string | null
          aug_plan?: number | null
          bespoke_project?: boolean | null
          close_month?: string | null
          contract_period?: number | null
          contract_value?: number | null
          created_at?: string
          dec_plan?: number | null
          feb_plan?: number | null
          id?: string
          jan_plan?: number | null
          jul_plan?: number | null
          jun_plan?: number | null
          mar_plan?: number | null
          may_plan?: number | null
          nov_plan?: number | null
          oct_plan?: number | null
          opportunity_name: string
          pilar: string
          po_month?: string | null
          po_release?: string | null
          po_release_date?: string | null
          presales_lob?: string | null
          product_family?: string | null
          project_id?: string | null
          se_name: string
          sep_plan?: number | null
          si_name?: string | null
          stage?: string
          telkom_si?: string | null
          tower: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          am_name?: string
          apr_plan?: number | null
          attachment_url?: string | null
          aug_plan?: number | null
          bespoke_project?: boolean | null
          close_month?: string | null
          contract_period?: number | null
          contract_value?: number | null
          created_at?: string
          dec_plan?: number | null
          feb_plan?: number | null
          id?: string
          jan_plan?: number | null
          jul_plan?: number | null
          jun_plan?: number | null
          mar_plan?: number | null
          may_plan?: number | null
          nov_plan?: number | null
          oct_plan?: number | null
          opportunity_name?: string
          pilar?: string
          po_month?: string | null
          po_release?: string | null
          po_release_date?: string | null
          presales_lob?: string | null
          product_family?: string | null
          project_id?: string | null
          se_name?: string
          sep_plan?: number | null
          si_name?: string | null
          stage?: string
          telkom_si?: string | null
          tower?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          lob: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lob?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lob?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lob_distribution: {
        Args: never
        Returns: {
          entry_count: number
          lob_name: string
          total_value: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
