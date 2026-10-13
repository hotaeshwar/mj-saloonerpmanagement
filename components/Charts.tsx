"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common Chart Options
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      titleFont: { size: 12, weight: 600 },
      bodyFont: { size: 12 },
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#64748b",
        font: { size: 11 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#f1f5f9",
      },
      ticks: {
        color: "#64748b",
        font: { size: 11 },
      },
    },
  },
};

/**
 * Monthly Revenue Chart (Area Chart) computed dynamically from bills
 */
export const RevenueChart: React.FC<{ bills?: any[] }> = ({ bills = [] }) => {
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = months.map((_, index) => {
    const monthPrefix = `${currentYear}-${String(index + 1).padStart(2, "0")}`;
    return bills
      .filter((b) => b.date && b.date.startsWith(monthPrefix))
      .reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);
  });

  const data = {
    labels: months,
    datasets: [
      {
        fill: true,
        label: "Revenue (₹)",
        data: monthlyData,
        borderColor: "#6D5BFF",
        backgroundColor: "rgba(109, 91, 255, 0.08)",
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#6D5BFF",
      },
    ],
  };

  return (
    <div className="h-72 w-full bg-white p-4">
      <Line options={baseOptions} data={data} />
    </div>
  );
};

/**
 * Expense Bar Chart computed dynamically from expenses
 */
export const ExpenseChart: React.FC<{ expenses?: any[] }> = ({ expenses = [] }) => {
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = months.map((_, index) => {
    const monthPrefix = `${currentYear}-${String(index + 1).padStart(2, "0")}`;
    return expenses
      .filter((e) => e.date && e.date.startsWith(monthPrefix))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: "Expenses (₹)",
        data: monthlyData,
        backgroundColor: "#00C2FF",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  return (
    <div className="h-72 w-full bg-white p-4">
      <Bar options={baseOptions} data={data} />
    </div>
  );
};

/**
 * Client Growth (Line Chart) computed dynamically from registered clients
 */
export const ClientGrowthChart: React.FC<{ clients?: any[] }> = ({ clients = [] }) => {
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Monthly new clients
  const monthlyData = months.map((_, index) => {
    const monthPrefix = `${currentYear}-${String(index + 1).padStart(2, "0")}`;
    return clients.filter((c) => {
      const dateStr = c.createdAt ? c.createdAt.slice(0, 7) : "";
      return dateStr === monthPrefix;
    }).length;
  });

  // Cumulative client growth
  let runningTotal = 0;
  const cumulativeData = monthlyData.map((count) => {
    runningTotal += count;
    return runningTotal;
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: "Total Clients",
        data: cumulativeData,
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        tension: 0.3,
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: "#22C55E",
      },
    ],
  };

  return (
    <div className="h-72 w-full bg-white p-4">
      <Line options={baseOptions} data={data} />
    </div>
  );
};

/**
 * Appointment Graphs (Bar/Line Chart) computed dynamically from weekly appointments
 */
export const AppointmentChart: React.FC<{ appointments?: any[] }> = ({ appointments = [] }) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get current week's dates (Monday to Sunday)
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIndex);

  const weekDates = daysOfWeek.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const completedData = weekDates.map((dateStr) => {
    return appointments.filter(
      (a) => (a.date === dateStr || (a.createdAt && a.createdAt.startsWith(dateStr))) && 
             (a.status === "Completed" || a.status === "Confirmed")
    ).length;
  });

  const pendingData = weekDates.map((dateStr) => {
    return appointments.filter(
      (a) => (a.date === dateStr || (a.createdAt && a.createdAt.startsWith(dateStr))) && 
             (a.status === "Pending" || a.status === "Cancelled")
    ).length;
  });

  const data = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Completed / Confirmed",
        data: completedData,
        backgroundColor: "#6D5BFF",
        borderRadius: 4,
        barPercentage: 0.5,
      },
      {
        label: "Pending / Cancelled",
        data: pendingData,
        backgroundColor: "#EF4444",
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-72 w-full bg-white p-4">
      <Bar options={options} data={data} />
    </div>
  );
};
