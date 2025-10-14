-- Add restrictive INSERT policy to profiles table
-- This prevents direct INSERT attempts via API, allowing only the trigger to create profiles
CREATE POLICY "Profiles can only be created via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (false);