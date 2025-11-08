const supabase = require('../config/db');

const labTestModel = {
  // Create a new lab test assignment
  async create(testData) {
    const { patientId, testName, assignedBy } = testData;
    const { data, error } = await supabase
      .from('lab_tests')
      .insert([
        {
          patientId,
          testName,
          assignedBy,
          assignedDate: new Date().toISOString(),
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all lab tests for a patient
  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('patientId', patientId)
      .order('assignedDate', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all pending lab tests (for lab technicians)
  async getPending() {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('status', 'pending')
      .order('assignedDate', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get lab test by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update lab test status
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('lab_tests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Link report to lab test
  async linkReport(testId, reportId) {
    const { data, error } = await supabase
      .from('lab_tests')
      .update({
        reportId,
        status: 'completed'
      })
      .eq('id', testId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = labTestModel;

