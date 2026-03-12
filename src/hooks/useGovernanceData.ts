import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useAiUseCases() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["ai_use_cases", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_use_cases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useCreateAiUseCase() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      code: string; name: string; description?: string; purpose?: string;
      owner_name?: string; department?: string; tool_name?: string;
      provider?: string; data_types?: string[]; user_count?: number;
      criticality?: string; status?: string;
    }) => {
      const { data, error } = await supabase
        .from("ai_use_cases")
        .insert({
          ...input,
          organization_id: profile!.organization_id!,
          created_by: user!.id,
          status: (input.status as any) ?? "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_use_cases"] }),
  });
}

export function useRisks() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["risks", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useCreateRisk() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      code: string; name: string; description?: string; category: string;
      impact: number; probability: number; status?: string;
      iso_clause?: string; annex_control?: string;
    }) => {
      const { data, error } = await supabase
        .from("risks")
        .insert({
          ...input,
          organization_id: profile!.organization_id!,
          created_by: user!.id,
          status: (input.status as any) ?? "open",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risks"] }),
  });
}

export function useControls() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["controls", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("controls")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useEvidences() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["evidences", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useCreateEvidence() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string; category: string; file_type?: string;
      owner_name?: string; version?: string; iso_clause?: string;
      owner_member_id?: string; file_url?: string | null; file_size?: number | null;
    }) => {
      const { data, error } = await supabase
        .from("evidences")
        .insert({
          name: input.name,
          category: input.category,
          file_type: input.file_type,
          owner_name: input.owner_name,
          version: input.version,
          iso_clause: input.iso_clause,
          owner_member_id: input.owner_member_id,
          file_url: input.file_url,
          file_size: input.file_size,
          organization_id: profile!.organization_id!,
          uploaded_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evidences"] }),
  });
}

export function useCommittees() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["committees", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committees")
        .select("*")
        .order("next_meeting", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useAiTools() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["ai_tools", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useCreateAiTool() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string; category?: string; user_count?: number; is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("ai_tools")
        .insert({
          ...input,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_tools"] }),
  });
}

export function useCreateGovernanceRole() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string; member_count?: number }) => {
      const { data, error } = await supabase
        .from("governance_roles")
        .insert({ ...input, organization_id: profile!.organization_id! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["governance_roles"] }),
  });
}

export function useCreateCommittee() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; cadence?: string; member_count?: number; next_meeting?: string }) => {
      const { data, error } = await supabase
        .from("committees")
        .insert({ ...input, organization_id: profile!.organization_id! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["committees"] }),
  });
}

export function useGovernanceRoles() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["governance_roles", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useReportExports() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["report_exports", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_exports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useAuditLog() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["audit_log", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}
