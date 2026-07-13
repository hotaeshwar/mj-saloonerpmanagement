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
 * Monthly Revenue Chart (Area Chart)
 */
export const RevenueChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        fill: true,
        label: "Revenue (₹)",
        data: [45000, 52000, 49000, 63000, 58000, 71000, 85000, 78000, 92000, 88000, 105000, 120000],
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
 * Expense Bar Chart
 */
export const ExpenseChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Expenses (₹)",
        data: [15000, 18000, 12000, 22000, 19000, 25000, 31000, 28000, 30000, 26000, 35000, 42000],
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
 * Client Growth (Line Chart)
 */
export const ClientGrowthChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Clients",
        data: [120, 145, 170, 210, 250, 310, 380, 440, 510, 580, 660, 750],
        borderColor: "#22C55E",
        backgroundColor: "transparent",
        tension: 0.3,
        borderWidth: 3,
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
 * Appointment Graphs (Bar/Line Chart)
 */
export const AppointmentChart: React.FC = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Completed",
        data: [14, 18, 15, 22, 28, 35, 42],
        backgroundColor: "#6D5BFF",
        borderRadius: 4,
        barPercentage: 0.5,
      },
      {
        label: "Cancelled",
        data: [2, 1, 3, 2, 4, 3, 5],
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
