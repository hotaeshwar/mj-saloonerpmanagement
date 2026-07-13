"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  Users, 
  Wallet, 
  History, 
  Clipboard, 
  Camera, 
  Smile, 
  CalendarClock, 
  Plus, 
  Edit,
  DollarSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

export default function ClientsPage() {
  const { data: clients, add: addClient, update: updateClient } = useCRUD("clients");

  // Modals state
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "wallet" | "details">("details");

  // Local forms state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [walletAmount, setWalletAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [gender, setGender] = useState("Female");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please provide client name and phone number.");
      return;
    }
    try {
      await addClient({
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        gender: gender || "Female",
        walletBalance: 0,
        membership: "None",
        pendingAmount: 0,
        notes: notes || "Regular visit client",
        status: true,
        feedback: feedback || "N/A",
        followUpDate: followUpDate || "N/A"
      });
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setFeedback("");
      setFollowUpDate("");
      setGender("Female");
      setIsModalOpen(false);
      toast.success("Client registered successfully.");
    } catch (e) {}
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || walletAmount <= 0) return;
    try {
      const currentBal = selectedClient.walletBalance || 0;
      await updateClient(selectedClient.id, {
        walletBalance: currentBal + walletAmount
      });
      setWalletAmount(0);
      setIsModalOpen(false);
      toast.success(`Loaded ₹${walletAmount} into ${selectedClient.name}'s wallet.`);
    } catch (e) {}
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <button
            onClick={() => {
              setSelectedClient(item);
              setModalType("details");
              setIsModalOpen(true);
            }}
            className="font-bold text-primary hover:underline text-left block"
          >
            {item.name}
          </button>
        );
      }
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "walletBalance",
      header: "Wallet Balance",
      cell: ({ row }: any) => (
        <span className="font-bold text-emerald-600">{formatCurrency(row.getValue("walletBalance"))}</span>
      )
    },
    { accessorKey: "membership", header: "Membership Level" },
    {
      accessorKey: "followUpDate",
      header: "Next Follow-up",
      cell: ({ row }: any) => {
        const val = row.getValue("followUpDate");
        return <span>{val && val !== "N/A" ? formatDate(val) : "No follow-up set"}</span>;
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedClient(item);
                setModalType("wallet");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 font-bold text-[10px] rounded-lg transition-colors border border-green-200/50"
            >
              <DollarSign size={10} /> Recharge
            </button>
            <a
              href={`https://api.whatsapp.com/send?phone=${item.phone.replace(/\D/g, "")}&text=${encodeURIComponent(`Hello ${item.name}, thank you for choosing MJ-creationERP. How can we assist you today?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px] rounded-lg transition-colors border border-emerald-200/50"
            >
              <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.885-6.974C16.526 1.808 14.056.782 11.423.782c-5.442 0-9.866 4.418-9.87 9.856 0 1.96.514 3.87 1.492 5.568l-1.02 3.722 3.812-.998zm12.697-7.228c-.3-.149-1.772-.875-2.046-.975-.275-.1-.475-.149-.675.15-.2.299-.775.975-.95 1.174-.175.2-.35.224-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.793-1.49-1.773-1.665-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.349.45-.523.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8 1.071-.275 1.096-.775 2.193-.775 2.242 0 .05.15.224.35.424 1.875 1.821 4.143 2.242 4.693 2.417.5.15 1.05.13 1.45.07.45-.067 1.771-.724 2.021-1.422.25-.698.25-1.297.175-1.422-.075-.125-.275-.2-.575-.349z"/>
              </svg>
              WhatsApp
            </a>
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
            <Users className="text-primary h-5 w-5" />
            Client Relationship Registry
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Register new salon guests, load pre-paid wallets, configure notes and manage feedback surveys.</p>
        </div>
        <button
          onClick={() => {
            setModalType("add");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
        >
          <Plus size={14} /> Register Guest
        </button>
      </div>

      {/* Main Data Table */}
      {clients.length > 0 ? (
        <Table columns={columns} data={clients} searchKey="name" searchPlaceholder="Search clients by name..." />
      ) : (
        <EmptyState 
          title="No clients registered"
          description="Build customer loyalty by recording their contact files and wallet logs."
          actionText="Add First Client"
          onAction={() => {
            setModalType("add");
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Add Client Dialog */}
      <Modal
        isOpen={isModalOpen && modalType === "add"}
        onClose={() => setIsModalOpen(false)}
        title="Register Client Profile"
        size="md"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Guest Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Contact Phone Number *</label>
            <input
              type="text"
              required
              placeholder="10 digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Non-Binary</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Private Directives & Notes</label>
            <textarea
              rows={2}
              placeholder="Allergies, chemical preferences, custom styling demands..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Schedule Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Service Feedback Level</label>
              <select
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="N/A">Not Available</option>
                <option value="Excellent">Excellent (5 Stars)</option>
                <option value="Good">Good (4 Stars)</option>
                <option value="Average">Average (3 Stars)</option>
                <option value="Poor">Poor (1-2 Stars)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Admit Register
            </button>
          </div>
        </form>
      </Modal>

      {/* Wallet Recharge Dialog */}
      <Modal
        isOpen={isModalOpen && modalType === "wallet"}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? `Load pre-paid credits: ${selectedClient.name}` : "Credit Wallet"}
        size="sm"
      >
        <form onSubmit={handleUpdateWallet} className="space-y-4">
          <div className="p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-xl flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Current Balance</span>
            <span className="text-emerald-600 font-bold">{selectedClient ? formatCurrency(selectedClient.walletBalance) : "₹0.00"}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Top Up Credits (₹) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 2000"
              value={walletAmount || ""}
              onChange={(e) => setWalletAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Confirm Load
            </button>
          </div>
        </form>
      </Modal>

      {/* Guest Details Dialog */}
      <Modal
        isOpen={isModalOpen && modalType === "details"}
        onClose={() => setIsModalOpen(false)}
        title="Customer Profile Summary"
        size="md"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-16 w-16 bg-indigo-50 text-primary font-extrabold text-xl uppercase rounded-2xl flex items-center justify-center border border-indigo-100">
                {selectedClient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedClient.name}</h3>
                <p className="text-xs text-slate-500">{selectedClient.phone} • {selectedClient.email}</p>
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xxs font-medium text-primary mt-1">
                  {selectedClient.membership || "General Client"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Wallet Pre-paid</span>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                  <Wallet size={14} />
                  {formatCurrency(selectedClient.walletBalance)}
                </p>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Dues Outstanding</span>
                <p className="text-sm font-bold text-danger">
                  {formatCurrency(selectedClient.pendingAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xxs font-bold text-slate-400 uppercase block mb-1">Directives Notes</span>
                <p className="text-xs text-slate-600 bg-slate-50/20 p-2.5 rounded-xl border border-slate-100 italic">
                  {selectedClient.notes || "No custom styling notes loaded."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-xxs font-bold text-slate-400 uppercase block mb-1">Follow-up schedule</span>
                  <p className="font-semibold">{selectedClient.followUpDate && selectedClient.followUpDate !== "N/A" ? formatDate(selectedClient.followUpDate) : "None"}</p>
                </div>
                <div>
                  <span className="text-xxs font-bold text-slate-400 uppercase block mb-1">Guest Review Feedback</span>
                  <p className="font-semibold">{selectedClient.feedback || "Not Provided"}</p>
                </div>
              </div>

              <div>
                <span className="text-xxs font-bold text-slate-400 uppercase block mb-1">Client Photo Journal</span>
                <div className="flex gap-2">
                  <div className="h-16 w-16 bg-slate-50 border border-slate-100 border-dashed rounded-xl flex items-center justify-center text-slate-400">
                    <Camera size={18} />
                  </div>
                  <div className="flex-1 flex items-center">
                    <p className="text-[10px] text-slate-400 italic">No treatment style photos uploaded to profile yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
