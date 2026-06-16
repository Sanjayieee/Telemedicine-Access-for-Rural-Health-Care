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
  prescriptions: Prescription[];
  stock: StockItem[];
}

// In-memory demo stores
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

export function listStock() { return Array.from(stock.values()); }

export function exportSync(): SyncPayload {
  return {
    patients: listPatients(),
    records: listPatients().flatMap(p=>p.records),
    prescriptions: listPrescriptions(),
    stock: listStock(),
  };
}

export function importSync(payload: SyncPayload) {
  for (const p of payload.patients) patients.set(p.id, p);
  for (const pres of payload.prescriptions) prescriptions.set(pres.id, pres);
  for (const s of payload.stock) stock.set(s.id, s);
}

// --- Demo Seeding Utilities ---
export function resetData() {
  patients.clear();
  prescriptions.clear();
  stock.clear();
}

export function isEmpty() {
  return patients.size === 0 && prescriptions.size === 0 && stock.size === 0;
}

export function seedDemoData() {
  if(!isEmpty()) return { skipped: true, message: 'Data not empty' };
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
  
  const createdPatients = demoPatients.map(dp => createPatient(dp));

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
      
      const record = createPatientRecord(
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
      record.createdAt = recordDate;
    }
    
    patient.updatedAt = Math.max(...patient.records.map(r => r.createdAt));
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
    const prescription = createPrescription(patient.id, 'doctor@example.com', template.meds);
    
    if (template.delivered) {
      updatePrescriptionDelivery(prescription.id, true);
    }
    
    // Backdate prescription
    prescription.createdAt = now - (Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
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
    upsertStock(item.name, item.quantity);
  }

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
