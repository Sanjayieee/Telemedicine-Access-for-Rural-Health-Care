// Script to reset and recreate MySQL database with correct schema
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '9090',
  database: process.env.DB_NAME || 'healthcare_db',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function resetDatabase() {
  console.log('🔧 Resetting MySQL database...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to healthcare_db\n');

    console.log('1️⃣ Dropping existing tables...');
    // Drop tables in correct order (child tables first)
    await connection.execute('DROP TABLE IF EXISTS patient_records');
    await connection.execute('DROP TABLE IF EXISTS prescriptions');
    await connection.execute('DROP TABLE IF EXISTS stock_items');
    await connection.execute('DROP TABLE IF EXISTS patients');
    console.log('✅ Tables dropped\n');

    console.log('2️⃣ Creating tables with correct schema...');
    
    // Patients table
    await connection.execute(`
      CREATE TABLE patients (
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
    
    // Patient records table (matching MySQL implementation)
    await connection.execute(`
      CREATE TABLE patient_records (
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
      CREATE TABLE prescriptions (
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
      CREATE TABLE stock_items (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        current_stock INT NOT NULL,
        min_threshold INT NOT NULL,
        unit VARCHAR(50) NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);

    // Doctors table
    await connection.execute(`
      CREATE TABLE doctors (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        specialization VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        license VARCHAR(255) UNIQUE NOT NULL,
        status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
        experience INT NOT NULL,
        qualification TEXT NOT NULL,
        address TEXT,
        emergency_contact VARCHAR(20),
        patient_count INT DEFAULT 0,
        last_login BIGINT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);

    console.log('✅ All tables created with correct schema!\n');

    console.log('3️⃣ Seeding sample data...');
    
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
    
    // Insert sample prescriptions
    await connection.execute(
      'INSERT INTO prescriptions (id, patient_id, medication, dosage, frequency, duration, delivered, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['rx-001', 'patient-001', 'Paracetamol', '500mg', 'Twice daily', '5 days', false, 'doctor@example.com', Date.now()]
    );
    
    await connection.execute(
      'INSERT INTO prescriptions (id, patient_id, medication, dosage, frequency, duration, delivered, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['rx-002', 'patient-002', 'Metformin', '500mg', 'Once daily', '30 days', true, 'doctor@example.com', Date.now()]
    );
    
    // Insert sample stock items
    const stockItems = [
      { id: 'stock-001', name: 'Paracetamol 500mg', category: 'Analgesic', current_stock: 150, min_threshold: 50, unit: 'tablets' },
      { id: 'stock-002', name: 'Amoxicillin 250mg', category: 'Antibiotic', current_stock: 80, min_threshold: 30, unit: 'capsules' },
      { id: 'stock-003', name: 'Ibuprofen 200mg', category: 'NSAID', current_stock: 200, min_threshold: 75, unit: 'tablets' }
    ];
    
    for (const item of stockItems) {
      await connection.execute(
        'INSERT INTO stock_items (id, name, category, current_stock, min_threshold, unit, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.name, item.category, item.current_stock, item.min_threshold, item.unit, Date.now()]
      );
    }
    
    // Insert sample doctors
    const doctors = [
      {
        id: 'doc-001',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+91-98765-43210',
        specialization: 'Cardiology',
        department: 'Internal Medicine',
        license: 'MED-2019-001',
        status: 'active',
        experience: 8,
        qualification: 'MD Cardiology, MBBS',
        address: '123 Medical Center, Punjab',
        emergency_contact: '+91-98765-43211',
        patient_count: 45,
        last_login: Date.now() - 3600000, // 1 hour ago
        created_at: Date.now() - 31536000000, // 1 year ago
        updated_at: Date.now() - 3600000
      },
      {
        id: 'doc-002',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@hospital.com',
        phone: '+91-98765-43212',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        license: 'MED-2020-002',
        status: 'active',
        experience: 12,
        qualification: 'MD Pediatrics, MBBS',
        address: '456 Children Hospital, Punjab',
        emergency_contact: '+91-98765-43213',
        patient_count: 67,
        last_login: Date.now() - 7200000, // 2 hours ago
        created_at: Date.now() - 25920000000, // 10 months ago
        updated_at: Date.now() - 7200000
      },
      {
        id: 'doc-003',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@hospital.com',
        phone: '+91-98765-43214',
        specialization: 'Gynecology',
        department: 'Obstetrics & Gynecology',
        license: 'MED-2018-003',
        status: 'on_leave',
        experience: 15,
        qualification: 'MS Gynecology, MBBS',
        address: '789 Women Care Center, Punjab',
        emergency_contact: '+91-98765-43215',
        patient_count: 23,
        last_login: Date.now() - 86400000, // 1 day ago
        created_at: Date.now() - 47520000000, // 1.5 years ago
        updated_at: Date.now() - 86400000
      },
      {
        id: 'doc-004',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@hospital.com',
        phone: '+91-98765-43216',
        specialization: 'Orthopedics',
        department: 'Surgery',
        license: 'MED-2021-004',
        status: 'active',
        experience: 6,
        qualification: 'MS Orthopedics, MBBS',
        address: '321 Bone Care Center, Punjab',
        emergency_contact: '+91-98765-43217',
        patient_count: 34,
        last_login: Date.now() - 1800000, // 30 minutes ago
        created_at: Date.now() - 15552000000, // 6 months ago
        updated_at: Date.now() - 1800000
      }
    ];
    
    for (const doctor of doctors) {
      await connection.execute(`
        INSERT INTO doctors (
          id, name, email, phone, specialization, department, license, 
          status, experience, qualification, address, emergency_contact, 
          patient_count, last_login, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        doctor.id, doctor.name, doctor.email, doctor.phone, doctor.specialization,
        doctor.department, doctor.license, doctor.status, doctor.experience,
        doctor.qualification, doctor.address, doctor.emergency_contact,
        doctor.patient_count, doctor.last_login, doctor.created_at, doctor.updated_at
      ]);
    }
    
    console.log('✅ Sample data inserted!');

    await connection.end();
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Tables: Recreated with correct schema');
    console.log('   ✅ Sample Data: 3 patients, 2 prescriptions, 3 stock items, 4 doctors');
    console.log('\n🚀 Your application should now work with MySQL!');
    console.log('   Next: Restart your development server');

  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
  }
}

resetDatabase();