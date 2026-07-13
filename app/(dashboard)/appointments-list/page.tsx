"use client";

import React from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { EmptyState } from "../../../components/EmptyState";
import { ClipboardList, Trash2 } from "lucide-react";
import { formatDate } from "../../../firebase/helpers";

export default function AppointmentsListPage() {
  const { data: appointments, remove: deleteAppointment } = useCRUD("appointments");

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
          <button
            onClick={() => {
              if (confirm("Delete this appointment record?")) {
                deleteAppointment(item.id);
              }
            }}
            className="p-1 text-slate-400 hover:text-danger hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
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

      {appointments.length > 0 ? (
        <Table columns={columns} data={appointments} searchKey="clientName" searchPlaceholder="Search clients..." />
      ) : (
        <EmptyState title="No bookings registered" description="Schedule appointments in the Calendar module to view details here." />
      )}
    </div>
  );
}
