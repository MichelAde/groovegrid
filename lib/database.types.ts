export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organization: {
        Row: {
          id: string;
          name: string;
          subdomain: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          country: string | null;
          logo_url: string | null;
          brand_color: string;
          is_active: boolean;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          logo_url?: string | null;
          brand_color?: string;
          is_active?: boolean;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subdomain?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          logo_url?: string | null;
          brand_color?: string;
          is_active?: boolean;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          permissions: Json;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          permissions?: Json;
          joined_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          permissions?: Json;
          joined_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          category: string | null;
          start_datetime: string;
          end_datetime: string | null;
          venue_name: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          country: string | null;
          capacity: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          category?: string | null;
          start_datetime: string;
          end_datetime?: string | null;
          venue_name?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          capacity?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          category?: string | null;
          start_datetime?: string;
          end_datetime?: string | null;
          venue_name?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          capacity?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          price: number;
          quantity_available: number;
          quantity_sold: number;
          sale_start_date: string | null;
          sale_end_date: string | null;
          is_active: boolean;
          is_available: boolean;
          sort_order: number;
          max_per_order: number | null;
          min_per_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          price?: number;
          quantity_available?: number;
          quantity_sold?: number;
          sale_start_date?: string | null;
          sale_end_date?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          sort_order?: number;
          max_per_order?: number | null;
          min_per_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          quantity_available?: number;
          quantity_sold?: number;
          sale_start_date?: string | null;
          sale_end_date?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          sort_order?: number;
          max_per_order?: number | null;
          min_per_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          event_id: string | null;
          buyer_email: string | null;
          buyer_name: string | null;
          buyer_phone: string | null;
          subtotal: number | null;
          fees: number | null;
          tax: number | null;
          total: number | null;
          currency: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          payment_status: string | null;
          payment_method: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          event_id?: string | null;
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone?: string | null;
          subtotal?: number | null;
          fees?: number | null;
          tax?: number | null;
          total?: number | null;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_status?: string | null;
          payment_method?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          event_id?: string | null;
          buyer_email?: string | null;
          buyer_name?: string | null;
          buyer_phone?: string | null;
          subtotal?: number | null;
          fees?: number | null;
          tax?: number | null;
          total?: number | null;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_status?: string | null;
          payment_method?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          event_id: string | null;
          ticket_type_id: string | null;
          user_id: string | null;
          quantity: number;
          price_per_ticket: number | null;
          ticket_name: string | null;
          event_title: string | null;
          event_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          event_id?: string | null;
          ticket_type_id?: string | null;
          user_id?: string | null;
          quantity?: number;
          price_per_ticket?: number | null;
          ticket_name?: string | null;
          event_title?: string | null;
          event_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          event_id?: string | null;
          ticket_type_id?: string | null;
          user_id?: string | null;
          quantity?: number;
          price_per_ticket?: number | null;
          ticket_name?: string | null;
          event_title?: string | null;
          event_date?: string | null;
          created_at?: string;
        };
      };
      pass_types: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          type: string | null;
          price: number;
          credits_total: number | null;
          validity_days: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          type?: string | null;
          price: number;
          credits_total?: number | null;
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          type?: string | null;
          price?: number;
          credits_total?: number | null;
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_passes: {
        Row: {
          id: string;
          user_id: string;
          pass_type_id: string | null;
          order_id: string | null;
          credits_remaining: number | null;
          credits_total: number | null;
          purchase_date: string;
          expiry_date: string | null;
          status: string;
          stripe_session_id: string | null;
          amount_paid: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pass_type_id?: string | null;
          order_id?: string | null;
          credits_remaining?: number | null;
          credits_total?: number | null;
          purchase_date?: string;
          expiry_date?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          amount_paid?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pass_type_id?: string | null;
          order_id?: string | null;
          credits_remaining?: number | null;
          credits_total?: number | null;
          purchase_date?: string;
          expiry_date?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          amount_paid?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          instructor: string | null;
          level: string | null;
          duration_weeks: number | null;
          start_date: string | null;
          end_date: string | null;
          schedule_days: string[] | null;
          schedule_time: string | null;
          max_students: number | null;
          price: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          instructor?: string | null;
          level?: string | null;
          duration_weeks?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          schedule_days?: string[] | null;
          schedule_time?: string | null;
          max_students?: number | null;
          price?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          instructor?: string | null;
          level?: string | null;
          duration_weeks?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          schedule_days?: string[] | null;
          schedule_time?: string | null;
          max_students?: number | null;
          price?: number | null;
          status?: string;
          created_at?: string;
        };
      };
      class_packages: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          credits: number;
          price: number;
          validity_days: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          credits: number;
          price: number;
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          credits?: number;
          price?: number;
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      student_packages: {
        Row: {
          id: string;
          user_id: string;
          package_id: string | null;
          credits_remaining: number | null;
          credits_total: number | null;
          purchase_date: string;
          expiry_date: string | null;
          status: string;
          stripe_session_id: string | null;
          amount_paid: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id?: string | null;
          credits_remaining?: number | null;
          credits_total?: number | null;
          purchase_date?: string;
          expiry_date?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          amount_paid?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string | null;
          credits_remaining?: number | null;
          credits_total?: number | null;
          purchase_date?: string;
          expiry_date?: string | null;
          status?: string;
          stripe_session_id?: string | null;
          amount_paid?: number | null;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrollment_date: string;
          status: string;
          payment_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrollment_date?: string;
          status?: string;
          payment_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrollment_date?: string;
          status?: string;
          payment_status?: string | null;
          created_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          type: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          target_revenue: number | null;
          actual_audience_size: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          type?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          target_revenue?: number | null;
          actual_audience_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          type?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          target_revenue?: number | null;
          actual_audience_size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_sequences: {
        Row: {
          id: string;
          campaign_id: string;
          sequence_order: number | null;
          channel: string | null;
          delay_minutes: number | null;
          subject: string | null;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          sequence_order?: number | null;
          channel?: string | null;
          delay_minutes?: number | null;
          subject?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          sequence_order?: number | null;
          channel?: string | null;
          delay_minutes?: number | null;
          subject?: string | null;
          content?: string | null;
          created_at?: string;
        };
      };
      audience_segments: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          segment_type: string | null;
          filters: Json | null;
          estimated_size: number;
          is_dynamic: boolean;
          last_calculated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          segment_type?: string | null;
          filters?: Json | null;
          estimated_size?: number;
          is_dynamic?: boolean;
          last_calculated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          segment_type?: string | null;
          filters?: Json | null;
          estimated_size?: number;
          is_dynamic?: boolean;
          last_calculated_at?: string | null;
          created_at?: string;
        };
      };
      campaign_sends: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string | null;
          channel: string | null;
          status: string | null;
          sent_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          converted_at: string | null;
          revenue_generated: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          user_id?: string | null;
          channel?: string | null;
          status?: string | null;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          converted_at?: string | null;
          revenue_generated?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          user_id?: string | null;
          channel?: string | null;
          status?: string | null;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          converted_at?: string | null;
          revenue_generated?: number | null;
          created_at?: string;
        };
      };
    };
  };
}



