import React from "react";
import Sidebar from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-white text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Viewport container */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Sticky top navbar */}
        <Navbar />
        
        {/* Scrollable page content */}
        <main className="flex-1 p-6 md:p-8 bg-white overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
