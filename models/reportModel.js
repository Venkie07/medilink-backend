const supabase = require('../config/db');

const reportModel = {
  // Create a new report
  async create(reportData) {
    const { patientId, testName, fileUrl, uploadedBy } = reportData;
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          patientId,
          testName,
          fileUrl,
          uploadedBy,
          uploadDate: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all reports for a patient
  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patientId', patientId)
      .order('uploadDate', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get report by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update report (for re-upload)
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('reports')
      .update({
        ...updateData,
        uploadDate: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all reports
  async getAll() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('uploadDate', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Check if report can be re-uploaded (within 24 hours)
  canReupload(uploadDate) {
    const uploadTime = new Date(uploadDate).getTime();
    const currentTime = new Date().getTime();
    const hoursDiff = (currentTime - uploadTime) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }
};

module.exports = reportModel;

