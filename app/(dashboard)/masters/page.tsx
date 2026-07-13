"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCRUD, useBase64Image } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { formatDate } from "../../../firebase/helpers";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Check,
  X,
  Scissors,
  Gift,
  Package,
  GraduationCap,
  Award,
  Ticket,
  UserCheck,
  Tag,
  Bookmark,
  Receipt,
  Percent,
  Network
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { toast } from "react-hot-toast";

// Schema definitions
const genericSchema = zod.object({
  name: zod.string().min(1, "Name/Identifier is required"),
  description: zod.string().optional(),
});

type TabKey = 
  | "services" 
  | "packages" 
  | "products" 
  | "courses" 
  | "memberships" 
  | "coupons" 
  | "employees" 
  | "categories" 
  | "brands" 
  | "expense-categories" 
  | "taxes" 
  | "departments";

function MastersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") || "services") as TabKey;

  // Tabs metadata
  const tabsList = [
    { key: "services", label: "Services", icon: Scissors, colName: "services" },
    { key: "packages", label: "Packages", icon: Gift, colName: "packages" },
    { key: "products", label: "Products", icon: Package, colName: "products" },
    { key: "courses", label: "Courses", icon: GraduationCap, colName: "courses" },
    { key: "memberships", label: "Memberships", icon: Award, colName: "memberships" },
    { key: "coupons", label: "Coupons", icon: Ticket, colName: "coupons" },
    { key: "employees", label: "Employees", icon: UserCheck, colName: "employees" },
    { key: "categories", label: "Categories", icon: Tag, colName: "categories" },
    { key: "brands", label: "Brands", icon: Bookmark, colName: "brands" },
    { key: "expense-categories", label: "Expense Categories", icon: Receipt, colName: "expenseCategories" },
    { key: "taxes", label: "Taxes", icon: Percent, colName: "taxes" },
    { key: "departments", label: "Departments", icon: Network, colName: "departments" },
  ];

  const currentTabInfo = tabsList.find(t => t.key === activeTab) || tabsList[0];
  
  // CRUD Data hooks
  const { data, loading, add, update, remove } = useCRUD(currentTabInfo.colName);
  
  // Selector reference data
  const { data: allCategories } = useCRUD("categories");
  const { data: allTaxes } = useCRUD("taxes");
  const { data: allDepartments } = useCRUD("departments");
  const { data: allServices } = useCRUD("services");
  
  // Image hook
  const { base64, setBase64, handleImageUpload, clear: clearImage } = useBase64Image();

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form custom local input states
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(0);
  const [barcode, setBarcode] = useState<string>("");
  const [validityDays, setValidityDays] = useState<number>(365);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"Percentage" | "Flat">("Percentage");
  const [minBillAmount, setMinBillAmount] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [commissionPercent, setCommissionPercent] = useState<number>(0);
  const [department, setDepartment] = useState<string>("");
  const [rate, setRate] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [membershipCredit, setMembershipCredit] = useState<number>(0);
  const [specialDiscountEnable, setSpecialDiscountEnable] = useState<boolean>(false);

  // Set active tab
  const handleTabChange = (key: string) => {
    router.push(`/masters?tab=${key}`);
    setEditingItem(null);
    clearImage();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(genericSchema),
  });

  // Load editing item values
  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name || editingItem.code || "",
        description: editingItem.description || "",
      });
      setBase64(editingItem.image || null);
      
      // Load custom fields
      setPrice(editingItem.price || 0);
      setDuration(editingItem.duration || "");
      setCategory(editingItem.category || "");
      setTax(editingItem.tax || "");
      setStock(editingItem.stock || 0);
      setLowStockAlert(editingItem.lowStockAlert || 0);
      setBarcode(editingItem.barcode || "");
      setValidityDays(editingItem.validityDays || 365);
      setDiscountPercent(editingItem.discountPercent || 0);
      setDiscountType(editingItem.discountType || "Percentage");
      setMinBillAmount(editingItem.minBillAmount || 0);
      setMaxDiscount(editingItem.maxDiscount || 0);
      setPhone(editingItem.phone || "");
      setRole(editingItem.role || "");
      setCommissionPercent(editingItem.commissionPercent || 0);
      setDepartment(editingItem.department || "");
      setRate(editingItem.rate || 0);
      setSelectedServices(editingItem.services || []);
      setMembershipCredit(editingItem.membershipCredit || 0);
      setSpecialDiscountEnable(editingItem.specialDiscountEnable || false);
    } else {
      reset({ name: "", description: "" });
      clearImage();
      
      // Reset custom fields
      setPrice(0);
      setDuration("");
      setCategory("");
      setTax("");
      setStock(0);
      setLowStockAlert(0);
      setBarcode("");
      setValidityDays(365);
      setDiscountPercent(0);
      setDiscountType("Percentage");
      setMinBillAmount(0);
      setMaxDiscount(0);
      setPhone("");
      setRole("");
      setCommissionPercent(0);
      setDepartment("");
      setRate(0);
      setSelectedServices([]);
      setMembershipCredit(0);
      setSpecialDiscountEnable(false);
    }
  }, [editingItem, reset, setBase64, clearImage]);

  // Form Submitter
  const onSubmit = async (formData: any) => {
    const payload: any = {
      ...formData,
      status: editingItem ? editingItem.status : true,
      image: base64,
    };

    // Construct correct custom payload keys per active tab configuration
    if (activeTab === "services") {
      payload.price = price;
      payload.category = category;
      payload.duration = duration;
      payload.tax = tax;
    } else if (activeTab === "packages") {
      payload.price = price;
      payload.services = selectedServices;
    } else if (activeTab === "products") {
      payload.price = price;
      payload.stock = stock;
      payload.lowStockAlert = lowStockAlert;
      payload.barcode = barcode;
    } else if (activeTab === "courses") {
      payload.price = price;
      payload.duration = duration;
    } else if (activeTab === "memberships") {
      payload.price = price;
      payload.duration = duration;
      payload.membershipCredit = membershipCredit;
      payload.discountPercent = discountPercent;
      payload.specialDiscountEnable = specialDiscountEnable;
    } else if (activeTab === "coupons") {
      payload.name = formData.name.toUpperCase();
      payload.discountType = discountType;
      payload.value = price; // Coupon flat value or percentage
      payload.minBillAmount = minBillAmount;
      payload.maxDiscount = maxDiscount;
    } else if (activeTab === "employees") {
      payload.phone = phone;
      payload.email = `${formData.name.toLowerCase().replace(/\s+/g, "")}@example.com`;
      payload.department = department;
      payload.role = role;
      payload.commissionPercent = commissionPercent;
    } else if (activeTab === "taxes") {
      payload.rate = rate;
    }

    try {
      if (editingItem) {
        await update(editingItem.id, payload);
      } else {
        await add(payload);
      }
      setModalOpen(false);
      setEditingItem(null);
      clearImage();
    } catch (e) {
      // toast shown in hooks
    }
  };

  // Toggle Item Status
  const toggleStatus = async (item: any) => {
    try {
      await update(item.id, { status: !item.status });
      toast.success(`Status updated for ${item.name || item.code}`);
    } catch (e) {}
  };

  // File picker handler
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  // Toggle package multi-service checkboxes
  const handleServiceCheckboxChange = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  // Dynamically push columns based on the selected master config tab
  const getTabColumns = () => {
    const list: any[] = [
      {
        accessorKey: "image",
        header: "Visual",
        cell: ({ row }: any) => {
          const img = row.getValue("image");
          return img ? (
            <img src={img} className="h-10 w-10 rounded-lg object-cover border border-slate-100" alt="Item" />
          ) : (
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
              <ImageIcon size={14} />
            </div>
          );
        }
      },
      {
        accessorKey: "name",
        header: "Name / Code",
        cell: ({ row }: any) => (
          <span className="font-bold text-slate-800">{row.getValue("name")}</span>
        )
      }
    ];

    if (activeTab === "services") {
      list.push(
        { accessorKey: "category", header: "Category" },
        { accessorKey: "price", header: "Service Price", cell: ({ row }: any) => <span>₹{row.getValue("price")}</span> },
        { accessorKey: "duration", header: "Duration" },
        { accessorKey: "tax", header: "Tax Bracket" }
      );
    } else if (activeTab === "packages") {
      list.push(
        { accessorKey: "price", header: "Package Price", cell: ({ row }: any) => <span>₹{row.getValue("price")}</span> },
        { accessorKey: "services", header: "Services count", cell: ({ row }: any) => <span>{(row.getValue("services") || []).length} items</span> }
      );
    } else if (activeTab === "products") {
      list.push(
        { accessorKey: "barcode", header: "UPC Barcode" },
        { accessorKey: "price", header: "Unit Price", cell: ({ row }: any) => <span>₹{row.getValue("price")}</span> },
        { accessorKey: "stock", header: "Stock count", cell: ({ row }: any) => <span className={`font-bold ${row.getValue("stock") <= row.original.lowStockAlert ? "text-danger animate-pulse" : "text-slate-700"}`}>{row.getValue("stock")} left</span> }
      );
    } else if (activeTab === "courses") {
      list.push(
        { accessorKey: "duration", header: "Course Duration" },
        { accessorKey: "price", header: "Tuition Fees", cell: ({ row }: any) => <span>₹{row.getValue("price")}</span> }
      );
    } else if (activeTab === "memberships") {
      list.push(
        { accessorKey: "duration", header: "DURATION" },
        { accessorKey: "price", header: "PRICE", cell: ({ row }: any) => <span>₹{row.getValue("price")}</span> },
        { accessorKey: "membershipCredit", header: "MEMBERSHIP CREDIT", cell: ({ row }: any) => <span>₹{row.getValue("membershipCredit") || 0}</span> },
        { accessorKey: "discountPercent", header: "DISCOUNT %", cell: ({ row }: any) => <span>{row.getValue("discountPercent")}%</span> },
        { accessorKey: "specialDiscountEnable", header: "SPECIAL DISCOUNT ENABLE", cell: ({ row }: any) => <span>{row.getValue("specialDiscountEnable") ? "Yes" : "No"}</span> }
      );
    } else if (activeTab === "coupons") {
      list.push(
        { accessorKey: "discountType", header: "Discount Type" },
        { accessorKey: "value", header: "Promo Discount Value", cell: ({ row }: any) => <span>{row.original.discountType === "Percentage" ? `${row.original.value}%` : `₹${row.original.value}`}</span> },
        { accessorKey: "minBillAmount", header: "Min Bill", cell: ({ row }: any) => <span>₹{row.getValue("minBillAmount")}</span> }
      );
    } else if (activeTab === "employees") {
      list.push(
        { accessorKey: "phone", header: "Phone Mobile" },
        { accessorKey: "role", header: "Role" },
        { accessorKey: "commissionPercent", header: "Commission %", cell: ({ row }: any) => <span>{row.getValue("commissionPercent")}%</span> },
        { accessorKey: "department", header: "Department" }
      );
    } else if (activeTab === "taxes") {
      list.push(
        { accessorKey: "rate", header: "Tax Rate %", cell: ({ row }: any) => <span>{row.getValue("rate")}%</span> }
      );
    }

    // Default trailing status and actions columns
    list.push(
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const item = row.original;
          return (
            <button
              onClick={() => toggleStatus(item)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold transition-colors ${
                item.status 
                  ? "bg-green-50 text-green-600 hover:bg-green-100/50" 
                  : "bg-red-50 text-danger hover:bg-red-100/50"
              }`}
            >
              {item.status ? "Active" : "Inactive"}
            </button>
          );
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
                  setEditingItem(item);
                  setModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-primary hover:bg-indigo-50/20 rounded-md transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this record?")) {
                    remove(item.id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-danger hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        }
      }
    );

    return list;
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Salon Masters Config</h1>
          <p className="text-xxs text-slate-400 mt-1">Configure service definitions, loyalty items, staff lists, and taxonomy structures.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            clearImage();
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
        >
          <Plus size={14} />
          Add Master Record
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start bg-white">
        
        {/* Left Tabs Menu */}
        <div className="lg:col-span-1 border border-slate-100 rounded-2xl p-4 bg-white flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none">
          {tabsList.map(tab => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
                  isSelected 
                    ? "bg-primary text-white" 
                    : "text-slate-600 hover:text-primary hover:bg-indigo-50/20"
                }`}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Data Table Area */}
        <div className="lg:col-span-3 bg-white space-y-4">
          <div className="flex justify-between items-center bg-white">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {currentTabInfo.label} Registry Listing ({data.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading master files...</div>
          ) : data.length > 0 ? (
            <Table columns={getTabColumns()} data={data} searchKey="name" searchPlaceholder={`Search ${currentTabInfo.label.toLowerCase()}...`} />
          ) : (
            <EmptyState 
              title={`No ${currentTabInfo.label} found`}
              description={`Add ${currentTabInfo.label.toLowerCase()} definitions to pop lists across appointments and quick billing screens.`}
              actionText={`Create New ${currentTabInfo.label.slice(0, -1)}`}
              onAction={() => setModalOpen(true)}
            />
          )}
        </div>

      </div>

      {/* Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit ${currentTabInfo.label.slice(0,-1)}` : `Create New ${currentTabInfo.label.slice(0,-1)}`}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          
          {/* File Image Uploader */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Cover Graphic</label>
            <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {base64 ? (
                <div className="relative">
                  <img src={base64} className="h-16 w-16 rounded-xl object-cover" alt="Preview" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  id="master-file-upload"
                />
                <label
                  htmlFor="master-file-upload"
                  className="inline-flex cursor-pointer items-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xxs font-bold transition-all shadow-xs"
                >
                  Upload Local Image
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Accepts PNG, JPG or WEBP. Converted to Base64 instantly.</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Name / Identifier *</label>
            <input
              type="text"
              placeholder={`Enter ${currentTabInfo.label.toLowerCase().slice(0, -1)} name`}
              {...register("name")}
              className={`w-full px-3.5 py-2 text-xs bg-white border ${
                errors.name ? "border-danger focus:border-danger" : "border-slate-200 focus:border-primary"
              } rounded-xl focus:outline-hidden text-slate-800 transition-colors`}
            />
            {errors.name && (
              <p className="text-xxs text-danger font-semibold">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Notes & Description</label>
            <textarea
              rows={2}
              placeholder="Provide general description details..."
              {...register("description")}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 transition-colors resize-none"
            />
          </div>

          {/* DYNAMIC ADDITIONAL FIELDS SECTION */}

          {/* 1. Services */}
          {activeTab === "services" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Service Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Service Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60 mins"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-850"
                >
                  <option value="">Select Category</option>
                  {allCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Tax Bracket *</label>
                <select
                  required
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-850"
                >
                  <option value="">Select Tax</option>
                  {allTaxes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 2. Packages */}
          {activeTab === "packages" && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Package Combo Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Select services in Package combo *</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  {allServices.map(srv => {
                    const isChecked = selectedServices.includes(srv.name);
                    return (
                      <label key={srv.id} className="flex items-center gap-2 text-xxs text-slate-650 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleServiceCheckboxChange(srv.name)}
                          className="rounded text-primary focus:ring-primary h-3 w-3"
                        />
                        <span>{srv.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. Products */}
          {activeTab === "products" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Retail Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">UPC Barcode *</label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Current Stock *</label>
                <input
                  type="number"
                  required
                  value={stock || ""}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Low Stock Alert *</label>
                <input
                  type="number"
                  required
                  value={lowStockAlert || ""}
                  onChange={(e) => setLowStockAlert(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
            </div>
          )}

          {/* 4. Courses */}
          {activeTab === "courses" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Tuition Fees (₹) *</label>
                <input
                  type="number"
                  required
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Course Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
            </div>
          )}

          {/* 5. Memberships */}
          {activeTab === "memberships" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Membership Credit (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={membershipCredit || ""}
                  onChange={(e) => setMembershipCredit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Discount (%) *</label>
                <input
                  type="number"
                  required
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="col-span-2 py-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="special-discount"
                  checked={specialDiscountEnable}
                  onChange={(e) => setSpecialDiscountEnable(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="special-discount" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable Special Discount?
                </label>
              </div>
            </div>
          )}

          {/* 6. Coupons */}
          {activeTab === "coupons" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-850"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Flat">Flat Discount</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Discount Value *</label>
                <input
                  type="number"
                  required
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Min Bill Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={minBillAmount || ""}
                  onChange={(e) => setMinBillAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Max Limit Cap (₹) *</label>
                <input
                  type="number"
                  required
                  value={maxDiscount || ""}
                  onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
            </div>
          )}

          {/* 7. Employees */}
          {activeTab === "employees" && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Roster Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Hair Stylist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Commission (%) *</label>
                <input
                  type="number"
                  required
                  value={commissionPercent || ""}
                  onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Department *</label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-850"
                >
                  <option value="">Select Department</option>
                  {allDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 11. Taxes */}
          {activeTab === "taxes" && (
            <div className="space-y-1 border-t border-slate-100 pt-4">
              <label className="text-xs font-semibold text-slate-700 block">Tax Rate (%) *</label>
              <input
                type="number"
                required
                value={rate || ""}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
          )}

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
              Save Record
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}

export default function MastersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Configuration...</div>}>
      <MastersContent />
    </Suspense>
  );
}
