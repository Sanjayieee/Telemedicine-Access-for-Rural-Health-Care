// Real MySQL database layer replacing the in-memory storage
import { v4 as uuid } from 'uuid';
import { executeQuery, executeQueryOne, pool } from './database';

// Import types from main db module
import type { Doctor } from './db';

// Test MySQL connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    throw new Error(`MySQL connection failed: ${error}`);
  }
}

export type Patient = {
  id: string; // QR code ID
  name: string;
  age: number;
  gender?: string;
  createdAt: number;
  updatedAt: number;
  records: PatientRecord[];
  chronic?: boolean; // chronic illness flag
  lastRisk?: { score:number; level:'low'|'moderate'|'high'; updatedAt:number; model_version:string };
};

export type PatientRecord = {
  id: string;
  patientId: string;
  note: string;
  createdBy: string; // user email
  createdAt: number;
  type: 'visit' | 'lab' | 'prescription' | 'followup';
  attachmentIds?: string[];
  vitals?: { systolic?:number; diastolic?:number; pulse?:number; spo2?:number; tempC?:number };
  symptoms?: string[]; // normalized tokens
};

export type Prescription = {
  id: string;
  patientId: string;
  doctor: string; // doctor email
  createdAt: number;
  meds: { name: string; dosage: string; duration: string }[];
  delivered?: boolean;
};

export type StockItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  updatedAt: number;
};

export interface SyncPayload {
  patients: Patient[];
  records: PatientRecord[];
  prescriptions: Prescription[];
  stock: StockItem[];
}

// ===== PATIENT OPERATIONS =====

export async function createPatient(input: Partial<Patient> & { name: string; age: number; gender?: string }): Promise<Patient> {
  const id = input.id || uuid();
  const createdAt = Date.now();
  
  await executeQuery(
    `INSERT INTO patients (id, name, age, gender, chronic, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, input.age, input.gender || null, input.chronic || false, createdAt, createdAt]
  );

  const patient: Patient = {
    id,
    name: input.name,
    age: input.age,
    gender: input.gender,
    createdAt,
    updatedAt: createdAt,
    records: [],
    chronic: input.chronic || false,
    lastRisk: input.lastRisk,
  };

  return patient;
}

export async function listPatients(): Promise<Patient[]> {
  const patients = await executeQuery<any>(
    `SELECT id, name, age, gender, chronic, 
            last_risk_score, last_risk_level, last_risk_updated_at, last_risk_model_version,
            created_at, updated_at 
     FROM patients 
     ORDER BY created_at DESC`
  );

  // Get records for each patient
  const patientsWithRecords: Patient[] = [];
  for (const p of patients) {
    const records = await listPatientRecords(p.id);
    patientsWithRecords.push({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      chronic: Boolean(p.chronic),
      records,
      lastRisk: p.last_risk_score ? {
        score: parseFloat(p.last_risk_score),
        level: p.last_risk_level,
        updatedAt: p.last_risk_updated_at,
        model_version: p.last_risk_model_version
      } : undefined
    });
  }

  return patientsWithRecords;
}

export async function getPatient(id: string): Promise<Patient | null> {
  const patient = await executeQueryOne<any>(
    `SELECT id, name, age, gender, chronic, 
            last_risk_score, last_risk_level, last_risk_updated_at, last_risk_model_version,
            created_at, updated_at 
     FROM patients 
     WHERE id = ?`,
    [id]
  );

  if (!patient) return null;

  const records = await listPatientRecords(id);

  return {
    id: patient.id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    createdAt: patient.created_at,
    updatedAt: patient.updated_at,
    chronic: Boolean(patient.chronic),
    records,
    lastRisk: patient.last_risk_score ? {
      score: parseFloat(patient.last_risk_score),
      level: patient.last_risk_level,
      updatedAt: patient.last_risk_updated_at,
      model_version: patient.last_risk_model_version
    } : undefined
  };
}

export async function updatePatientChronic(id: string, chronic: boolean): Promise<Patient | null> {
  await executeQuery(
    `UPDATE patients SET chronic = ?, updated_at = ? WHERE id = ?`,
    [chronic, Date.now(), id]
  );
  
  return getPatient(id);
}

export async function updatePatientRisk(
  id: string, 
  risk: { score:number; level:'low'|'moderate'|'high'; model_version:string }
): Promise<Patient | null> {
  const updatedAt = Date.now();
  
  await executeQuery(
    `UPDATE patients 
     SET last_risk_score = ?, last_risk_level = ?, last_risk_updated_at = ?, 
         last_risk_model_version = ?, updated_at = ? 
     WHERE id = ?`,
    [risk.score, risk.level, updatedAt, risk.model_version, updatedAt, id]
  );
  
  return getPatient(id);
}

// ===== PATIENT RECORDS OPERATIONS =====

export async function createPatientRecord(
  patientId: string, 
  note: string, 
  type: PatientRecord['type'], 
  createdBy: string, 
  extra?: { vitals?: PatientRecord['vitals']; symptoms?: string[] }
): Promise<PatientRecord> {
  // Verify patient exists
  const patient = await getPatient(patientId);
  if (!patient) throw new Error('Patient not found');

  const id = uuid();
  const createdAt = Date.now();
  
  await executeQuery(
    `INSERT INTO patient_records 
     (id, patient_id, note, type, created_by, created_at, 
      vitals_systolic, vitals_diastolic, vitals_pulse, vitals_spo2, vitals_temp_c, 
      symptoms, attachment_ids) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, patientId, note, type, createdBy, createdAt,
      extra?.vitals?.systolic || null,
      extra?.vitals?.diastolic || null,
      extra?.vitals?.pulse || null,
      extra?.vitals?.spo2 || null,
      extra?.vitals?.tempC || null,
      extra?.symptoms ? JSON.stringify(extra.symptoms) : null,
      null // attachment_ids
    ]
  );

  // Update patient updated_at
  await executeQuery(
    `UPDATE patients SET updated_at = ? WHERE id = ?`,
    [createdAt, patientId]
  );

  return {
    id,
    patientId,
    note,
    type,
    createdBy,
    createdAt,
    vitals: extra?.vitals,
    symptoms: extra?.symptoms
  };
}

