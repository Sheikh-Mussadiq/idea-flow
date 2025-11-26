-- Fix RLS policy for boards to avoid recursion and ensure owners can view their created boards

drop policy "Users can view boards they are members of" on boards;

create policy "Users can view boards they are members of"
  on boards for select
  using (
    owner_id = auth.uid() OR
    exists (
      select 1 from board_members
      where board_members.board_id = boards.id
      and board_members.user_id = auth.uid()
    )
  );
