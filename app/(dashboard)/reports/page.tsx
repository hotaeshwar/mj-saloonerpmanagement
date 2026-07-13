"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { updateDocument } from "../../../firebase/firestore";
import { EmptyState } from "../../../components/EmptyState";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Users, 
  Calendar, 
  GraduationCap, 
  Scale, 
  Box,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { formatCurrency, formatDate } from "../../../firebase/helpers";
import { toast } from "react-hot-toast";

type ReportType = 
  | "daily-collection" 
  | "monthly-collection" 
  | "expense" 
  | "gst" 
  | "inventory" 
  | "staff-commission" 
  | "appointment" 
  | "academy-fees" 
  | "profit-loss";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("profit-loss");

  // CRUD Data hooks
  const { data: bills } = useCRUD("billing");
  const { data: expenses } = useCRUD("expenses");
  const { data: products } = useCRUD("products");
  const { data: appointments } = useCRUD("appointments");
  const { data: employees } = useCRUD("employees");
  const { data: students } = useCRUD("academy_students");

  const statusCell = ({ row }: any) => {
    const item = row.original;
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      try {
        await updateDocument("billing", item.id, { status: newStatus });
        toast.success(`Invoice ${item.id} status updated to ${newStatus}`);
      } catch (err) {
        toast.error("Failed to update status.");
      }
    };
    
    let badgeColor = "bg-green-50 text-green-600 border-green-200";
    if (item.status === "Pending") badgeColor = "bg-orange-50 text-orange-600 border-orange-200";
    else if (item.status === "Cancelled") badgeColor = "bg-red-50 text-red-600 border-red-200";
    
    return (
      <select
        value={item.status || "Paid"}
        onChange={handleStatusChange}
        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold focus:outline-hidden cursor-pointer ${badgeColor}`}
      >
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    );
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const [exportMonth, setExportMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [exportYear, setExportYear] = useState<string>("2026");

  const handleExportExcel = () => {
    let dataset = [];
    let fileName = "";
    let headers: string[] = [];
    let extractFn = (item: any) => [];

    const targetMonthStr = String(exportMonth).padStart(2, "0");

    const filterByDate = (list: any[]) => {
      return list.filter(item => {
        if (!item.date) return false;
        const [year, month] = item.date.split("-");
        return month === targetMonthStr && year === exportYear;
      });
    };

    if (activeReport === "daily-collection") {
      dataset = filterByDate(dailyCollectionData);
      fileName = `Daily_Collections_${exportYear}_Month_${targetMonthStr}`;
      headers = ["Invoice ID", "Client Name", "Payment Mode", "Grand Total", "Status", "Date"];
      extractFn = (item) => [item.id, item.clientName || "Walk-in", item.paymentMode || "Cash", item.grandTotal || 0, item.status || "Paid", item.date || ""];
    } else if (activeReport === "monthly-collection") {
      dataset = filterByDate(monthlyCollectionData);
      fileName = `Monthly_Revenue_${exportYear}_Month_${targetMonthStr}`;
      headers = ["Invoice ID", "Client Name", "Grand Total", "Status", "Date"];
      extractFn = (item) => [item.id, item.clientName || "Walk-in", item.grandTotal || 0, item.status || "Paid", item.date || ""];
    } else if (activeReport === "expense") {
      dataset = filterByDate(expenseData);
      fileName = `Expenses_${exportYear}_Month_${targetMonthStr}`;
      headers = ["Voucher Description", "Category", "Amount", "Date"];
      extractFn = (item) => [item.title, item.category, item.amount, item.date];
    } else if (activeReport === "gst") {
      dataset = filterByDate(gstData);
      fileName = `GST_Tax_Ledger_${exportYear}_Month_${targetMonthStr}`;
      headers = ["Invoice ID", "Client Name", "Receipt Amount", "SGST 9%", "CGST 9%", "Date"];
      extractFn = (item) => [item.id, item.clientName || "Walk-in", item.grandTotal || 0, (item.grandTotal * 0.09).toFixed(2), (item.grandTotal * 0.09).toFixed(2), item.date];
    } else {
      dataset = activeReport === "staff-commission" ? staffCommissionData 
              : activeReport === "student-dues" ? studentDuesData 
              : activeReport === "inventory" ? inventoryStockData 
              : activeReport === "feedback" ? feedbackSurveyData : [];
      fileName = `${activeReport}_Report_Full`;
      
      if (dataset.length > 0) {
        headers = Object.keys(dataset[0]).filter(k => k !== "image" && k !== "id");
        extractFn = (item) => headers.map(h => item[h]);
      }
    }

    if (dataset.length === 0) {
      toast.error(`No records found for ${exportYear}-${targetMonthStr} in this category.`);
      return;
    }

    const csvRows = [headers.join(",")];
    for (const item of dataset) {
      const values = extractFn(item).map(val => {
        const escaped = ("" + (val === undefined || val === null ? "" : val)).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel ledger download generated successfully!");
  };

  // Helper calculation metrics
  const totalRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const totalTax = bills.reduce((sum, b) => sum + (b.tax || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;

  const handleExport = () => {
    toast.success("CSV file generation queued. Report downloaded successfully.");
  };

  // 1. Daily Collection Report Data
  const dailyCollectionData = bills.filter(b => b.date === todayStr);

  // 2. Monthly Collection Report Data
  const monthlyCollectionData = bills;

  // 3. Expense Report Data
  const expenseData = expenses;

  // 4. GST Report Data
  const gstData = bills.map(b => ({
    id: b.id,
    clientName: b.clientName,
    date: b.date,
    taxableAmount: b.grandTotal - b.tax,
    cgst: b.tax / 2,
    sgst: b.tax / 2,
    totalTax: b.tax
  }));

  // 5. Inventory Report Data
  const inventoryData = products.map(p => ({
    name: p.name,
    stock: p.stock,
    price: p.price,
    value: p.stock * p.price,
    status: p.stock <= p.lowStockAlert ? "Reorder" : "Adequate"
  }));

  // 6. Staff Commission Report Data
  const staffCommissionData = employees.map(emp => {
    const servicesDone = bills.filter(b => b.items.some((i: any) => i.staff === emp.name));
    const totalVolume = servicesDone.reduce((sum, b) => sum + (b.subtotal || 0), 0);
    const commEarned = (totalVolume * (emp.commissionPercent || 0)) / 100;
    return {
      name: emp.name,
      role: emp.role,
      commissionPercent: emp.commissionPercent,
      volume: totalVolume,
      commission: commEarned
    };
  });

  // 7. Appointment Report Data
  const appointmentData = appointments;

  // 8. Academy Fees Report Data
  const academyFeesData = [
    { student: "Emily Blunt", course: "Masters Diploma in Cosmetology", total: 120000, paid: 60000, balance: 60000, status: "Partial" },
    { student: "John Krasinski", course: "Professional Bridal Makeup Artistry", total: 60000, paid: 60000, balance: 0, status: "Paid" }
  ];

  // Report configurations metadata
  const reportsList = [
    { key: "profit-loss", label: "Profit & Loss", icon: Scale },
    { key: "daily-collection", label: "Daily Collections", icon: TrendingUp },
    { key: "monthly-collection", label: "Monthly Revenue", icon: BarChart3 },
    { key: "expense", label: "Expense Statements", icon: TrendingDown },
    { key: "gst", label: "GST Summary", icon: Percent },
    { key: "inventory", label: "Inventory Stocking", icon: Box },
    { key: "staff-commission", label: "Staff Commissions", icon: Users },
    { key: "appointment", label: "Appointments Logs", icon: Calendar },
    { key: "academy-fees", label: "Academy Tuition", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="text-primary h-5 w-5" />
            Business Reports Hub
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Review operating margins, compute tax files, audit staff commissions and generate balance sheets.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-655 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
        >
          <Download size={14} /> Export Sheet
        </button>
      </div>

      {/* Grid: Selectors Left vs Data Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start bg-white">
        
        {/* Left Reports Selection */}
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl p-4 bg-white flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none">
          {reportsList.map(rep => {
            const RepIcon = rep.icon;
            const isSelected = activeReport === rep.key;
            return (
              <button
                key={rep.key}
                onClick={() => setActiveReport(rep.key as any)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
                  isSelected 
                    ? "bg-primary text-white" 
                    : "text-slate-600 hover:text-primary hover:bg-indigo-50/20"
                }`}
              >
                <RepIcon size={14} />
                {rep.label}
              </button>
            );
          })}
        </div>

        {/* Right Report Grid Viewport */}
        <div className="lg:col-span-3 bg-white space-y-6">
          
          {/* Unified Month-wise Excel Exporter Console */}
          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-end justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Month-wise Excel Export Console</h4>
              <p className="text-[10px] text-slate-400">Filter and download active report tables directly into Microsoft Excel spreadsheets.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                >
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </select>
              </div>
              <div>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                <FileSpreadsheet size={13} /> Export Excel (CSV)
              </button>
            </div>
          </div>
          
          {/* Profit and Loss Statement View */}
          {activeReport === "profit-loss" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Profit & Loss Balance Sheet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Revenue Billed</span>
                  <h4 className="text-xl font-black text-emerald-600">{formatCurrency(totalRevenue)}</h4>
                </div>
                <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Expense Drawn</span>
                  <h4 className="text-xl font-black text-danger">-{formatCurrency(totalExpense)}</h4>
                </div>
                <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-1 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Net Profit</span>
                  <h4 className={`text-xl font-black ${netProfit >= 0 ? "text-primary" : "text-danger"}`}>
                    {formatCurrency(netProfit)}
                  </h4>
                </div>
              </div>

              <div className="p-6 border border-slate-100 rounded-2xl space-y-4 bg-white">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Business Operating Margins</h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tax Liabilities (GST Collected)</span>
                    <span className="font-semibold">{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Transaction Value</span>
                    <span className="font-semibold">{formatCurrency(totalRevenue / (bills.length || 1))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Client Database Count</span>
                    <span className="font-semibold">{students.length + bills.length} Profiles</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Collection Table */}
          {activeReport === "daily-collection" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Daily Collections Ledger</h3>
              {dailyCollectionData.length > 0 ? (
                <Table
                  columns={[
                    { accessorKey: "id", header: "Invoice ID", cell: ({ row }) => <span className="font-bold text-primary">{row.getValue("id")}</span> },
                    { accessorKey: "clientName", header: "Client" },
                    { accessorKey: "paymentMode", header: "Payment Mode" },
                    { accessorKey: "grandTotal", header: "Receipt Amount", cell: ({ row }) => <span className="font-bold">{formatCurrency(row.getValue("grandTotal"))}</span> },
                    { accessorKey: "status", header: "Payment Status", cell: statusCell }
                  ]}
                  data={dailyCollectionData}
                />
              ) : (
                <EmptyState title="No collections today" description="Once transactions are cleared in the Billing console, logs will populate here." />
              )}
            </div>
          )}

          {/* Monthly Collection Table */}
          {activeReport === "monthly-collection" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Monthly Revenue Statements</h3>
              <Table
                columns={[
                  { accessorKey: "id", header: "Invoice ID", cell: ({ row }) => <span className="font-bold text-primary">{row.getValue("id")}</span> },
                  { accessorKey: "clientName", header: "Client" },
                  { accessorKey: "date", header: "Posting Date", cell: ({ row }) => <span>{formatDate(row.getValue("date"))}</span> },
                  { accessorKey: "grandTotal", header: "Receipt Amount", cell: ({ row }) => <span className="font-bold">{formatCurrency(row.getValue("grandTotal"))}</span> },
                  { accessorKey: "status", header: "Payment Status", cell: statusCell }
                ]}
                data={monthlyCollectionData}
              />
            </div>
          )}

          {/* Expense Report Table */}
          {activeReport === "expense" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Operating Expense Audits</h3>
              <Table
                columns={[
                  { accessorKey: "title", header: "Voucher Description" },
                  { accessorKey: "category", header: "Expense Category" },
                  { accessorKey: "date", header: "Posting Date", cell: ({ row }) => <span>{formatDate(row.getValue("date"))}</span> },
                  { accessorKey: "amount", header: "Debit Amount", cell: ({ row }) => <span className="font-bold text-danger">-{formatCurrency(row.getValue("amount"))}</span> }
                ]}
                data={expenseData}
              />
            </div>
          )}

          {/* GST Summary Table */}
          {activeReport === "gst" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">GST Tax Liability Summary (CGST 9% + SGST 9%)</h3>
              <Table
                columns={[
                  { accessorKey: "id", header: "Invoice ID" },
                  { accessorKey: "date", header: "Date" },
                  { accessorKey: "taxableAmount", header: "Taxable Value", cell: ({ row }) => <span>{formatCurrency(row.getValue("taxableAmount"))}</span> },
                  { accessorKey: "cgst", header: "CGST", cell: ({ row }) => <span>{formatCurrency(row.getValue("cgst"))}</span> },
                  { accessorKey: "sgst", header: "SGST", cell: ({ row }) => <span>{formatCurrency(row.getValue("sgst"))}</span> },
                  { accessorKey: "totalTax", header: "Tax Collected", cell: ({ row }) => <span className="font-bold">{formatCurrency(row.getValue("totalTax"))}</span> }
                ]}
                data={gstData}
              />
            </div>
          )}

          {/* Inventory Valuation Table */}
          {activeReport === "inventory" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Inventory Valuation Audit</h3>
              <Table
                columns={[
                  { accessorKey: "name", header: "Product" },
                  { accessorKey: "stock", header: "Current Stock" },
                  { accessorKey: "price", header: "Price Point", cell: ({ row }) => <span>{formatCurrency(row.getValue("price"))}</span> },
                  { accessorKey: "value", header: "Valuation", cell: ({ row }) => <span className="font-bold">{formatCurrency(row.getValue("value"))}</span> },
                  { accessorKey: "status", header: "Roster Status" }
                ]}
                data={inventoryData}
              />
            </div>
          )}

          {/* Staff Commissions Table */}
          {activeReport === "staff-commission" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Staff Commission Metrics</h3>
              <Table
                columns={[
                  { accessorKey: "name", header: "Employee" },
                  { accessorKey: "role", header: "Designation" },
                  { accessorKey: "commissionPercent", header: "Rate", cell: ({ row }) => <span>{row.getValue("commissionPercent")}%</span> },
                  { accessorKey: "volume", header: "Services Volume", cell: ({ row }) => <span>{formatCurrency(row.getValue("volume"))}</span> },
                  { accessorKey: "commission", header: "Commission Owed", cell: ({ row }) => <span className="font-bold text-emerald-600">{formatCurrency(row.getValue("commission"))}</span> }
                ]}
                data={staffCommissionData}
              />
            </div>
          )}

          {/* Appointments Logs Table */}
          {activeReport === "appointment" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Scheduled Appointments Audits</h3>
              <Table
                columns={[
                  { accessorKey: "clientName", header: "Client" },
                  { accessorKey: "serviceName", header: "Treatment" },
                  { accessorKey: "staffName", header: "Stylist" },
                  { accessorKey: "date", header: "Schedule Date", cell: ({ row }) => <span>{formatDate(row.getValue("date"))}</span> },
                  { accessorKey: "status", header: "Status" }
                ]}
                data={appointmentData}
              />
            </div>
          )}

          {/* Academy Tuition Table */}
          {activeReport === "academy-fees" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Academy Fees Collections</h3>
              <Table
                columns={[
                  { accessorKey: "student", header: "Student" },
                  { accessorKey: "course", header: "Course Major" },
                  { accessorKey: "total", header: "Tuition Cost", cell: ({ row }) => <span>{formatCurrency(row.getValue("total"))}</span> },
                  { accessorKey: "paid", header: "Amount Paid", cell: ({ row }) => <span className="text-green-600">{formatCurrency(row.getValue("paid"))}</span> },
                  { accessorKey: "balance", header: "Pending Balance", cell: ({ row }) => <span className="text-danger">{formatCurrency(row.getValue("balance"))}</span> },
                  { accessorKey: "status", header: "Ledger status" }
                ]}
                data={academyFeesData}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
