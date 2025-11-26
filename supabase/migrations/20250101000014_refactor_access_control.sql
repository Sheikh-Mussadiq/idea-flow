-- Refactor access control to fix recursion and enforce strict owner permissions

-- 1. Clean up previous attempts
drop trigger if exists add_owner_as_member on boards;
drop function if exists public.add_board_owner_to_members();

-- 2. Create Security Definer functions to break recursion loops
-- These functions bypass RLS to check the underlying tables directly
create or replace function public.is_board_owner(p_board_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from boards
    where id = p_board_id
    and owner_id = (select auth.uid())
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_board_member(p_board_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from board_members
    where board_id = p_board_id
    and user_id = (select auth.uid())
  );
end;
$$ language plpgsql security definer;

-- 3. Redefine general access function using the new primitives
create or replace function public.has_board_access(p_board_id uuid)
returns boolean as $$
begin
  return is_board_owner(p_board_id) or is_board_member(p_board_id);
end;
$$ language plpgsql security definer;

-- 4. Redefine edit content function (Owner OR Editor)
create or replace function public.can_edit_board_content(p_board_id uuid)
returns boolean as $$
begin
  return is_board_owner(p_board_id) or exists (
    select 1 from board_members
    where board_id = p_board_id
    and user_id = (select auth.uid())
    and role = 'editor'
  );
end;
$$ language plpgsql security definer;

-- 5. Update Boards Policies
drop policy if exists "Users can view boards they are members of" on boards;
drop policy if exists "Users can insert their own boards" on boards;
drop policy if exists "Owners can update their boards" on boards;
drop policy if exists "Owners can delete their boards" on boards;
drop policy if exists "Users can view boards" on boards; -- Cleanup potential duplicates

create policy "Users can view boards"
  on boards for select
  using (owner_id = auth.uid() or is_board_member(id));

create policy "Users can create boards"
  on boards for insert
  with check (owner_id = auth.uid());

create policy "Owners can update boards"
  on boards for update
  using (owner_id = auth.uid());

create policy "Owners can delete boards"
  on boards for delete
  using (owner_id = auth.uid());

-- 6. Update Board Members Policies
drop policy if exists "Users can view members of boards they are on" on board_members;
drop policy if exists "Owners can manage board members" on board_members;
drop policy if exists "Members can manage board members" on board_members;
drop policy if exists "Users can view board members" on board_members; -- Cleanup potential duplicates

create policy "Users can view board members"
  on board_members for select
  using (user_id = auth.uid() or is_board_owner(board_id));

create policy "Owners can manage board members"
  on board_members for all
  using (is_board_owner(board_id));
