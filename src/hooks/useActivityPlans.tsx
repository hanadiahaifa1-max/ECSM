import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ActivityPlan } from "@/types/activityPlan";

export function useActivityPlans() {
  const { user } = useAuth();
  const [activityPlans, setActivityPlans] = useState<ActivityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivityPlans = useCallback(async () => {
    if (!user) {
      setActivityPlans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_plans")
        .select("*")
        .order("activity_date", { ascending: false });

      if (error) throw error;

      setActivityPlans(data || []);
    } catch (err) {
      console.error("Error fetching activity plans:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivityPlans();
  }, [fetchActivityPlans]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("activity_plans_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_plans",
        },
        () => {
          fetchActivityPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchActivityPlans]);

  const addActivityPlan = async (
    plan: Omit<ActivityPlan, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    try {
      const { error } = await supabase.from("activity_plans").insert({
        user_id: user.id,
        se_name: plan.se_name,
        account_name: plan.account_name,
        opportunity_name: plan.opportunity_name,
        activity_date: plan.activity_date,
        am_name: plan.am_name,
        agenda: plan.agenda,
        solution_offer: plan.solution_offer,
        contract_value: plan.contract_value,
        rev_plan_fy26: plan.rev_plan_fy26,
        est_close_month: plan.est_close_month,
        output: plan.output,
        next_action: plan.next_action,
        pipeline_entry_id: plan.pipeline_entry_id,
        attachment_url: plan.attachment_url,
      });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("Error adding activity plan:", err);
      return { error: err as Error };
    }
  };

  const updateActivityPlan = async (id: string, plan: Partial<ActivityPlan>) => {
    try {
      // Build update object dynamically to avoid overwriting with undefined
      const updateData: Record<string, unknown> = {};
      
      if (plan.se_name !== undefined) updateData.se_name = plan.se_name;
      if (plan.account_name !== undefined) updateData.account_name = plan.account_name;
      if (plan.opportunity_name !== undefined) updateData.opportunity_name = plan.opportunity_name;
      if (plan.activity_date !== undefined) updateData.activity_date = plan.activity_date;
      if (plan.am_name !== undefined) updateData.am_name = plan.am_name;
      if (plan.agenda !== undefined) updateData.agenda = plan.agenda;
      if (plan.solution_offer !== undefined) updateData.solution_offer = plan.solution_offer;
      if (plan.contract_value !== undefined) updateData.contract_value = plan.contract_value;
      if (plan.rev_plan_fy26 !== undefined) updateData.rev_plan_fy26 = plan.rev_plan_fy26;
      if (plan.est_close_month !== undefined) updateData.est_close_month = plan.est_close_month;
      if (plan.output !== undefined) updateData.output = plan.output;
      if (plan.next_action !== undefined) updateData.next_action = plan.next_action;
      if (plan.pipeline_entry_id !== undefined) updateData.pipeline_entry_id = plan.pipeline_entry_id;
      if (plan.attachment_url !== undefined) updateData.attachment_url = plan.attachment_url;

      const { error } = await supabase
        .from("activity_plans")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("Error updating activity plan:", err);
      return { error: err as Error };
    }
  };

  const deleteActivityPlan = async (id: string) => {
    try {
      const { error } = await supabase.from("activity_plans").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("Error deleting activity plan:", err);
      return { error: err as Error };
    }
  };

  return {
    activityPlans,
    loading,
    error,
    addActivityPlan,
    updateActivityPlan,
    deleteActivityPlan,
    refetch: fetchActivityPlans,
  };
}
