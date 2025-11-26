-- Create comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null default (select auth.uid()),
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- Policies
create policy "Users can view comments on boards they access"
  on comments for select
  using (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = comments.card_id
      and has_board_access(board_columns.board_id)
    )
  );

create policy "Editors and owners can create comments"
  on comments for insert
  with check (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = comments.card_id
      and can_edit_board_content(board_columns.board_id)
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
      join board_columns on board_columns.id = cards.column_id
      join boards on boards.id = board_columns.board_id
      where cards.id = comments.card_id
      and boards.owner_id = (select auth.uid())
    )
  );

-- Trigger for updated_at
create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table comments;
