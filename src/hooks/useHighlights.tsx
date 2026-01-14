import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Highlight } from "@/types/highlight";

export function useHighlights() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHighlights = async () => {
    if (!user) {
      setHighlights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("highlights")
        .select("*")
        .order("highlight_date", { ascending: false });

      if (error) throw error;

      const mappedData: Highlight[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        related_account: item.related_account,
        related_opportunity: item.related_opportunity,
        highlight_date: item.highlight_date,
        description: item.description,
        status: item.status,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        se_name: item.se_name,
        presales_lob: item.presales_lob,
        support_needed: item.support_needed,
        dept_in_charge: item.dept_in_charge,
        potential_rev: item.potential_rev,
        pipeline_entry_id: item.pipeline_entry_id,
        stage: item.stage,
        creator_name: item.se_name || "Unknown",
      }));

      setHighlights(mappedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("highlights-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "highlights",
        },
        () => {
          fetchHighlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addHighlight = async (
    highlight: Omit<Highlight, "id" | "created_at" | "updated_at" | "created_by" | "creator_name">
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("highlights").insert({
      title: highlight.title,
      category: highlight.category,
      related_account: highlight.related_account,
      related_opportunity: highlight.related_opportunity,
      highlight_date: highlight.highlight_date,
      description: highlight.description,
      status: highlight.status,
      se_name: highlight.se_name,
      presales_lob: highlight.presales_lob,
      support_needed: highlight.support_needed,
      dept_in_charge: highlight.dept_in_charge,
      potential_rev: highlight.potential_rev,
      pipeline_entry_id: highlight.pipeline_entry_id,
      stage: highlight.stage,
      created_by: user.id,
    });

    return { error };
  };

  const updateHighlight = async (id: string, highlight: Partial<Highlight>) => {
    const { error } = await supabase
      .from("highlights")
      .update({
        title: highlight.title,
        category: highlight.category,
        related_account: highlight.related_account,
        related_opportunity: highlight.related_opportunity,
        highlight_date: highlight.highlight_date,
        description: highlight.description,
        status: highlight.status,
        se_name: highlight.se_name,
        presales_lob: highlight.presales_lob,
        support_needed: highlight.support_needed,
        dept_in_charge: highlight.dept_in_charge,
        potential_rev: highlight.potential_rev,
        pipeline_entry_id: highlight.pipeline_entry_id,
        stage: highlight.stage,
      })
      .eq("id", id);

    return { error };
  };

  const deleteHighlight = async (id: string) => {
    const { error } = await supabase.from("highlights").delete().eq("id", id);

    return { error };
  };

  return {
    highlights,
    loading,
    error,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    refetch: fetchHighlights,
  };
}
