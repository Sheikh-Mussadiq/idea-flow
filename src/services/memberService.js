import { supabase } from '../lib/supabaseClient';

export const memberService = {
  async addMember(boardId, userId, role = 'viewer') {
    const { data, error } = await supabase
      .from('board_members')
      .insert({ board_id: boardId, user_id: userId, role })
      .select(`
        role,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateMemberRole(boardId, userId, role) {
    const { data, error } = await supabase
      .from('board_members')
      .update({ role })
      .match({ board_id: boardId, user_id: userId })
      .select(`
        role,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(boardId, userId) {
    const { error } = await supabase
      .from('board_members')
      .delete()
      .match({ board_id: boardId, user_id: userId });

    if (error) throw error;
  }
};
