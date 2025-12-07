-- Create storage bucket for avatars (public bucket)
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Helper function to extract user_id from avatar path
-- Path format: {userId}.{extension} (e.g., "uuid.jpg")
create or replace function public.get_user_id_from_avatar_path(p_path text)
returns uuid as $$
declare
  v_user_id text;
begin
  -- Extract user_id from path (everything before the last '.')
  -- This handles cases like "uuid.jpg" or "uuid.png"
  v_user_id := substring(p_path from '^([^.]*)');
  
  -- Validate it's a UUID
  if v_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_user_id::uuid;
  else
    return null;
  end if;
end;
$$ language plpgsql security definer;

-- Policy: Users can INSERT (upload) their own avatars
-- File must be named as {userId}.{extension} where userId matches the authenticated user
create policy "Users can upload their own avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  public.get_user_id_from_avatar_path(name) = (select auth.uid())
);

-- Policy: Users can UPDATE their own avatars
create policy "Users can update their own avatars"
on storage.objects for update
using (
  bucket_id = 'avatars' and
  public.get_user_id_from_avatar_path(name) = (select auth.uid())
)
with check (
  bucket_id = 'avatars' and
  public.get_user_id_from_avatar_path(name) = (select auth.uid())
);

-- Policy: Users can DELETE their own avatars
create policy "Users can delete their own avatars"
on storage.objects for delete
using (
  bucket_id = 'avatars' and
  public.get_user_id_from_avatar_path(name) = (select auth.uid())
);

