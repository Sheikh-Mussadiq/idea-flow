-- Create subtasks table
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table subtasks enable row level security;

-- Policies
create policy "Users can view subtasks on boards they access"
  on subtasks for select
  using (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = subtasks.card_id
      and has_board_access(board_columns.board_id)
    )
  );

create policy "Editors and owners can manage subtasks"
  on subtasks for all
  using (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = subtasks.card_id
      and can_edit_board_content(board_columns.board_id)
    )
  );

-- Trigger for updated_at
create trigger update_subtasks_updated_at
  before update on subtasks
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table subtasks;
