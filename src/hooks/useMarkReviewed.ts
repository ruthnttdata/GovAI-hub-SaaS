import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useGovernanceData";

type ReviewableTable = "ai_use_cases" | "risks" | "evidences";

export function useMarkReviewed(table: ReviewableTable) {
  const qc = useQueryClient();
  const { data: org } = useOrganization();
  const frequencyDays = org?.review_frequency_days ?? 90;

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const nextReview = new Date(Date.now() + frequencyDays * 86400000).toISOString();
      const reviewDateField = table === "evidences" ? "review_due_at" : "next_review_at";

      const updatePayload: Record<string, any> = {
        last_reviewed_at: now,
        [reviewDateField]: nextReview,
        reviewed_by: user.id,
        review_note: note || null,
      };

      const { error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq("id", id);
      if (error) throw error;

      // Audit log
      if (org?.id) {
        await supabase.from("audit_log").insert({
          organization_id: org.id,
          user_id: user.id,
          action: "review_marked",
          entity_type: table,
          entity_id: id,
          details: { review_note: note || null },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["requirement_evidence_map"] });
      qc.invalidateQueries({ queryKey: ["reviewStatus"] });
    },
  });
}
