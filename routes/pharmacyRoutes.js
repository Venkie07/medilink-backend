const express = require('express');
const prescriptionModel = require('../models/prescriptionModel');
const pharmacyModel = require('../models/pharmacyModel');
const patientModel = require('../models/patientModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

const router = express.Router();

// Get prescription by patient ID
router.get('/:patientId', authMiddleware, roleCheck(['pharmacy', 'admin', 'doctor']), async (req, res) => {
  try {
    const prescriptions = await prescriptionModel.getByPatientId(req.params.patientId);

    if (prescriptions.length === 0) {
      return res.status(404).json({ error: 'No prescriptions found for this patient' });
    }

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
            statusId: status ? status.id : null,
            medicineIndex: index
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
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription', details: error.message });
  }
});

// Update medicine status
router.put('/update', authMiddleware, roleCheck(['pharmacy', 'admin']), async (req, res) => {
  try {
    const { patientId, prescriptionId, medicineIndex, medicineName, status } = req.body;

    if (!patientId || !prescriptionId || (medicineIndex === undefined && !medicineName) || !status) {
      return res.status(400).json({ 
        error: 'Patient ID, prescription ID, medicine (index or name), and status are required' 
      });
    }

    if (!['issued', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "issued" or "pending"' });
    }

    // Verify prescription exists
    const prescription = await prescriptionModel.findById(prescriptionId);
    if (!prescription || prescription.patientId !== patientId) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // If medicineName provided but not index, find index
    let finalMedicineIndex = medicineIndex;
    if (finalMedicineIndex === undefined && medicineName) {
      const medicines = prescription.medicines;
      finalMedicineIndex = medicines.findIndex((med, idx) => {
        const medName = typeof med === 'string' ? med : med.name || med;
        return medName.toLowerCase() === medicineName.toLowerCase();
      });

      if (finalMedicineIndex === -1) {
        return res.status(404).json({ error: 'Medicine not found in prescription' });
      }
    }

    // Get medicine name if not provided
    const finalMedicineName = medicineName || 
      (typeof prescription.medicines[finalMedicineIndex] === 'string' 
        ? prescription.medicines[finalMedicineIndex] 
        : prescription.medicines[finalMedicineIndex].name || prescription.medicines[finalMedicineIndex]);

    // Update medicine status
    const updatedStatus = await pharmacyModel.updateMedicineStatus({
      patientId,
      prescriptionId,
      medicineName: finalMedicineName,
      medicineIndex: finalMedicineIndex,
      status,
      updatedBy: req.user.id
    });

    res.json({
      message: 'Medicine status updated successfully',
      status: updatedStatus
    });
  } catch (error) {
    console.error('Update medicine status error:', error);
    res.status(500).json({ error: 'Failed to update medicine status', details: error.message });
  }
});

module.exports = router;

