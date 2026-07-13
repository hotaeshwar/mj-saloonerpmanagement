import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP Saloon & Academy Management",
  description: "Modern, Premium Salon & Academy Management Suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'text-xs font-semibold rounded-xl border border-slate-100 shadow-lg text-slate-800 bg-white p-3',
              duration: 4000,
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
