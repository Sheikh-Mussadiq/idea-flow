-- Optimize card_attachments policies to use cards.board_id directly
-- (cards table now has board_id column, so we don't need to join board_columns)

-- Drop old policies
drop policy if exists "Users can view attachments on boards they access" on card_attachments;
drop policy if exists "Editors and owners can upload attachments" on card_attachments;
drop policy if exists "Users can delete their own attachments or owners can delete any" on card_attachments;

-- Create optimized policies using cards.board_id
create policy "Users can view attachments on boards they access"
  on card_attachments for select
  using (
    exists (
      select 1 from cards
      where cards.id = card_attachments.card_id
      and has_board_access(cards.board_id)
    )
  );

create policy "Editors and owners can upload attachments"
  on card_attachments for insert
  with check (
    exists (
      select 1 from cards
      where cards.id = card_attachments.card_id
      and can_edit_board_content(cards.board_id)
    )
  );

create policy "Users can delete their own attachments or owners can delete any"
  on card_attachments for delete
  using (
    (uploaded_by = (select auth.uid())) OR
    exists (
      select 1 from cards
      join boards on boards.id = cards.board_id
      where cards.id = card_attachments.card_id
      and boards.owner_id = (select auth.uid())
    )
  );

