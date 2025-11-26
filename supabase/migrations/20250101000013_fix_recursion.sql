-- Fix infinite recursion by decoupling policies and ensuring owner membership

-- 1. Create function to add board owner as member
create or replace function public.add_board_owner_to_members()
returns trigger as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'editor')
  on conflict (board_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create trigger on boards
drop trigger if exists add_owner_as_member on boards;
create trigger add_owner_as_member
  after insert on boards
  for each row
  execute function public.add_board_owner_to_members();

-- 3. Backfill existing boards: ensure owners are members
insert into public.board_members (board_id, user_id, role)
select id, owner_id, 'editor'
from boards
on conflict (board_id, user_id) do nothing;

-- 4. Update board_members policies to avoid querying boards table (breaking the cycle)
drop policy "Users can view members of boards they are on" on board_members;
drop policy "Owners can manage board members" on board_members;
-- Also drop the one I might have created or the default one if names match
-- drop policy if exists "Owners and editors can manage board members" on board_members;

create policy "Users can view members of boards they are on"
  on board_members for select
  using (
    user_id = auth.uid() OR
    board_id IN (
      select board_id from board_members where user_id = auth.uid()
    )
  );

create policy "Members can manage board members"
  on board_members for all
  using (
    exists (
      select 1 from board_members as bm
      where bm.board_id = board_members.board_id
      and bm.user_id = auth.uid()
      and bm.role = 'editor'
    )
  );
