const supabase = require('../config/db');

// Generate patient ID: first 4 letters of name + birth year + 2-digit random number
function generatePatientId(name, birthYear) {
  // Handle names shorter than 4 characters
  const cleanName = name.replace(/\s/g, '').toUpperCase();
  const namePart = cleanName.length >= 4 
    ? cleanName.substring(0, 4) 
    : cleanName.padEnd(4, 'X'); // Pad with X if name is too short
  
  const yearPart = birthYear.toString();
  const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${namePart}${yearPart}${randomPart}`;
}

const patientModel = {
  // Create a new patient
  async create(patientData) {
    const { name, age, gender, contact, birthYear, photoUrl, createdBy, userId } = patientData;
    
    // Generate patient ID
    let patientId = generatePatientId(name, birthYear);
    
    // Ensure uniqueness
    let exists = await this.findByPatientId(patientId);
    let attempts = 0;
    while (exists && attempts < 10) {
      patientId = generatePatientId(name, birthYear);
      exists = await this.findByPatientId(patientId);
      attempts++;
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          patientId,
          name,
          age,
          gender,
          contact,
          birthYear,
          photoUrl: photoUrl || null,
          userId: userId || null,
          createdBy
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Provide helpful error message
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        throw new Error('Database table "patients" does not exist. Please run the SQL schema in Supabase SQL Editor.');
      }
      if (error.code === '23505') { // Unique constraint violation
        throw new Error(`Patient ID ${patientId} already exists. Please try again.`);
      }
      throw error;
    }
    return data;
  },

  // Find patient by patientId
  async findByPatientId(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patientId', patientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Find patient by UUID
  async findById(id) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all patients
  async getAll() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update patient
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete patient
  async delete(id) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

module.exports = patientModel;

