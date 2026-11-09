// Generated from the Supabase "Smart TV" development project (public schema).
// Regenerate after each migration (Supabase MCP `generate_typescript_types` or
// `supabase gen types typescript --project-id <ref>`).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'fulfilling'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' };
  public: {
    Tables: {
      contact_requests: {
        Row: {
          consent_given: boolean;
          consent_text_version: string;
          created_at: string;
          email: string;
          id: string;
          kind: 'support' | 'launch_waitlist';
          locale: string;
          market_code: string | null;
          message: string | null;
          name: string | null;
          status: string;
          subject: string | null;
          interest_duration_months: number | null;
          interest_streams: number | null;
          preferred_device: 'smart_tv' | 'streaming_device' | 'mobile' | 'computer' | null;
        };
        Insert: {
          consent_given: boolean;
          consent_text_version: string;
          email: string;
          kind: 'support' | 'launch_waitlist';
          locale?: string;
          market_code?: string | null;
          message?: string | null;
          name?: string | null;
          subject?: string | null;
          interest_duration_months?: number | null;
          interest_streams?: number | null;
          preferred_device?: 'smart_tv' | 'streaming_device' | 'mobile' | 'computer' | null;
        };
        Update: never;
        Relationships: [];
      };
      markets: {
        Row: {
          code: string;
          created_at: string;
          currency: string;
          default_locale: string;
          is_active: boolean;
          licensed: boolean;
          name: string;
          sales_enabled: boolean;
          tax_inclusive_pricing: boolean;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      plans: {
        Row: { created_at: string; duration_months: number; id: number; is_active: boolean; streams: number };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      prices: {
        Row: {
          amount_minor: number;
          created_at: string;
          currency: string;
          id: string;
          market_code: string;
          plan_id: number;
          status: 'illustrative' | 'approved' | 'retired';
          valid_from: string;
          valid_to: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'prices_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_webhook_events: {
        Row: {
          event_type: string;
          id: string;
          order_id: string | null;
          payload: Json;
          processed_at: string | null;
          processing_error: string | null;
          provider: string;
          provider_event_id: string;
          received_at: string;
        };
        Insert: {
          event_type: string;
          order_id?: string | null;
          payload: Json;
          provider: string;
          provider_event_id: string;
        };
        Update: { processed_at?: string | null; processing_error?: string | null; order_id?: string | null };
        Relationships: [];
      };
      orders: {
        Row: {
          created_at: string;
          currency: string;
          customer_id: string | null;
          email: string;
          id: string;
          idempotency_key: string;
          market_code: string;
          payment_provider: string | null;
          payment_reference: string | null;
          plan_id: number;
          price_id: string;
          reference: string;
          status: OrderStatus;
          subtotal_minor: number;
          tax_minor: number;
          terms_accepted_at: string | null;
          terms_version: string | null;
          total_minor: number | null;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      contact_kind: 'support' | 'launch_waitlist';
      order_status: OrderStatus;
      price_status: 'illustrative' | 'approved' | 'retired';
    };
    CompositeTypes: { [_ in never]: never };
  };
};
