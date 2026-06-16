// In-memory database implementation as fallback
import { v4 as uuid } from 'uuid';
import type { Patient, PatientRecord, Prescription, StockItem, Doctor } from './db';

export function createInMemoryDatabase() {
  // In-memory storage
  const patients = new Map<string, Patient>();
  const prescriptions = new Map<string, Prescription>();
  const stockItems = new Map<string, StockItem>();
  const doctors = new Map<string, Doctor>();

  // Initialize with sample data
  const initSampleData = () => {
    // Sample patients
    const samplePatients: Patient[] = [
      {
        id: 'patient-001',
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
        records: [],
        chronic: false
      },
      {
        id: 'patient-002',
        name: 'Priya Sharma', 
        age: 32,
        gender: 'Female',
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
        records: [],
        chronic: true
      },
      {
        id: 'patient-003',
        name: 'Amit Singh',
        age: 28,
        gender: 'Male',
        createdAt: Date.now() - 259200000,
        updatedAt: Date.now() - 259200000,
        records: [],
        chronic: false
      }
    ];

    // Sample prescriptions
    const samplePrescriptions: Prescription[] = [
      {
        id: 'rx-001',
        patientId: 'patient-001',
        medication: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        delivered: false,
        createdBy: 'doctor@example.com',
        createdAt: Date.now() - 86400000
      },
      {
        id: 'rx-002',
        patientId: 'patient-002',
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Once daily',
        duration: '30 days',
        delivered: true,
        createdBy: 'doctor@example.com',
        createdAt: Date.now() - 172800000
      }
    ];

    // Sample stock items
    const sampleStock: StockItem[] = [
      {
        id: 'stock-001',
        name: 'Paracetamol 500mg',
        category: 'Analgesic',
        currentStock: 150,
        minThreshold: 50,
        unit: 'tablets',
        updatedAt: Date.now()
      },
      {
        id: 'stock-002',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        currentStock: 80,
        minThreshold: 30,
        unit: 'capsules',
        updatedAt: Date.now()
      },
      {
        id: 'stock-003',
        name: 'Ibuprofen 200mg',
        category: 'NSAID',
        currentStock: 200,
        minThreshold: 75,
        unit: 'tablets',
        updatedAt: Date.now()
      }
    ];

    // Sample doctors
    const sampleDoctors: Doctor[] = [
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
        emergencyContact: '+91-98765-43211',
        patientCount: 45,
        lastLogin: Date.now() - 3600000, // 1 hour ago
        createdAt: Date.now() - 31536000000, // 1 year ago
        updatedAt: Date.now() - 3600000
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
        emergencyContact: '+91-98765-43213',
        patientCount: 67,
        lastLogin: Date.now() - 7200000, // 2 hours ago
        createdAt: Date.now() - 25920000000, // 10 months ago
        updatedAt: Date.now() - 7200000
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
        emergencyContact: '+91-98765-43215',
        patientCount: 23,
        lastLogin: Date.now() - 86400000, // 1 day ago
        createdAt: Date.now() - 47520000000, // 1.5 years ago
        updatedAt: Date.now() - 86400000
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
        emergencyContact: '+91-98765-43217',
        patientCount: 34,
        lastLogin: Date.now() - 1800000, // 30 minutes ago
        createdAt: Date.now() - 15552000000, // 6 months ago
        updatedAt: Date.now() - 1800000
      }
    ];

    // Populate maps
    samplePatients.forEach(p => patients.set(p.id, p));
    samplePrescriptions.forEach(p => prescriptions.set(p.id, p));
    sampleStock.forEach(s => stockItems.set(s.id, s));
    sampleDoctors.forEach(d => doctors.set(d.id, d));
  };

  // Initialize sample data
  initSampleData();

  return {
    // Patient operations
    listPatients: (): Patient[] => Array.from(patients.values()),
    
    getPatient: (id: string): Patient | null => patients.get(id) || null,
    
    createPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'records'>): Patient => {
      const newPatient: Patient = {
        ...patient,
        id: uuid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        records: []
      };
      patients.set(newPatient.id, newPatient);
      return newPatient;
    },
    
    updatePatient: (id: string, updates: Partial<Patient>): Patient | null => {
      const patient = patients.get(id);
      if (!patient) return null;
      
      const updated = { ...patient, ...updates, updatedAt: Date.now() };
      patients.set(id, updated);
      return updated;
    },
    
    updatePatientChronic: (id: string, chronic: boolean): Patient | null => {
      const patient = patients.get(id);
      if (!patient) return null;
      
      const updated = { ...patient, chronic, updatedAt: Date.now() };
      patients.set(id, updated);
      return updated;
    },
    
    deletePatient: (id: string): boolean => {
      return patients.delete(id);
    },

    // Patient Records operations
    listPatientRecords: (patientId: string): PatientRecord[] => {
      const patient = patients.get(patientId);
      return patient ? patient.records : [];
    },
    
    createPatientRecord: (record: Omit<PatientRecord, 'id' | 'createdAt'>): PatientRecord => {
      const newRecord: PatientRecord = {
        ...record,
        id: uuid(),
        createdAt: Date.now()
      };
      
      const patient = patients.get(record.patientId);
      if (patient) {
        patient.records.push(newRecord);
        patient.updatedAt = Date.now();
        patients.set(patient.id, patient);
      }
      
      return newRecord;
    },

    // Prescription operations
    listPrescriptions: (patientId?: string): Prescription[] => {
      const allPrescriptions = Array.from(prescriptions.values());
      return patientId 
        ? allPrescriptions.filter(p => p.patientId === patientId)
        : allPrescriptions;
    },
    
    createPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription => {
      const newPrescription: Prescription = {
        ...prescription,
        id: uuid(),
        createdAt: Date.now()
      };
      prescriptions.set(newPrescription.id, newPrescription);
      return newPrescription;
    },
    
    updatePrescriptionDelivered: (id: string, delivered: boolean): Prescription | null => {
      const prescription = prescriptions.get(id);
      if (!prescription) return null;
      
      prescription.delivered = delivered;
      prescriptions.set(id, prescription);
      return prescription;
    },

    // Stock operations
    listStockItems: (): StockItem[] => Array.from(stockItems.values()),
    
    createStockItem: (item: Omit<StockItem, 'id' | 'updatedAt'>): StockItem => {
      const newItem: StockItem = {
        ...item,
        id: uuid(),
        updatedAt: Date.now()
      };
      stockItems.set(newItem.id, newItem);
      return newItem;
    },
    
    updateStockQuantity: (id: string, quantity: number): StockItem | null => {
      const item = stockItems.get(id);
      if (!item) return null;
      
      item.currentStock = quantity;
      item.updatedAt = Date.now();
      stockItems.set(id, item);
      return item;
    },

    // Doctor operations
    listDoctors: (): Doctor[] => Array.from(doctors.values()),
    
    getDoctor: (id: string): Doctor | null => doctors.get(id) || null,
    
    createDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Doctor => {
      const newDoctor: Doctor = {
        ...doctor,
        id: uuid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      doctors.set(newDoctor.id, newDoctor);
      return newDoctor;
    },
    
    updateDoctor: (id: string, updates: Partial<Doctor>): Doctor | null => {
      const doctor = doctors.get(id);
      if (!doctor) return null;
      
      const updatedDoctor = { ...doctor, ...updates, updatedAt: Date.now() };
      doctors.set(id, updatedDoctor);
      return updatedDoctor;
    },
    
    updateDoctorStatus: (id: string, status: Doctor['status']): Doctor | null => {
      const doctor = doctors.get(id);
      if (!doctor) return null;
      
      doctor.status = status;
      doctor.updatedAt = Date.now();
      doctors.set(id, doctor);
      return doctor;
    },
    
    deleteDoctor: (id: string): boolean => {
      return doctors.delete(id);
    },
    
    getDoctorsByDepartment: (department: string): Doctor[] => {
      return Array.from(doctors.values()).filter(d => d.department === department);
    },
    
    getDoctorsBySpecialization: (specialization: string): Doctor[] => {
      return Array.from(doctors.values()).filter(d => d.specialization === specialization);
    }
  };
}