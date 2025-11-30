-- Add like and dislike columns to ai_ideas table
alter table ai_ideas
  add column is_liked boolean default false,
  add column is_disliked boolean default false;

-- Add constraint to ensure both can't be true at the same time
alter table ai_ideas
  add constraint check_like_dislike_exclusive 
  check (not (is_liked = true and is_disliked = true));
