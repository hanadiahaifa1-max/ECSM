import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LoBData {
  name: string;
  value: number;
  count: number;
}

export function useLoBDistribution() {
  const { user } = useAuth();
  const [lobData, setLobData] = useState<LoBData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoBDistribution = async () => {
    if (!user) {
      setLobData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use secure database function to get LoB distribution
      // This aggregates data without exposing individual user profiles
      const { data, error } = await supabase.rpc("get_lob_distribution");

      if (error) throw error;

      // Convert to array format
      const result: LoBData[] = (data || []).map((item: { lob_name: string; total_value: number; entry_count: number }) => ({
        name: item.lob_name,
        value: Number(item.total_value),
        count: Number(item.entry_count),
      }));

      setLobData(result);
    } catch (err) {
      console.error("Error fetching LoB distribution:", err);
      setLobData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoBDistribution();
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("lob-distribution-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_entries",
        },
        () => {
          fetchLoBDistribution();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    lobData,
    loading,
    refetch: fetchLoBDistribution,
  };
}