export async function listPatientRecords(patientId: string): Promise<PatientRecord[]> {
  const records = await executeQuery<any>(
    `SELECT id, patient_id, note, type, created_by, created_at,
            vitals_systolic, vitals_diastolic, vitals_pulse, vitals_spo2, vitals_temp_c,
            symptoms, attachment_ids
     FROM patient_records 
     WHERE patient_id = ? 
     ORDER BY created_at DESC`,
    [patientId]
  );

  return records.map(r => ({
    id: r.id,
    patientId: r.patient_id,
    note: r.note,
    type: r.type,
    createdBy: r.created_by,
    createdAt: r.created_at,
    vitals: {
      systolic: r.vitals_systolic,
      diastolic: r.vitals_diastolic,
      pulse: r.vitals_pulse,
      spo2: r.vitals_spo2,
      tempC: r.vitals_temp_c
    },
    symptoms: r.symptoms ? JSON.parse(r.symptoms) : undefined,
    attachmentIds: r.attachment_ids ? JSON.parse(r.attachment_ids) : undefined
  }));
}

// ===== PRESCRIPTION OPERATIONS =====

export async function createPrescription(
  patientId: string, 
  doctor: string, 
  meds: Prescription['meds']
): Promise<Prescription> {
  const id = uuid();
  const createdAt = Date.now();
  
  await executeQuery(
    `INSERT INTO prescriptions (id, patient_id, doctor, meds, delivered, created_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, patientId, doctor, JSON.stringify(meds), false, createdAt]
  );

  return { id, patientId, doctor, meds, delivered: false, createdAt };
}

export async function listPrescriptions(patientId?: string): Promise<Prescription[]> {
  const query = patientId 
    ? `SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC`
    : `SELECT * FROM prescriptions ORDER BY created_at DESC`;
  
  const params = patientId ? [patientId] : [];
  const prescriptions = await executeQuery<any>(query, params);

  return prescriptions.map(p => ({
    id: p.id,
    patientId: p.patient_id,
    doctor: p.doctor,
    meds: p.meds ? JSON.parse(p.meds) : [],
    delivered: Boolean(p.delivered),
    createdAt: p.created_at
  }));
}

export async function updatePrescriptionDelivery(id: string, delivered: boolean): Promise<Prescription | null> {
  await executeQuery(
    `UPDATE prescriptions SET delivered = ? WHERE id = ?`,
    [delivered, id]
  );
  
  const prescription = await executeQueryOne<any>(
    `SELECT * FROM prescriptions WHERE id = ?`,
    [id]
  );

  if (!prescription) return null;

  return {
    id: prescription.id,
    patientId: prescription.patient_id,
    doctor: prescription.doctor,
    meds: JSON.parse(prescription.meds),
    delivered: Boolean(prescription.delivered),
    createdAt: prescription.created_at
  };
}

// ===== STOCK OPERATIONS =====

export async function upsertStock(name: string, delta: number): Promise<StockItem> {
  const updatedAt = Date.now();
  
  // Check if item exists
  const existing = await executeQueryOne<any>(
    `SELECT * FROM stock WHERE LOWER(name) = LOWER(?)`,
    [name]
  );

  if (existing) {
    const newQuantity = Math.max(0, (existing.current_stock || 0) + delta);
    await executeQuery(
      `UPDATE stock SET current_stock = ?, updated_at = ? WHERE id = ?`,
      [newQuantity, updatedAt, existing.id]
    );
    
    return {
      id: existing.id,
      name: existing.name,
      category: existing.category || 'medication',
      currentStock: newQuantity,
      minThreshold: existing.min_threshold || 10,
      unit: existing.unit || 'units',
      updatedAt
    };
  } else {
    const id = uuid();
    const quantity = Math.max(0, delta);
    
    await executeQuery(
      `INSERT INTO stock (id, name, category, current_stock, min_threshold, unit, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, 'medication', quantity, 10, 'units', updatedAt]
    );
    
    return { 
      id, 
      name, 
      category: 'medication', 
      currentStock: quantity, 
      minThreshold: 10, 
      unit: 'units', 
      updatedAt 
    };
  }
}

