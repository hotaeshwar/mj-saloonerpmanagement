"use client";

import React from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { EmptyState } from "../../../components/EmptyState";
import { MessageSquare, Star, Smile } from "lucide-react";
import { formatDate } from "../../../firebase/helpers";

export default function FeedbackPage() {
  const { data: clients } = useCRUD("clients");

  // Format clients with feedback
  const feedbackData = clients
    .filter(c => c.feedback && c.feedback !== "N/A")
    .map(c => ({
      name: c.name,
      phone: c.phone,
      rating: c.feedback === "Excellent" ? 5 : c.feedback === "Good" ? 4 : c.feedback === "Average" ? 3 : 2,
      review: c.notes || "No custom review comments.",
      date: c.createdAt || new Date().toISOString()
    }));

  const columns = [
    {
      accessorKey: "name",
      header: "Guest Name",
      cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.getValue("name")}</span>
    },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "rating",
      header: "Rating Score",
      cell: ({ row }: any) => {
        const rating = row.getValue("rating") as number;
        return (
          <div className="flex gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} size={14} className={idx < rating ? "fill-current" : "text-slate-200"} />
            ))}
          </div>
        );
      }
    },
    { accessorKey: "review", header: "Guest Comments" },
    {
      accessorKey: "date",
      header: "Post Date",
      cell: ({ row }: any) => <span>{formatDate(row.getValue("date"))}</span>
    }
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="text-primary h-5 w-5" />
            Client Reviews & Feedback
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Review operating service comments, inspect ratings, and improve guest experiences.</p>
        </div>
      </div>

      {feedbackData.length > 0 ? (
        <Table columns={columns} data={feedbackData} searchKey="name" searchPlaceholder="Search reviews..." />
      ) : (
        <EmptyState 
          title="No guest reviews recorded"
          description="Register guest review levels inside the Client Management console to populate feedback tables."
        />
      )}
    </div>
  );
}
