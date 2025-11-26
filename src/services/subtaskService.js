import { supabase } from '../lib/supabaseClient';

export const subtaskService = {
  async createSubtask(subtask) {
    const { data, error } = await supabase
      .from('subtasks')
      .insert(subtask)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubtask(subtaskId, updates) {
    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubtask(subtaskId) {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  },

  async updateSubtaskPositions(updates) {
    const { data, error } = await supabase
      .from('subtasks')
      .upsert(updates)
      .select();

    if (error) throw error;
    return data;
  }
};