export async function listStockItems(): Promise<StockItem[]> {
  const stock = await executeQuery<any>(
    `SELECT * FROM stock ORDER BY name`
  );

  return stock.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category || 'medication',
    currentStock: s.current_stock || 0,
    minThreshold: s.min_threshold || 10,
    unit: s.unit || 'units',
    updatedAt: s.updated_at
  }));
}

export async function createStockItem(item: Omit<StockItem, 'id' | 'updatedAt'>): Promise<StockItem> {
  const id = uuid();
  const now = Date.now();
  
  const query = `
    INSERT INTO stock (id, name, category, current_stock, min_threshold, unit, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  await executeQuery(query, [id, item.name, item.category, item.currentStock, item.minThreshold, item.unit, now]);
  
  return {
    id,
    name: item.name,
    category: item.category,
    currentStock: item.currentStock,
    minThreshold: item.minThreshold,
    unit: item.unit,
    updatedAt: now
  };
}

export async function updateStockQuantity(id: string, quantity: number): Promise<StockItem | null> {
  const now = Date.now();
  
  const query = `
    UPDATE stock 
    SET current_stock = ?, updated_at = ?
    WHERE id = ?
  `;
  
  await executeQuery(query, [quantity, now, id]);
  
  // Return the updated item
  const items = await executeQuery<any>('SELECT * FROM stock WHERE id = ?', [id]);
  if (items.length === 0) return null;
  
  const item = items[0];
  return {
    id: item.id,
    name: item.name,
    category: item.category || 'medication',
    currentStock: item.current_stock || 0,
    minThreshold: item.min_threshold || 10,
    unit: item.unit || 'units',
    updatedAt: item.updated_at
  };
}

// ===== DOCTOR OPERATIONS =====

export async function listDoctors(): Promise<Doctor[]> {
  const query = `
    SELECT * FROM doctors 
    ORDER BY name ASC
  `;
  
  const doctors = await executeQuery<any>(query);
  
  return doctors.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    specialization: d.specialization,
    department: d.department,
    license: d.license,
    status: d.status,
    experience: d.experience,
    qualification: d.qualification,
    address: d.address,
    emergencyContact: d.emergency_contact,
    patientCount: d.patient_count,
    lastLogin: d.last_login,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

export async function getDoctor(id: string): Promise<Doctor | null> {
  const query = 'SELECT * FROM doctors WHERE id = ?';
  const doctors = await executeQuery<any>(query, [id]);
  
  if (doctors.length === 0) return null;
  
  const d = doctors[0];
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    specialization: d.specialization,
    department: d.department,
    license: d.license,
    status: d.status,
    experience: d.experience,
    qualification: d.qualification,
    address: d.address,
    emergencyContact: d.emergency_contact,
    patientCount: d.patient_count,
    lastLogin: d.last_login,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  };
}

export async function createDoctor(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
  const id = uuid();
  const now = Date.now();
  
  const query = `
    INSERT INTO doctors (
      id, name, email, phone, specialization, department, license, 
      status, experience, qualification, address, emergency_contact, 
      patient_count, last_login, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await executeQuery(query, [
    id, doctor.name, doctor.email, doctor.phone, doctor.specialization,
    doctor.department, doctor.license, doctor.status, doctor.experience,
    doctor.qualification, doctor.address, doctor.emergencyContact,
    doctor.patientCount || 0, doctor.lastLogin, now, now
  ]);
  
  return {
    id,
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    specialization: doctor.specialization,
    department: doctor.department,
    license: doctor.license,
    status: doctor.status,
    experience: doctor.experience,
    qualification: doctor.qualification,
    address: doctor.address,
    emergencyContact: doctor.emergencyContact,
    patientCount: doctor.patientCount || 0,
    lastLogin: doctor.lastLogin,
    createdAt: now,
    updatedAt: now
  };
}

export async function updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
  const now = Date.now();
  
  // Build dynamic update query
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
  if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
  if (updates.specialization !== undefined) { fields.push('specialization = ?'); values.push(updates.specialization); }
  if (updates.department !== undefined) { fields.push('department = ?'); values.push(updates.department); }
  if (updates.license !== undefined) { fields.push('license = ?'); values.push(updates.license); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.experience !== undefined) { fields.push('experience = ?'); values.push(updates.experience); }
  if (updates.qualification !== undefined) { fields.push('qualification = ?'); values.push(updates.qualification); }
  if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address); }
  if (updates.emergencyContact !== undefined) { fields.push('emergency_contact = ?'); values.push(updates.emergencyContact); }
  if (updates.patientCount !== undefined) { fields.push('patient_count = ?'); values.push(updates.patientCount); }
  if (updates.lastLogin !== undefined) { fields.push('last_login = ?'); values.push(updates.lastLogin); }
  
  if (fields.length === 0) return getDoctor(id);
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const query = `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`;
  await executeQuery(query, values);
  
  return getDoctor(id);
}

