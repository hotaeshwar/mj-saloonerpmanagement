export interface IndianFestival {
  date: string; // YYYY-MM-DD
  name: string;
  emoji: string;
  category: "National" | "Hindu" | "Islamic" | "Sikh" | "Christian" | "Regional";
  description?: string;
}

export const INDIAN_FESTIVALS: IndianFestival[] = [
  // 2025
  { date: "2025-01-13", name: "Lohri", emoji: "🌾", category: "Regional" },
  { date: "2025-01-14", name: "Makar Sankranti / Pongal", emoji: "🪁", category: "Hindu" },
  { date: "2025-01-26", name: "Republic Day", emoji: "🇮🇳", category: "National" },
  { date: "2025-02-26", name: "Maha Shivratri", emoji: "🔱", category: "Hindu" },
  { date: "2025-03-13", name: "Holika Dahan", emoji: "🔥", category: "Hindu" },
  { date: "2025-03-14", name: "Holi", emoji: "🎨", category: "Hindu" },
  { date: "2025-03-31", name: "Eid-ul-Fitr", emoji: "🌙", category: "Islamic" },
  { date: "2025-04-06", name: "Ram Navami", emoji: "🏹", category: "Hindu" },
  { date: "2025-04-14", name: "Ambedkar Jayanti / Baisakhi", emoji: "🌾", category: "National" },
  { date: "2025-06-07", name: "Bakrid / Eid al-Adha", emoji: "🌙", category: "Islamic" },
  { date: "2025-08-09", name: "Raksha Bandhan", emoji: "🧵", category: "Hindu" },
  { date: "2025-08-15", name: "Independence Day", emoji: "🇮🇳", category: "National" },
  { date: "2025-08-16", name: "Janmashtami", emoji: "🦚", category: "Hindu" },
  { date: "2025-08-27", name: "Ganesh Chaturthi", emoji: "🐘", category: "Hindu" },
  { date: "2025-10-02", name: "Gandhi Jayanti / Dussehra", emoji: "🏹", category: "National" },
  { date: "2025-10-10", name: "Karwa Chauth", emoji: "🌙", category: "Hindu" },
  { date: "2025-10-18", name: "Dhanteras", emoji: "✨", category: "Hindu" },
  { date: "2025-10-20", name: "Diwali / Deepavali", emoji: "🪔", category: "Hindu" },
  { date: "2025-10-22", name: "Bhai Dooj", emoji: "🍬", category: "Hindu" },
  { date: "2025-10-28", name: "Chhath Puja", emoji: "☀️", category: "Hindu" },
  { date: "2025-11-05", name: "Guru Nanak Jayanti", emoji: "ੴ", category: "Sikh" },
  { date: "2025-12-25", name: "Christmas", emoji: "🎄", category: "Christian" },

  // 2026
  { date: "2026-01-13", name: "Lohri", emoji: "🌾", category: "Regional" },
  { date: "2026-01-14", name: "Makar Sankranti / Pongal", emoji: "🪁", category: "Hindu" },
  { date: "2026-01-26", name: "Republic Day", emoji: "🇮🇳", category: "National" },
  { date: "2026-02-15", name: "Maha Shivratri", emoji: "🔱", category: "Hindu" },
  { date: "2026-03-03", name: "Holika Dahan", emoji: "🔥", category: "Hindu" },
  { date: "2026-03-04", name: "Holi", emoji: "🎨", category: "Hindu" },
  { date: "2026-03-20", name: "Eid-ul-Fitr", emoji: "🌙", category: "Islamic" },
  { date: "2026-03-21", name: "Gudi Padwa / Ugadi", emoji: "🌸", category: "Hindu" },
  { date: "2026-03-28", name: "Ram Navami", emoji: "🏹", category: "Hindu" },
  { date: "2026-04-03", name: "Good Friday", emoji: "✝️", category: "Christian" },
  { date: "2026-04-14", name: "Baisakhi / Ambedkar Jayanti", emoji: "🌾", category: "National" },
  { date: "2026-05-01", name: "Maharashtra Day", emoji: "🚩", category: "Regional" },
  { date: "2026-05-02", name: "Buddha Purnima", emoji: "🪷", category: "National" },
  { date: "2026-05-27", name: "Bakrid / Eid al-Adha", emoji: "🌙", category: "Islamic" },
  { date: "2026-07-26", name: "Muharram", emoji: "🌙", category: "Islamic" },
  { date: "2026-07-28", name: "Guru Purnima", emoji: "🙏", category: "Hindu" },
  { date: "2026-08-15", name: "Independence Day", emoji: "🇮🇳", category: "National" },
  { date: "2026-08-27", name: "Raksha Bandhan", emoji: "🧵", category: "Hindu" },
  { date: "2026-09-04", name: "Janmashtami", emoji: "🦚", category: "Hindu" },
  { date: "2026-09-14", name: "Ganesh Chaturthi", emoji: "🐘", category: "Hindu" },
  { date: "2026-09-24", name: "Anant Chaturdashi", emoji: "🌊", category: "Hindu" },
  { date: "2026-10-02", name: "Gandhi Jayanti", emoji: "🕊️", category: "National" },
  { date: "2026-10-11", name: "Navratri Begins", emoji: "🔱", category: "Hindu" },
  { date: "2026-10-18", name: "Durga Puja / Maha Saptami", emoji: "🌺", category: "Hindu" },
  { date: "2026-10-19", name: "Maha Ashtami", emoji: "🌺", category: "Hindu" },
  { date: "2026-10-20", name: "Dussehra / Vijayadashami", emoji: "🏹", category: "Hindu" },
  { date: "2026-10-28", name: "Karwa Chauth", emoji: "🌙", category: "Hindu" },
  { date: "2026-11-06", name: "Dhanteras", emoji: "✨", category: "Hindu" },
  { date: "2026-11-08", name: "Diwali / Deepavali", emoji: "🪔", category: "Hindu" },
  { date: "2026-11-09", name: "Govardhan Puja", emoji: "🪔", category: "Hindu" },
  { date: "2026-11-10", name: "Bhai Dooj", emoji: "🍬", category: "Hindu" },
  { date: "2026-11-15", name: "Chhath Puja", emoji: "☀️", category: "Hindu" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti", emoji: "ੴ", category: "Sikh" },
  { date: "2026-12-25", name: "Christmas", emoji: "🎄", category: "Christian" },

  // 2027
  { date: "2027-01-13", name: "Lohri", emoji: "🌾", category: "Regional" },
  { date: "2027-01-14", name: "Makar Sankranti / Pongal", emoji: "🪁", category: "Hindu" },
  { date: "2027-01-26", name: "Republic Day", emoji: "🇮🇳", category: "National" },
  { date: "2027-03-07", name: "Maha Shivratri", emoji: "🔱", category: "Hindu" },
  { date: "2027-03-22", name: "Holi", emoji: "🎨", category: "Hindu" },
  { date: "2027-08-15", name: "Independence Day", emoji: "🇮🇳", category: "National" },
  { date: "2027-08-17", name: "Raksha Bandhan", emoji: "🧵", category: "Hindu" },
  { date: "2027-08-25", name: "Janmashtami", emoji: "🦚", category: "Hindu" },
  { date: "2027-09-04", name: "Ganesh Chaturthi", emoji: "🐘", category: "Hindu" },
  { date: "2027-10-02", name: "Gandhi Jayanti", emoji: "🕊️", category: "National" },
  { date: "2027-10-09", name: "Dussehra", emoji: "🏹", category: "Hindu" },
  { date: "2027-10-29", name: "Diwali", emoji: "🪔", category: "Hindu" },
  { date: "2027-12-25", name: "Christmas", emoji: "🎄", category: "Christian" },
];

/**
 * Returns Indian festival details for a given date YYYY-MM-DD
 */
export const getIndianFestival = (dateStr: string): IndianFestival | undefined => {
  return INDIAN_FESTIVALS.find((f) => f.date === dateStr);
};

/**
 * Returns all Indian festivals in a given year and month (1-indexed month: 1=Jan, 12=Dec)
 */
export const getIndianFestivalsForMonth = (year: number, month: number): IndianFestival[] => {
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  return INDIAN_FESTIVALS.filter((f) => f.date.startsWith(monthPrefix));
};

/**
 * Finds next upcoming Indian festival starting from reference date
 */
export const getUpcomingIndianFestival = (fromDateStr: string): IndianFestival | undefined => {
  return INDIAN_FESTIVALS
    .filter((f) => f.date >= fromDateStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
};
