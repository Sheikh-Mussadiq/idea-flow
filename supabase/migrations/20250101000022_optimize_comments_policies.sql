-- Optimize comments policies to use cards.board_id directly
-- (cards table now has board_id column, so we don't need to join board_columns)

-- Drop old policies
drop policy if exists "Users can view comments on boards they access" on comments;
drop policy if exists "Editors and owners can create comments" on comments;
drop policy if exists "Users can update their own comments" on comments;
drop policy if exists "Users can delete their own comments or owners can delete any" on comments;

-- Create optimized policies using cards.board_id
create policy "Users can view comments on boards they access"
  on comments for select
  using (
    exists (
      select 1 from cards
      where cards.id = comments.card_id
      and has_board_access(cards.board_id)
    )
  );

create policy "Board members can create comments"
  on comments for insert
  with check (
    exists (
      select 1 from cards
      where cards.id = comments.card_id
      and has_board_access(cards.board_id)
    )
  );

create policy "Users can update their own comments"
  on comments for update
  using (user_id = (select auth.uid()));

create policy "Users can delete their own comments or owners can delete any"
  on comments for delete
  using (
    (user_id = (select auth.uid())) OR
    exists (
      select 1 from cards
      join boards on boards.id = cards.board_id
      where cards.id = comments.card_id
      and boards.owner_id = (select auth.uid())
    )
  );

