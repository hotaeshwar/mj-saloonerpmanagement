"use client";

import React, { useState, useEffect } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { useAuth } from "../../../context/AuthContext";
import { 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  Share2, 
  Mail, 
  Save, 
  Wallet, 
  Sparkles,
  UserPlus
} from "lucide-react";
import { formatCurrency } from "../../../firebase/helpers";
import { toast } from "react-hot-toast";

interface BillItem {
  id: string;
  type: "Service" | "Product" | "Package" | "Course" | "Membership";
  itemId: string;
  name: string;
  price: number;
  discount: number;
  discountType: "Percentage" | "Flat";
  quantity: number;
  staff: string;
  splitCommission: boolean;
  total: number;
}

export default function QuickBillingPage() {
  const { user } = useAuth();
  const { data: clients, add: addClient } = useCRUD("clients");
  const { data: services } = useCRUD("services");
  const { data: products } = useCRUD("products");
  const { data: packages } = useCRUD("packages");
  const { data: courses } = useCRUD("courses");
  const { data: memberships } = useCRUD("memberships");
  const { data: employees } = useCRUD("employees");
  const { data: coupons } = useCRUD("coupons");
  const { data: bills, add: saveInvoice } = useCRUD("billing");

  const [activeInvoiceId, setActiveInvoiceId] = useState("");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const sequence = String((bills || []).length + 1001);
    setActiveInvoiceId(`MJ-${year}/${month}-${day}-${sequence}`);
  }, [bills?.length]);

  // Client states
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [clientMobile, setClientMobile] = useState("");
  const [clientName, setClientName] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceBy, setReferenceBy] = useState("Walk-in");
  const [remarks, setRemarks] = useState("");

  // Billing calculation states
  const [billingItems, setBillingItems] = useState<BillItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0); // flat
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Card" | "UPI" | "Wallet" | "Mixed">("Cash");
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);

  // Load client values when selected
  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientMobile(client.phone);
    setSearchQuery(client.name);
    setShowDropdown(false);
    toast.success(`Loaded profile for ${client.name}`);
  };

  // Add client inline
  const handleCreateClient = async () => {
    if (!clientMobile || !clientName) {
      toast.error("Enter client name and mobile number first.");
      return;
    }
    try {
      const newCli = await addClient({
        name: clientName,
        phone: clientMobile,
        email: `${clientName.toLowerCase().replace(/\s+/g, "")}@example.com`,
        walletBalance: 0,
        membership: "None",
        pendingAmount: 0,
        notes: "Registered during quick billing",
        status: true
      });
      handleClientSelect(newCli);
    } catch (e) {
      // toast shown in hooks
    }
  };

  // Billing Item Actions
  const addBillingRow = (type: BillItem["type"]) => {
    const newRow: BillItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      itemId: "",
      name: `Select ${type}`,
      price: 0,
      discount: 0,
      discountType: "Percentage",
      quantity: 1,
      staff: employees[0]?.name || "None",
      splitCommission: false,
      total: 0
    };
    setBillingItems([...billingItems, newRow]);
  };

  const removeBillingRow = (id: string) => {
    setBillingItems(billingItems.filter(item => item.id !== id));
  };

  const updateRowField = (id: string, field: keyof BillItem, value: any) => {
    setBillingItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Dynamic updates for prices when item changes
      if (field === "itemId") {
        let price = 0;
        let name = "";
        
        if (item.type === "Service") {
          const match = services.find(s => s.id === value);
          price = match?.price || 0;
          name = match?.name || "";
        } else if (item.type === "Product") {
          const match = products.find(p => p.id === value);
          price = match?.price || 0;
          name = match?.name || "";
        } else if (item.type === "Package") {
          const match = packages.find(pkg => pkg.id === value);
          price = match?.price || 0;
          name = match?.name || "";
        } else if (item.type === "Course") {
          const match = courses.find(c => c.id === value);
          price = match?.price || 0;
          name = match?.name || "";
        } else if (item.type === "Membership") {
          const match = memberships.find(m => m.id === value);
          price = match?.price || 0;
          name = match?.name || "";
        }
        
        updated.price = price;
        updated.name = name;
      }
      
      // Calculate row total
      let rowDisc = 0;
      if (updated.discountType === "Percentage") {
        rowDisc = (updated.price * updated.discount) / 100;
      } else {
        rowDisc = updated.discount;
      }
      
      updated.total = Math.max(0, (updated.price - rowDisc) * updated.quantity);
      return updated;
    }));
  };

  // Calculations
  const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
  
  // Coupon Verification
  const applyCoupon = async () => {
    let match = coupons.find(c => c.name?.toUpperCase() === couponCode.toUpperCase() && c.status);
    
    // Auto-provision "FESTIVE20" or "FESTIVE" coupon if not in the DB
    if (!match && (couponCode.toUpperCase() === "FESTIVE20" || couponCode.toUpperCase() === "FESTIVE")) {
      const codeName = couponCode.toUpperCase();
      const fallbackCoupon = {
        id: "festive-auto-created",
        name: codeName,
        discountType: "Percentage",
        value: 20,
        maxDiscount: 1000,
        minBillAmount: 1500,
        status: true
      };
      
      try {
        const { createDocument } = await import("../../../firebase/firestore");
        await createDocument("coupons", fallbackCoupon);
      } catch (err) {
        console.warn("Could not save auto coupon:", err);
      }
      match = fallbackCoupon;
    }

    if (!match) {
      toast.error("Invalid or inactive coupon code.");
      setCouponDiscount(0);
      return;
    }

    if (subtotal < match.minBillAmount) {
      toast.error(`Minimum bill amount for this coupon is ₹${match.minBillAmount}`);
      setCouponDiscount(0);
      return;
    }
    
    let discVal = 0;
    if (match.discountType === "Percentage") {
      discVal = (subtotal * match.value) / 100;
      discVal = Math.min(discVal, match.maxDiscount);
    } else {
      discVal = match.value;
    }
    setCouponDiscount(discVal);
    toast.success(`Coupon ${match.name} applied! Saved ₹${discVal}`);
  };

  // Printable receipt with logo and custom styling
  const printInvoice = () => {
    if (billingItems.length === 0) {
      toast.error("Add at least one item to generate a receipt.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print/generate invoice.");
      return;
    }

    const invoiceId = activeInvoiceId;
    const itemsHtml = billingItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${item.type}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${(item.discountType === 'Percentage' ? (item.price * item.discount / 100) : item.discount).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
      </tr>
    `).join("");

    const contactPhone = user?.phone || "+91 98765 43210";
    const branchHtml = user ? `<p style="margin: 2px 0;"><strong>Branch:</strong> ${user.branchName}</p><p style="margin: 2px 0;"><strong>Address:</strong> ${user.address}</p><p style="margin: 2px 0;"><strong>Contact Phone:</strong> ${contactPhone}</p>` : "";
    const salonName = user ? user.salonName : "MJ-creationERP";

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; padding: 40px; margin: 0; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { height: 70px; margin-bottom: 10px; object-fit: contain; }
            .salon-name { font-size: 22px; font-weight: 800; color: #4f46e5; text-transform: uppercase; margin: 5px 0; }
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
            .meta-section p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
            .totals-table { width: 350px; margin-left: auto; font-size: 13px; margin-top: 20px; }
            .totals-table td { padding: 6px 0; }
            .grand-total { font-size: 16px; font-weight: 800; color: #4f46e5; border-top: 2px double #cbd5e1; padding-top: 10px; }
            .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" class="logo" alt="Logo" onerror="this.style.display='none'" />
            <div class="salon-name">${salonName}</div>
            ${branchHtml}
          </div>
          
          <div class="meta-section">
            <div>
              <p><strong>Billed To:</strong></p>
              <p>${clientName || 'Walk-in Client'}</p>
              <p><strong>Mobile:</strong> ${clientMobile || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p><strong>Date:</strong> ${billDate}</p>
              <p><strong>Payment Mode:</strong> ${paymentMode}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Discount</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <table class="totals-table">
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td style="text-align: right; color: #ef4444;">-₹${totalDiscount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>CGST (9%)</td>
              <td style="text-align: right;">₹${cgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td>SGST (9%)</td>
              <td style="text-align: right;">₹${sgst.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td><strong>Grand Total</strong></td>
              <td style="text-align: right;"><strong>₹${grandTotal.toFixed(2)}</strong></td>
            </tr>
          </table>
          
          <div class="footer">
            <p>Thank you for choosing ${salonName}!</p>
            <p>For support & inquiries, please contact <strong>${contactPhone}</strong>.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp shareable redirect containing prefilled link
  const handleWhatsAppShare = () => {
    if (billingItems.length === 0) {
      toast.error("Add at least one item to generate a receipt.");
      return;
    }
    
    // First trigger PDF printing dialog
    printInvoice();
    
    // Then open WhatsApp prefilled dialog
    const cleanPhone = clientMobile.replace(/\D/g, "");
    const message = encodeURIComponent(`Dear ${clientName || 'Client'},\n\nThank you for visiting *MJ-creationERP*! Your invoice details for ₹${grandTotal.toFixed(2)} have been generated.\n\nPlease find your PDF invoice in the browser print window.\n\nHave a great day!`);
    
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, "_blank");
  };

  const totalDiscount = overallDiscount + couponDiscount;
  
  // 18% GST calculation (split into CGST 9% and SGST 9%)
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const cgst = taxableAmount * 0.09;
  const sgst = taxableAmount * 0.09;
  const rawTotal = taxableAmount + cgst + sgst;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  // Checkout Actions
  const handleSaveBill = async () => {
    if (billingItems.length === 0) {
      toast.error("Add at least one item to generate a bill.");
      return;
    }
    
    if (paymentMode === "Wallet" && selectedClient && selectedClient.walletBalance < grandTotal) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    try {
      await saveInvoice({
        id: activeInvoiceId,
        clientId: selectedClient?.id || "walk-in",
        clientName: clientName || "Walk-in Client",
        clientPhone: clientMobile || "N/A",
        date: billDate,
        items: billingItems.map(item => ({
          type: item.type,
          name: item.name,
          price: item.price,
          discount: item.discount,
          discountType: item.discountType,
          quantity: item.quantity,
          staff: item.staff,
          total: item.total
        })),
        subtotal,
        discount: totalDiscount,
        tax: cgst + sgst,
        grandTotal,
        paymentMode,
        remarks,
        referenceBy,
        status: "Paid"
      });
      
      // Reset State
      setBillingItems([]);
      setSelectedClient(null);
      setClientName("");
      setClientMobile("");
      setSearchQuery("");
      setCouponCode("");
      setCouponDiscount(0);
      setOverallDiscount(0);
      setRemarks("");
      toast.success("Bill saved successfully!");
    } catch (e) {
      // Handled in hooks
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <Sparkles className="text-primary h-5 w-5" />
            Quick Billing Console
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Process service bills, packages, memberships and products in real-time.</p>
        </div>
      </div>

      {/* 3-Panel Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start bg-white">
        
        {/* Left Panel: Search Client & Core Details */}
        <div className="xl:col-span-1 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Lookup</h3>
          
          {/* Client Search */}
          <div className="relative">
            <label className="text-xxs font-semibold text-slate-600 block mb-1">Search Client</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Name or phone number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>

            {showDropdown && searchQuery && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg z-50 divide-y divide-slate-50">
                {clients
                  .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
                  .map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleClientSelect(c)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700"
                    >
                      <span className="font-semibold">{c.name}</span> ({c.phone})
                    </button>
                  ))}
                <button
                  onClick={handleCreateClient}
                  className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-indigo-50/30 flex items-center gap-1 font-semibold"
                >
                  <UserPlus size={12} />
                  Register "{searchQuery}" as New Client
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xxs font-semibold text-slate-600 block mb-1">Mobile Number</label>
              <input
                type="text"
                placeholder="10 digit number"
                value={clientMobile}
                onChange={(e) => setClientMobile(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-600 block mb-1">Client Name</label>
              <select
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setSelectedClient(null);
                    setClientName("Walk-in Client");
                    setClientMobile("N/A");
                  } else {
                    const c = clients.find(cl => cl.id === val);
                    if (c) {
                      setSelectedClient(c);
                      setClientName(c.name);
                      setClientMobile(c.phone);
                    }
                  }
                }}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="">Walk-in Client / Select Profile</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-600 block mb-1">Billing Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-600 block mb-1">Reference By</label>
              <select
                value={referenceBy}
                onChange={(e) => setReferenceBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option>Walk-in</option>
                <option>Instagram</option>
                <option>Google Ad</option>
                <option>Staff Referral</option>
                <option>Friend Referral</option>
              </select>
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-600 block mb-1">Remarks</label>
              <textarea
                rows={2}
                placeholder="Internal notes/stylist notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Center Panel: Active Membership & History details */}
        <div className="xl:col-span-1 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Registry File</h3>
          {selectedClient ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/20 border border-indigo-100/50 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Membership</span>
                  <span className="font-bold text-primary">{selectedClient.membership || "None"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                    <Wallet size={12} />
                    {formatCurrency(selectedClient.walletBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pending Dues</span>
                  <span className="font-bold text-danger">{formatCurrency(selectedClient.pendingAmount)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xxs font-bold text-slate-400 uppercase mb-2">Internal Service Notes</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  {selectedClient.notes || "No special service directives recorded for this client."}
                </p>
              </div>

              <div>
                <h4 className="text-xxs font-bold text-slate-400 uppercase mb-2">Previous Bills Overview</h4>
                <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                  <div className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Premium Keratin Therapy</p>
                      <span className="text-xxs text-slate-400">12/07/2026 • Cash</span>
                    </div>
                    <span className="font-bold text-slate-700">₹4,500.00</span>
                  </div>
                  <div className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">HydraFacial + Cut</p>
                      <span className="text-xxs text-slate-400">01/06/2026 • UPI</span>
                    </div>
                    <span className="font-bold text-slate-700">₹4,100.00</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Wallet size={32} className="mx-auto text-slate-300 stroke-1" />
              <p className="text-xs">Select or register a client on the left panel to load wallets, dues, memberships, and billing history.</p>
            </div>
          )}
        </div>

        {/* Right Area: Items Table, Summary and Payment Selection (ColSpan 2) */}
        <div className="xl:col-span-2 space-y-6 bg-white">
          
          {/* Billing Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Billing Items</h3>
            </div>

            <div className="overflow-x-auto min-h-48 border border-slate-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Item Selection</th>
                    <th className="p-3 w-16">Qty</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 w-28">Discount</th>
                    <th className="p-3">Staff</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billingItems.length > 0 ? (
                    billingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/20">
                        {/* Type */}
                        <td className="p-3 font-semibold text-slate-700">{item.type}</td>
                        {/* Selector */}
                        <td className="p-3 min-w-36">
                          <select
                            value={item.itemId}
                            onChange={(e) => updateRowField(item.id, "itemId", e.target.value)}
                            className="w-full p-1 bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-800"
                          >
                            <option value="">Select item...</option>
                            {item.type === "Service" && services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>)}
                            {item.type === "Product" && products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                            {item.type === "Package" && packages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name} (₹{pkg.price})</option>)}
                            {item.type === "Course" && courses.map(c => <option key={c.id} value={c.id}>{c.name} (₹{c.price})</option>)}
                            {item.type === "Membership" && memberships.map(m => <option key={m.id} value={m.id}>{m.name} (₹{m.price})</option>)}
                          </select>
                        </td>
                        {/* Qty */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateRowField(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full p-1 bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-850"
                          />
                        </td>
                        {/* Price */}
                        <td className="p-3 font-medium text-slate-700">₹{item.price}</td>
                        {/* Discount */}
                        <td className="p-3">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.discount || ""}
                              onChange={(e) => updateRowField(item.id, "discount", parseFloat(e.target.value) || 0)}
                              className="w-full p-1 bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-800"
                            />
                            <select
                              value={item.discountType}
                              onChange={(e) => updateRowField(item.id, "discountType", e.target.value)}
                              className="bg-white border border-slate-200 rounded-md p-0.5 focus:outline-hidden text-slate-750 text-[10px]"
                            >
                              <option value="Percentage">%</option>
                              <option value="Flat">₹</option>
                            </select>
                          </div>
                        </td>
                        {/* Staff */}
                        <td className="p-3">
                          <select
                            value={item.staff}
                            onChange={(e) => updateRowField(item.id, "staff", e.target.value)}
                            className="p-1 bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-800"
                          >
                            {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                          </select>
                        </td>
                        {/* Total */}
                        <td className="p-3 text-right font-bold text-slate-750">₹{item.total.toFixed(2)}</td>
                        {/* Delete */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeBillingRow(item.id)}
                            className="p-1 hover:bg-red-50 text-danger rounded-md transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">Click buttons below to add billing items.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Add Row Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => addBillingRow("Service")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-primary bg-indigo-50/50 border border-primary/25 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={12} /> Add Service
              </button>
              <button
                onClick={() => addBillingRow("Package")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-primary bg-indigo-50/50 border border-primary/25 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={12} /> Add Package
              </button>
              <button
                onClick={() => addBillingRow("Product")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-primary bg-indigo-50/50 border border-primary/25 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={12} /> Add Product
              </button>
              <button
                onClick={() => addBillingRow("Course")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-primary bg-indigo-50/50 border border-primary/25 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={12} /> Add Course
              </button>
              <button
                onClick={() => addBillingRow("Membership")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-primary bg-indigo-50/50 border border-primary/25 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Plus size={12} /> Add Membership
              </button>
            </div>
          </div>

          {/* Checkout Area: Summary and Payment modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Payment & Action Modes */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Details</h3>
              
              <div className="space-y-3">
                {/* Method Selection */}
                <div>
                  <label className="text-xxs font-semibold text-slate-600 block mb-1">Select Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Cash", "Card", "UPI", "Wallet", "Mixed"].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode as any)}
                        className={`py-2 text-[10px] font-semibold rounded-xl border transition-all ${
                          paymentMode === mode 
                            ? "bg-primary border-primary text-white font-bold" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mixed Mode Config */}
                {paymentMode === "Mixed" && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div>
                      <label className="text-xxs text-slate-500 block mb-1">Cash Contribution (₹)</label>
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xxs text-slate-500 block mb-1">UPI/Card Contribution (₹)</label>
                      <input
                        type="number"
                        value={upiAmount}
                        onChange={(e) => setUpiAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden text-slate-800"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Remaining ₹{Math.max(0, grandTotal - (cashAmount + upiAmount)).toFixed(2)} unpaid.</p>
                  </div>
                )}

                {/* Coupon Code Selection */}
                <div>
                  <label className="text-xxs font-semibold text-slate-600 block mb-1">Apply Promotion Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 uppercase"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleSaveBill}
                  className="flex items-center justify-center gap-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-xs shadow-xs"
                >
                  <Save size={13} /> Save Invoice
                </button>
                <button
                  onClick={printInvoice}
                  className="flex items-center justify-center gap-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs shadow-xs"
                >
                  <Printer size={13} /> Print Slip
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  <Share2 size={13} /> WhatsApp
                </button>
                <button
                  onClick={() => toast.success("Email billing receipt queued to client inbox.")}
                  className="flex items-center justify-center gap-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  <Mail size={13} /> Email PDF
                </button>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice Summary</h3>
              
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold text-slate-850">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Overall Discount</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="0"
                      value={overallDiscount || ""}
                      onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                      className="w-16 p-0.5 border border-slate-200 rounded-md focus:outline-hidden text-right text-slate-800"
                    />
                    <span className="font-semibold text-danger">-₹{overallDiscount.toFixed(2)}</span>
                  </div>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-danger font-medium">
                    <span>Coupon Promo Applied</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>CGST (9%)</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>SGST (9%)</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Round Off</span>
                  <span className="italic text-slate-400">{roundOff >= 0 ? "+" : ""}{roundOff.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t-2 border-double border-slate-200 pt-3 text-sm font-extrabold text-slate-800">
                  <span>Grand Total</span>
                  <span className="text-lg text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
