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
  MapPin,
  Edit3,
  Phone
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUserSession } = useAuth();
  
  // States
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Form states - Branch
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchPhone, setBranchPhone] = useState("");

  // Edit Branch states
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [editBranchName, setEditBranchName] = useState("");
  const [editBranchLocation, setEditBranchLocation] = useState("");
  const [editBranchPhone, setEditBranchPhone] = useState("");

  // Form states - Admin Profile
  const [editAdminName, setEditAdminName] = useState("");
  const [editSalonName, setEditSalonName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

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

  // Update Admin Profile & Contact details
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: editAdminName.trim() || user.name,
      salonName: editSalonName.trim() || user.salonName,
      phone: editPhone.trim() || user.phone || "+91 98765 43210",
      address: editAddress.trim() || user.address
    };

    try {
      // Update in Firestore admins collection
      try {
        await updateDocument("admins", user.uid, {
          name: updatedUser.name,
          salonName: updatedUser.salonName,
          phone: updatedUser.phone,
          address: updatedUser.address
        });
      } catch (fsErr) {
        console.warn("Firestore update warning (using fallback state):", fsErr);
      }

      // Update in LocalStorage fallback mock admins array
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("erpsaloon_mock_admins");
        if (existing) {
          try {
            const list = JSON.parse(existing);
            const updatedList = list.map((a: any) => a.uid === user.uid ? updatedUser : a);
            localStorage.setItem("erpsaloon_mock_admins", JSON.stringify(updatedList));
          } catch (e) {}
        }
      }

      // Update active React Context session
      updateUserSession(updatedUser);
      setIsProfileModalOpen(false);
      toast.success("Salon contact profile & details updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile details.");
    }
  };

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
        phone: branchPhone || user?.phone || "+91 98765 43210",
        status: "active"
      });
      
      setBranchName("");
      setBranchLocation("");
      setBranchPhone("");
      setIsModalOpen(false);
      toast.success("Branch added successfully.");
      await refreshBranches();

      // If user currently has no branch set or main branch, auto-activate this one!
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
      const updatedProfile = {
        ...user,
        branchName: branch.name,
        address: branch.location,
        phone: branch.phone || user.phone || "+91 98765 43210"
      };
      
      try {
        await updateDocument("admins", user.uid, {
          branchName: branch.name,
          address: branch.location,
          phone: updatedProfile.phone
        });
      } catch (err) {}

      // Update active Context session
      updateUserSession(updatedProfile);
      toast.success(`Switched active branch to ${branch.name}.`);
    } catch (e) {
      toast.error("Failed to update active branch.");
    }
  };

  const openEditBranchModal = (branch: any) => {
    setSelectedBranch(branch);
    setEditBranchName(branch.name || "");
    setEditBranchLocation(branch.location || "");
    setEditBranchPhone(branch.phone || "");
    setIsEditBranchModalOpen(true);
  };

  const handleEditBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !editBranchName || !editBranchLocation) {
      toast.error("Please fill in both branch name and location.");
      return;
    }

    try {
      await updateDocument("branches", selectedBranch.id, {
        name: editBranchName,
        location: editBranchLocation,
        phone: editBranchPhone || "+91 98765 43210"
      });
      setIsEditBranchModalOpen(false);
      toast.success("Branch location updated successfully.");
      await refreshBranches();
    } catch (e: any) {
      toast.error("Failed to update branch: " + e.message);
    }
  };

  // Delete Branch
  const handleDeleteBranch = async (branch: any) => {
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
          <div className="flex items-center gap-1 text-slate-500 max-w-[250px] truncate">
            <MapPin size={12} className="shrink-0 text-slate-400" />
            <span>{item.location}</span>
          </div>
        );
      }
    },
    { 
      accessorKey: "phone", 
      header: "Contact Phone",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1 text-slate-600 font-mono text-xs">
            <Phone size={12} className="shrink-0 text-primary" />
            <span>{item.phone || user?.phone || "+91 98765 43210"}</span>
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
          <div className="flex items-center gap-1.5">
            {!isActive && (
              <button
                onClick={() => handleActivateBranch(item)}
                title="Activate Branch"
                className="p-1.5 rounded-lg border border-green-200 text-green-600 bg-green-50 hover:bg-green-100/50 transition-colors"
              >
                <CheckCircle2 size={12} />
              </button>
            )}
            <button
              onClick={() => openEditBranchModal(item)}
              title="Edit Branch"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={() => handleDeleteBranch(item)}
              title="Delete Branch"
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
    <div className="space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <SettingsIcon className="text-primary h-5 w-5" />
            General Branch & Salon Configuration
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Configure business operating locations, set active branch selections, and update contact phone details.</p>
        </div>
      </div>

      {/* Profile & Salon Details info block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        
        {/* Salon profile card */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-white space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Building size={14} className="text-primary" /> Active Salon & Contact Details
            </h3>
            <button
              onClick={() => {
                setEditAdminName(user?.name || "");
                setEditSalonName(user?.salonName || "");
                setEditPhone(user?.phone || "+91 98765 43210");
                setEditAddress(user?.address || "");
                setIsProfileModalOpen(true);
              }}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 border border-primary/20 bg-indigo-50/50 px-2.5 py-1 rounded-lg"
            >
              <Edit3 size={12} /> Edit Profile & Contact
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Salon Brand Name</span>
              <span className="font-semibold text-slate-800">{user?.salonName}</span>
            </div>
            <div className="flex justify-between">
              <span>Admin Contact Number</span>
              <span className="font-mono font-bold text-primary">{user?.phone || "+91 98765 43210"}</span>
            </div>
            <div className="flex justify-between">
              <span>Assigned Branch</span>
              <span className="font-semibold text-slate-800">{user?.branchName || "Not Configured"}</span>
            </div>
            <div className="flex justify-between">
              <span>Full Branch Address</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{user?.address || "No location address set"}</span>
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
                ? "You hold Super Administrator clearance. You can edit configurations, set active operating branches, and manage contact numbers." 
                : "You hold standard Administrator credentials. Contact details and branch switching are enabled."}
            </p>
          </div>
        </div>

      </div>

      {/* Branches configuration registry list */}
      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registered Store Branches</h3>
            <p className="text-xxs text-slate-400">Configure and activate store locations to update your session profile.</p>
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

      {/* Edit Admin Contact & Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit Salon & Contact Details"
        size="md"
      >
        <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Admin Contact Phone Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98765 43210"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 font-mono"
            />
            <p className="text-[10px] text-slate-400">This contact phone will reflect on the Navbar, Sidebar, and Billing Invoices.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Salon Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MJ-creationERP"
              value={editSalonName}
              onChange={(e) => setEditSalonName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Administrator Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={editAdminName}
              onChange={(e) => setEditAdminName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Active Branch Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 101 Premium Avenue, Suite A, Downtown"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>

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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Contact Phone</label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={branchPhone}
              onChange={(e) => setBranchPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 font-mono"
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

      {/* Edit Branch Modal */}
      <Modal
        isOpen={isEditBranchModalOpen}
        onClose={() => setIsEditBranchModalOpen(false)}
        title={selectedBranch ? `Edit Branch: ${selectedBranch.name}` : "Edit Operating Branch"}
        size="md"
      >
        <form onSubmit={handleEditBranchSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. East Side Center"
              value={editBranchName}
              onChange={(e) => setEditBranchName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Location (Full Address) *</label>
            <input
              type="text"
              required
              placeholder="e.g. 505 Fashion Boulevard, Suite C, East Side"
              value={editBranchLocation}
              onChange={(e) => setEditBranchLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Branch Contact Phone</label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={editBranchPhone}
              onChange={(e) => setEditBranchPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditBranchModalOpen(false)}
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
