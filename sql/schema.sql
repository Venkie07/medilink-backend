-- MediLink Healthcare Management System Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'lab', 'pharmacy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  contact TEXT NOT NULL,
  "birthYear" INTEGER NOT NULL,
  "photoUrl" TEXT,
  "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "createdBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: lab_tests (lab test assignments)
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId" TEXT NOT NULL REFERENCES patients("patientId") ON DELETE CASCADE,
  "testName" TEXT NOT NULL,
  "assignedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "assignedDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  "reportId" UUID,
  FOREIGN KEY ("reportId") REFERENCES reports(id) ON DELETE SET NULL
);

-- Table 4: reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId" TEXT NOT NULL REFERENCES patients("patientId") ON DELETE CASCADE,
  "testName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "uploadedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  "uploadDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for lab_tests.reportId after reports table is created
ALTER TABLE lab_tests 
ADD CONSTRAINT fk_lab_tests_report 
FOREIGN KEY ("reportId") REFERENCES reports(id) ON DELETE SET NULL;

-- Table 5: prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId" TEXT NOT NULL REFERENCES patients("patientId") ON DELETE CASCADE,
  "doctorId" UUID REFERENCES users(id) ON DELETE SET NULL,
  medicines JSONB NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 6: pharmacy_status (individual medicine tracking)
CREATE TABLE IF NOT EXISTS pharmacy_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "patientId" TEXT NOT NULL REFERENCES patients("patientId") ON DELETE CASCADE,
  "prescriptionId" UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  "medicineName" TEXT NOT NULL,
  "medicineIndex" INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('issued', 'pending')),
  "updatedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("patientId", "prescriptionId", "medicineIndex")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients("patientId");
CREATE INDEX IF NOT EXISTS idx_patients_createdBy ON patients("createdBy");
CREATE INDEX IF NOT EXISTS idx_lab_tests_patientId ON lab_tests("patientId");
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_reports_patientId ON reports("patientId");
CREATE INDEX IF NOT EXISTS idx_reports_uploadDate ON reports("uploadDate");
CREATE INDEX IF NOT EXISTS idx_prescriptions_patientId ON prescriptions("patientId");
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctorId ON prescriptions("doctorId");
CREATE INDEX IF NOT EXISTS idx_pharmacy_status_patientId ON pharmacy_status("patientId");
CREATE INDEX IF NOT EXISTS idx_pharmacy_status_prescriptionId ON pharmacy_status("prescriptionId");

-- Create Supabase Storage buckets (run these in Supabase Storage section or via API)
-- Note: You'll need to create these buckets manually in Supabase Dashboard > Storage
-- Bucket 1: 'photos' (for patient photos)
-- Bucket 2: 'reports' (for lab reports)

