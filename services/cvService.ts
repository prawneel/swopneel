// Lightweight IndexedDB helper for storing a CV file client-side
const DB_NAME = 'starkfolio_cv_db';
const STORE_NAME = 'cv_store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCV(file: File) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put({ file, name: file.name, type: file.type, time: Date.now() }, 'current');
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function getCV(): Promise<{ file: File; name: string; type: string } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get('current');
    req.onsuccess = () => {
      const v = req.result;
      if (!v) return resolve(null);
      resolve({ file: v.file as File, name: v.name, type: v.type });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCV() {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete('current');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function getCVVersion(): number {
  const v = localStorage.getItem('cv_version');
  return v ? parseInt(v) : 1;
}

export function bumpCVVersion() {
  const v = getCVVersion() + 1;
  localStorage.setItem('cv_version', String(v));
  return v;
}

export function setCVVersion(n: number) {
  localStorage.setItem('cv_version', String(n));
}

export default { saveCV, getCV, deleteCV, getCVVersion, bumpCVVersion, setCVVersion };
