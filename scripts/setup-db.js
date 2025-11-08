const fs = require('fs');
const path = require('path');
const supabase = require('../config/db');

// Read SQL schema file
const sqlSchema = fs.readFileSync(
  path.join(__dirname, '../sql/schema.sql'),
  'utf8'
);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MediLink database...');

    // Split SQL by semicolons and execute each statement
    // Note: Supabase client doesn't support raw SQL execution directly
    // This script is a helper - you should run the SQL in Supabase SQL Editor
    
    console.log('⚠️  Note: Supabase client SDK does not support raw SQL execution.');
    console.log('📝 Please run the SQL schema manually in Supabase SQL Editor:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of backend/sql/schema.sql');
    console.log('   4. Execute the SQL');
    console.log('\n📄 SQL Schema location: backend/sql/schema.sql');

    // Create storage buckets via API (if possible)
    console.log('\n📦 Creating storage buckets...');
    
    try {
      // Create photos bucket
      const { data: photosBucket, error: photosError } = await supabase.storage.createBucket('photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
      });

      if (photosError && photosError.message !== 'Bucket already exists') {
        console.error('Error creating photos bucket:', photosError.message);
      } else {
        console.log('✅ Photos bucket created/verified');
      }

      // Create reports bucket
      const { data: reportsBucket, error: reportsError } = await supabase.storage.createBucket('reports', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      });

      if (reportsError && reportsError.message !== 'Bucket already exists') {
        console.error('Error creating reports bucket:', reportsError.message);
      } else {
        console.log('✅ Reports bucket created/verified');
      }
    } catch (error) {
      console.log('⚠️  Could not create buckets automatically. Please create them manually in Supabase Dashboard > Storage:');
      console.log('   - Bucket: "photos" (public, 5MB limit, images only)');
      console.log('   - Bucket: "reports" (public, 10MB limit, PDFs and images)');
    }

    console.log('\n✅ Database setup instructions displayed above.');
    console.log('🔗 Next steps:');
    console.log('   1. Run the SQL schema in Supabase SQL Editor');
    console.log('   2. Verify storage buckets are created');
    console.log('   3. Update .env file with your Supabase credentials');
    console.log('   4. Start the server: npm run dev');

  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();

