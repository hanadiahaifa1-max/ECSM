-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy that allows all authenticated users to view all profiles
-- This is needed for LoB distribution chart to aggregate data across all users
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the update policy - users can only update their own profile
-- (This policy already exists, just documenting it here)