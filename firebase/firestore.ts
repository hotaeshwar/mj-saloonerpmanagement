import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { generateUUID } from "./helpers";

// Standard Mock Data Seeds for high-fidelity demonstration
const SEED_DATA: Record<string, any[]> = {
  categories: [],
  brands: [],
  expenseCategories: [],
  taxes: [],
  departments: [],
  services: [],
  packages: [],
  products: [],
  courses: [],
  memberships: [],
  coupons: [],
  employees: [],
  clients: [],
  appointments: [],
  expenses: [],
  withdrawals: [],
  enquiries: [],
  feedback: [],
  attendance: [],
  academy_students: [],
  academy_batches: []
};

// Clear old mock seed databases once to ensure blank state
if (typeof window !== "undefined") {
  const cleared = localStorage.getItem("erpsaloon_db_cleared_v3");
  if (!cleared) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("erpsaloon_db_")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem("erpsaloon_db_cleared_v3", "true");
  }
}

/**
 * Get all documents in a collection
 */
export const getDocuments = async (collectionName: string) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (error) {
      console.error(`Error loading from Firestore ${collectionName}:`, error);
      // fallback to mock if Firestore fails
    }
  }

  // Mock implementation
  const storageKey = `erpsaloon_db_${collectionName}`;
  const localData = localStorage.getItem(storageKey);
  const data = localData ? JSON.parse(localData) : [];
  
  // Sort by createdAt descending
  return data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Create a new document in a collection
 */
export const createDocument = async (collectionName: string, data: any) => {
  const newId = data.id || generateUUID();
  const docPayload = {
    ...data,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, collectionName, newId), docPayload);
      return docPayload;
    } catch (error) {
      console.error(`Error saving to Firestore ${collectionName}:`, error);
    }
  }

  // Mock implementation
  const storageKey = `erpsaloon_db_${collectionName}`;
  const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
  existing.push(docPayload);
  localStorage.setItem(storageKey, JSON.stringify(existing));
  return docPayload;
};

/**
 * Update a document in a collection
 */
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const updatePayload = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, collectionName, id), updatePayload);
      return { id, ...updatePayload };
    } catch (error) {
      console.error(`Error updating in Firestore ${collectionName}:`, error);
    }
  }

  // Mock implementation
  const storageKey = `erpsaloon_db_${collectionName}`;
  const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const index = existing.findIndex((item: any) => item.id === id);
  
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updatePayload };
    localStorage.setItem(storageKey, JSON.stringify(existing));
    return existing[index];
  } else {
    throw new Error(`Document with ID ${id} not found in ${collectionName}`);
  }
};

/**
 * Delete a document in a collection
 */
export const deleteDocument = async (collectionName: string, id: string) => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return id;
    } catch (error) {
      console.error(`Error deleting from Firestore ${collectionName}:`, error);
    }
  }

  // Mock implementation
  const storageKey = `erpsaloon_db_${collectionName}`;
  const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const filtered = existing.filter((item: any) => item.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(filtered));
  return id;
};
