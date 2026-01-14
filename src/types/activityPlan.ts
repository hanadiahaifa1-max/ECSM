export interface ActivityPlan {
  id: string;
  user_id: string;
  se_name: string;
  account_name: string | null;
  opportunity_name: string | null;
  activity_date: string;
  am_name: string | null;
  agenda: string | null;
  solution_offer: string | null;
  contract_value: number;
  rev_plan_fy26: number;
  est_close_month: string | null;
  output: string | null;
  next_action: string | null;
  pipeline_entry_id: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export const CLOSE_MONTHS = [
  "Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26",
  "Jul-26", "Aug-26", "Sep-26", "Oct-26", "Nov-26", "Dec-26",
];
