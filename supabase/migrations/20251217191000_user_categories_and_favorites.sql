-- 1. User Categories (user-owned)
create table if not exists public.board_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  color text, -- Optional color for the category
  created_at timestamptz default now(),
  unique (user_id, name)
);

-- Enable RLS for board_categories
alter table public.board_categories enable row level security;

create policy "Users can view their own categories"
  on public.board_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.board_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.board_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.board_categories for delete
  using (auth.uid() = user_id);


-- 2. Board <-> Category Mapping (many-to-many, user-scoped)
create table if not exists public.board_category_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  board_id uuid references public.boards(id) on delete cascade not null,
  category_id uuid references public.board_categories(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, board_id, category_id)
);

-- Enable RLS for board_category_assignments
alter table public.board_category_assignments enable row level security;

create policy "Users can view their own category assignments"
  on public.board_category_assignments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own category assignments"
  on public.board_category_assignments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own category assignments"
  on public.board_category_assignments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own category assignments"
  on public.board_category_assignments for delete
  using (auth.uid() = user_id);


-- 3. Favourites (user <-> board)
create table if not exists public.board_favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  board_id uuid references public.boards(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, board_id)
);

-- Enable RLS for board_favourites
alter table public.board_favourites enable row level security;

create policy "Users can view their own favourites"
  on public.board_favourites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favourites"
  on public.board_favourites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favourites"
  on public.board_favourites for delete
  using (auth.uid() = user_id);
