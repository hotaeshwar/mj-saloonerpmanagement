"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getDocuments, createDocument, deleteDocument, updateDocument } from "../../../firebase/firestore";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  Settings as SettingsIcon, 
  Building,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUserSession } = useAuth();
  
  // States
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");

  // Load branches
  const refreshBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await getDocuments("branches");
      setBranchesList(res);
    } catch (e) {
      toast.error("Failed to load branches config.");
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    refreshBranches();
  }, []);

  // Add Branch
  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !branchLocation) {
      toast.error("Please fill in both branch name and location.");
      return;
    }

    try {
      const newBranch = await createDocument("branches", {
        name: branchName,
        location: branchLocation,
        status: "active"
      });
      
      setBranchName("");
      setBranchLocation("");
      setIsModalOpen(false);
      toast.success("Branch added successfully.");
      await refreshBranches();

      // If user currently has no branch set, auto-activate this one!
      if (user && (!user.branchName || user.branchName === "Main Branch" || user.branchName === "Downtown Elite")) {
        await handleActivateBranch(newBranch);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add branch.");
    }
  };

  // Activate Branch (Sets active branch for logged in user)
  const handleActivateBranch = async (branch: any) => {
    if (!user) return;
    try {
      // Update admins document in Firestore
      const updatedProfile = {
        ...user,
        branchName: branch.name,
        address: branch.location
      };
      
      await updateDocument("admins", user.uid, {
        branchName: branch.name,
        address: branch.location
      });

      // Update active Context session
      updateUserSession(updatedProfile);
      toast.success(`Switched active branch to ${branch.name}.`);
    } catch (e) {
      toast.error("Failed to update active branch.");
    }
  };

  // Delete Branch
  const handleDeleteBranch = async (branch: any) => {
    if (user?.role !== "SUPER_ADMIN") {
      toast.error("Super Admin clearance is required to delete branches.");
      return;
    }

    if (confirm(`Are you sure you want to remove branch location: ${branch.name}?`)) {
      try {
        await deleteDocument("branches", branch.id);
        toast.success("Branch location deleted.");
        await refreshBranches();
      } catch (e) {
        toast.error("Error deleting branch.");
      }
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }: any) => {
        const item = row.original;
        const isActive = user?.branchName === item.name;
        return (
          <div className="flex items-center gap-2">
            <div>
              <p className="font-bold text-slate-800">{item.name}</p>
              {isActive && (
                <span className="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700 mt-0.5">
                  Active
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    { 
      accessorKey: "location", 
      header: "Location Address",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 text-slate-500 max-w-[300px] truncate">
            <MapPin size={12} className="shrink-0 text-slate-400" />
            <span>{item.location}</span>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Operations",
      cell: ({ row }: any) => {
        const item = row.original;
        const isActive = user?.branchName === item.name;
        return (
          <div className="flex gap-2">
            {!isActive && (
              <button
                onClick={() => handleActivateBranch(item)}
                title="Activate Branch"
                className="p-1.5 rounded-lg border border-green-200 text-green-600 bg-green-50 hover:bg-green-100/50 transition-colors"
              >
                <CheckCircle2 size={12} />
              </button>
            )}
            {user?.role === "SUPER_ADMIN" && (
              <button
                onClick={() => handleDeleteBranch(item)}
                title="Delete Branch"
                className="p-1.5 rounded-lg border border-red-100 text-danger hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <SettingsIcon className="text-primary h-5 w-5" />
            General Branch Configuration
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Configure business operating locations, set active branch selections, and track store addresses.</p>
        </div>
      </div>

      {/* Profile & Salon Details info block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        
        {/* Salon profile card */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1">
            <Building size={14} className="text-primary" /> Active Salon & Branch details
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Salon Brand Name</span>
              <span className="font-semibold text-slate-800">{user?.salonName}</span>
            </div>
            <div className="flex justify-between">
              <span>Assigned Branch</span>
              <span className="font-semibold text-slate-800">{user?.branchName || "Not Configured"}</span>
            </div>
            <div className="flex justify-between">
              <span>Full Branch Address</span>
              <span className="font-semibold text-slate-800 text-right">{user?.address || "No location address set"}</span>
            </div>
          </div>
        </div>

        {/* Security configuration summary */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1">
            <Lock size={14} className="text-primary" /> Security & Role Access
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Logged Account</span>
              <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>User Group Role</span>
              <span className="font-bold text-primary">{user?.role}</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              {user?.role === "SUPER_ADMIN" 
                ? "You hold Super Administrator clearance. You can edit configurations, set active operating branches, and manage locations." 
                : "You hold standard Administrator credentials. Branch details switching is enabled but deletion operations are locked."}
            </p>
          </div>
        </div>

      </div>

      {/* Branches configuration registry list */}
      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registered Store Branches</h3>
            <p className="text-xxs text-slate-400">Configure and activate store locations to updates your session profile.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
          >
            <Plus size={12} /> Add Branch
          </button>
        </div>

        {loadingBranches ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading branch registers...</p>
        ) : branchesList.length > 0 ? (
          <Table columns={columns} data={branchesList} searchKey="name" searchPlaceholder="Search branch name..." />
        ) : (
          <EmptyState 
            title="No Branches Configured"
            description="Add your store branch name and location to initialize active operating units."
          />
        )}
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Operating Branch"
        size="md"
      >
        <form onSubmit={handleAddBranchSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. East Side Center"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Location (Full Address) *</label>
            <input
              type="text"
              required
              placeholder="e.g. 505 Fashion Boulevard, Suite C, East Side"
              value={branchLocation}
              onChange={(e) => setBranchLocation(e.target.value)}
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
              Save Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
