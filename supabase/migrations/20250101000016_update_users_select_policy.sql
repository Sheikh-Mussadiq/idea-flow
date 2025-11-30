-- Drop the existing restrictive select policy
drop policy if exists "Users can view their own profile" on users;

-- Create new policy allowing all authenticated users to view all profiles
create policy "Authenticated users can view all profiles"
  on users for select
  to authenticated
  using (true);
