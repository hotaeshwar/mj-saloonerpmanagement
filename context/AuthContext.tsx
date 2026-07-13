"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "../firebase/auth";
import { db } from "../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-hot-toast";

interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  salonName: string;
  branchName: string;
  address: string;
  status: string;
  createdAt: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  loginSession: (admin: AdminUser) => void;
  updateUserSession: (updatedUser: AdminUser) => void;
  logoutSession: () => Promise<void>;
  notifications: any[];
  clearNotification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Web Audio tone play chime (chime tone chime)
  const playNotificationTone = () => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playBeep(880, now, 0.15); // A5 note
      playBeep(1046.5, now + 0.1, 0.35); // C6 note
    } catch (e) {
      console.log("AudioContext blocked or not supported", e);
    }
  };

  const addRealNotification = (text: string) => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      time: "Just now",
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationTone();
    toast.success(text, { icon: "🔔", duration: 4500 });
  };

  // Real-time Firestore Listeners for notifications
  useEffect(() => {
    if (!db) return;
    
    // We set a flag to wait for the initial collection snapshot to load so we don't spam alerts for past records
    let isInitialLoad = true;
    
    // 1. Listen to new Appointments
    const unsubAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !isInitialLoad) {
          const data = change.doc.data();
          addRealNotification(`New Appointment: ${data.clientName || "Guest"} for ${data.time || "N/A"}`);
        }
      });
    });

    // 2. Listen to new Enquiries
    const unsubEnquiries = onSnapshot(collection(db, "enquiries"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !isInitialLoad) {
          const data = change.doc.data();
          addRealNotification(`New Client Enquiry logged for ${data.name || "Guest"}`);
        }
      });
    });

    // 3. Listen to Inventory changes (Low Stock alerts)
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if ((change.type === "added" || change.type === "modified") && !isInitialLoad) {
          const data = change.doc.data();
          if (data.stock <= (data.lowStockAlert || 2)) {
            addRealNotification(`Low Stock Alert: ${data.name} has only ${data.stock} units remaining.`);
          }
        }
      });
    });

    // Toggle initial load flag to false after first sync batch completed
    const timer = setTimeout(() => {
      isInitialLoad = false;
    }, 2000);

    return () => {
      unsubAppointments();
      unsubEnquiries();
      unsubProducts();
      clearTimeout(timer);
    };
  }, [db]);

  useEffect(() => {
    // Load session from local storage & cookie
    const storedUser = localStorage.getItem("erpsaloon_session_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error reading session user:", e);
      }
    }
    setLoading(false);
  }, []);

  const loginSession = (admin: AdminUser) => {
    setUser(admin);
    localStorage.setItem("erpsaloon_session_user", JSON.stringify(admin));
    // Set a client cookie readable by Edge Middleware
    document.cookie = `erpsaloon_session=${encodeURIComponent(
      JSON.stringify({ uid: admin.uid, role: admin.role, name: admin.name })
    )}; path=/; max-age=86400; SameSite=Lax`;
    router.push("/dashboard");
  };

  const updateUserSession = (updatedUser: AdminUser) => {
    setUser(updatedUser);
    localStorage.setItem("erpsaloon_session_user", JSON.stringify(updatedUser));
  };

  const logoutSession = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    localStorage.removeItem("erpsaloon_session_user");
    // Clear cookie
    document.cookie = "erpsaloon_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Automatic client side redirection for pages
  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === "/login";
      if (!user && !isPublicPath) {
        router.push("/login");
      } else if (user && isPublicPath) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, loginSession, updateUserSession, logoutSession, notifications, clearNotification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
