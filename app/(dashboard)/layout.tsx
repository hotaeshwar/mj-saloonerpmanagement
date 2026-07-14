"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navbar } from "../../components/Navbar";

const Sidebar = dynamic(() => import("../../components/Sidebar"), {
  ssr: false,
  loading: () => <aside className="hidden md:block h-screen sticky top-0 bg-white w-20 border-r border-slate-100" />
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-white text-slate-800" suppressHydrationWarning>
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
