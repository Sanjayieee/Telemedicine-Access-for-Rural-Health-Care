// Database abstraction layer - switches between in-memory and MySQL based on environment
// Replace with a real database (Firestore, PostgreSQL, etc.) in production.

import { v4 as uuid } from 'uuid';

// Type definitions
export type Patient = {
  id: string; // QR code ID
  name: string;
  age: number;
  gender?: string;
  createdAt: number;
  updatedAt: number;
  records: PatientRecord[];
  chronic?: boolean; // chronic illness flag (simplified)
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
  quantity: number;
  updatedAt: number;
};

export interface SyncPayload {
  patients: Patient[];
  records: PatientRecord[];
  prescriptions: Prescription[];
  stock: StockItem[];
}

// Check if we should use MySQL or in-memory storage
const useMySQL = process.env.DB_TYPE === 'mysql';

// In-memory demo stores (used when MySQL is not configured)
const patients = new Map<string, Patient>();
const prescriptions = new Map<string, Prescription>();
const stock = new Map<string, StockItem>();

export function createPatient(input: Partial<Patient> & { name: string; age: number; gender?: string }) {
  const id = input.id || uuid();
  const p: Patient = {
    id,
    name: input.name,
    age: input.age,
    gender: input.gender,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    records: input.records || [],
    chronic: input.chronic || false,
    lastRisk: input.lastRisk,
  };
  patients.set(id, p);
  return p;
}

export function listPatients() {
  return Array.from(patients.values()).sort((a,b)=>b.createdAt - a.createdAt);
}

export function getPatient(id: string) {
  return patients.get(id) || null;
}

export function createPrescription(patientId: string, doctor: string, meds: Prescription['meds']) {
  const id = uuid();
  const pres: Prescription = { id, patientId, doctor, meds, createdAt: Date.now() };
  prescriptions.set(id, pres);
  return pres;
}

export function createPatientRecord(patientId: string, note: string, type: PatientRecord['type'], createdBy: string, extra?: { vitals?: PatientRecord['vitals']; symptoms?: string[] }) {
  const patient = patients.get(patientId);
  if(!patient) throw new Error('Patient not found');
  const rec: PatientRecord = { id: uuid(), patientId, note, type, createdBy, createdAt: Date.now(), vitals: extra?.vitals, symptoms: extra?.symptoms };
  patient.records.push(rec);
  patient.updatedAt = Date.now();
  return rec;
}

export function updatePatientChronic(id: string, chronic: boolean) {
  const p = patients.get(id);
  if(p) { p.chronic = chronic; p.updatedAt = Date.now(); }
  return p || null;
}

export function updatePatientRisk(id: string, risk: { score:number; level:'low'|'moderate'|'high'; model_version:string }) {
  const p = patients.get(id);
  if(p) {
    p.lastRisk = { score:risk.score, level:risk.level, model_version:risk.model_version, updatedAt: Date.now() };
    p.updatedAt = Date.now();
  }
  return p || null;
}

export function listPatientRecords(patientId: string) {
  const patient = patients.get(patientId);
  return patient ? [...patient.records].sort((a,b)=>b.createdAt - a.createdAt) : [];
}

export function listPrescriptions(patientId?: string) {
  return Array.from(prescriptions.values()).filter(p=>!patientId || p.patientId === patientId);
}

export function updatePrescriptionDelivery(id: string, delivered: boolean) {
  const cur = prescriptions.get(id);
  if (cur) {
    cur.delivered = delivered;
  }
  return cur;
}

export function upsertStock(name: string, delta: number) {
  let item = Array.from(stock.values()).find(s=>s.name.toLowerCase() === name.toLowerCase());
  if (!item) {
    item = { id: uuid(), name, quantity: 0, updatedAt: Date.now() };
    stock.set(item.id, item);
  }
  item.quantity = Math.max(0, item.quantity + delta);
  item.updatedAt = Date.now();
  return item;
}

export function listStock() {
  return Array.from(stock.values()).sort((a,b)=>a.name.localeCompare(b.name));
}

export function getAllData(): SyncPayload {
  return {
    patients: Array.from(patients.values()),
    records: Array.from(patients.values()).flatMap(p => p.records),
    prescriptions: Array.from(prescriptions.values()),
    stock: Array.from(stock.values()),
  };
}

export function resetData() {
  patients.clear();
  prescriptions.clear();
  stock.clear();
}

