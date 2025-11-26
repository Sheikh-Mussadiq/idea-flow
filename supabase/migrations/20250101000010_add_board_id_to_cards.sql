-- Add board_id to cards table
alter table cards add column board_id uuid references boards(id) on delete cascade;

-- Populate board_id for existing cards (if any)
update cards
set board_id = board_columns.board_id
from board_columns
where cards.column_id = board_columns.id;

-- Make board_id not null
alter table cards alter column board_id set not null;

-- Update RLS policies for cards to use simpler board_id check
drop policy "Users can view cards on boards they access" on cards;
drop policy "Editors and owners can manage cards" on cards;

create policy "Users can view cards on boards they access"
  on cards for select
  using (has_board_access(board_id));

create policy "Editors and owners can manage cards"
  on cards for all
  using (can_edit_board_content(board_id));

-- Enable Realtime (already enabled, but good to be safe/explicit if re-running)
-- alter publication supabase_realtime add table cards;
