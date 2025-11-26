-- Create users table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table users enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on users for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on users for update
  using ((select auth.uid()) = id);

-- Create function to handle new user signup with unique username generation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_username text;
  base_username text;
  counter integer := 0;
begin
  -- Generate base username from full_name (remove spaces)
  -- Fallback to 'user' if full_name is missing
  base_username := replace(coalesce(new.raw_user_meta_data->>'full_name', 'user'), ' ', '');
  
  -- Ensure we have at least something
  if base_username = '' then
    base_username := 'user';
  end if;
  
  new_username := base_username;
  
  -- Check uniqueness and append number if necessary
  while exists (select 1 from public.users where username = new_username) loop
    counter := counter + 1;
    new_username := base_username || '_' || counter;
  end loop;

  insert into public.users (id, email, full_name, avatar_url, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new_username
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

-- Prevent important info updates (id, email, username)
create or replace function public.prevent_imp_info_update_users()
returns trigger as $$
begin
  if NEW.id IS DISTINCT FROM OLD.id then
    raise exception 'ID cannot be updated';
  end if;
  if NEW.email IS DISTINCT FROM OLD.email then
    raise exception 'Email cannot be updated';
  end if;
  if NEW.username IS DISTINCT FROM OLD.username then
    raise exception 'Username cannot be updated';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger prevent_imp_info_update_users_trigger
  before update on users
  for each row
  execute function public.prevent_imp_info_update_users();
