const express = require('express');
const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');
const reportModel = require('../models/reportModel');
const prescriptionModel = require('../models/prescriptionModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

const router = express.Router();

// Get statistics
router.get('/stats', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const [users, patients, reports, prescriptions] = await Promise.all([
      userModel.getAll(),
      patientModel.getAll(),
      reportModel.getAll(),
      prescriptionModel.getAll()
    ]);

    res.json({
      totalUsers: users.length,
      totalPatients: patients.length,
      totalReports: reports.length,
      totalPrescriptions: prescriptions.length,
      usersByRole: {
        admin: users.filter(u => u.role === 'admin').length,
        doctor: users.filter(u => u.role === 'doctor').length,
        patient: users.filter(u => u.role === 'patient').length,
        lab: users.filter(u => u.role === 'lab').length,
        pharmacy: users.filter(u => u.role === 'pharmacy').length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Get all users
router.get('/users', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await userModel.getAll();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }));

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Delete user
router.delete('/user/:id', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await userModel.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Get all patients (admin)
router.get('/patients', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const patients = await patientModel.getAll();
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients', details: error.message });
  }
});

// Get all reports (admin)
router.get('/reports', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const reports = await reportModel.getAll();
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

// Get all prescriptions (admin)
router.get('/prescriptions', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const prescriptions = await prescriptionModel.getAll();
    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions', details: error.message });
  }
});

module.exports = router;

