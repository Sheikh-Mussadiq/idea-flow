-- Create cards table
create table cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid references board_columns(id) on delete cascade not null,
  title text not null,
  description text,
  position integer not null,
  priority text check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  assigned_to uuid[] default '{}',
  tags uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table cards enable row level security;

-- Policies
create policy "Users can view cards on boards they access"
  on cards for select
  using (
    exists (
      select 1 from board_columns
      where id = cards.column_id
      and has_board_access(board_id)
    )
  );

create policy "Editors and owners can manage cards"
  on cards for all
  using (
    exists (
      select 1 from board_columns
      where id = cards.column_id
      and can_edit_board_content(board_id)
    )
  );

-- Trigger for updated_at
create trigger update_cards_updated_at
  before update on cards
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table cards;
