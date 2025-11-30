-- Create ai_ideas_comments table
create table ai_ideas_comments (
  id uuid primary key default gen_random_uuid(),
  ai_idea_id uuid references ai_ideas(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null default (select auth.uid()),
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ai_ideas_comments enable row level security;

-- Policies
create policy "Users can view comments on ideas they can access"
  on ai_ideas_comments for select
  using (
    exists (
      select 1 from ai_ideas
      join ai_flows on ai_flows.id = ai_ideas.flow_id
      where ai_ideas.id = ai_ideas_comments.ai_idea_id
      and has_board_access(ai_flows.board_id)
    )
  );

create policy "Users can create comments on ideas they can access"
  on ai_ideas_comments for insert
  with check (
    exists (
      select 1 from ai_ideas
      join ai_flows on ai_flows.id = ai_ideas.flow_id
      where ai_ideas.id = ai_ideas_comments.ai_idea_id
      and has_board_access(ai_flows.board_id)
    )
  );

create policy "Users can update their own comments"
  on ai_ideas_comments for update
  using (user_id = (select auth.uid()));

create policy "Users can delete their own comments"
  on ai_ideas_comments for delete
  using (user_id = (select auth.uid()));

-- Trigger for updated_at
create trigger update_ai_ideas_comments_updated_at
  before update on ai_ideas_comments
  for each row
  execute function update_updated_at_column();

-- Enable Realtime
alter publication supabase_realtime add table ai_ideas_comments;
