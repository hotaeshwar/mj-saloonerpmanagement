"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { ClipboardList, Trash2, Edit } from "lucide-react";
import { formatDate } from "../../../firebase/helpers";
import { toast } from "react-hot-toast";

export default function AppointmentsListPage() {
  const { data: appointments, update: updateAppointment, remove: deleteAppointment } = useCRUD("appointments");
  const { data: services } = useCRUD("services");
  const { data: employees } = useCRUD("employees");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Form states - Edit
  const [editClientName, setEditClientName] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editStaffName, setEditStaffName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");

  const openEditModal = (item: any) => {
    setSelectedAppointment(item);
    setEditClientName(item.clientName || "");
    setEditClientPhone(item.clientPhone || "");
    setEditServiceName(item.serviceName || "");
    setEditStaffName(item.staffName || "");
    setEditDate(item.date || new Date().toISOString().split("T")[0]);
    setEditTime(item.time || "");
    setEditStatus(item.status || "Pending");
    setEditModalOpen(true);
  };

  const handleEditAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !editClientName || !editServiceName) {
      toast.error("Please fill in client and service details.");
      return;
    }

    try {
      await updateAppointment(selectedAppointment.id, {
        clientName: editClientName,
        clientPhone: editClientPhone,
        serviceName: editServiceName,
        staffName: editStaffName,
        date: editDate,
        time: editTime,
        status: editStatus
      });
      setEditModalOpen(false);
    } catch (e) {}
  };

  const columns = [
    { accessorKey: "clientName", header: "Client Name", cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.getValue("clientName")}</span> },
    { accessorKey: "clientPhone", header: "Phone" },
    { accessorKey: "serviceName", header: "Treatment Service" },
    { accessorKey: "staffName", header: "Stylist Assigned" },
    { accessorKey: "date", header: "Scheduled Date", cell: ({ row }: any) => <span>{formatDate(row.getValue("date"))}</span> },
    { accessorKey: "time", header: "Time Slot" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const val = row.getValue("status");
        return (
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            val === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
          }`}>
            {val}
          </span>
        );
      }
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
              title="Edit Appointment"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Are you sure you want to delete appointment for "${item.clientName}"?`)) {
                  await deleteAppointment(item.id);
                }
              }}
              title="Delete Appointment"
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
            <ClipboardList className="text-primary h-5 w-5" />
            Appointments Logs List
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Audit complete scheduler records, clean old listings, and verify logs.</p>
        </div>
      </div>

      {appointments && appointments.length > 0 ? (
        <Table columns={columns} data={appointments} searchKey="clientName" searchPlaceholder="Search clients..." />
      ) : (
        <EmptyState title="No bookings registered" description="Schedule appointments in the Calendar module to view details here." />
      )}

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedAppointment ? `Edit Appointment: ${selectedAppointment.clientName}` : "Edit Appointment"}
        size="md"
      >
        <form onSubmit={handleEditAppointmentSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Client Full Name *</label>
              <input
                type="text"
                required
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Contact Phone Number</label>
              <input
                type="text"
                value={editClientPhone}
                onChange={(e) => setEditClientPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Treatment Service *</label>
              <input
                type="text"
                required
                value={editServiceName}
                onChange={(e) => setEditServiceName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Stylist Assigned</label>
              <input
                type="text"
                value={editStaffName}
                onChange={(e) => setEditStaffName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Date *</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Time Slot</label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
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
