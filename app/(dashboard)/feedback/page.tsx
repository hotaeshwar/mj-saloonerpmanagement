"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { MessageSquare, Star, Edit, Trash2 } from "lucide-react";
import { formatDate } from "../../../firebase/helpers";
import { toast } from "react-hot-toast";

export default function FeedbackPage() {
  const { data: clients, update: updateClient } = useCRUD("clients");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editFeedbackLevel, setEditFeedbackLevel] = useState("Good");
  const [editReviewText, setEditReviewText] = useState("");

  // Format clients with feedback
  const feedbackData = clients
    .filter(c => c.feedback && c.feedback !== "N/A")
    .map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      feedback: c.feedback,
      rating: c.feedback === "Excellent" ? 5 : c.feedback === "Good" ? 4 : c.feedback === "Average" ? 3 : 2,
      review: c.notes || "No custom review comments.",
      date: c.createdAt || new Date().toISOString()
    }));

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setEditFeedbackLevel(item.feedback || "Good");
    setEditReviewText(item.review || "");
    setEditModalOpen(true);
  };

  const handleEditFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await updateClient(selectedItem.id, {
        feedback: editFeedbackLevel,
        notes: editReviewText
      });
      setEditModalOpen(false);
    } catch (e) {}
  };

  const handleDeleteFeedback = async (item: any) => {
    if (confirm(`Remove review record for ${item.name}?`)) {
      try {
        await updateClient(item.id, {
          feedback: "N/A"
        });
        toast.success("Review removed.");
      } catch (e) {}
    }
  };

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
              title="Edit Feedback"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={() => handleDeleteFeedback(item)}
              title="Delete Feedback"
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

      {/* Edit Feedback Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedItem ? `Edit Feedback: ${selectedItem.name}` : "Edit Review"}
        size="md"
      >
        <form onSubmit={handleEditFeedbackSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Rating Score</label>
            <select
              value={editFeedbackLevel}
              onChange={(e) => setEditFeedbackLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            >
              <option value="Excellent">Excellent (5 Stars)</option>
              <option value="Good">Good (4 Stars)</option>
              <option value="Average">Average (3 Stars)</option>
              <option value="Poor">Poor (1-2 Stars)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Guest Review Comments</label>
            <textarea
              rows={3}
              value={editReviewText}
              onChange={(e) => setEditReviewText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
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
