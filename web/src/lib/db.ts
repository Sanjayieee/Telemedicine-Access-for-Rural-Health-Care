// Hybrid database layer - tries MySQL first, falls back to in-memory storage
import { v4 as uuid } from 'uuid';

// Type definitions (same as before)
export type Patient = {
  id: string;
  name: string;
  age: number;
  gender?: string;
  createdAt: number;
  updatedAt: number;
  records: PatientRecord[];
  chronic?: boolean;
  lastRisk?: { score:number; level:'low'|'moderate'|'high'; updatedAt:number; model_version:string };
};

export type PatientRecord = {
  id: string;
  patientId: string;
  note: string;
  createdBy: string;
  createdAt: number;
  type: 'visit' | 'lab' | 'prescription' | 'followup';
  attachmentIds?: string[];
  vitals?: { systolic?:number; diastolic?:number; pulse?:number; spo2?:number; tempC?:number };
  symptoms?: string[];
};

export type Prescription = {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  delivered?: boolean;
  createdBy: string;
  createdAt: number;
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

export type Doctor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  department: string;
  license: string;
  status: 'active' | 'inactive' | 'on_leave';
  experience: number; // years
  qualification: string;
  address?: string;
  emergencyContact?: string;
  patientCount?: number;
  lastLogin?: number;
  createdAt: number;
  updatedAt: number;
};

// Database state
let isUsingMySQL = false;
let mysqlModule: any = null;
let inMemoryModule: any = null;

// Try to initialize MySQL connection
async function initializeDatabase() {
  try {
    // Try to import and test MySQL connection
    mysqlModule = await import('./db-mysql');
    await mysqlModule.testConnection();
    
    console.log('✅ Using MySQL database');
    isUsingMySQL = true;
    return true;
  } catch (error) {
    console.log('⚠️ MySQL not available, using in-memory storage');
    console.log('   To use MySQL: Start the service and restart the application');
    
    // Fallback to in-memory storage
    const { createInMemoryDatabase } = await import('./db-memory');
    inMemoryModule = createInMemoryDatabase();
    isUsingMySQL = false;
    return false;
  }
}

// Initialize on first import
let initPromise: Promise<boolean> | null = null;
function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  return initPromise;
}

// Generic database operation wrapper
async function withDatabase<T>(operation: (db: any) => Promise<T> | T): Promise<T> {
  await ensureInitialized();
  const db = isUsingMySQL ? mysqlModule : inMemoryModule;
  return operation(db);
}

// Patient operations
export async function listPatients(): Promise<Patient[]> {
  return withDatabase(db => db.listPatients());
}

export async function getPatient(id: string): Promise<Patient | null> {
  return withDatabase(db => db.getPatient(id));
}

export async function createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'records'>): Promise<Patient> {
  return withDatabase(db => db.createPatient(patient));
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  return withDatabase(db => db.updatePatient(id, updates));
}

export async function updatePatientChronic(id: string, chronic: boolean): Promise<Patient | null> {
  return withDatabase(db => db.updatePatientChronic(id, chronic));
}

export async function updatePatientRisk(id: string, riskScore: number): Promise<Patient | null> {
  return withDatabase(db => db.updatePatient(id, { riskScore }));
}

export async function deletePatient(id: string): Promise<boolean> {
  return withDatabase(db => db.deletePatient(id));
}

// Patient Records operations
export async function listPatientRecords(patientId: string): Promise<PatientRecord[]> {
  return withDatabase(db => db.listPatientRecords(patientId));
}

export async function createPatientRecord(record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<PatientRecord> {
  return withDatabase(db => db.createPatientRecord(record));
}

// Prescription operations
export async function listPrescriptions(patientId?: string): Promise<Prescription[]> {
  return withDatabase(db => db.listPrescriptions(patientId));
}

export async function createPrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> {
  return withDatabase(db => db.createPrescription(prescription));
}

export async function updatePrescriptionDelivered(id: string, delivered: boolean): Promise<Prescription | null> {
  return withDatabase(db => db.updatePrescriptionDelivered(id, delivered));
}

// Stock operations
export async function listStockItems(): Promise<StockItem[]> {
  return withDatabase(db => db.listStockItems());
}

export async function createStockItem(item: Omit<StockItem, 'id' | 'updatedAt'>): Promise<StockItem> {
  return withDatabase(db => db.createStockItem(item));
}

export async function updateStockQuantity(id: string, quantity: number): Promise<StockItem | null> {
  return withDatabase(db => db.updateStockQuantity(id, quantity));
}

// Doctor operations
export async function listDoctors(): Promise<Doctor[]> {
  return withDatabase(db => db.listDoctors());
}

export async function getDoctor(id: string): Promise<Doctor | null> {
  return withDatabase(db => db.getDoctor(id));
}

export async function createDoctor(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
  return withDatabase(db => db.createDoctor(doctor));
}

export async function updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
  return withDatabase(db => db.updateDoctor(id, updates));
}

export async function updateDoctorStatus(id: string, status: Doctor['status']): Promise<Doctor | null> {
  return withDatabase(db => db.updateDoctorStatus(id, status));
}

export async function deleteDoctor(id: string): Promise<boolean> {
  return withDatabase(db => db.deleteDoctor(id));
}

export async function getDoctorsByDepartment(department: string): Promise<Doctor[]> {
  return withDatabase(db => db.getDoctorsByDepartment(department));
}

export async function getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
  return withDatabase(db => db.getDoctorsBySpecialization(specialization));
}

// Data management functions
export async function seedDemoData(): Promise<{skipped: boolean; patients: number; prescriptions: number; stock: number}> {
  return withDatabase(db => db.seedDemoData());
}

export async function resetData(): Promise<void> {
  return withDatabase(db => db.resetData());
}

export async function isEmpty(): Promise<boolean> {
  return withDatabase(db => db.isEmpty());
}

// Alias for compatibility
export async function listStock(): Promise<StockItem[]> {
  return listStockItems();
}

// Utility functions
export async function isDatabaseConnected(): Promise<boolean> {
  await ensureInitialized();
  return isUsingMySQL;
}

export async function getDatabaseInfo(): Promise<{type: 'mysql' | 'memory', connected: boolean}> {
  const connected = await isDatabaseConnected();
  return {
    type: connected ? 'mysql' : 'memory',
    connected
  };
}

// Export for debugging
export { isUsingMySQL };