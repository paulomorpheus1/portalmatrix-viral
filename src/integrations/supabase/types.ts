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
      achievements: {
        Row: {
          awarded_at: string
          id: string
          payload: Json
          slug: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          id?: string
          payload?: Json
          slug: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          id?: string
          payload?: Json
          slug?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          balance_cents: number
          clicks: number
          code: string
          conversions: number
          created_at: string
          lifetime_cents: number
          parent_id: string | null
          user_id: string
        }
        Insert: {
          balance_cents?: number
          clicks?: number
          code: string
          conversions?: number
          created_at?: string
          lifetime_cents?: number
          parent_id?: string | null
          user_id: string
        }
        Update: {
          balance_cents?: number
          clicks?: number
          code?: string
          conversions?: number
          created_at?: string
          lifetime_cents?: number
          parent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          payload: Json
          target_id: string | null
          target_kind: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          target_id?: string | null
          target_kind?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          target_id?: string | null
          target_kind?: string | null
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          config: Json
          created_at: string
          default_provider: string | null
          fallback_chain: string[]
          id: string
          kind: Database["public"]["Enums"]["provider_kind"]
          name: string
          slug: string
        }
        Insert: {
          config?: Json
          created_at?: string
          default_provider?: string | null
          fallback_chain?: string[]
          id?: string
          kind: Database["public"]["Enums"]["provider_kind"]
          name: string
          slug: string
        }
        Update: {
          config?: Json
          created_at?: string
          default_provider?: string | null
          fallback_chain?: string[]
          id?: string
          kind?: Database["public"]["Enums"]["provider_kind"]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["content_kind"]
          media_url: string | null
          metadata: Json
          platforms: Database["public"]["Enums"]["social_platform"][]
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string
          viral_score: number | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["content_kind"]
          media_url?: string | null
          metadata?: Json
          platforms?: Database["public"]["Enums"]["social_platform"][]
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          viral_score?: number | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["content_kind"]
          media_url?: string | null
          metadata?: Json
          platforms?: Database["public"]["Enums"]["social_platform"][]
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          viral_score?: number | null
        }
        Relationships: []
      }
      content_jobs: {
        Row: {
          asset_id: string | null
          capability_slug: string
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          input: Json
          output: Json | null
          provider_slug: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          capability_slug: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          provider_slug?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id: string
        }
        Update: {
          asset_id?: string | null
          capability_slug?: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          provider_slug?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_jobs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          ref_id: string | null
          ref_kind: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          ref_id?: string | null
          ref_kind?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          ref_id?: string | null
          ref_kind?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credits_wallet: {
        Row: {
          balance: number
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification: {
        Row: {
          last_action_at: string | null
          level: number
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          last_action_at?: string | null
          level?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          last_action_at?: string | null
          level?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          external_id: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          payload: Json
          pix_copy_paste: string | null
          pix_qr_code: string | null
          provider: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["payment_kind"]
          payload?: Json
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          payload?: Json
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          id: string
          payload: Json
          platform: Database["public"]["Enums"]["social_platform"]
          rule_key: string
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          id?: string
          payload?: Json
          platform: Database["public"]["Enums"]["social_platform"]
          rule_key: string
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          id?: string
          payload?: Json
          platform?: Database["public"]["Enums"]["social_platform"]
          rule_key?: string
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string | null
          onboarding_completed: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string | null
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string | null
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      provider_usage: {
        Row: {
          capability_slug: string | null
          cost_cents: number | null
          created_at: string
          error: string | null
          id: string
          latency_ms: number | null
          provider_slug: string
          success: boolean | null
          tokens_in: number | null
          tokens_out: number | null
          user_id: string | null
        }
        Insert: {
          capability_slug?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          provider_slug: string
          success?: boolean | null
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Update: {
          capability_slug?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          provider_slug?: string
          success?: boolean | null
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          base_url: string | null
          config: Json
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["provider_kind"]
          name: string
          priority: number
          secret_name: string | null
          slug: string
          status: Database["public"]["Enums"]["provider_status"]
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          config?: Json
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["provider_kind"]
          name: string
          priority?: number
          secret_name?: string | null
          slug: string
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          config?: Json
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["provider_kind"]
          name?: string
          priority?: number
          secret_name?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_user_id: string
          created_at: string
          id: string
          referred_user_id: string
          reward_cents: number
          status: string
        }
        Insert: {
          affiliate_user_id: string
          created_at?: string
          id?: string
          referred_user_id: string
          reward_cents?: number
          status?: string
        }
        Update: {
          affiliate_user_id?: string
          created_at?: string
          id?: string
          referred_user_id?: string
          reward_cents?: number
          status?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          account_id: string
          asset_id: string
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          platform_post_id: string | null
          published_at: string | null
          scheduled_for: string
          status: string
          user_id: string
        }
        Insert: {
          account_id: string
          asset_id: string
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_for: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string
          asset_id?: string
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_for?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token_secret: string | null
          created_at: string
          expires_at: string | null
          external_id: string | null
          handle: string
          id: string
          metadata: Json
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token_secret: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_secret?: string | null
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          handle: string
          id?: string
          metadata?: Json
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token_secret?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_secret?: string | null
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          handle?: string
          id?: string
          metadata?: Json
          platform?: Database["public"]["Enums"]["social_platform"]
          refresh_token_secret?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          infinitepay_subscription_id: string | null
          metadata: Json
          plan: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          infinitepay_subscription_id?: string | null
          metadata?: Json
          plan: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          infinitepay_subscription_id?: string | null
          metadata?: Json
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trends: {
        Row: {
          captured_at: string
          id: string
          keyword: string
          payload: Json
          platform: Database["public"]["Enums"]["social_platform"]
          region: string | null
          score: number
        }
        Insert: {
          captured_at?: string
          id?: string
          keyword: string
          payload?: Json
          platform: Database["public"]["Enums"]["social_platform"]
          region?: string | null
          score?: number
        }
        Update: {
          captured_at?: string
          id?: string
          keyword?: string
          payload?: Json
          platform?: Database["public"]["Enums"]["social_platform"]
          region?: string | null
          score?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          event: string | null
          id: string
          payload: Json
          processed_at: string | null
          signature_ok: boolean | null
          source: string
        }
        Insert: {
          created_at?: string
          event?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          signature_ok?: boolean | null
          source: string
        }
        Update: {
          created_at?: string
          event?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          signature_ok?: boolean | null
          source?: string
        }
        Relationships: []
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_kind:
        | "post"
        | "short"
        | "reel"
        | "thumbnail"
        | "script"
        | "hook"
        | "cta"
        | "ugc"
        | "vsl"
        | "image"
        | "video"
        | "audio"
      content_status:
        | "draft"
        | "queued"
        | "generating"
        | "ready"
        | "published"
        | "failed"
        | "archived"
      payment_kind: "pix" | "subscription" | "one_time" | "payout"
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
        | "canceled"
      provider_kind:
        | "llm"
        | "image"
        | "video"
        | "audio"
        | "search"
        | "social"
        | "payment"
        | "storage"
      provider_status: "active" | "degraded" | "disabled" | "pending"
      social_platform:
        | "tiktok"
        | "instagram"
        | "facebook"
        | "threads"
        | "x"
        | "youtube"
        | "kwai"
        | "discord"
        | "telegram"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
        | "incomplete"
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
      app_role: ["admin", "moderator", "user"],
      content_kind: [
        "post",
        "short",
        "reel",
        "thumbnail",
        "script",
        "hook",
        "cta",
        "ugc",
        "vsl",
        "image",
        "video",
        "audio",
      ],
      content_status: [
        "draft",
        "queued",
        "generating",
        "ready",
        "published",
        "failed",
        "archived",
      ],
      payment_kind: ["pix", "subscription", "one_time", "payout"],
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "canceled",
      ],
      provider_kind: [
        "llm",
        "image",
        "video",
        "audio",
        "search",
        "social",
        "payment",
        "storage",
      ],
      provider_status: ["active", "degraded", "disabled", "pending"],
      social_platform: [
        "tiktok",
        "instagram",
        "facebook",
        "threads",
        "x",
        "youtube",
        "kwai",
        "discord",
        "telegram",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "expired",
        "incomplete",
      ],
    },
  },
} as const
