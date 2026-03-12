import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrgMembers() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["org_members", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useCreateOrgMember() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { full_name: string; email: string; job_title?: string }) => {
      const { data, error } = await supabase
        .from("org_members")
        .insert({
          ...input,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org_members"] }),
  });
}

export function useDeleteOrgMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org_members"] }),
  });
}

export function useRoleAssignments() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["role_assignments", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_assignments")
        .select("*, org_members(id, full_name, email)")
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { role_id: string; member_id: string }) => {
      // Upsert: delete existing assignment for this role, then insert new one
      await supabase
        .from("role_assignments")
        .delete()
        .eq("role_id", input.role_id)
        .eq("organization_id", profile!.organization_id!);

      const { data, error } = await supabase
        .from("role_assignments")
        .insert({
          role_id: input.role_id,
          member_id: input.member_id,
          organization_id: profile!.organization_id!,
        })
        .select("*, org_members(id, full_name, email)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["role_assignments"] }),
  });
}
