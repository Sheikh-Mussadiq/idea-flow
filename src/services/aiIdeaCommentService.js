import { supabase } from '../lib/supabaseClient';

export const aiIdeaCommentService = {
  async getCommentsByIdeaId(aiIdeaId) {
    const { data, error } = await supabase
      .from('ai_ideas_comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('ai_idea_id', aiIdeaId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createComment(comment, userId) {
    const { data, error } = await supabase
      .from('ai_ideas_comments')
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
      .from('ai_ideas_comments')
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
      .from('ai_ideas_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  subscribeToComments(aiIdeaId, callback) {
    const subscription = supabase
      .channel(`ai_ideas_comments:${aiIdeaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_ideas_comments',
          filter: `ai_idea_id=eq.${aiIdeaId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }
};