export async function updateDoctorStatus(id: string, status: Doctor['status']): Promise<Doctor | null> {
  return updateDoctor(id, { status });
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const query = 'DELETE FROM doctors WHERE id = ?';
  await executeQuery(query, [id]);
  return true;
}

export async function getDoctorsByDepartment(department: string): Promise<Doctor[]> {
  const query = `
    SELECT * FROM doctors 
    WHERE department = ? 
    ORDER BY name ASC
  `;
  
  const doctors = await executeQuery<any>(query, [department]);
  
  return doctors.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    specialization: d.specialization,
    department: d.department,
    license: d.license,
    status: d.status,
    experience: d.experience,
    qualification: d.qualification,
    address: d.address,
    emergencyContact: d.emergency_contact,
    patientCount: d.patient_count,
    lastLogin: d.last_login,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

export async function getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
  const query = `
    SELECT * FROM doctors 
    WHERE specialization = ? 
    ORDER BY name ASC
  `;
  
  const doctors = await executeQuery<any>(query, [specialization]);
  
  return doctors.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    specialization: d.specialization,
    department: d.department,
    license: d.license,
    status: d.status,
    experience: d.experience,
    qualification: d.qualification,
    address: d.address,
    emergencyContact: d.emergency_contact,
    patientCount: d.patient_count,
    lastLogin: d.last_login,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

// ===== SYNC OPERATIONS =====

export async function exportSync(): Promise<SyncPayload> {
  const patients = await listPatients();
  const records = patients.flatMap(p => p.records);
  const prescriptions = await listPrescriptions();
  const stock = await listStockItems();

  return { patients, records, prescriptions, stock };
}

export async function importSync(payload: SyncPayload): Promise<void> {
  // Import patients
  for (const p of payload.patients) {
    await executeQuery(
      `INSERT IGNORE INTO patients 
       (id, name, age, gender, chronic, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.age, p.gender || null, p.chronic || false, p.createdAt, p.updatedAt]
    );
  }

  // Import records
  for (const r of payload.records) {
    await executeQuery(
      `INSERT IGNORE INTO patient_records 
       (id, patient_id, note, type, created_by, created_at, 
        vitals_systolic, vitals_diastolic, vitals_pulse, vitals_spo2, vitals_temp_c, 
        symptoms, attachment_ids) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id, r.patientId, r.note, r.type, r.createdBy, r.createdAt,
        r.vitals?.systolic || null,
        r.vitals?.diastolic || null,
        r.vitals?.pulse || null,
        r.vitals?.spo2 || null,
        r.vitals?.tempC || null,
        r.symptoms ? JSON.stringify(r.symptoms) : null,
        r.attachmentIds ? JSON.stringify(r.attachmentIds) : null
      ]
    );
  }

  // Import prescriptions
  for (const pres of payload.prescriptions) {
    await executeQuery(
      `INSERT IGNORE INTO prescriptions 
       (id, patient_id, doctor, meds, delivered, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pres.id, pres.patientId, pres.doctor, JSON.stringify(pres.meds), pres.delivered || false, pres.createdAt]
    );
  }

  // Import stock
  for (const s of payload.stock) {
    await executeQuery(
      `INSERT INTO stock (id, name, category, current_stock, min_threshold, unit, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       current_stock = VALUES(current_stock), updated_at = VALUES(updated_at)`,
      [s.id, s.name, s.category, s.currentStock, s.minThreshold, s.unit, s.updatedAt]
    );
  }
}

// ===== DEMO SEEDING UTILITIES =====

export async function resetData(): Promise<void> {
  await executeQuery(`DELETE FROM patient_records`);
  await executeQuery(`DELETE FROM prescriptions`);
  await executeQuery(`DELETE FROM patients`);
  await executeQuery(`DELETE FROM stock`);
}

export async function isEmpty(): Promise<boolean> {
  const patientCount = await executeQueryOne<{count: number}>(`SELECT COUNT(*) as count FROM patients`);
  const prescriptionCount = await executeQueryOne<{count: number}>(`SELECT COUNT(*) as count FROM prescriptions`);
  const stockCount = await executeQueryOne<{count: number}>(`SELECT COUNT(*) as count FROM stock`);

  return (patientCount?.count || 0) === 0 && 
         (prescriptionCount?.count || 0) === 0 && 
         (stockCount?.count || 0) === 0;
}

export async function seedDemoData() {
  if(!(await isEmpty())) return { skipped: true, message: 'Data not empty' };
  
  const now = Date.now();
  
  // Enhanced patient dataset with more realistic health profiles
  const demoPatients = [
    // High-risk patients
    { name: 'Rajesh Kumar', age: 67, gender: 'Male', chronic: true },
    { name: 'Kamala Devi', age: 58, gender: 'Female', chronic: true },
    { name: 'Suresh Patel', age: 72, gender: 'Male', chronic: true },
    
    // Moderate-risk patients
    { name: 'Anita Singh', age: 45, gender: 'Female', chronic: false },
    { name: 'Ravi Sharma', age: 52, gender: 'Male', chronic: true },
    { name: 'Geeta Rani', age: 38, gender: 'Female', chronic: false },
    
    // Lower-risk patients
    { name: 'Amit Verma', age: 28, gender: 'Male', chronic: false },
    { name: 'Priya Joshi', age: 32, gender: 'Female', chronic: false },
    { name: 'Rohit Gupta', age: 24, gender: 'Male', chronic: false },
    { name: 'Sunita Kumari', age: 29, gender: 'Female', chronic: false },
    
    // Pediatric cases
    { name: 'Arjun Kumar', age: 8, gender: 'Male', chronic: false },
    { name: 'Kavya Patel', age: 12, gender: 'Female', chronic: false },
    
    // Elderly cases
    { name: 'Ram Prasad', age: 78, gender: 'Male', chronic: true },
    { name: 'Lakshmi Bai', age: 69, gender: 'Female', chronic: true },
    { name: 'Hari Om', age: 81, gender: 'Male', chronic: true },
    
    // Common cases with variations for duplicate detection testing
    { name: 'Mohammad Ali', age: 35, gender: 'Male', chronic: false },
    { name: 'Mohammed Ali', age: 36, gender: 'Male', chronic: false }, // Similar name
    { name: 'Fatima Sheikh', age: 42, gender: 'Female', chronic: false },
    { name: 'Deepak Yadav', age: 31, gender: 'Male', chronic: false },
    { name: 'Deepika Yadav', age: 31, gender: 'Female', chronic: false }, // Similar name/age
    
    // Rural/tribal names
    { name: 'Bhima Sankara Rao', age: 49, gender: 'Male', chronic: false },
    { name: 'Yellamma Naidu', age: 54, gender: 'Female', chronic: true },
    { name: 'Kiran Babu', age: 33, gender: 'Male', chronic: false },
    { name: 'Manjula Reddy', age: 41, gender: 'Female', chronic: false },
    { name: 'Surya Prakash', age: 26, gender: 'Male', chronic: false },
  ];
  
  const createdPatients = [];
  for (const dp of demoPatients) {
    const patient = await createPatient(dp);
    createdPatients.push(patient);
  }

  // Add detailed medical records with vitals and symptoms
  const conditions = [
    { condition: 'Diabetes', symptoms: ['increased thirst', 'frequent urination', 'fatigue'], vitals: { systolic: 145, diastolic: 92, pulse: 88, spo2: 96 } },
    { condition: 'Hypertension', symptoms: ['headache', 'dizziness'], vitals: { systolic: 160, diastolic: 100, pulse: 85, spo2: 97 } },
    { condition: 'Respiratory infection', symptoms: ['cough', 'fever', 'shortness of breath'], vitals: { systolic: 120, diastolic: 80, pulse: 95, spo2: 94, tempC: 38.5 } },
    { condition: 'Joint pain', symptoms: ['joint stiffness', 'swelling', 'pain'], vitals: { systolic: 130, diastolic: 85, pulse: 75, spo2: 98 } },
    { condition: 'Cardiac assessment', symptoms: ['chest pain', 'palpitations'], vitals: { systolic: 150, diastolic: 95, pulse: 102, spo2: 95 } },
    { condition: 'Routine checkup', symptoms: [], vitals: { systolic: 125, diastolic: 78, pulse: 72, spo2: 99 } },
  ];

  // Add records for each patient based on risk profile
  let totalRecords = 0;
  for (const [index, patient] of createdPatients.entries()) {
    const isHighRisk = patient.age > 60 || patient.chronic;
    const recordCount = isHighRisk ? 3 : Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < recordCount; i++) {
      const condition = isHighRisk 
        ? conditions[Math.floor(Math.random() * 5)] // Exclude routine checkup for high-risk
        : conditions[Math.floor(Math.random() * conditions.length)];
      
      const dayOffset = Math.floor(Math.random() * 30); // Last 30 days
      const recordDate = now - (dayOffset * 24 * 60 * 60 * 1000);
      
      let note = `Patient ${patient.name} presents with ${condition.condition}.`;
      if (condition.symptoms.length > 0) {
        note += ` Symptoms reported: ${condition.symptoms.join(', ')}.`;
      }
      
      if (patient.chronic && condition.condition.includes('Diabetes')) {
        note += ' Chronic diabetic - monitoring required.';
      }
      
      if (patient.age > 65) {
        note += ' Elderly patient - comprehensive assessment needed.';
      }
      
      const record = await createPatientRecord(
        patient.id, 
        note, 
        i === 0 ? 'visit' : (['lab', 'followup'] as const)[Math.floor(Math.random() * 2)], 
        'doctor@example.com',
        { 
          vitals: condition.vitals,
          symptoms: condition.symptoms 
        }
      );
      
      // Backdate the record
      await executeQuery(
        `UPDATE patient_records SET created_at = ? WHERE id = ?`,
        [recordDate, record.id]
      );
      
      totalRecords++;
    }
    
    // Update patient updated_at to latest record
    await executeQuery(
      `UPDATE patients p 
       SET updated_at = (
         SELECT MAX(created_at) FROM patient_records 
         WHERE patient_id = p.id
       ) 
       WHERE p.id = ?`,
      [patient.id]
    );
  }

  // Enhanced prescriptions with more realistic medications
  const medicationTemplates = [
    { meds: [{ name:'Metformin', dosage:'500mg', duration:'30d' }], delivered: true },
    { meds: [{ name:'Lisinopril', dosage:'10mg', duration:'30d' }], delivered: true },
    { meds: [{ name:'Amoxicillin', dosage:'500mg', duration:'7d' }], delivered: true },
    { meds: [{ name:'Paracetamol', dosage:'650mg', duration:'5d' }], delivered: false },
    { meds: [{ name:'Aspirin', dosage:'75mg', duration:'30d' }], delivered: true },
    { meds: [{ name:'Omeprazole', dosage:'20mg', duration:'14d' }], delivered: false },
    { meds: [{ name:'Atorvastatin', dosage:'20mg', duration:'30d' }], delivered: true },
    { meds: [
      { name:'Metformin', dosage:'500mg', duration:'30d' },
      { name:'Glimepiride', dosage:'2mg', duration:'30d' }
    ], delivered: true },
  ];
  
  // Assign prescriptions to patients, especially high-risk ones
  const patientsForPrescriptions = createdPatients
    .filter(p => p.chronic || p.age > 50)
    .slice(0, 12);
    
  for (const patient of patientsForPrescriptions) {
    const template = medicationTemplates[Math.floor(Math.random() * medicationTemplates.length)];
    const prescription = await createPrescription(patient.id, 'doctor@example.com', template.meds);
    
    if (template.delivered) {
      await updatePrescriptionDelivery(prescription.id, true);
    }
    
    // Backdate prescription
    const prescriptionDate = now - (Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
    await executeQuery(
      `UPDATE prescriptions SET created_at = ? WHERE id = ?`,
      [prescriptionDate, prescription.id]
    );
  }

  // Realistic pharmacy stock with varying levels
  const stockItems = [
    // High-demand medications (some running low)
    { name: 'Paracetamol 650mg', quantity: 15 }, // Low stock
    { name: 'Amoxicillin 500mg', quantity: 45 },
    { name: 'ORS Packets', quantity: 8 }, // Critical stock
    { name: 'Aspirin 75mg', quantity: 120 },
    
    // Chronic disease medications
    { name: 'Metformin 500mg', quantity: 35 }, // Moderate stock
    { name: 'Lisinopril 10mg', quantity: 67 },
    { name: 'Atorvastatin 20mg', quantity: 23 },
    { name: 'Glimepiride 2mg', quantity: 41 },
    
    // Emergency/critical medications
    { name: 'Adrenaline 1mg/ml', quantity: 5 }, // Critical stock
    { name: 'Salbutamol Inhaler', quantity: 12 },
    { name: 'Prednisolone 5mg', quantity: 89 },
    
    // Vitamins and supplements
    { name: 'Vitamin D3 60k IU', quantity: 156 },
    { name: 'Iron Tablets 100mg', quantity: 234 },
    { name: 'Folic Acid 5mg', quantity: 178 },
    
    // Pediatric medications
    { name: 'Paracetamol Syrup', quantity: 28 },
    { name: 'Amoxicillin Syrup', quantity: 19 },
  ];
  
  for (const item of stockItems) {
    await upsertStock(item.name, item.quantity);
  }

  const finalPrescriptions = await listPrescriptions();
  const finalStock = await listStockItems();

  return {
    skipped: false,
    patients: createdPatients.length,
    records: totalRecords,
    prescriptions: finalPrescriptions.length,
    stock: finalStock.length,
    generatedAt: now,
    summary: {
      chronicPatients: createdPatients.filter(p => p.chronic).length,
      elderlyPatients: createdPatients.filter(p => p.age > 60).length,
      highRiskStock: finalStock.filter(s => s.currentStock < 20).length,
    }
  };
}