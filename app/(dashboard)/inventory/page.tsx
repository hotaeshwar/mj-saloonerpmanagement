"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  Box, 
  AlertTriangle, 
  Barcode, 
  ShoppingCart, 
  Truck, 
  Plus, 
  Edit,
  Trash2,
  FileSpreadsheet 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

export default function InventoryPage() {
  const { data: products, update: updateProduct, remove: deleteProduct } = useCRUD("products");
  const { data: purchases, add: addPurchase } = useCRUD("purchases");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Purchase form states
  const [supplierName, setSupplierName] = useState("");
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseCost, setPurchaseCost] = useState(0);

  // Edit product states
  const [editName, setEditName] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editLowStockAlert, setEditLowStockAlert] = useState(5);

  const openEditModal = (item: any) => {
    setSelectedProduct(item);
    setEditName(item.name || "");
    setEditBarcode(item.barcode || "");
    setEditStock(item.stock || 0);
    setEditPrice(item.price || 0);
    setEditLowStockAlert(item.lowStockAlert || 5);
    setEditModalOpen(true);
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !editName.trim()) {
      toast.error("Please enter a valid product title.");
      return;
    }

    try {
      await updateProduct(selectedProduct.id, {
        name: editName.trim(),
        barcode: editBarcode.trim(),
        stock: Number(editStock) || 0,
        price: Number(editPrice) || 0,
        lowStockAlert: Number(editLowStockAlert) || 0,
      });
      setEditModalOpen(false);
    } catch (e) {}
  };

  const handleLogPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !supplierName || purchaseQty <= 0) {
      toast.error("Please provide valid supplier and quantity details.");
      return;
    }

    try {
      // Record transaction
      await addPurchase({
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        supplier: supplierName,
        quantity: purchaseQty,
        costPrice: purchaseCost,
        date: new Date().toISOString().split('T')[0]
      });

      // Update product inventory levels
      const currentStock = selectedProduct.stock || 0;
      await updateProduct(selectedProduct.id, {
        stock: currentStock + purchaseQty
      });

      setSupplierName("");
      setPurchaseQty(1);
      setPurchaseCost(0);
      setModalOpen(false);
      toast.success(`Inventory updated. Restocked ${purchaseQty} units of ${selectedProduct.name}.`);
    } catch (e) {}
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Product Title",
      cell: ({ row }: any) => <span className="font-bold text-slate-800">{row.getValue("name")}</span>
    },
    {
      accessorKey: "barcode",
      header: "UPC / Barcode",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
          <Barcode size={10} /> {row.getValue("barcode") || "No Barcode"}
        </span>
      )
    },
    {
      accessorKey: "stock",
      header: "Stock Level",
      cell: ({ row }: any) => {
        const item = row.original;
        const isLow = item.stock <= (item.lowStockAlert || 5);
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold ${isLow ? "text-danger" : "text-slate-800"}`}>
              {item.stock} Unit{item.stock !== 1 ? "s" : ""}
            </span>
            {isLow && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-danger animate-pulse">
                <AlertTriangle size={10} /> LOW STOCK
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "price",
      header: "Retail Price",
      cell: ({ row }: any) => <span>{formatCurrency(row.getValue("price"))}</span>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSelectedProduct(item);
                setModalOpen(true);
              }}
              title="Restock Inventory"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white hover:bg-primary-dark font-bold text-[10px] rounded-lg transition-colors shadow-xs"
            >
              <Plus size={10} /> Restock
            </button>
            <button
              onClick={() => openEditModal(item)}
              title="Edit Product Details"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Are you sure you want to remove "${item.name}" from products?`)) {
                  await deleteProduct(item.id);
                }
              }}
              title="Delete Product"
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
            <Box className="text-primary h-5 w-5" />
            Inventory Control Console
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Monitor product stocks, register vendor supply invoices, verify UPC barcodes, and check low-stock thresholds.</p>
        </div>
      </div>

      {/* Main Stock Table */}
      {products.length > 0 ? (
        <Table columns={columns} data={products} searchKey="name" searchPlaceholder="Search products stock..." />
      ) : (
        <EmptyState 
          title="No products logged"
          description="Create product records inside the Masters settings screen to manage stocks."
        />
      )}

      {/* Restock Purchase Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProduct ? `Log purchase item: ${selectedProduct.name}` : "Log Supplier Purchase"}
        size="md"
      >
        <form onSubmit={handleLogPurchase} className="space-y-4">
          <div className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Stock Level</span>
              <span className="font-bold text-slate-700">{selectedProduct?.stock} Units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Low Stock Trigger Limit</span>
              <span className="font-bold text-danger">{selectedProduct?.lowStockAlert || 5} Units</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Supplier Name / Vendor *</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                placeholder="e.g. Loreal Distributor Hub"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Purchase Quantity *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="10"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Total Invoice Cost (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Total sum paid"
                value={purchaseCost || ""}
                onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

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
              Log Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedProduct ? `Edit Product: ${selectedProduct.name}` : "Edit Product"}
        size="md"
      >
        <form onSubmit={handleEditProductSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Loreal Professional Shampoo"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">UPC / Barcode</label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="e.g. 8901234567890"
                value={editBarcode}
                onChange={(e) => setEditBarcode(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Current Stock</label>
              <input
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Retail Price (₹)</label>
              <input
                type="number"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Low Alert Level</label>
              <input
                type="number"
                min="0"
                value={editLowStockAlert}
                onChange={(e) => setEditLowStockAlert(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
