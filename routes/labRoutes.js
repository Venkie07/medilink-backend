const express = require('express');
const multer = require('multer');
const labTestModel = require('../models/labTestModel');
const reportModel = require('../models/reportModel');
const patientModel = require('../models/patientModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const uploadHelper = require('../utils/uploadHelper');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for reports
});

// Get all assigned lab tests (lab technician only)
router.get('/assignments', authMiddleware, roleCheck(['lab']), async (req, res) => {
  try {
    const tests = await labTestModel.getPending();
    res.json(tests);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch lab assignments', details: error.message });
  }
});

// Upload lab report
router.post('/upload', authMiddleware, roleCheck(['lab']), upload.single('report'), async (req, res) => {
  try {
    const { patientId, testName, testId } = req.body;

    if (!patientId || !testName || !req.file) {
      return res.status(400).json({ error: 'Patient ID, test name, and report file are required' });
    }

    // Verify patient exists
    const patient = await patientModel.findByPatientId(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify test assignment exists if testId provided
    if (testId) {
      const test = await labTestModel.findById(testId);
      if (!test || test.patientId !== patientId) {
        return res.status(404).json({ error: 'Lab test assignment not found' });
      }
    }

    // Upload report file
    const fileUrl = await uploadHelper.uploadLabReport(req.file);

    // Create report
    const report = await reportModel.create({
      patientId,
      testName,
      fileUrl,
      uploadedBy: req.user.id
    });

    // Link report to lab test if testId provided
    if (testId) {
      await labTestModel.linkReport(testId, report.id);
    }

    res.status(201).json({
      message: 'Report uploaded successfully',
      report
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ error: 'Failed to upload report', details: error.message });
  }
});

// Re-upload report (within 24 hours)
router.put('/:id', authMiddleware, roleCheck(['lab']), upload.single('report'), async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get existing report
    const existingReport = await reportModel.findById(reportId);
    if (!existingReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if uploaded by current user
    if (existingReport.uploadedBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only re-upload your own reports' });
    }

    // Check 24-hour window
    if (!reportModel.canReupload(existingReport.uploadDate)) {
      return res.status(400).json({ 
        error: 'Re-upload window expired. Reports can only be re-uploaded within 24 hours of initial upload.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Report file is required' });
    }

    // Upload new report file
    const fileUrl = await uploadHelper.uploadLabReport(req.file);

    // Update report
    const updatedReport = await reportModel.update(reportId, {
      fileUrl,
      testName: req.body.testName || existingReport.testName
    });

    res.json({
      message: 'Report re-uploaded successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Re-upload report error:', error);
    res.status(500).json({ error: 'Failed to re-upload report', details: error.message });
  }
});

// Get all reports for a patient
router.get('/reports/:patientId', authMiddleware, async (req, res) => {
  try {
    const reports = await reportModel.getByPatientId(req.params.patientId);
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

module.exports = router;

