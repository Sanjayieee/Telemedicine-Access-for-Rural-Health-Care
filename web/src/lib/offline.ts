// Offline / sync helper using IndexedDB via idb library.
import { openDB } from 'idb';
import type { SyncPayload } from './db';

const DB_NAME = 'swasthya_offline';
const STORE = 'pendingSync';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function queueSync(payload: Omit<SyncPayload,'stock'|'prescriptions'> & { type: string }) {
  const db = await getDB();
  await db.add(STORE, { ...payload, createdAt: Date.now() });
}

export async function listQueued() {
  const db = await getDB();
  return await db.getAll(STORE);
}

export async function clearQueued() {
  const db = await getDB();
  const tx = db.transaction(STORE,'readwrite');
  await tx.store.clear();
  await tx.done;
}
