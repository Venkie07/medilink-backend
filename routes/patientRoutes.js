const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const supabase = require('../config/db');
const patientModel = require('../models/patientModel');
const userModel = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const uploadHelper = require('../utils/uploadHelper');
const idCardGenerator = require('../utils/idCardGenerator');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create patient (admin/doctor only)
// Note: multer must come after auth/role checks but will parse FormData and populate req.body
router.post('/', authMiddleware, roleCheck(['admin', 'doctor']), upload.single('photo'), async (req, res) => {
  try {
    // Extract data from req.body (FormData fields are available in req.body when using multer)
    const { name, age, gender, contact, birthYear, email, password } = req.body;
    
    // Debug: Log received data
    console.log('Received patient data:', { 
      name, 
      age, 
      gender, 
      contact, 
      birthYear, 
      email: email ? 'provided' : 'missing', 
      password: password ? 'provided' : 'missing',
      hasFile: !!req.file
    });
    
    // Check if email/password are actually in the request
    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        error: 'Email is required to create patient login credentials',
        hint: 'Please make sure the email field is filled in the form'
      });
    }
    
    if (!password || password.trim() === '') {
      return res.status(400).json({ 
        error: 'Password is required to create patient login credentials',
        hint: 'Please make sure the password field is filled in the form'
      });
    }

    // Validation - check all required fields
    if (!name || !age || !gender || !contact || !birthYear) {
      return res.status(400).json({ error: 'Name, age, gender, contact, and birth year are required' });
    }
    
    // Email and password validation already checked above with better error messages

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }

    let photoUrl = null;
    
    // Upload photo if provided
    if (req.file) {
      try {
        photoUrl = await uploadHelper.uploadPatientPhoto(req.file);
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        // Continue without photo if upload fails (optional field)
        console.warn('Continuing patient creation without photo due to upload error');
      }
    }

    // Hash password for user account
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user account first
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient'
    });

    // Create patient record linked to user
    const patient = await patientModel.create({
      name,
      age: parseInt(age),
      gender,
      contact,
      birthYear: parseInt(birthYear),
      photoUrl,
      createdBy: req.user.id,
      userId: user.id // Link patient to user account
    });

    res.status(201).json({
      message: 'Patient created successfully with login credentials',
      patient: {
        ...patient,
        email: user.email // Include email in response
      },
      loginCredentials: {
        email: user.email,
        password: '***hidden***', // Don't send password back
        note: 'Please share these credentials with the patient securely'
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    console.error('Error stack:', error.stack);
    
    // If user was created but patient creation failed, clean up
    if (req.body.email) {
      try {
        const user = await userModel.findByEmail(req.body.email);
        if (user && user.role === 'patient') {
          await userModel.delete(user.id);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to create patient', 
      details: error.message,
      hint: error.code === 'PGRST116' || error.message.includes('relation') 
        ? 'Database tables may not exist. Run the SQL schema in Supabase.' 
        : undefined
    });
  }
});

// Get patient by ID (UUID)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await patientModel.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Patients can only view their own profile
    if (req.user.role === 'patient') {
      // Check if this patient record belongs to the logged-in patient
      if (patient.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
      }
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient', details: error.message });
  }
});

// Get patient by patientId (text ID)
router.get('/by-id/:patientId', authMiddleware, async (req, res) => {
  try {
    const patient = await patientModel.findByPatientId(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Patients can only view their own profile
    if (req.user.role === 'patient') {
      // Check if this patient record belongs to the logged-in patient
      if (patient.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
      }
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient', details: error.message });
  }
});

// Get current patient's own profile (for patient role)
router.get('/me/profile', authMiddleware, roleCheck(['patient']), async (req, res) => {
  try {
    // Find patient by userId
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('userId', req.user.id)
      .single();

    if (error || !patients) {
      return res.status(404).json({ error: 'Patient profile not found. Please contact your doctor.' });
    }

    res.json(patients);
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile', details: error.message });
  }
});

// Update patient (doctor/admin only)
router.put('/:id', authMiddleware, roleCheck(['admin', 'doctor']), upload.single('photo'), async (req, res) => {
  try {
    const { name, age, gender, contact, birthYear } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (contact) updateData.contact = contact;
    if (birthYear) updateData.birthYear = parseInt(birthYear);

    // Upload new photo if provided
    if (req.file) {
      updateData.photoUrl = await uploadHelper.uploadPatientPhoto(req.file);
    }

    const patient = await patientModel.update(req.params.id, updateData);

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient', details: error.message });
  }
});

// Delete patient (admin only)
router.delete('/:id', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    await patientModel.delete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient', details: error.message });
  }
});

// Generate and download ID card
router.get('/id-card/:patientId', authMiddleware, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // If patientId is 'me', get current patient's profile
    let patient;
    if (patientId === 'me' && req.user.role === 'patient') {
      // Get patient's own profile
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('*')
        .eq('userId', req.user.id)
        .single();
      
      if (error || !patientData) {
        return res.status(404).json({ 
          error: 'Patient profile not found. Please contact your doctor to create your patient record.' 
        });
      }
      patient = patientData;
    } else {
      // Get patient by patientId
      patient = await patientModel.findByPatientId(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      // If user is a patient, verify they can only access their own ID card
      if (req.user.role === 'patient' && patient.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only download your own ID card.' });
      }
    }

    // Generate PDF
    const pdfBuffer = await idCardGenerator.generateIdCardPDF(patient);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ID_${patient.patientId}.pdf"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('ID card generation error:', error);
    res.status(500).json({ error: 'Failed to generate ID card', details: error.message });
  }
});

module.exports = router;

