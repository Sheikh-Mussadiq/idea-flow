-- Add input_field column to ai_flows table
alter table ai_flows add column input_field text;

-- Add tags array column to ai_ideas table
alter table ai_ideas add column tags text[] default '{}';

