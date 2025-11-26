-- Create board_columns table
create table board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  title text not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table board_columns enable row level security;

-- Policies
create policy "Users can view columns of boards they access"
  on board_columns for select
  using (has_board_access(board_id));

create policy "Editors and owners can manage columns"
  on board_columns for all
  using (can_edit_board_content(board_id));

-- Enable Realtime
alter publication supabase_realtime add table board_columns;