export function seedDatabase() {
  // Skip if data already exists
  if (patients.size > 0) {
    return {
      skipped: true,
      patients: patients.size,
      records: Array.from(patients.values()).reduce((sum, p) => sum + p.records.length, 0),
      prescriptions: prescriptions.size,
      stock: stock.size,
      generatedAt: Date.now(),
      summary: { message: 'Database already seeded' }
    };
  }

  const now = Date.now();
  
  // Create patients
  const createdPatients = [
    createPatient({ name: 'Rajesh Kumar', age: 45, gender: 'male', chronic: true }),
    createPatient({ name: 'Priya Sharma', age: 32, gender: 'female' }),
    createPatient({ name: 'Amit Singh', age: 67, gender: 'male', chronic: true }),
    createPatient({ name: 'Sunita Patel', age: 28, gender: 'female' }),
    createPatient({ name: 'Vikram Gupta', age: 52, gender: 'male' }),
    createPatient({ name: 'Meera Joshi', age: 39, gender: 'female' }),
  ];

  // Add records to patients
  const recordData = [
    { patientId: createdPatients[0].id, note: 'Routine checkup for diabetes', type: 'visit' as const, vitals: { systolic: 140, diastolic: 90, pulse: 72, spo2: 98 } },
    { patientId: createdPatients[1].id, note: 'Prenatal checkup - everything normal', type: 'visit' as const, vitals: { systolic: 110, diastolic: 70, pulse: 68, spo2: 99 } },
    { patientId: createdPatients[2].id, note: 'Follow-up for hypertension medication', type: 'followup' as const, vitals: { systolic: 150, diastolic: 95, pulse: 76, spo2: 97 } },
    { patientId: createdPatients[3].id, note: 'Annual health screening', type: 'visit' as const, vitals: { systolic: 115, diastolic: 75, pulse: 64, spo2: 99 } },
    { patientId: createdPatients[4].id, note: 'Blood work results review', type: 'lab' as const },
    { patientId: createdPatients[5].id, note: 'Vaccination update', type: 'visit' as const, vitals: { systolic: 120, diastolic: 80, pulse: 70, spo2: 98 } },
  ];

  recordData.forEach(record => {
    createPatientRecord(record.patientId, record.note, record.type, 'doctor@example.com', { vitals: record.vitals });
  });

  // Create prescriptions
  const prescriptionData = [
    { patientId: createdPatients[0].id, doctor: 'doctor@example.com', meds: [{ name: 'Metformin', dosage: '500mg', duration: '30 days' }] },
    { patientId: createdPatients[1].id, doctor: 'doctor@example.com', meds: [{ name: 'Folic Acid', dosage: '5mg', duration: '30 days' }] },
    { patientId: createdPatients[2].id, doctor: 'doctor@example.com', meds: [{ name: 'Lisinopril', dosage: '10mg', duration: '30 days' }] },
  ];

  prescriptionData.forEach(pres => {
    createPrescription(pres.patientId, pres.doctor, pres.meds);
  });

  // Add stock items
  const stockItems = [
    { name: 'Paracetamol 500mg', quantity: 150 },
    { name: 'Amoxicillin 250mg', quantity: 75 },
    { name: 'Metformin 500mg', quantity: 120 },
    { name: 'Lisinopril 10mg', quantity: 90 },
    { name: 'Aspirin 75mg', quantity: 200 },
    { name: 'Omeprazole 20mg', quantity: 65 },
    { name: 'Atorvastatin 20mg', quantity: 85 },
    { name: 'Amlodipine 5mg', quantity: 110 },
    { name: 'Insulin Glargine', quantity: 25 },
    { name: 'Salbutamol Inhaler', quantity: 40 },
    { name: 'Folic Acid 5mg', quantity: 95 },
    { name: 'Iron Tablets', quantity: 130 },
    { name: 'Vitamin D3', quantity: 80 },
    { name: 'Cough Syrup', quantity: 45 },
    { name: 'Antiseptic Solution', quantity: 60 },
    // Emergency medications
    { name: 'Epinephrine Auto-injector', quantity: 12 },
    { name: 'Nitroglycerin Spray', quantity: 18 },
    { name: 'Glucose Tablets', quantity: 75 },
    // Pediatric medications
    { name: 'Paracetamol Syrup', quantity: 28 },
    { name: 'Amoxicillin Syrup', quantity: 19 },
  ];
  
  stockItems.forEach(item => {
    upsertStock(item.name, item.quantity);
  });

  return {
    skipped: false,
    patients: createdPatients.length,
    records: createdPatients.reduce((sum, p) => sum + p.records.length, 0),
    prescriptions: listPrescriptions().length,
    stock: listStock().length,
    generatedAt: now,
    summary: {
      chronicPatients: createdPatients.filter(p => p.chronic).length,
      elderlyPatients: createdPatients.filter(p => p.age > 60).length,
      highRiskStock: stockItems.filter(s => s.quantity < 20).length,
    }
  };
}