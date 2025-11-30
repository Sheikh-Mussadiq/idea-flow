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

  async toggleIdeaLike(ideaId, currentlyLiked) {
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
    return data;
  },

  async toggleIdeaDislike(ideaId, currentlyDisliked) {
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
    return data;
  }
};
