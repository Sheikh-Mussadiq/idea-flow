-- Set default value for profile column in user_profiles table
alter table user_profiles 
  alter column profile 
  set default '{
    "idea_style": "",
    "topics_liked": [""],
    "preferred_tone": "",
    "topics_disliked": [""],
    "preferred_length": "",
    "examples_of_liked_ideas": [""],
    "examples_of_disliked_ideas": [""]
  }'::jsonb;

