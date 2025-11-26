import { supabase } from '../lib/supabaseClient';

export const userService = {
  async fetchUserProfile(userId, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) return profile;

      // If error is not "PGRST116" (no rows returned), throw it
      if (error && error.code !== 'PGRST116') throw error;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId, file) {
    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old avatar if exists
      try {
        const { data: oldFiles } = await supabase.storage
          .from("avatars")
          .list(userId);

        if (oldFiles?.length) {
          await supabase.storage
            .from("avatars")
            .remove(oldFiles.map((f) => `${userId}.${f.name}`));
        }
      } catch (error) {
        console.warn("Could not delete old avatar:", error);
      }

      // Upload new avatar
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user profile
      const { data: userData, error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      return userData;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },
  async searchUsers(query) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }
};
