-- Create ai_flows table
create table ai_flows (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ai_ideas table
create table ai_ideas (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid references ai_flows(id) on delete cascade not null,
  parent_id uuid references ai_ideas(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ai_flows enable row level security;
alter table ai_ideas enable row level security;

-- Policies for ai_flows
create policy "Users can view flows on boards they access"
  on ai_flows for select
  using (has_board_access(board_id));

create policy "Only owners can manage flows"
  on ai_flows for all
  using (
    exists (
      select 1 from boards
      where id = ai_flows.board_id
      and owner_id = (select auth.uid())
    )
  );

-- Policies for ai_ideas
create policy "Users can view ideas on flows they access"
  on ai_ideas for select
  using (
    exists (
      select 1 from ai_flows
      where id = ai_ideas.flow_id
      and has_board_access(board_id)
    )
  );

create policy "Only owners can manage ideas"
  on ai_ideas for all
  using (
    exists (
      select 1 from ai_flows
      join boards on boards.id = ai_flows.board_id
      where ai_flows.id = ai_ideas.flow_id
      and boards.owner_id = (select auth.uid())
    )
  );

-- Enable Realtime
alter publication supabase_realtime add table ai_flows;
alter publication supabase_realtime add table ai_ideas;
