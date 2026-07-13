/**
 * Converts a file object to a Base64 encoded string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Formats a Date object or timestamp string into standard DD/MM/YYYY format.
 */
export const formatDate = (dateInput: Date | string | number | null | undefined): string => {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format values as currency (e.g. ₹ 1,500.00 or $1,500.00)
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || '0') || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Generate a random UUID-like ID for mock database elements
 */
export const generateUUID = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
