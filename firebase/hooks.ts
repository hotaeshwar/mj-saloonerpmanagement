"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { loginUser, logoutUser, resetPassword, createAdmin, updateAdmin, deleteAdmin } from "./auth";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "./firestore";
import { fileToBase64 } from "./helpers";

/**
 * Hook for login operations
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const admin = await loginUser(email, password);
      toast.success("Welcome to dashboard");
      return admin;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};

/**
 * Hook for logout operations
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success("Logged out successfully.");
    } catch (error: any) {
      toast.error("Logout error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
};

/**
 * Hook for password resets
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);

  const sendReset = async (email: string) => {
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { sendReset, loading };
};

/**
 * Generic CRUD operations hook
 */
export const useCRUD = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const result = await getDocuments(collectionName);
      setData(result);
    } catch (error: any) {
      toast.error(`Error loading ${collectionName}: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [collectionName]);

  const add = async (item: any) => {
    setLoading(true);
    try {
      const newItem = await createDocument(collectionName, item);
      toast.success("Item added successfully.");
      await refreshData();
      return newItem;
    } catch (error: any) {
      toast.error("Error adding item: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updatedFields: any) => {
    setLoading(true);
    try {
      const updated = await updateDocument(collectionName, id, updatedFields);
      toast.success("Item updated successfully.");
      await refreshData();
      return updated;
    } catch (error: any) {
      toast.error("Error updating item: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      await deleteDocument(collectionName, id);
      toast.success("Item deleted successfully.");
      await refreshData();
    } catch (error: any) {
      toast.error("Error deleting item: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, add, update, remove, refreshData };
};

/**
 * Hook to convert and upload images to Base64
 */
export const useBase64Image = () => {
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const base64Str = await fileToBase64(file);
      setBase64(base64Str);
      toast.success("Image uploaded and converted successfully.");
      return base64Str;
    } catch (error: any) {
      toast.error("Error processing image file: " + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setBase64(null), []);

  return { base64, setBase64, handleImageUpload, clear, loading };
};
