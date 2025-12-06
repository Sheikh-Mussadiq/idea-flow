-- Optimize subtasks policies to use cards.board_id directly
-- (cards table now has board_id column, so we don't need to join board_columns)

-- Drop old policies
drop policy if exists "Users can view subtasks on boards they access" on subtasks;
drop policy if exists "Editors and owners can manage subtasks" on subtasks;

-- Create optimized policies using cards.board_id
create policy "Users can view subtasks on boards they access"
  on subtasks for select
  using (
    exists (
      select 1 from cards
      where cards.id = subtasks.card_id
      and has_board_access(cards.board_id)
    )
  );

create policy "Editors and owners can manage subtasks"
  on subtasks for all
  using (
    exists (
      select 1 from cards
      where cards.id = subtasks.card_id
      and can_edit_board_content(cards.board_id)
    )
  );

