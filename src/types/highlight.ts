export const HIGHLIGHT_CATEGORIES = ["High", "Medium", "Low"];

export const HIGHLIGHT_STATUSES = ["On Progress", "Complate"];

export type HighlightStatus = (typeof HIGHLIGHT_STATUSES)[number];

export const DEPT_IN_CHARGE_OPTIONS = ["AM", "Product", "Delivery"] as const;

export type DeptInCharge = (typeof DEPT_IN_CHARGE_OPTIONS)[number];

export interface Highlight {
  id: string;
  title: string;
  category: string | null;
  related_account: string | null;
  related_opportunity: string | null;
  highlight_date: string | null;
  description: string | null;
  status: HighlightStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // New fields based on Excel structure
  se_name: string | null;
  presales_lob: string | null;
  support_needed: string | null;
  dept_in_charge: string | null;
  potential_rev: number | null;
  pipeline_entry_id: string | null;
  stage: string | null;
  // Joined data
  creator_name?: string;
}
