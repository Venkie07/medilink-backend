const supabase = require('../config/db');

const uploadHelper = {
  // Upload file to Supabase Storage
  async uploadFile(file, bucketName, folder = '') {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Convert buffer to ArrayBuffer for Supabase
      const fileBuffer = file.buffer;
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        // Provide helpful error message for RLS policy errors
        if (error.message && error.message.includes('row-level security')) {
          throw new Error('Storage bucket RLS policy error. Please run storage_policies.sql in Supabase SQL Editor to create upload policies.');
        }
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  },

  // Upload patient photo
  async uploadPatientPhoto(file) {
    if (!file) {
      throw new Error('No file provided');
    }
    try {
      return await this.uploadFile(file, 'photos', 'patients');
    } catch (error) {
      // Check if bucket doesn't exist
      if (error.message && (error.message.includes('Bucket') || error.message.includes('not found'))) {
        throw new Error('Storage bucket "photos" not found. Please create it in Supabase Storage.');
      }
      throw error;
    }
  },

  // Upload lab report
  async uploadLabReport(file) {
    return await this.uploadFile(file, 'reports', 'lab-reports');
  }
};

module.exports = uploadHelper;

