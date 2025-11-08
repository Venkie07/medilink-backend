const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
let authRoutes, adminRoutes, doctorRoutes, patientRoutes, labRoutes, pharmacyRoutes, prescriptionRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  adminRoutes = require('./routes/adminRoutes');
  doctorRoutes = require('./routes/doctorRoutes');
  patientRoutes = require('./routes/patientRoutes');
  labRoutes = require('./routes/labRoutes');
  pharmacyRoutes = require('./routes/pharmacyRoutes');
  prescriptionRoutes = require('./routes/prescriptionRoutes');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - update with your Vercel frontend URL after deployment
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8000',
    'https://venkie07.github.io', 
    'http://localhost:8000', // Local development
    'https://medilink.vercel.app', // Update with your Vercel URL
    /\.vercel\.app$/, // Allow all Vercel preview deployments
    /\.netlify\.app$/ // Allow Netlify if needed
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediLink API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Debug: Log all registered routes
console.log('📋 Registered routes:');
console.log('  POST /api/auth/register');
console.log('  POST /api/auth/login');
console.log('  GET  /api/auth/me');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - Log the requested route for debugging
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MediLink API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API base: http://localhost:${PORT}/api`);
  console.log(`📡 Register: http://localhost:${PORT}/api/auth/register`);
});

module.exports = app;

