import { supabase } from '../lib/supabaseClient';

export const commentService = {
  async createComment(comment, userId) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        user_id: userId
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateComment(commentId, text) {
    const { data, error } = await supabase
      .from('comments')
      .update({ text })
      .eq('id', commentId)
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }
};
