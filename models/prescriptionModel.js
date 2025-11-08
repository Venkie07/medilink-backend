const supabase = require('../config/db');

const prescriptionModel = {
  // Create a new prescription
  async create(prescriptionData) {
    const { patientId, doctorId, medicines, date } = prescriptionData;
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          patientId,
          doctorId,
          medicines: Array.isArray(medicines) ? medicines : JSON.parse(medicines),
          date: date || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all prescriptions for a patient
  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patientId', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get prescription by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all prescriptions
  async getAll() {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update prescription
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('prescriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = prescriptionModel;

