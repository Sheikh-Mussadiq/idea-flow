import { supabase } from '../lib/supabaseClient';

export const flowService = {
  async createFlow(flow) {
    const { data, error } = await supabase
      .from('ai_flows')
      .insert(flow)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFlow(flowId, updates) {
    const { data, error } = await supabase
      .from('ai_flows')
      .update(updates)
      .eq('id', flowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFlow(flowId) {
    const { error } = await supabase
      .from('ai_flows')
      .delete()
      .eq('id', flowId);

    if (error) throw error;
  },

  async createIdea(idea) {
    const { data, error } = await supabase
      .from('ai_ideas')
      .insert(idea)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIdea(ideaId, updates) {
    const { data, error } = await supabase
      .from('ai_ideas')
      .update(updates)
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteIdea(ideaId) {
    const { error } = await supabase
      .from('ai_ideas')
      .delete()
      .eq('id', ideaId);

    if (error) throw error;
  },

  async toggleIdeaLike(ideaId, currentlyLiked, userId) {
    const { data, error } = await supabase
      .from('ai_ideas')
      .update({
        is_liked: !currentlyLiked,
        is_disliked: false // Clear dislike if setting like
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw error;

    // Call profile-updater edge function (fire and forget) when liking
    if (data.is_liked && userId) {
      const ideaText = data.title + (data.description ? `: ${data.description}` : '');
      // Fire and forget - don't await
      supabase.functions.invoke('profile-updater', {
        body: {
          user_id: userId,
          idea: ideaText,
          reaction: 'like'
        }
      }).catch(err => {
        console.error('[flowService] Failed to update profile:', err);
      });
    }

    return data;
  },

  async toggleIdeaDislike(ideaId, currentlyDisliked, userId) {
    const { data, error } = await supabase
      .from('ai_ideas')
      .update({
        is_disliked: !currentlyDisliked,
        is_liked: false // Clear like if setting dislike
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw error;

    // Call profile-updater edge function (fire and forget) when disliking
    if (data.is_disliked && userId) {
      const ideaText = data.title + (data.description ? `: ${data.description}` : '');
      // Fire and forget - don't await
      supabase.functions.invoke('profile-updater', {
        body: {
          user_id: userId,
          idea: ideaText,
          reaction: 'dislike'
        }
      }).catch(err => {
        console.error('[flowService] Failed to update profile:', err);
      });
    }

    return data;
  }
};
