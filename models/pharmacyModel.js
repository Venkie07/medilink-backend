const supabase = require('../config/db');

const pharmacyModel = {
  // Create or update medicine status
  async updateMedicineStatus(statusData) {
    const { patientId, prescriptionId, medicineName, medicineIndex, status, updatedBy } = statusData;
    
    // Check if status already exists
    const { data: existing } = await supabase
      .from('pharmacy_status')
      .select('*')
      .eq('patientId', patientId)
      .eq('prescriptionId', prescriptionId)
      .eq('medicineIndex', medicineIndex)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('pharmacy_status')
        .update({
          status,
          updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('pharmacy_status')
        .insert([
          {
            patientId,
            prescriptionId,
            medicineName,
            medicineIndex,
            status,
            updatedBy,
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Get all medicine statuses for a patient
  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from('pharmacy_status')
      .select('*')
      .eq('patientId', patientId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get medicine statuses for a prescription
  async getByPrescriptionId(prescriptionId) {
    const { data, error } = await supabase
      .from('pharmacy_status')
      .select('*')
      .eq('prescriptionId', prescriptionId)
      .order('medicineIndex', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get all pharmacy statuses
  async getAll() {
    const { data, error } = await supabase
      .from('pharmacy_status')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

module.exports = pharmacyModel;

