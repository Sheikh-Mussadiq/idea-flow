import { supabase } from '../lib/supabaseClient';

export const tagService = {
  async createTag(tag) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTag(tagId, updates) {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTag(tagId) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }
};
