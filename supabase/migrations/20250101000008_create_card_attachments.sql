-- Create card_attachments table
create table card_attachments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references users(id) default (select auth.uid()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table card_attachments enable row level security;

-- Policies
create policy "Users can view attachments on boards they access"
  on card_attachments for select
  using (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = card_attachments.card_id
      and has_board_access(board_columns.board_id)
    )
  );

create policy "Editors and owners can upload attachments"
  on card_attachments for insert
  with check (
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      where cards.id = card_attachments.card_id
      and can_edit_board_content(board_columns.board_id)
    )
  );

create policy "Users can delete their own attachments or owners can delete any"
  on card_attachments for delete
  using (
    (uploaded_by = (select auth.uid())) OR
    exists (
      select 1 from cards
      join board_columns on board_columns.id = cards.column_id
      join boards on boards.id = board_columns.board_id
      where cards.id = card_attachments.card_id
      and boards.owner_id = (select auth.uid())
    )
  );

-- Enable Realtime
alter publication supabase_realtime add table card_attachments;
