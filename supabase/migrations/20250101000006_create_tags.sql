-- Create tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table tags enable row level security;

-- Policies
create policy "Users can view tags on boards they access"
  on tags for select
  using (has_board_access(board_id));

create policy "Editors and owners can manage tags"
  on tags for all
  using (can_edit_board_content(board_id));

-- Enable Realtime
alter publication supabase_realtime add table tags;
