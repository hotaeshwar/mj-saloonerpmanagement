"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit,
  TrendingDown, 
  CalendarDays, 
  BookOpen, 
  FileText 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

export default function ExpensesPage() {
  const { data: expenses, add: addExpense, update: updateExpense, remove: deleteExpense } = useCRUD("expenses");
  const { data: expenseCategories } = useCRUD("expenseCategories");

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Form states - Add
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  // Form states - Edit
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Totals calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  
  const dailyTotal = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const monthlyTotal = expenses
    .filter(e => e.date && e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || amount <= 0) {
      toast.error("Please fill all required expense fields.");
      return;
    }

    try {
      await addExpense({
        title,
        category,
        amount,
        date,
        description
      });
      // reset
      setTitle("");
      setCategory("");
      setAmount(0);
      setDescription("");
      setModalOpen(false);
    } catch (e) {}
  };

  const openEditModal = (item: any) => {
    setSelectedExpense(item);
    setEditTitle(item.title || "");
    setEditCategory(item.category || "");
    setEditAmount(item.amount || 0);
    setEditDate(item.date || new Date().toISOString().split("T")[0]);
    setEditDescription(item.description || "");
    setEditModalOpen(true);
  };

  const handleEditExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense || !editTitle || !editCategory || editAmount <= 0) {
      toast.error("Please fill all required expense fields.");
      return;
    }

    try {
      await updateExpense(selectedExpense.id, {
        title: editTitle,
        category: editCategory,
        amount: Number(editAmount) || 0,
        date: editDate,
        description: editDescription
      });
      setEditModalOpen(false);
    } catch (e) {}
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Expense Description",
      cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.getValue("title")}</span>
    },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "amount",
      header: "Voucher Amount",
      cell: ({ row }: any) => <span className="font-extrabold text-danger">-{formatCurrency(row.getValue("amount"))}</span>
    },
    {
      accessorKey: "date",
      header: "Posting Date",
      cell: ({ row }: any) => <span>{formatDate(row.getValue("date"))}</span>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditModal(item)}
              title="Edit Expense"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm("Delete this expense log?")) {
                  await deleteExpense(item.id);
                }
              }}
              title="Delete Expense"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <Receipt className="text-primary h-5 w-5" />
            Operational Expense Registry
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Record day-to-day salon outflows, manage rent, utilities, vendor purchases and Petty Cash balances.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
        >
          <Plus size={14} /> Record Outflow
        </button>
      </div>

      {/* Metrics breakdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        <div className="p-5 border border-slate-100 rounded-2xl bg-white flex justify-between items-center shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outflow Today</span>
            <h3 className="text-2xl font-black text-slate-800">{formatCurrency(dailyTotal)}</h3>
          </div>
          <div className="p-3 bg-red-50 text-danger rounded-xl">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="p-5 border border-slate-100 rounded-2xl bg-white flex justify-between items-center shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outflow This Month</span>
            <h3 className="text-2xl font-black text-slate-850">{formatCurrency(monthlyTotal)}</h3>
          </div>
          <div className="p-3 bg-red-50 text-danger rounded-xl">
            <CalendarDays size={20} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {expenses.length > 0 ? (
        <Table columns={columns} data={expenses} searchKey="title" searchPlaceholder="Search expenses..." />
      ) : (
        <EmptyState 
          title="No expenses logged"
          description="Operational outflows logged here will adjust Petty Cash budgets dynamically."
          actionText="Record First Expense"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Record Expense Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Expense Voucher"
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Expense Title *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                placeholder="e.g. Shop Electricity bill July"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Expense Category *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="">Choose category...</option>
                {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Date of Expense</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Voucher Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 8500"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Voucher Notes & Description</label>
            <textarea
              rows={2}
              placeholder="Invoice details, payment modes, approval remarks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Confirm Log
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Expense Dialog */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedExpense ? `Edit Expense: ${selectedExpense.title}` : "Edit Expense"}
        size="md"
      >
        <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Expense Title *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                placeholder="e.g. Shop Electricity bill July"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Expense Category *</label>
              <select
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="">Choose category...</option>
                {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Date of Expense</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Voucher Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 8500"
              value={editAmount || ""}
              onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Voucher Notes & Description</label>
            <textarea
              rows={2}
              placeholder="Invoice details, payment modes, approval remarks..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
