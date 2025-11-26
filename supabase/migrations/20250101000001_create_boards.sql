-- Create boards table
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#6366f1',
  icon text default '📝',
  owner_id uuid references users(id) on delete cascade not null,
  is_archived boolean default false,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create board_members table
create table board_members (
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  role text check (role in ('viewer', 'editor')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (board_id, user_id)
);

-- Enable RLS
alter table boards enable row level security;
alter table board_members enable row level security;

-- Helper functions for RLS
-- Fix ambiguous column reference by renaming function parameters
drop function public.has_board_access(uuid) cascade;
drop function public.can_edit_board_content(uuid) cascade;
create or replace function public.has_board_access(p_board_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from boards
    where id = p_board_id
    and owner_id = (select auth.uid())
  ) or exists (
    select 1 from board_members
    where board_id = p_board_id
    and user_id = (select auth.uid())
  );
end;
$$ language plpgsql security definer;

create or replace function public.can_edit_board_content(p_board_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from boards
    where id = p_board_id
    and owner_id = (select auth.uid())
  ) or exists (
    select 1 from board_members
    where board_id = p_board_id
    and user_id = (select auth.uid())
    and role = 'editor'
  );
end;
$$ language plpgsql security definer;

-- Policies for boards
create policy "Users can view boards they are members of"
  on boards for select
  using (has_board_access(id));

create policy "Users can insert their own boards"
  on boards for insert
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their boards"
  on boards for update
  using ((select auth.uid()) = owner_id);

create policy "Owners can delete their boards"
  on boards for delete
  using ((select auth.uid()) = owner_id);

-- Policies for board_members
create policy "Users can view members of boards they are on"
  on board_members for select
  using (has_board_access(board_id));

create policy "Owners can manage board members"
  on board_members for all
  using (
    exists (
      select 1 from boards
      where id = board_members.board_id
      and owner_id = (select auth.uid())
    )
  );

-- Trigger for updated_at
create trigger update_boards_updated_at
  before update on boards
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table boards;
alter publication supabase_realtime add table board_members;