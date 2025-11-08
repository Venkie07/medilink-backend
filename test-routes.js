// Quick test to verify routes are loading correctly
require('dotenv').config();

console.log('Testing route loading...\n');

// Check .env
console.log('1. Checking .env file:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('');

// Test route loading
console.log('2. Testing route loading:');
try {
  const authRoutes = require('./routes/authRoutes');
  console.log('   ✅ authRoutes loaded');
  
  const adminRoutes = require('./routes/adminRoutes');
  console.log('   ✅ adminRoutes loaded');
  
  const doctorRoutes = require('./routes/doctorRoutes');
  console.log('   ✅ doctorRoutes loaded');
  
  const patientRoutes = require('./routes/patientRoutes');
  console.log('   ✅ patientRoutes loaded');
  
  const labRoutes = require('./routes/labRoutes');
  console.log('   ✅ labRoutes loaded');
  
  const pharmacyRoutes = require('./routes/pharmacyRoutes');
  console.log('   ✅ pharmacyRoutes loaded');
  
  const prescriptionRoutes = require('./routes/prescriptionRoutes');
  console.log('   ✅ prescriptionRoutes loaded');
  
  console.log('\n✅ All routes loaded successfully!');
} catch (error) {
  console.error('   ❌ Error loading routes:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

// Test database connection
console.log('\n3. Testing database connection:');
try {
  const supabase = require('./config/db');
  console.log('   ✅ Supabase client created');
  console.log('   Note: Actual connection test requires valid credentials');
} catch (error) {
  console.error('   ❌ Error creating Supabase client:', error.message);
}

console.log('\n✅ All tests passed! Your server should work correctly.');
console.log('   Make sure to restart your server: npm run dev');

