-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own entries or admins view all" ON public.pipeline_entries;

-- Create new SELECT policy: All authenticated users can view all entries
CREATE POLICY "All authenticated users can view all entries"
ON public.pipeline_entries
FOR SELECT
TO authenticated
USING (true);

-- Note: UPDATE and DELETE policies remain the same (users can only modify their own entries)