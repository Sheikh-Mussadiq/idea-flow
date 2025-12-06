import { supabase } from '../lib/supabaseClient';

export const attachmentService = {
  async uploadAttachment(cardId, file) {
    // First, get the board_id from the card
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .select('board_id')
      .eq('id', cardId)
      .single();

    if (cardError) throw cardError;
    if (!cardData?.board_id) throw new Error('Card not found or missing board_id');

    const boardId = cardData.board_id;

    // Generate file name: boardId/cardId/{realfilename}-{random 3 digit number}.{fileExt}
    const fileExt = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    // Sanitize filename (remove special chars that might cause issues)
    const sanitizedFileName = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3 digit random number (100-999)
    const fileName = `${sanitizedFileName}-${randomNum}.${fileExt}`;
    const filePath = `${boardId}/${cardId}/${fileName}`;

    // Upload file to storage (private bucket)
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create database record with storage path (not public URL)
    const { data, error: dbError } = await supabase
      .from('card_attachments')
      .insert({
        card_id: cardId,
        name: file.name,
        file_url: filePath, // Store storage path, not public URL
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) {
      // If DB insert fails, try to clean up the uploaded file
      await supabase.storage.from('attachments').remove([filePath]);
      throw dbError;
    }
    return data;
  },

  /**
   * Get a signed URL for viewing/downloading an attachment
   * @param {string} filePath - The storage path stored in file_url field
   * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  async getAttachmentUrl(filePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Delete an attachment (both database record and storage file)
   * @param {string} attachmentId - The attachment ID
   */
  async deleteAttachment(attachmentId) {
    // First get the attachment to know the file path
    const { data: attachment, error: fetchError } = await supabase
      .from('card_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;
    if (!attachment) throw new Error('Attachment not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_url]);

    // Log storage error but don't fail if file doesn't exist
    if (storageError) {
      console.warn('Error deleting file from storage:', storageError);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('card_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) throw dbError;
  }
};
