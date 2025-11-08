const express = require('express');
const labTestModel = require('../models/labTestModel');
const patientModel = require('../models/patientModel');
const reportModel = require('../models/reportModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

const router = express.Router();

// Assign lab test
router.post('/assign-lab-test', authMiddleware, roleCheck(['doctor']), async (req, res) => {
  try {
    const { patientId, testName } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({ error: 'Patient ID and test name are required' });
    }

    // Verify patient exists
    const patient = await patientModel.findByPatientId(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create lab test assignment
    const labTest = await labTestModel.create({
      patientId,
      testName,
      assignedBy: req.user.id
    });

    res.status(201).json({
      message: 'Lab test assigned successfully',
      labTest
    });
  } catch (error) {
    console.error('Assign lab test error:', error);
    res.status(500).json({ error: 'Failed to assign lab test', details: error.message });
  }
});

// Get patient reports
router.get('/patient/:patientId/reports', authMiddleware, roleCheck(['doctor']), async (req, res) => {
  try {
    const reports = await reportModel.getByPatientId(req.params.patientId);
    res.json(reports);
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ error: 'Failed to fetch patient reports', details: error.message });
  }
});

// Search patient by patientId
router.get('/patient/:patientId', authMiddleware, roleCheck(['doctor']), async (req, res) => {
  try {
    const patient = await patientModel.findByPatientId(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient', details: error.message });
  }
});

module.exports = router;

