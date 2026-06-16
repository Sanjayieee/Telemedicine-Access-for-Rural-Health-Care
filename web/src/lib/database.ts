import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '9090',
  database: process.env.DB_NAME || 'healthcare_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // Create patients table
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
        updated_at BIGINT NOT NULL,
        INDEX idx_age (age),
        INDEX idx_chronic (chronic),
        INDEX idx_risk_level (last_risk_level),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create patient_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_records (
        id VARCHAR(255) PRIMARY KEY,
        patient_id VARCHAR(255) NOT NULL,
        note TEXT NOT NULL,
        type ENUM('visit', 'lab', 'prescription', 'followup') NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL,
        vitals_systolic INT DEFAULT NULL,
        vitals_diastolic INT DEFAULT NULL,
        vitals_pulse INT DEFAULT NULL,
        vitals_spo2 INT DEFAULT NULL,
        vitals_temp_c DECIMAL(4,2) DEFAULT NULL,
        symptoms JSON DEFAULT NULL,
        attachment_ids JSON DEFAULT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create prescriptions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(255) PRIMARY KEY,
        patient_id VARCHAR(255) NOT NULL,
        doctor VARCHAR(255) NOT NULL,
        meds JSON NOT NULL,
        delivered BOOLEAN DEFAULT FALSE,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient_id (patient_id),
        INDEX idx_doctor (doctor),
        INDEX idx_delivered (delivered),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create stock table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        updated_at BIGINT NOT NULL,
        INDEX idx_name (name),
        INDEX idx_quantity (quantity),
        INDEX idx_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper to execute queries safely
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

// Helper to execute single row queries
export async function executeQueryOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<T>(query, params);
  return rows[0] || null;
}

// Initialize database on startup
if (process.env.NODE_ENV !== 'test') {
  testConnection().then(async (connected) => {
    if (connected) {
      await initializeDatabase();
    }
  });
}