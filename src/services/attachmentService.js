import { supabase } from '../lib/supabaseClient';

export const attachmentService = {
  async uploadAttachment(cardId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${cardId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    // Create database record
    const { data, error: dbError } = await supabase
      .from('card_attachments')
      .insert({
        card_id: cardId,
        name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  },

  async deleteAttachment(attachmentId) {
    // First get the attachment to know the file path (if we stored it, or derive it)
    // For now, we just delete the record. Real app should delete from storage too.
    const { error } = await supabase
      .from('card_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  }
};
