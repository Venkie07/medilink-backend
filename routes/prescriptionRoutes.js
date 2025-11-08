const express = require('express');
const prescriptionModel = require('../models/prescriptionModel');
const patientModel = require('../models/patientModel');
const pharmacyModel = require('../models/pharmacyModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

const router = express.Router();

// Create prescription (doctor only)
router.post('/', authMiddleware, roleCheck(['doctor']), async (req, res) => {
  try {
    const { patientId, medicines } = req.body;

    if (!patientId || !medicines) {
      return res.status(400).json({ error: 'Patient ID and medicines are required' });
    }

    // Validate medicines format
    let medicinesArray;
    if (typeof medicines === 'string') {
      medicinesArray = JSON.parse(medicines);
    } else {
      medicinesArray = medicines;
    }

    if (!Array.isArray(medicinesArray) || medicinesArray.length === 0) {
      return res.status(400).json({ error: 'Medicines must be a non-empty array' });
    }

    // Verify patient exists
    const patient = await patientModel.findByPatientId(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create prescription
    const prescription = await prescriptionModel.create({
      patientId,
      doctorId: req.user.id,
      medicines: medicinesArray,
      date: new Date().toISOString()
    });

    // Initialize pharmacy status for each medicine
    for (let i = 0; i < medicinesArray.length; i++) {
      const medicine = medicinesArray[i];
      await pharmacyModel.updateMedicineStatus({
        patientId,
        prescriptionId: prescription.id,
        medicineName: typeof medicine === 'string' ? medicine : medicine.name || medicine,
        medicineIndex: i,
        status: 'pending',
        updatedBy: req.user.id
      });
    }

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription', details: error.message });
  }
});

// Get all prescriptions for a patient
router.get('/:patientId', authMiddleware, async (req, res) => {
  try {
    const prescriptions = await prescriptionModel.getByPatientId(req.params.patientId);

    // Get pharmacy status for each prescription
    const prescriptionsWithStatus = await Promise.all(
      prescriptions.map(async (prescription) => {
        const statuses = await pharmacyModel.getByPrescriptionId(prescription.id);
        
        // Map medicines with their statuses
        const medicinesWithStatus = prescription.medicines.map((medicine, index) => {
          const status = statuses.find(s => s.medicineIndex === index);
          return {
            name: typeof medicine === 'string' ? medicine : medicine.name || medicine,
            status: status ? status.status : 'pending',
            statusId: status ? status.id : null
          };
        });

        return {
          ...prescription,
          medicinesWithStatus
        };
      })
    );

    res.json(prescriptionsWithStatus);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions', details: error.message });
  }
});

// Get all prescriptions (admin/doctor only)
router.get('/', authMiddleware, roleCheck(['admin', 'doctor']), async (req, res) => {
  try {
    const prescriptions = await prescriptionModel.getAll();
    res.json(prescriptions);
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions', details: error.message });
  }
});

module.exports = router;

