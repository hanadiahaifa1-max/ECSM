import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { PipelineEntry, Stage } from "@/types/pipeline";

interface DbPipelineEntry {
  id: string;
  user_id: string;
  account_name: string;
  opportunity_name: string;
  stage: string;
  product_family: string | null;
  pilar: string;
  tower: string;
  se_name: string;
  am_name: string;
  close_month: string | null;
  contract_value: number;
  contract_period?: number | "OTC" | null;
  jan_plan: number;
  feb_plan: number;
  mar_plan: number;
  apr_plan: number;
  may_plan: number;
  jun_plan: number;
  jul_plan: number;
  aug_plan: number;
  sep_plan: number;
  oct_plan: number;
  nov_plan: number;
  dec_plan: number;
  presales_lob?: string | null;
  telkom_si?: string | null;
  si_name?: string | null;
  bespoke_project?: boolean | null;
  project_id?: string | null;
  po_release?: string | null;
  po_release_date?: string | null;
  po_month: string | null;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
}

const mapDbToEntry = (item: DbPipelineEntry, index: number): PipelineEntry => ({
  id: item.id,
  no: index + 1,
  userId: item.user_id,
  telkomSI: item.telkom_si || "Telkom",
  siName: item.si_name || null,
  accountName: item.account_name,
  opportunityName: item.opportunity_name,
  stage: item.stage as Stage,
  productFamily: item.product_family || "",
  pilar: item.pilar,
  tower: item.tower,
  seName: item.se_name,
  presalesLoB: item.presales_lob || "",
  amName: item.am_name,
  closeMonth: item.close_month || "",
  contractPeriod: item.contract_period || 12,
  contractValue: Number(item.contract_value),
  revPlan: {
    jan: Number(item.jan_plan),
    feb: Number(item.feb_plan),
    mar: Number(item.mar_plan),
    apr: Number(item.apr_plan),
    may: Number(item.may_plan),
    jun: Number(item.jun_plan),
    jul: Number(item.jul_plan),
    aug: Number(item.aug_plan),
    sep: Number(item.sep_plan),
    oct: Number(item.oct_plan),
    nov: Number(item.nov_plan),
    dec: Number(item.dec_plan),
  },
  bespokeProject: item.bespoke_project || false,
  projectId: item.project_id || null,
  poReleaseDate: item.po_release_date || item.po_release || null,
  poReleaseNumber: item.po_month || null,
  attachmentUrl: item.attachment_url || null,
});

export function usePipeline() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pipeline_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedData = (data as DbPipelineEntry[]).map((item, index) => mapDbToEntry(item, index));
      setEntries(mappedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("pipeline-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_entries",
        },
        () => {
          fetchEntries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addEntry = async (entry: Omit<PipelineEntry, "id" | "no">) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("pipeline_entries").insert({
      user_id: user.id,
      account_name: entry.accountName,
      opportunity_name: entry.opportunityName,
      stage: entry.stage,
      product_family: entry.productFamily,
      pilar: entry.pilar,
      tower: entry.tower,
      se_name: entry.seName,
      presales_lob: entry.presalesLoB,
      am_name: entry.amName,
      close_month: entry.closeMonth,
      contract_period: typeof entry.contractPeriod === "number" ? entry.contractPeriod : null,
      contract_value: entry.contractValue,
      jan_plan: entry.revPlan.jan,
      feb_plan: entry.revPlan.feb,
      mar_plan: entry.revPlan.mar,
      apr_plan: entry.revPlan.apr,
      may_plan: entry.revPlan.may,
      jun_plan: entry.revPlan.jun,
      jul_plan: entry.revPlan.jul,
      aug_plan: entry.revPlan.aug,
      sep_plan: entry.revPlan.sep,
      oct_plan: entry.revPlan.oct,
      nov_plan: entry.revPlan.nov,
      dec_plan: entry.revPlan.dec,
      telkom_si: entry.telkomSI,
      si_name: entry.siName,
      bespoke_project: entry.bespokeProject,
      project_id: entry.projectId,
      po_release_date: entry.poReleaseDate,
      po_release: entry.poReleaseDate,
      po_month: entry.poReleaseNumber,
      attachment_url: entry.attachmentUrl,
    } as any);

    return { error };
  };

  const updateEntry = async (id: string, entry: Partial<PipelineEntry>) => {
    const updateData: Record<string, unknown> = {};

    if (entry.accountName !== undefined) updateData.account_name = entry.accountName;
    if (entry.opportunityName !== undefined) updateData.opportunity_name = entry.opportunityName;
    if (entry.stage !== undefined) updateData.stage = entry.stage;
    if (entry.productFamily !== undefined) updateData.product_family = entry.productFamily;
    if (entry.pilar !== undefined) updateData.pilar = entry.pilar;
    if (entry.tower !== undefined) updateData.tower = entry.tower;
    if (entry.seName !== undefined) updateData.se_name = entry.seName;
    if (entry.presalesLoB !== undefined) updateData.presales_lob = entry.presalesLoB;
    if (entry.amName !== undefined) updateData.am_name = entry.amName;
    if (entry.closeMonth !== undefined) updateData.close_month = entry.closeMonth;
    if (entry.contractPeriod !== undefined) updateData.contract_period = entry.contractPeriod;
    if (entry.contractValue !== undefined) updateData.contract_value = entry.contractValue;
    if (entry.telkomSI !== undefined) updateData.telkom_si = entry.telkomSI;
    if (entry.siName !== undefined) updateData.si_name = entry.siName;
    if (entry.bespokeProject !== undefined) updateData.bespoke_project = entry.bespokeProject;
    if (entry.projectId !== undefined) updateData.project_id = entry.projectId;
    if (entry.poReleaseDate !== undefined) {
      updateData.po_release_date = entry.poReleaseDate;
      updateData.po_release = entry.poReleaseDate;
    }
    if (entry.poReleaseNumber !== undefined) updateData.po_month = entry.poReleaseNumber;
    if (entry.attachmentUrl !== undefined) updateData.attachment_url = entry.attachmentUrl;
    if (entry.revPlan) {
      if (entry.revPlan.jan !== undefined) updateData.jan_plan = entry.revPlan.jan;
      if (entry.revPlan.feb !== undefined) updateData.feb_plan = entry.revPlan.feb;
      if (entry.revPlan.mar !== undefined) updateData.mar_plan = entry.revPlan.mar;
      if (entry.revPlan.apr !== undefined) updateData.apr_plan = entry.revPlan.apr;
      if (entry.revPlan.may !== undefined) updateData.may_plan = entry.revPlan.may;
      if (entry.revPlan.jun !== undefined) updateData.jun_plan = entry.revPlan.jun;
      if (entry.revPlan.jul !== undefined) updateData.jul_plan = entry.revPlan.jul;
      if (entry.revPlan.aug !== undefined) updateData.aug_plan = entry.revPlan.aug;
      if (entry.revPlan.sep !== undefined) updateData.sep_plan = entry.revPlan.sep;
      if (entry.revPlan.oct !== undefined) updateData.oct_plan = entry.revPlan.oct;
      if (entry.revPlan.nov !== undefined) updateData.nov_plan = entry.revPlan.nov;
      if (entry.revPlan.dec !== undefined) updateData.dec_plan = entry.revPlan.dec;
    }

    const { error } = await supabase.from("pipeline_entries").update(updateData).eq("id", id);

    return { error };
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("pipeline_entries").delete().eq("id", id);

    return { error };
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
