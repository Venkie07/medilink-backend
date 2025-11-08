-- Migration: Add userId column to patients table
-- Run this if you already have a patients table without userId column

-- Add userId column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_patients_userId ON patients("userId");

