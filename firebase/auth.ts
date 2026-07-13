import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";
import { generateUUID } from "./helpers";

// Default admin users for fallback mode
const DEFAULT_MOCK_ADMINS = [
  {
    uid: "super-admin-id",
    name: "Alex Johnson",
    email: "superadmin@erpsaloon.com",
    role: "SUPER_ADMIN",
    salonName: "MJ-creationERP",
    branchName: "Downtown Elite",
    address: "101 Premium Avenue, Suite A, Downtown",
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    uid: "super-admin-alex",
    name: "Alex Johnson",
    email: "alex@erpsaloon.com",
    role: "SUPER_ADMIN",
    salonName: "MJ-creationERP",
    branchName: "Downtown Elite",
    address: "101 Premium Avenue, Suite A, Downtown",
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    uid: "admin-id",
    name: "Jane Smith",
    email: "admin@erpsaloon.com",
    role: "ADMIN",
    salonName: "MJ-creationERP",
    branchName: "West End Hub",
    address: "505 Fashion Boulevard, West End",
    status: "active",
    createdAt: new Date().toISOString()
  }
];

// Initialize mock admins in LocalStorage if not present, invalid, or missing standard accounts
if (typeof window !== "undefined") {
  const existing = localStorage.getItem("erpsaloon_mock_admins");
  let needReset = !existing;
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.some(a => a.email === "superadmin@erpsaloon.com")) {
        needReset = true;
      }
    } catch (e) {
      needReset = true;
    }
  }
  if (needReset) {
    localStorage.setItem("erpsaloon_mock_admins", JSON.stringify(DEFAULT_MOCK_ADMINS));
  }
}

/**
 * Sign in user
 */
export const loginUser = async (email: string, password: string) => {
  if (isFirebaseConfigured && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      let adminData: any;
      if (!adminDoc.exists()) {
        adminData = {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "Administrator",
          email: user.email || email.trim(),
          role: "SUPER_ADMIN",
          salonName: "MJ-creationERP",
          branchName: "Main Branch",
          address: "Branch Location",
          status: "active",
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, "admins", user.uid), adminData);
        } catch (setErr) {
          console.warn("Could not auto-create admin doc in Firestore:", setErr);
        }
      } else {
        adminData = adminDoc.data();
      }

      if (adminData.status === "disabled" || adminData.status === "inactive" || adminData.active === false) {
        await signOut(auth);
        throw new Error("This administrator account has been disabled.");
      }
      
      return adminData;
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  } else {
    // Fallback Mock Auth
    const mockAdmins = JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
    const cleanEmail = email.trim().toLowerCase();
    
    // 100% Bulletproof demo credentials bypass
    let admin = DEFAULT_MOCK_ADMINS.find((a: any) => a.email.toLowerCase() === cleanEmail);
    if (!admin) {
      admin = mockAdmins.find((a: any) => a.email.toLowerCase() === cleanEmail);
    }
    
    if (!admin) {
      throw new Error("Firebase Authentication is not configured. Please write your Firebase Web App credentials in the .env.local file and restart the Next.js server to sign in with custom accounts.");
    }
    
    if (password !== "password123") {
      throw new Error("Invalid password. (For demo accounts, use password: password123)");
    }
    
    if (admin.status === "disabled" || admin.status === "inactive") {
      throw new Error("This administrator account has been disabled.");
    }
    
    return admin;
  }
};

/**
 * Sign out user
 */
export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (email: string) => {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    const mockAdmins = JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
    const admin = mockAdmins.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) {
      throw new Error("No administrator found with this email address.");
    }
    // Simulation success
  }
};

/**
 * Get all administrator accounts
 */
export const getAdmins = async () => {
  if (isFirebaseConfigured && db) {
    const querySnapshot = await getDocs(collection(db, "admins"));
    const adminsList: any[] = [];
    querySnapshot.forEach((doc) => {
      adminsList.push({ uid: doc.id, ...doc.data() });
    });
    return adminsList;
  } else {
    return JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
  }
};

/**
 * Create Admin Account (Super Admin only)
 */
export const createAdmin = async (adminData: any) => {
  if (isFirebaseConfigured && auth && db) {
    // Real Firebase environment will require firebase-admin custom endpoints,
    // or standard createUser (we simulate via setDoc for simplicity)
    const newUid = generateUUID();
    const newAdmin = {
      uid: newUid,
      ...adminData,
      status: "active",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "admins", newUid), newAdmin);
    return newAdmin;
  } else {
    const mockAdmins = JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
    const emailExists = mockAdmins.some((a: any) => a.email.toLowerCase() === adminData.email.toLowerCase());
    if (emailExists) {
      throw new Error("Email address already in use.");
    }
    
    const newAdmin = {
      uid: generateUUID(),
      ...adminData,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    mockAdmins.push(newAdmin);
    localStorage.setItem("erpsaloon_mock_admins", JSON.stringify(mockAdmins));
    return newAdmin;
  }
};

/**
 * Update Admin Account (Super Admin only)
 */
export const updateAdmin = async (uid: string, adminData: any) => {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, "admins", uid), adminData);
  } else {
    const mockAdmins = JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
    const index = mockAdmins.findIndex((a: any) => a.uid === uid);
    if (index === -1) throw new Error("Admin user not found.");
    
    mockAdmins[index] = { ...mockAdmins[index], ...adminData, updatedAt: new Date().toISOString() };
    localStorage.setItem("erpsaloon_mock_admins", JSON.stringify(mockAdmins));
  }
};

/**
 * Delete Admin Account (Super Admin only)
 */
export const deleteAdmin = async (uid: string) => {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "admins", uid));
  } else {
    const mockAdmins = JSON.parse(localStorage.getItem("erpsaloon_mock_admins") || "[]");
    const filtered = mockAdmins.filter((a: any) => a.uid !== uid);
    localStorage.setItem("erpsaloon_mock_admins", JSON.stringify(filtered));
  }
};
