// Simple script to test MySQL connection and setup database
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '9090',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function testAndSetup() {
  console.log('🔧 Testing MySQL connection...\n');
  console.log('📋 Configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Password: ${'*'.repeat(dbConfig.password.length)}\n`);

  try {
    // Test connection first
    console.log('1️⃣ Connecting to MySQL server...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL server connection successful!\n');

    // Create database
    console.log('2️⃣ Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS healthcare_db`);
    console.log('✅ Database "healthcare_db" created/verified\n');

    // Connect to the healthcare database
    await connection.changeUser({ database: 'healthcare_db' });
    console.log('3️⃣ Connected to healthcare_db\n');

    // Create tables
    console.log('4️⃣ Creating tables...');
    
    // Patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
        chronic BOOLEAN DEFAULT FALSE,
        last_risk_score DECIMAL(3,2) DEFAULT NULL,
        last_risk_level ENUM('low', 'moderate', 'high') DEFAULT NULL,
        last_risk_updated_at BIGINT DEFAULT NULL,
        last_risk_model_version VARCHAR(50) DEFAULT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);
    
    // Patient records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_records (
        id VARCHAR(255) PRIMARY KEY,
        patient_id VARCHAR(255) NOT NULL,
        note TEXT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL,
        type ENUM('visit', 'lab', 'prescription', 'followup') NOT NULL,
        attachment_ids JSON DEFAULT NULL,
        vitals_systolic INT DEFAULT NULL,
        vitals_diastolic INT DEFAULT NULL,
        vitals_pulse INT DEFAULT NULL,
        vitals_spo2 INT DEFAULT NULL,
        vitals_temp_c DECIMAL(4,1) DEFAULT NULL,
        symptoms JSON DEFAULT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    
    // Prescriptions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(255) PRIMARY KEY,
        patient_id VARCHAR(255) NOT NULL,
        medication VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        duration VARCHAR(255) NOT NULL,
        delivered BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    
    // Stock items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        current_stock INT NOT NULL,
        min_threshold INT NOT NULL,
        unit VARCHAR(50) NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);

    console.log('✅ All tables created successfully!\n');

    // Check if we have any data
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    const patientCount = patients[0].count;
    
    console.log('5️⃣ Database status:');
    console.log(`   Patients: ${patientCount} records`);
    
    if (patientCount === 0) {
      console.log('\n6️⃣ Seeding sample data...');
      
      // Insert sample patients
      const samplePatients = [
        {
          id: 'patient-001',
          name: 'Rajesh Kumar',
          age: 45,
          gender: 'Male',
          chronic: false,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          id: 'patient-002', 
          name: 'Priya Sharma',
          age: 32,
          gender: 'Female',
          chronic: true,
          created_at: Date.now(),
          updated_at: Date.now()
        },
        {
          id: 'patient-003',
          name: 'Amit Singh',
          age: 28,
          gender: 'Male', 
          chronic: false,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      ];
      
      for (const patient of samplePatients) {
        await connection.execute(
          'INSERT INTO patients (id, name, age, gender, chronic, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [patient.id, patient.name, patient.age, patient.gender, patient.chronic, patient.created_at, patient.updated_at]
        );
      }
      
      // Insert sample stock items
      const stockItems = [
        { id: 'stock-001', name: 'Paracetamol', category: 'Analgesic', current_stock: 150, min_threshold: 50, unit: 'tablets' },
        { id: 'stock-002', name: 'Amoxicillin', category: 'Antibiotic', current_stock: 80, min_threshold: 30, unit: 'capsules' },
        { id: 'stock-003', name: 'Ibuprofen', category: 'NSAID', current_stock: 200, min_threshold: 75, unit: 'tablets' }
      ];
      
      for (const item of stockItems) {
        await connection.execute(
          'INSERT INTO stock_items (id, name, category, current_stock, min_threshold, unit, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.name, item.category, item.current_stock, item.min_threshold, item.unit, Date.now()]
        );
      }
      
      console.log('✅ Sample data inserted!');
    }

    await connection.end();
    
    console.log('\n🎉 MySQL setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ MySQL Connection: Working');
    console.log('   ✅ Database: healthcare_db created');
    console.log('   ✅ Tables: All created successfully');
    console.log('   ✅ Sample Data: Available');
    console.log('\n🚀 Your application can now connect to MySQL!');
    console.log('   Next: Update your db.ts to use MySQL instead of in-memory storage');

  } catch (error) {
    console.error('\n❌ MySQL setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Start MySQL service: Run PowerShell as Administrator and execute:');
    console.error('      net start MYSQL80');
    console.error('   2. Verify MySQL credentials in .env file');
    console.error('   3. Check if MySQL is installed and running on port 3306');
    console.error('   4. Test connection with: mysql -u root -p9090');
  }
}

testAndSetup();