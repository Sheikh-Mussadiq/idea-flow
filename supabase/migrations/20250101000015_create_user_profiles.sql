-- Create user_profiles table
create table user_profiles (
  user_id uuid primary key references users(id) on delete cascade not null,
  profile jsonb not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table user_profiles enable row level security;

-- Policies for regular users
create policy "Users can view their own profile"
  on user_profiles for select
  using (user_id = (select auth.uid()));

create policy "Users can insert their own profile"
  on user_profiles for insert
  with check (user_id = (select auth.uid()));

create policy "Users can update their own profile"
  on user_profiles for update
  using (user_id = (select auth.uid()));

create policy "Users can delete their own profile"
  on user_profiles for delete
  using (user_id = (select auth.uid()));

-- Policies for service role (allow all operations)
create policy "Service role can do all operations"
  on user_profiles for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Policies for service role (allow all operations)
create policy "Service role has full access"
  on user_profiles
  for all
  to service_role
  with check (true);

-- Trigger for updated_at
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table user_profiles;

