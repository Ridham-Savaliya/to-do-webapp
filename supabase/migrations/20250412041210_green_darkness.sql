/*
  # Add insert policy for users table

  1. Changes
    - Add RLS policy to allow users to insert their own data during registration
  
  2. Security
    - Policy ensures users can only insert rows where id matches their auth.uid()
    - This maintains data integrity while allowing user registration
*/

CREATE POLICY "Users can insert own data" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);