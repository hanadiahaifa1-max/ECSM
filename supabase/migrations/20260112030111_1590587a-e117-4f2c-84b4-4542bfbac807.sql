
CREATE OR REPLACE FUNCTION public.get_lob_distribution()
 RETURNS TABLE(lob_name text, total_value numeric, entry_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    COALESCE(p.lob, 'Unknown') as lob_name,
    COALESCE(SUM(
      COALESCE(pe.jan_plan, 0) + COALESCE(pe.feb_plan, 0) + COALESCE(pe.mar_plan, 0) +
      COALESCE(pe.apr_plan, 0) + COALESCE(pe.may_plan, 0) + COALESCE(pe.jun_plan, 0) +
      COALESCE(pe.jul_plan, 0) + COALESCE(pe.aug_plan, 0) + COALESCE(pe.sep_plan, 0) +
      COALESCE(pe.oct_plan, 0) + COALESCE(pe.nov_plan, 0) + COALESCE(pe.dec_plan, 0)
    ), 0) as total_value,
    COUNT(pe.id) as entry_count
  FROM pipeline_entries pe
  LEFT JOIN profiles p ON pe.user_id = p.user_id
  WHERE p.lob IS NOT NULL AND p.lob != ''
  GROUP BY p.lob
  HAVING SUM(
    COALESCE(pe.jan_plan, 0) + COALESCE(pe.feb_plan, 0) + COALESCE(pe.mar_plan, 0) +
    COALESCE(pe.apr_plan, 0) + COALESCE(pe.may_plan, 0) + COALESCE(pe.jun_plan, 0) +
    COALESCE(pe.jul_plan, 0) + COALESCE(pe.aug_plan, 0) + COALESCE(pe.sep_plan, 0) +
    COALESCE(pe.oct_plan, 0) + COALESCE(pe.nov_plan, 0) + COALESCE(pe.dec_plan, 0)
  ) > 0
  ORDER BY total_value DESC;
$function$;
