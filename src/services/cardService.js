import { supabase } from '../lib/supabaseClient';

export const cardService = {
  async createCard(card) {
    const { data, error } = await supabase
      .from('cards')
      .insert(card)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCard(cardId, updates) {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCard(cardId) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  },

  async updateCardPositions(updates) {
    // updates is array of { id, position, column_id }
    const { data, error } = await supabase
      .from('cards')
      .upsert(updates)
      .select();

    if (error) throw error;
    return data;
  }
};
