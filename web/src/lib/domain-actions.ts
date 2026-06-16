"use server";
import {createPatient, listPatients, createPrescription, listPrescriptions, updatePrescriptionDelivered, createStockItem, updateStockQuantity, listStockItems, createPatientRecord, listPatientRecords} from '@/lib/db';
import {revalidatePath} from 'next/cache';

export async function addPatient(formData: FormData) {
  const name = String(formData.get('name')||'').trim();
  const age = Number(formData.get('age')||0);
  const gender = String(formData.get('gender')||'');
  if(!name || !age) throw new Error('Missing fields');
  createPatient({name, age, gender});
  revalidatePath('/patients');
}

export async function getPatients() {
  return listPatients();
}

export async function addPatientRecord(patientId: string, note: string, type: 'visit'|'lab'|'prescription'|'followup', createdBy: string) {
  const rec = createPatientRecord({
    patientId,
    note,
    type,
    createdBy
  });
  revalidatePath(`/patients/${patientId}`);
  return rec;
}

export async function getPatientRecords(patientId: string) {
  return listPatientRecords(patientId);
}

export async function addPrescription(patientId: string, doctor: string, meds: {name:string; dosage:string; frequency?:string; duration:string}[]) {
  // Create prescriptions for each medication
  const prescriptions = [];
  for (const med of meds) {
    const p = await createPrescription({
      patientId,
      medication: med.name,
      dosage: med.dosage,
      frequency: med.frequency || 'As directed',
      duration: med.duration,
      createdBy: doctor
    });
    prescriptions.push(p);
  }
  revalidatePath('/prescriptions');
  return prescriptions;
}

export async function setPrescriptionDelivered(id: string, delivered: boolean) {
  updatePrescriptionDelivered(id, delivered);
  revalidatePath('/prescriptions');
}

export async function updateStock(name: string, delta: number) {
  // For now, create a new stock item - this should be improved to handle updates
  const item = await createStockItem({
    name,
    category: 'medication', // Default category
    currentStock: Math.max(0, delta), // Ensure non-negative stock
    minThreshold: 10, // Default minimum threshold
    unit: 'units' // Default unit
  });
  revalidatePath('/pharmacy');
  return item;
}

export async function getStock() {
  return listStockItems();
}
