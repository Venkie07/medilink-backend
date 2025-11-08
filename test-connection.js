// Test Supabase Connection
require('dotenv').config();

console.log('🔌 Testing Supabase Connection...\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Missing');
  console.error('   SUPABASE_KEY:', supabaseKey ? '✅' : '❌ Missing');
  process.exit(1);
}

console.log('   ✅ SUPABASE_URL:', supabaseUrl);
console.log('   ✅ SUPABASE_KEY:', supabaseKey.substring(0, 20) + '...');
console.log('   ✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('   ✅ PORT:', process.env.PORT || '5000');

// Test Supabase connection
console.log('\n2. Testing Supabase Connection:');
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('   ✅ Supabase client created successfully');
  
  // Test database connection by querying a table
  console.log('\n3. Testing Database Query:');
  
  supabase
    .from('users')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('   ⚠️  Tables not created yet. Please run the SQL schema in Supabase SQL Editor.');
          console.log('   📝 File location: backend/sql/schema.sql');
        } else {
          console.error('   ❌ Database error:', error.message);
        }
      } else {
        console.log('   ✅ Database connection successful!');
        console.log('   ✅ Tables exist and are accessible');
      }
      
      // Test storage buckets
      console.log('\n4. Testing Storage Buckets:');
      supabase.storage
        .listBuckets()
        .then(({ data, error }) => {
          if (error) {
            console.error('   ❌ Storage error:', error.message);
          } else {
            const buckets = data || [];
            const bucketNames = buckets.map(b => b.name);
            console.log('   📦 Available buckets:', bucketNames.length > 0 ? bucketNames.join(', ') : 'None');
            
            const requiredBuckets = ['photos', 'reports'];
            const missingBuckets = requiredBuckets.filter(b => !bucketNames.includes(b));
            
            if (missingBuckets.length === 0) {
              console.log('   ✅ All required buckets exist (photos, reports)');
            } else {
              console.log('   ⚠️  Missing buckets:', missingBuckets.join(', '));
              console.log('   📝 Please create these buckets in Supabase Storage section');
            }
          }
          
          console.log('\n' + '='.repeat(50));
          console.log('✅ Connection test complete!');
          console.log('='.repeat(50));
          console.log('\nNext steps:');
          console.log('1. If tables are missing, run backend/sql/schema.sql in Supabase SQL Editor');
          console.log('2. If buckets are missing, create them in Supabase Storage');
          console.log('3. Start your server: npm run dev');
        });
    });
    
} catch (error) {
  console.error('   ❌ Error creating Supabase client:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

