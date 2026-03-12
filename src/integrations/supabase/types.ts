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
      action_items: {
        Row: {
          assignee: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          organization_id: string
          status: Database["public"]["Enums"]["action_item_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["action_item_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["action_item_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tools: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          user_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          user_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          user_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_use_cases: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          criticality: string | null
          data_types: string[] | null
          deleted_at: string | null
          department: string | null
          description: string | null
          id: string
          impact: string | null
          last_reviewed_at: string | null
          model_name: string | null
          name: string
          next_review_at: string | null
          organization_id: string
          owner_name: string | null
          provider: string | null
          purpose: string | null
          review_note: string | null
          reviewed_by: string | null
          risk_score: number | null
          status: Database["public"]["Enums"]["use_case_status"] | null
          tool_name: string | null
          updated_at: string
          user_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          criticality?: string | null
          data_types?: string[] | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          last_reviewed_at?: string | null
          model_name?: string | null
          name: string
          next_review_at?: string | null
          organization_id: string
          owner_name?: string | null
          provider?: string | null
          purpose?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["use_case_status"] | null
          tool_name?: string | null
          updated_at?: string
          user_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          criticality?: string | null
          data_types?: string[] | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          last_reviewed_at?: string | null
          model_name?: string | null
          name?: string
          next_review_at?: string | null
          organization_id?: string
          owner_name?: string | null
          provider?: string | null
          purpose?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["use_case_status"] | null
          tool_name?: string | null
          updated_at?: string
          user_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_use_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_profiles: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_email: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          legal_name: string | null
          organization_id: string
          postcode: string | null
          region: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          organization_id: string
          postcode?: string | null
          region?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          organization_id?: string
          postcode?: string | null
          region?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          cadence: string | null
          created_at: string
          id: string
          member_count: number | null
          name: string
          next_meeting: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          cadence?: string | null
          created_at?: string
          id?: string
          member_count?: number | null
          name: string
          next_meeting?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          cadence?: string | null
          created_at?: string
          id?: string
          member_count?: number | null
          name?: string
          next_meeting?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      controls: {
        Row: {
          annex_control: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          due_date: string | null
          evidence_ids: string[] | null
          id: string
          iso_clause: string | null
          name: string
          organization_id: string
          owner_name: string | null
          requirement_id: string | null
          risk_id: string | null
          status: Database["public"]["Enums"]["control_status"] | null
          updated_at: string
        }
        Insert: {
          annex_control?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_ids?: string[] | null
          id?: string
          iso_clause?: string | null
          name: string
          organization_id: string
          owner_name?: string | null
          requirement_id?: string | null
          risk_id?: string | null
          status?: Database["public"]["Enums"]["control_status"] | null
          updated_at?: string
        }
        Update: {
          annex_control?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_ids?: string[] | null
          id?: string
          iso_clause?: string | null
          name?: string
          organization_id?: string
          owner_name?: string | null
          requirement_id?: string | null
          risk_id?: string | null
          status?: Database["public"]["Enums"]["control_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "controls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controls_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      evidences: {
        Row: {
          category: string
          control_id: string | null
          created_at: string
          deleted_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          iso_clause: string | null
          last_reviewed_at: string | null
          metadata: Json | null
          name: string
          organization_id: string
          owner_member_id: string | null
          owner_name: string | null
          requirement_id: string | null
          review_due_at: string | null
          review_note: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["evidence_status"] | null
          updated_at: string
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          category: string
          control_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          iso_clause?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          name: string
          organization_id: string
          owner_member_id?: string | null
          owner_name?: string | null
          requirement_id?: string | null
          review_due_at?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["evidence_status"] | null
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          control_id?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          iso_clause?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          owner_member_id?: string | null
          owner_name?: string | null
          requirement_id?: string | null
          review_due_at?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["evidence_status"] | null
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidences_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_owner_member_id_fkey"
            columns: ["owner_member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
        ]
      }
      export_log: {
        Row: {
          created_at: string
          evidence_pack_id: string | null
          export_formats: Json
          export_kind: string
          id: string
          is_trial_export: boolean
          organization_id: string
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string
          evidence_pack_id?: string | null
          export_formats?: Json
          export_kind?: string
          id?: string
          is_trial_export?: boolean
          organization_id: string
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string
          evidence_pack_id?: string | null
          export_formats?: Json
          export_kind?: string
          id?: string
          is_trial_export?: boolean
          organization_id?: string
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_reviews: {
        Row: {
          action_items_count: number | null
          attendees: string[] | null
          created_at: string
          created_by: string | null
          decisions: string | null
          id: string
          notes: string | null
          organization_id: string
          review_date: string
          review_type: string
          title: string
          updated_at: string
        }
        Insert: {
          action_items_count?: number | null
          attendees?: string[] | null
          created_at?: string
          created_by?: string | null
          decisions?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          review_date?: string
          review_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_items_count?: number | null
          attendees?: string[] | null
          created_at?: string
          created_by?: string | null
          decisions?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          review_date?: string
          review_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_roles: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          member_count: number | null
          name: string
          organization_id: string
          responsibles: string[] | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number | null
          name: string
          organization_id: string
          responsibles?: string[] | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number | null
          name?: string
          organization_id?: string
          responsibles?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          certification_interest: boolean | null
          company: string | null
          created_at: string | null
          email: string
          employees_range: string | null
          id: string
          message: string | null
          name: string
          num_consultants: string | null
          num_target_clients: string | null
          sector: string | null
          source: string | null
        }
        Insert: {
          certification_interest?: boolean | null
          company?: string | null
          created_at?: string | null
          email: string
          employees_range?: string | null
          id?: string
          message?: string | null
          name: string
          num_consultants?: string | null
          num_target_clients?: string | null
          sector?: string | null
          source?: string | null
        }
        Update: {
          certification_interest?: boolean | null
          company?: string | null
          created_at?: string | null
          email?: string
          employees_range?: string | null
          id?: string
          message?: string | null
          name?: string
          num_consultants?: string | null
          num_target_clients?: string | null
          sector?: string | null
          source?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendees: string[] | null
          committee_id: string
          created_at: string
          date: string
          id: string
          minutes_url: string | null
          organization_id: string
          summary: string | null
          title: string
        }
        Insert: {
          attendees?: string[] | null
          committee_id: string
          created_at?: string
          date: string
          id?: string
          minutes_url?: string | null
          organization_id: string
          summary?: string | null
          title: string
        }
        Update: {
          attendees?: string[] | null
          committee_id?: string
          created_at?: string
          date?: string
          id?: string
          minutes_url?: string | null
          organization_id?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      office_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_headquarters: boolean
          name: string
          organization_id: string
          postcode: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_headquarters?: boolean
          name: string
          organization_id: string
          postcode?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_headquarters?: boolean
          name?: string
          organization_id?: string
          postcode?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          job_title: string | null
          organization_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_title?: string | null
          organization_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_title?: string | null
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          advanced_mode_enabled: boolean
          ai_scope: string | null
          aims_scope: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_postcode: string | null
          billing_region: string | null
          compliance_contact_email: string | null
          compliance_contact_name: string | null
          country: string | null
          created_at: string
          critical_overdue_days: number
          criticality_level: string | null
          deleted_at: string | null
          employee_count: number | null
          employee_range: string | null
          export_blocking_enabled: boolean
          export_blocking_scope: string
          id: string
          iso_readiness_pct: number | null
          legal_company_name: string | null
          name: string
          onboarding_step: number | null
          partner_id: string | null
          regulatory_framework: string | null
          review_frequency_days: number
          review_mode: string
          sector: string | null
          tax_id: string | null
          trade_name: string | null
          trial_ends_at: string | null
          trial_exports_used: number
          trial_started_at: string | null
          updated_at: string
          vertical_template: string | null
          warning_before_days: number
          website: string | null
        }
        Insert: {
          advanced_mode_enabled?: boolean
          ai_scope?: string | null
          aims_scope?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postcode?: string | null
          billing_region?: string | null
          compliance_contact_email?: string | null
          compliance_contact_name?: string | null
          country?: string | null
          created_at?: string
          critical_overdue_days?: number
          criticality_level?: string | null
          deleted_at?: string | null
          employee_count?: number | null
          employee_range?: string | null
          export_blocking_enabled?: boolean
          export_blocking_scope?: string
          id?: string
          iso_readiness_pct?: number | null
          legal_company_name?: string | null
          name: string
          onboarding_step?: number | null
          partner_id?: string | null
          regulatory_framework?: string | null
          review_frequency_days?: number
          review_mode?: string
          sector?: string | null
          tax_id?: string | null
          trade_name?: string | null
          trial_ends_at?: string | null
          trial_exports_used?: number
          trial_started_at?: string | null
          updated_at?: string
          vertical_template?: string | null
          warning_before_days?: number
          website?: string | null
        }
        Update: {
          advanced_mode_enabled?: boolean
          ai_scope?: string | null
          aims_scope?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postcode?: string | null
          billing_region?: string | null
          compliance_contact_email?: string | null
          compliance_contact_name?: string | null
          country?: string | null
          created_at?: string
          critical_overdue_days?: number
          criticality_level?: string | null
          deleted_at?: string | null
          employee_count?: number | null
          employee_range?: string | null
          export_blocking_enabled?: boolean
          export_blocking_scope?: string
          id?: string
          iso_readiness_pct?: number | null
          legal_company_name?: string | null
          name?: string
          onboarding_step?: number | null
          partner_id?: string | null
          regulatory_framework?: string | null
          review_frequency_days?: number
          review_mode?: string
          sector?: string | null
          tax_id?: string | null
          trade_name?: string | null
          trial_ends_at?: string | null
          trial_exports_used?: number
          trial_started_at?: string | null
          updated_at?: string
          vertical_template?: string | null
          warning_before_days?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_plans: {
        Row: {
          created_at: string
          current_period_exports: number | null
          id: string
          max_clients: number | null
          max_consultant_seats: number | null
          max_exports_per_month: number | null
          partner_id: string
          period_start: string | null
          plan_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_exports?: number | null
          id?: string
          max_clients?: number | null
          max_consultant_seats?: number | null
          max_exports_per_month?: number | null
          partner_id: string
          period_start?: string | null
          plan_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_exports?: number | null
          id?: string
          max_clients?: number | null
          max_consultant_seats?: number | null
          max_exports_per_month?: number | null
          partner_id?: string
          period_start?: string | null
          plan_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_plans_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_templates: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          partner_id: string
          template_type: string
          updated_at: string
          vertical: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          name: string
          partner_id: string
          template_type?: string
          updated_at?: string
          vertical?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          partner_id?: string
          template_type?: string
          updated_at?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_templates_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          accent_color: string | null
          brand_name: string | null
          created_at: string
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          name: string
          pdf_cover_logo_url: string | null
          pdf_footer_text: string | null
          portal_name: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name: string
          pdf_cover_logo_url?: string | null
          pdf_footer_text?: string | null
          portal_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          pdf_cover_logo_url?: string | null
          pdf_footer_text?: string | null
          portal_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          feature_flags: Json | null
          id: string
          is_active: boolean | null
          max_clients: number | null
          max_consultants: number | null
          max_evidences: number | null
          max_exports_per_month: number | null
          max_systems: number | null
          max_users: number | null
          name: string
          plan_type: string
          price_annual: number | null
          price_monthly: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_flags?: Json | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          max_consultants?: number | null
          max_evidences?: number | null
          max_exports_per_month?: number | null
          max_systems?: number | null
          max_users?: number | null
          name: string
          plan_type?: string
          price_annual?: number | null
          price_monthly?: number | null
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_flags?: Json | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          max_consultants?: number | null
          max_evidences?: number | null
          max_exports_per_month?: number | null
          max_systems?: number | null
          max_users?: number | null
          name?: string
          plan_type?: string
          price_annual?: number | null
          price_monthly?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          job_title: string | null
          locale: string
          organization_id: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          job_title?: string | null
          locale?: string
          organization_id?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          job_title?: string | null
          locale?: string
          organization_id?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      raci_entries: {
        Row: {
          id: string
          organization_id: string
          process_name: string
          raci_type: string
          role_id: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          process_name: string
          raci_type: string
          role_id?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          process_name?: string
          raci_type?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raci_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raci_entries_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "governance_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          exported_by: string | null
          file_size: number | null
          file_url: string | null
          format: string | null
          id: string
          manifest: Json | null
          name: string
          organization_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          exported_by?: string | null
          file_size?: number | null
          file_url?: string | null
          format?: string | null
          id?: string
          manifest?: Json | null
          name: string
          organization_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          exported_by?: string | null
          file_size?: number | null
          file_url?: string | null
          format?: string | null
          id?: string
          manifest?: Json | null
          name?: string
          organization_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_evidence_map: {
        Row: {
          control_id: string | null
          created_at: string
          critical: boolean
          evidence_id: string | null
          id: string
          iso_clause: string
          notes: string | null
          organization_id: string
          owner_name: string | null
          requirement_id: string
          requirement_name: string
          status: string | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          control_id?: string | null
          created_at?: string
          critical?: boolean
          evidence_id?: string | null
          id?: string
          iso_clause: string
          notes?: string | null
          organization_id: string
          owner_name?: string | null
          requirement_id: string
          requirement_name: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          control_id?: string | null
          created_at?: string
          critical?: boolean
          evidence_id?: string | null
          id?: string
          iso_clause?: string
          notes?: string | null
          organization_id?: string
          owner_name?: string | null
          requirement_id?: string
          requirement_name?: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_evidence_map_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_evidence_map_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_evidence_map_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          annex_control: string | null
          category: string
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          impact: number
          iso_clause: string | null
          last_reviewed_at: string | null
          name: string
          next_review_at: string | null
          organization_id: string
          probability: number
          review_note: string | null
          reviewed_by: string | null
          score: number | null
          status: Database["public"]["Enums"]["risk_status"] | null
          updated_at: string
          use_case_id: string | null
        }
        Insert: {
          annex_control?: string | null
          category: string
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          impact?: number
          iso_clause?: string | null
          last_reviewed_at?: string | null
          name: string
          next_review_at?: string | null
          organization_id: string
          probability?: number
          review_note?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string
          use_case_id?: string | null
        }
        Update: {
          annex_control?: string | null
          category?: string
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          impact?: number
          iso_clause?: string | null
          last_reviewed_at?: string | null
          name?: string
          next_review_at?: string | null
          organization_id?: string
          probability?: number
          review_note?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string
          use_case_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "ai_use_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignments: {
        Row: {
          assigned_at: string
          id: string
          member_id: string
          organization_id: string
          role_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          member_id: string
          organization_id: string
          role_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          member_id?: string
          organization_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "governance_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          grace_ends_at: string | null
          id: string
          notes_internal: string | null
          period_end: string | null
          period_start: string | null
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          tenant_type: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          grace_ends_at?: string | null
          id?: string
          notes_internal?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          tenant_type?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          grace_ends_at?: string | null
          id?: string
          notes_internal?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          tenant_type?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          is_read_only: boolean | null
          reason: string
          started_at: string
          support_user_id: string
          target_user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_read_only?: boolean | null
          reason: string
          started_at?: string
          support_user_id: string
          target_user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_read_only?: boolean | null
          reason?: string
          started_at?: string
          support_user_id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      usage_meters: {
        Row: {
          clients_count: number | null
          consultants_count: number | null
          created_at: string
          evidences_count: number | null
          exports_count: number | null
          id: string
          period_end: string
          period_start: string
          systems_count: number | null
          tenant_id: string
          tenant_type: string
          updated_at: string
          users_count: number | null
        }
        Insert: {
          clients_count?: number | null
          consultants_count?: number | null
          created_at?: string
          evidences_count?: number | null
          exports_count?: number | null
          id?: string
          period_end?: string
          period_start?: string
          systems_count?: number | null
          tenant_id: string
          tenant_type?: string
          updated_at?: string
          users_count?: number | null
        }
        Update: {
          clients_count?: number | null
          consultants_count?: number | null
          created_at?: string
          evidences_count?: number | null
          exports_count?: number | null
          id?: string
          period_end?: string
          period_start?: string
          systems_count?: number | null
          tenant_id?: string
          tenant_type?: string
          updated_at?: string
          users_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          organization_id: string | null
          partner_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          partner_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          partner_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      vertical_seed_data: {
        Row: {
          created_at: string
          data: Json
          entity_type: string
          id: string
          vertical: string
        }
        Insert: {
          created_at?: string
          data?: Json
          entity_type: string
          id?: string
          vertical: string
        }
        Update: {
          created_at?: string
          data?: Json
          entity_type?: string
          id?: string
          vertical?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      get_user_partner_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      setup_organization:
        | {
            Args: {
              _country?: string
              _employee_count?: number
              _org_name: string
              _sector?: string
            }
            Returns: string
          }
        | {
            Args: {
              _aims_scope?: string
              _country?: string
              _employee_count?: number
              _org_name: string
              _sector?: string
              _vertical_template?: string
            }
            Returns: string
          }
      try_trial_export: { Args: { _org_id: string }; Returns: boolean }
    }
    Enums: {
      action_item_status: "todo" | "in_progress" | "done" | "cancelled"
      app_role:
        | "admin"
        | "partner"
        | "viewer"
        | "org_admin"
        | "org_editor"
        | "org_viewer"
        | "partner_admin"
        | "partner_consultant"
        | "partner_viewer"
        | "platform_superadmin"
        | "platform_support"
      control_status:
        | "implemented"
        | "in_progress"
        | "pending"
        | "not_applicable"
      evidence_status: "current" | "obsolete" | "draft"
      risk_severity: "critical" | "high" | "medium" | "low"
      risk_status: "open" | "mitigating" | "closed"
      use_case_status: "approved" | "in_review" | "pending" | "retired"
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
      action_item_status: ["todo", "in_progress", "done", "cancelled"],
      app_role: [
        "admin",
        "partner",
        "viewer",
        "org_admin",
        "org_editor",
        "org_viewer",
        "partner_admin",
        "partner_consultant",
        "partner_viewer",
        "platform_superadmin",
        "platform_support",
      ],
      control_status: [
        "implemented",
        "in_progress",
        "pending",
        "not_applicable",
      ],
      evidence_status: ["current", "obsolete", "draft"],
      risk_severity: ["critical", "high", "medium", "low"],
      risk_status: ["open", "mitigating", "closed"],
      use_case_status: ["approved", "in_review", "pending", "retired"],
    },
  },
} as const
