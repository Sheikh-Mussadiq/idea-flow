import { supabase } from '../lib/supabaseClient';

export const columnService = {
  async createColumn(column) {
    const { data, error } = await supabase
      .from('board_columns')
      .insert(column)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateColumn(columnId, updates) {
    const { data, error } = await supabase
      .from('board_columns')
      .update(updates)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(columnId) {
    const { error } = await supabase
      .from('board_columns')
      .delete()
      .eq('id', columnId);

    if (error) throw error;
  },

  async updateColumnPositions(updates) {
    // updates is array of { id, position }
    const { data, error } = await supabase
      .from('board_columns')
      .upsert(updates)
      .select();

    if (error) throw error;
    return data;
  }
};
