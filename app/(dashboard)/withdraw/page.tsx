"use client";

import React, { useState } from "react";
import { Table } from "../../../components/Table";
import { EmptyState } from "../../../components/EmptyState";
import { Landmark, Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../firebase/helpers";
import { useCRUD } from "../../../firebase/hooks";
import { Modal } from "../../../components/Modal";
import { toast } from "react-hot-toast";

export default function WithdrawPage() {
  const { data: withdraws, add: addWithdraw, update: updateWithdraw, remove: deleteWithdraw } = useCRUD("withdraws");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWithdraw, setSelectedWithdraw] = useState<any>(null);

  // Form states - Add
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("UPI Bank Transfer");

  // Form states - Edit
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editMethod, setEditMethod] = useState("UPI Bank Transfer");
  const [editDate, setEditDate] = useState("");

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) {
      toast.error("Please provide a valid description and positive withdraw amount.");
      return;
    }
    try {
      await addWithdraw({
        title,
        amount: parseFloat(amount.toString()) || 0,
        method,
        date: new Date().toISOString().split("T")[0]
      });
      setTitle("");
      setAmount(0);
      setModalOpen(false);
    } catch (err: any) {}
  };

  const openEditModal = (item: any) => {
    setSelectedWithdraw(item);
    setEditTitle(item.title || "");
    setEditAmount(item.amount || 0);
    setEditMethod(item.method || "UPI Bank Transfer");
    setEditDate(item.date || new Date().toISOString().split("T")[0]);
    setEditModalOpen(true);
  };

  const handleEditWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdraw || !editTitle || editAmount <= 0) {
      toast.error("Please provide a valid description and positive withdraw amount.");
      return;
    }
    try {
      await updateWithdraw(selectedWithdraw.id, {
        title: editTitle,
        amount: parseFloat(editAmount.toString()) || 0,
        method: editMethod,
        date: editDate
      });
      setEditModalOpen(false);
    } catch (err: any) {}
  };

  const columns = [
    { accessorKey: "id", header: "Withdraw ID", cell: ({ row }: any) => <span className="font-semibold text-xxs text-slate-400">{(row.getValue("id") || "").substring(0, 8)}</span> },
    { accessorKey: "title", header: "Drawing Description" },
    { accessorKey: "amount", header: "Draw Value", cell: ({ row }: any) => <span className="font-extrabold text-danger">-{formatCurrency(row.getValue("amount"))}</span> },
    { accessorKey: "method", header: "Transfer Mode" },
    { accessorKey: "date", header: "Posting Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditModal(item)}
              title="Edit Withdrawal"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Are you sure you want to remove drawing log "${item.title}"?`)) {
                  await deleteWithdraw(item.id);
                }
              }}
              title="Delete Withdrawal"
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
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <Landmark className="text-primary h-5 w-5" />
            Drawing & Withdraw Ledger
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Audit cash drawing balances, log bank transfers, and verify owner draw amounts.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
        >
          <Plus size={14} /> Log Cash Withdraw
        </button>
      </div>

      {withdraws && withdraws.length > 0 ? (
        <Table columns={columns} data={withdraws} />
      ) : (
        <EmptyState 
          title="No drawings logged yet" 
          description="Log owner withdrawals or bank drawings using the action button at the top." 
        />
      )}

      {/* Log Withdraw Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Cash Drawing / Bank Withdraw"
        size="md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Drawing Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Owner Drawing July / Vendor Settlement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Draw Value (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Transfer Mode *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-855"
              >
                <option value="UPI Bank Transfer">UPI Bank Transfer</option>
                <option value="Cash Withdrawal">Cash Withdrawal</option>
                <option value="Cheque Clearance">Cheque Clearance</option>
              </select>
            </div>
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
              Save Withdrawal Log
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Withdraw Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedWithdraw ? `Edit Withdrawal: ${selectedWithdraw.title}` : "Edit Withdrawal"}
        size="md"
      >
        <form onSubmit={handleEditWithdrawSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Drawing Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Owner Drawing July / Vendor Settlement"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Draw Value (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={editAmount || ""}
                onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Transfer Mode *</label>
              <select
                value={editMethod}
                onChange={(e) => setEditMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-855"
              >
                <option value="UPI Bank Transfer">UPI Bank Transfer</option>
                <option value="Cash Withdrawal">Cash Withdrawal</option>
                <option value="Cheque Clearance">Cheque Clearance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Posting Date</label>
            <input
              type="date"
              required
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
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
