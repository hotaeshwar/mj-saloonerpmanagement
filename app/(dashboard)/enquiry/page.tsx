"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { updateDocument } from "../../../firebase/firestore";
import { HelpCircle, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EnquiryPage() {
  const { data: enquiries, loading, add: addEnquiry, update: updateEnquiry, remove: deleteEnquiry } = useCRUD("enquiries");
  
  // Modal states - Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [enquiryQuery, setEnquiryQuery] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");

  // Modal states - Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestPhone, setEditGuestPhone] = useState("");
  const [editEnquiryQuery, setEditEnquiryQuery] = useState("");
  const [editSourceChannel, setEditSourceChannel] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");

  const handleLogEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !enquiryQuery) {
      toast.error("Please fill in all required query fields.");
      return;
    }

    try {
      await addEnquiry({
        guest: guestName,
        phone: guestPhone,
        query: enquiryQuery,
        source: sourceChannel || "Walk-in Lead",
        status: "Pending"
      });
      setGuestName("");
      setGuestPhone("");
      setEnquiryQuery("");
      setSourceChannel("");
      setIsModalOpen(false);
    } catch (err: any) {}
  };

  const openEditModal = (item: any) => {
    setSelectedEnquiry(item);
    setEditGuestName(item.guest || "");
    setEditGuestPhone(item.phone || "");
    setEditEnquiryQuery(item.query || "");
    setEditSourceChannel(item.source || "");
    setEditStatus(item.status || "Pending");
    setIsEditModalOpen(true);
  };

  const handleEditEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !editGuestName || !editGuestPhone || !editEnquiryQuery) {
      toast.error("Please fill in all required query fields.");
      return;
    }

    try {
      await updateEnquiry(selectedEnquiry.id, {
        guest: editGuestName,
        phone: editGuestPhone,
        query: editEnquiryQuery,
        source: editSourceChannel || "Walk-in Lead",
        status: editStatus
      });
      setIsEditModalOpen(false);
    } catch (err: any) {}
  };

  const statusCell = ({ row }: any) => {
    const item = row.original;
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      try {
        await updateDocument("enquiries", item.id, { status: newStatus });
        toast.success(`Enquiry status updated to ${newStatus}`);
      } catch (err) {
        toast.error("Failed to update enquiry status.");
      }
    };
    
    let badgeColor = "bg-yellow-50 text-yellow-600 border-yellow-200";
    if (item.status === "Converted") badgeColor = "bg-green-50 text-green-600 border-green-200";
    else if (item.status === "Lost") badgeColor = "bg-red-50 text-danger border-red-200";
    
    return (
      <select
        value={item.status || "Pending"}
        onChange={handleStatusChange}
        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold focus:outline-hidden cursor-pointer ${badgeColor}`}
      >
        <option value="Pending">Pending</option>
        <option value="Converted">Converted</option>
        <option value="Lost">Lost</option>
      </select>
    );
  };

  const columns = [
    { accessorKey: "id", header: "Enquiry ID", cell: ({ row }: any) => <span className="font-mono text-[10px] text-slate-400">{(row.getValue("id") || "").substring(0, 8)}</span> },
    { accessorKey: "guest", header: "Lead Contact", cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.getValue("guest")}</span> },
    { accessorKey: "phone", header: "Mobile" },
    { accessorKey: "query", header: "Enquiry Query" },
    { accessorKey: "source", header: "Source Channels" },
    { accessorKey: "status", header: "Roster Status", cell: statusCell },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditModal(item)}
              title="Edit Enquiry"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Are you sure you want to delete enquiry for "${item.guest}"?`)) {
                  await deleteEnquiry(item.id);
                }
              }}
              title="Delete Enquiry"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
            {item.phone && (
              <a
                href={`https://api.whatsapp.com/send?phone=${item.phone.replace(/\D/g, "")}&text=${encodeURIComponent(`Hello ${item.guest}, thank you for your enquiry regarding "${item.query}". How can we help you coordinate this further?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Chat"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px] rounded-lg border border-emerald-200/50 transition-colors"
              >
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.885-6.974C16.526 1.808 14.056.782 11.423.782c-5.442 0-9.866 4.418-9.87 9.856 0 1.96.514 3.87 1.492 5.568l-1.02 3.722 3.812-.998zm12.697-7.228c-.3-.149-1.772-.875-2.046-.975-.275-.1-.475-.149-.675.15-.2.299-.775.975-.95 1.174-.175.2-.35.224-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.793-1.49-1.773-1.665-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.349.45-.523.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8 1.071-.275 1.096-.775 2.193-.775 2.242 0 .05.15.224.35.424 1.875 1.821 4.143 2.242 4.693 2.417.5.15 1.05.13 1.45.07.45-.067 1.771-.724 2.021-1.422.25-.698.25-1.297.175-1.422-.075-.125-.275-.2-.575-.349z"/>
                </svg>
                Chat
              </a>
            )}
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
            <HelpCircle className="text-primary h-5 w-5" />
            Client Enquiry Ledger
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Audit customer leads, follow-up on service enquiries, and convert marketing channels.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
        >
          <Plus size={14} /> Log Enquiry
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading lead tickets...</div>
      ) : enquiries.length > 0 ? (
        <Table columns={columns} data={enquiries} searchKey="guest" searchPlaceholder="Search lead contact name..." />
      ) : (
        <EmptyState 
          title="No lead enquiries logged"
          description="Log customer enquiries and questions to follow up on booking conversions."
          actionText="Log First Enquiry"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Log Enquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log New Guest Enquiry"
        size="md"
      >
        <form onSubmit={handleLogEnquirySubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Lead Contact Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aanya Sen"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 9830098300"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Source Channel (e.g. Instagram, Web, Walk-in)</label>
            <input
              type="text"
              placeholder="e.g. Instagram Lead"
              value={sourceChannel}
              onChange={(e) => setSourceChannel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Enquiry Query details *</label>
            <textarea
              rows={3}
              required
              placeholder="Write the guest's detailed questions..."
              value={enquiryQuery}
              onChange={(e) => setEnquiryQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
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
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Enquiry Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedEnquiry ? `Edit Enquiry: ${selectedEnquiry.guest}` : "Edit Enquiry"}
        size="md"
      >
        <form onSubmit={handleEditEnquirySubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Lead Contact Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aanya Sen"
              value={editGuestName}
              onChange={(e) => setEditGuestName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 9830098300"
              value={editGuestPhone}
              onChange={(e) => setEditGuestPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Source Channel</label>
              <input
                type="text"
                placeholder="e.g. Instagram Lead"
                value={editSourceChannel}
                onChange={(e) => setEditSourceChannel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              >
                <option value="Pending">Pending</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Enquiry Query details *</label>
            <textarea
              rows={3}
              required
              placeholder="Write the guest's detailed questions..."
              value={editEnquiryQuery}
              onChange={(e) => setEditEnquiryQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
