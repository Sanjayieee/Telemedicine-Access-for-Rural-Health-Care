// Database setup and testing script
// Run this to test database connection and setup

import { testConnection, initializeDatabase } from './src/lib/database.js';
import { seedDemoData, resetData, isEmpty } from './src/lib/db-mysql.js';

async function setupDatabase() {
  console.log('🔧 Starting database setup...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Database connection failed. Check your .env configuration.');
      process.exit(1);
    }

    // Initialize database tables
    console.log('2️⃣ Initializing database tables...');
    await initializeDatabase();

    // Check if database is empty
    console.log('3️⃣ Checking database state...');
    const empty = await isEmpty();
    
    if (empty) {
      console.log('4️⃣ Database is empty. Seeding demo data...');
      const seedResult = await seedDemoData();
      console.log('✅ Demo data seeded:', seedResult);
    } else {
      console.log('4️⃣ Database already contains data. Skipping seed.');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Database: Connected ✅');
    console.log('   - Tables: Initialized ✅'); 
    console.log('   - Data: Available ✅');
    console.log('\n🚀 You can now start your application with: npm run dev');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('   1. Check if MySQL is running');
    console.error('   2. Verify .env database configuration');
    console.error('   3. Ensure database "healthcare_db" exists');
    console.error('   4. Check user permissions');
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };