-- Create storage bucket for attachments (private bucket)
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attachments', 'attachments', false, null, null)
on conflict (id) do nothing;

-- Create storage bucket policies for attachments

-- Helper function to extract board_id from storage path
-- Path format: boardId/cardId/{filename}
create or replace function public.get_board_id_from_attachment_path(p_path text)
returns uuid as $$
declare
  v_board_id text;
begin
  -- Extract board_id from path (first segment before first '/')
  v_board_id := split_part(p_path, '/', 1);
  
  -- Validate it's a UUID
  if v_board_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_board_id::uuid;
  else
    return null;
  end if;
end;
$$ language plpgsql security definer;

-- Policy: Users can SELECT (download) attachments on boards they have access to
create policy "Users can download attachments on boards they access"
on storage.objects for select
using (
  bucket_id = 'attachments' and
  public.has_board_access(public.get_board_id_from_attachment_path(name))
);

-- Policy: Editors and owners can INSERT (upload) attachments
create policy "Editors and owners can upload attachments"
on storage.objects for insert
with check (
  bucket_id = 'attachments' and
  public.can_edit_board_content(public.get_board_id_from_attachment_path(name))
);

-- Policy: Users can DELETE their own uploads or owners can delete any
-- Note: We check if the user uploaded it by checking card_attachments table
-- or if they're the board owner
create policy "Users can delete attachments they uploaded or owners can delete any"
on storage.objects for delete
using (
  bucket_id = 'attachments' and (
    -- Check if user uploaded this attachment
    exists (
      select 1 from card_attachments
      where file_url = name
      and uploaded_by = (select auth.uid())
    ) or
    -- Or check if user is board owner
    public.is_board_owner(public.get_board_id_from_attachment_path(name))
  )
);

