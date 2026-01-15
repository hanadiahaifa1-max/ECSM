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
  telkom_name?: string | null;
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
  telkomName: item.telkom_name || null,
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
    // Extended years 2-5
    jan_y2: Number((item as any).jan_y2 || 0),
    feb_y2: Number((item as any).feb_y2 || 0),
    mar_y2: Number((item as any).mar_y2 || 0),
    apr_y2: Number((item as any).apr_y2 || 0),
    may_y2: Number((item as any).may_y2 || 0),
    jun_y2: Number((item as any).jun_y2 || 0),
    jul_y2: Number((item as any).jul_y2 || 0),
    aug_y2: Number((item as any).aug_y2 || 0),
    sep_y2: Number((item as any).sep_y2 || 0),
    oct_y2: Number((item as any).oct_y2 || 0),
    nov_y2: Number((item as any).nov_y2 || 0),
    dec_y2: Number((item as any).dec_y2 || 0),
    jan_y3: Number((item as any).jan_y3 || 0),
    feb_y3: Number((item as any).feb_y3 || 0),
    mar_y3: Number((item as any).mar_y3 || 0),
    apr_y3: Number((item as any).apr_y3 || 0),
    may_y3: Number((item as any).may_y3 || 0),
    jun_y3: Number((item as any).jun_y3 || 0),
    jul_y3: Number((item as any).jul_y3 || 0),
    aug_y3: Number((item as any).aug_y3 || 0),
    sep_y3: Number((item as any).sep_y3 || 0),
    oct_y3: Number((item as any).oct_y3 || 0),
    nov_y3: Number((item as any).nov_y3 || 0),
    dec_y3: Number((item as any).dec_y3 || 0),
    jan_y4: Number((item as any).jan_y4 || 0),
    feb_y4: Number((item as any).feb_y4 || 0),
    mar_y4: Number((item as any).mar_y4 || 0),
    apr_y4: Number((item as any).apr_y4 || 0),
    may_y4: Number((item as any).may_y4 || 0),
    jun_y4: Number((item as any).jun_y4 || 0),
    jul_y4: Number((item as any).jul_y4 || 0),
    aug_y4: Number((item as any).aug_y4 || 0),
    sep_y4: Number((item as any).sep_y4 || 0),
    oct_y4: Number((item as any).oct_y4 || 0),
    nov_y4: Number((item as any).nov_y4 || 0),
    dec_y4: Number((item as any).dec_y4 || 0),
    jan_y5: Number((item as any).jan_y5 || 0),
    feb_y5: Number((item as any).feb_y5 || 0),
    mar_y5: Number((item as any).mar_y5 || 0),
    apr_y5: Number((item as any).apr_y5 || 0),
    may_y5: Number((item as any).may_y5 || 0),
    jun_y5: Number((item as any).jun_y5 || 0),
    jul_y5: Number((item as any).jul_y5 || 0),
    aug_y5: Number((item as any).aug_y5 || 0),
    sep_y5: Number((item as any).sep_y5 || 0),
    oct_y5: Number((item as any).oct_y5 || 0),
    nov_y5: Number((item as any).nov_y5 || 0),
    dec_y5: Number((item as any).dec_y5 || 0),
  },
  bespokeProject: item.bespoke_project || false,
  projectId: item.project_id || null,
  poReleaseDate: item.po_release_date || item.po_release || null,
  poReleaseNumber: item.po_month || null,
  attachmentUrl: item.attachment_url || null,
  otcEntries: (item as any).otc_entries || [],
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
    if (entry.telkomName !== undefined) updateData.telkom_name = entry.telkomName;
    if (entry.bespokeProject !== undefined) updateData.bespoke_project = entry.bespokeProject;
    if (entry.projectId !== undefined) updateData.project_id = entry.projectId;
    if (entry.poReleaseDate !== undefined) {
      updateData.po_release_date = entry.poReleaseDate;
      updateData.po_release = entry.poReleaseDate;
    }
    if (entry.poReleaseNumber !== undefined) updateData.po_month = entry.poReleaseNumber;
    if (entry.attachmentUrl !== undefined) updateData.attachment_url = entry.attachmentUrl;

    // Handle extended revenue plan (years 2-5)
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

      // Extended fields for years 2-5
      const extendedEntry = entry as any;
      if (extendedEntry.revPlan?.jan_y2 !== undefined) updateData.jan_y2 = extendedEntry.revPlan.jan_y2;
      if (extendedEntry.revPlan?.feb_y2 !== undefined) updateData.feb_y2 = extendedEntry.revPlan.feb_y2;
      if (extendedEntry.revPlan?.mar_y2 !== undefined) updateData.mar_y2 = extendedEntry.revPlan.mar_y2;
      if (extendedEntry.revPlan?.apr_y2 !== undefined) updateData.apr_y2 = extendedEntry.revPlan.apr_y2;
      if (extendedEntry.revPlan?.may_y2 !== undefined) updateData.may_y2 = extendedEntry.revPlan.may_y2;
      if (extendedEntry.revPlan?.jun_y2 !== undefined) updateData.jun_y2 = extendedEntry.revPlan.jun_y2;
      if (extendedEntry.revPlan?.jul_y2 !== undefined) updateData.jul_y2 = extendedEntry.revPlan.jul_y2;
      if (extendedEntry.revPlan?.aug_y2 !== undefined) updateData.aug_y2 = extendedEntry.revPlan.aug_y2;
      if (extendedEntry.revPlan?.sep_y2 !== undefined) updateData.sep_y2 = extendedEntry.revPlan.sep_y2;
      if (extendedEntry.revPlan?.oct_y2 !== undefined) updateData.oct_y2 = extendedEntry.revPlan.oct_y2;
      if (extendedEntry.revPlan?.nov_y2 !== undefined) updateData.nov_y2 = extendedEntry.revPlan.nov_y2;
      if (extendedEntry.revPlan?.dec_y2 !== undefined) updateData.dec_y2 = extendedEntry.revPlan.dec_y2;

      if (extendedEntry.revPlan?.jan_y3 !== undefined) updateData.jan_y3 = extendedEntry.revPlan.jan_y3;
      if (extendedEntry.revPlan?.feb_y3 !== undefined) updateData.feb_y3 = extendedEntry.revPlan.feb_y3;
      if (extendedEntry.revPlan?.mar_y3 !== undefined) updateData.mar_y3 = extendedEntry.revPlan.mar_y3;
      if (extendedEntry.revPlan?.apr_y3 !== undefined) updateData.apr_y3 = extendedEntry.revPlan.apr_y3;
      if (extendedEntry.revPlan?.may_y3 !== undefined) updateData.may_y3 = extendedEntry.revPlan.may_y3;
      if (extendedEntry.revPlan?.jun_y3 !== undefined) updateData.jun_y3 = extendedEntry.revPlan.jun_y3;
      if (extendedEntry.revPlan?.jul_y3 !== undefined) updateData.jul_y3 = extendedEntry.revPlan.jul_y3;
      if (extendedEntry.revPlan?.aug_y3 !== undefined) updateData.aug_y3 = extendedEntry.revPlan.aug_y3;
      if (extendedEntry.revPlan?.sep_y3 !== undefined) updateData.sep_y3 = extendedEntry.revPlan.sep_y3;
      if (extendedEntry.revPlan?.oct_y3 !== undefined) updateData.oct_y3 = extendedEntry.revPlan.oct_y3;
      if (extendedEntry.revPlan?.nov_y3 !== undefined) updateData.nov_y3 = extendedEntry.revPlan.nov_y3;
      if (extendedEntry.revPlan?.dec_y3 !== undefined) updateData.dec_y3 = extendedEntry.revPlan.dec_y3;

      if (extendedEntry.revPlan?.jan_y4 !== undefined) updateData.jan_y4 = extendedEntry.revPlan.jan_y4;
      if (extendedEntry.revPlan?.feb_y4 !== undefined) updateData.feb_y4 = extendedEntry.revPlan.feb_y4;
      if (extendedEntry.revPlan?.mar_y4 !== undefined) updateData.mar_y4 = extendedEntry.revPlan.mar_y4;
      if (extendedEntry.revPlan?.apr_y4 !== undefined) updateData.apr_y4 = extendedEntry.revPlan.apr_y4;
      if (extendedEntry.revPlan?.may_y4 !== undefined) updateData.may_y4 = extendedEntry.revPlan.may_y4;
      if (extendedEntry.revPlan?.jun_y4 !== undefined) updateData.jun_y4 = extendedEntry.revPlan.jun_y4;
      if (extendedEntry.revPlan?.jul_y4 !== undefined) updateData.jul_y4 = extendedEntry.revPlan.jul_y4;
      if (extendedEntry.revPlan?.aug_y4 !== undefined) updateData.aug_y4 = extendedEntry.revPlan.aug_y4;
      if (extendedEntry.revPlan?.sep_y4 !== undefined) updateData.sep_y4 = extendedEntry.revPlan.sep_y4;
      if (extendedEntry.revPlan?.oct_y4 !== undefined) updateData.oct_y4 = extendedEntry.revPlan.oct_y4;
      if (extendedEntry.revPlan?.nov_y4 !== undefined) updateData.nov_y4 = extendedEntry.revPlan.nov_y4;
      if (extendedEntry.revPlan?.dec_y4 !== undefined) updateData.dec_y4 = extendedEntry.revPlan.dec_y4;

      if (extendedEntry.revPlan?.jan_y5 !== undefined) updateData.jan_y5 = extendedEntry.revPlan.jan_y5;
      if (extendedEntry.revPlan?.feb_y5 !== undefined) updateData.feb_y5 = extendedEntry.revPlan.feb_y5;
      if (extendedEntry.revPlan?.mar_y5 !== undefined) updateData.mar_y5 = extendedEntry.revPlan.mar_y5;
      if (extendedEntry.revPlan?.apr_y5 !== undefined) updateData.apr_y5 = extendedEntry.revPlan.apr_y5;
      if (extendedEntry.revPlan?.may_y5 !== undefined) updateData.may_y5 = extendedEntry.revPlan.may_y5;
      if (extendedEntry.revPlan?.jun_y5 !== undefined) updateData.jun_y5 = extendedEntry.revPlan.jun_y5;
      if (extendedEntry.revPlan?.jul_y5 !== undefined) updateData.jul_y5 = extendedEntry.revPlan.jul_y5;
      if (extendedEntry.revPlan?.aug_y5 !== undefined) updateData.aug_y5 = extendedEntry.revPlan.aug_y5;
      if (extendedEntry.revPlan?.sep_y5 !== undefined) updateData.sep_y5 = extendedEntry.revPlan.sep_y5;
      if (extendedEntry.revPlan?.oct_y5 !== undefined) updateData.oct_y5 = extendedEntry.revPlan.oct_y5;
      if (extendedEntry.revPlan?.nov_y5 !== undefined) updateData.nov_y5 = extendedEntry.revPlan.nov_y5;
      if (extendedEntry.revPlan?.dec_y5 !== undefined) updateData.dec_y5 = extendedEntry.revPlan.dec_y5;
    }

    // Handle OTC entries
    if ((entry as any).otcEntries !== undefined) {
      updateData.otc_entries = (entry as any).otcEntries;
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
