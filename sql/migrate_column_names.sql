-- Migration Script: Fix Column Name Casing
-- Run this if you already created tables with lowercase column names
-- This will rename columns to match camelCase used in the code

-- Patients table
ALTER TABLE patients RENAME COLUMN patientid TO "patientId";
ALTER TABLE patients RENAME COLUMN birthyear TO "birthYear";
ALTER TABLE patients RENAME COLUMN photourl TO "photoUrl";
ALTER TABLE patients RENAME COLUMN createdby TO "createdBy";

-- Lab tests table
ALTER TABLE lab_tests RENAME COLUMN patientid TO "patientId";
ALTER TABLE lab_tests RENAME COLUMN testname TO "testName";
ALTER TABLE lab_tests RENAME COLUMN assignedby TO "assignedBy";
ALTER TABLE lab_tests RENAME COLUMN assigneddate TO "assignedDate";
ALTER TABLE lab_tests RENAME COLUMN reportid TO "reportId";

-- Reports table
ALTER TABLE reports RENAME COLUMN patientid TO "patientId";
ALTER TABLE reports RENAME COLUMN testname TO "testName";
ALTER TABLE reports RENAME COLUMN fileurl TO "fileUrl";
ALTER TABLE reports RENAME COLUMN uploadedby TO "uploadedBy";
ALTER TABLE reports RENAME COLUMN uploaddate TO "uploadDate";

-- Prescriptions table
ALTER TABLE prescriptions RENAME COLUMN patientid TO "patientId";
ALTER TABLE prescriptions RENAME COLUMN doctorid TO "doctorId";

-- Pharmacy status table
ALTER TABLE pharmacy_status RENAME COLUMN patientid TO "patientId";
ALTER TABLE pharmacy_status RENAME COLUMN prescriptionid TO "prescriptionId";
ALTER TABLE pharmacy_status RENAME COLUMN medicinename TO "medicineName";
ALTER TABLE pharmacy_status RENAME COLUMN medicineindex TO "medicineIndex";
ALTER TABLE pharmacy_status RENAME COLUMN updatedby TO "updatedBy";

-- Drop old indexes and recreate with correct column names
DROP INDEX IF EXISTS idx_patients_patientid;
DROP INDEX IF EXISTS idx_patients_createdby;
DROP INDEX IF EXISTS idx_lab_tests_patientid;
DROP INDEX IF EXISTS idx_reports_patientid;
DROP INDEX IF EXISTS idx_reports_uploaddate;
DROP INDEX IF EXISTS idx_prescriptions_patientid;
DROP INDEX IF EXISTS idx_prescriptions_doctorid;
DROP INDEX IF EXISTS idx_pharmacy_status_patientid;
DROP INDEX IF EXISTS idx_pharmacy_status_prescriptionid;

-- Recreate indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients("patientId");
CREATE INDEX IF NOT EXISTS idx_patients_createdBy ON patients("createdBy");
CREATE INDEX IF NOT EXISTS idx_lab_tests_patientId ON lab_tests("patientId");
CREATE INDEX IF NOT EXISTS idx_reports_patientId ON reports("patientId");
CREATE INDEX IF NOT EXISTS idx_reports_uploadDate ON reports("uploadDate");
CREATE INDEX IF NOT EXISTS idx_prescriptions_patientId ON prescriptions("patientId");
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctorId ON prescriptions("doctorId");
CREATE INDEX IF NOT EXISTS idx_pharmacy_status_patientId ON pharmacy_status("patientId");
CREATE INDEX IF NOT EXISTS idx_pharmacy_status_prescriptionId ON pharmacy_status("prescriptionId");

