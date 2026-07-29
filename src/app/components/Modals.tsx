import React, { useState, useEffect } from 'react';
import { X, Check, Database, AlertCircle, Plus, RefreshCw, Key, Globe, Package, DollarSign, User, Building2, Truck, TrendingUp, ArrowDownLeft, Download, Upload, Share2, Cloud, CloudOff, Copy, HardDrive } from 'lucide-react';
import { useStockFlow, Product, Invoice, PurchaseOrder, Vendor, Customer } from '../context/StockFlowContext';

// Helper modal wrapper
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// 1. SUPABASE CONFIG MODAL
export function SupabaseConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isSupabaseConnected, supabaseUrl, supabaseKey, connectSupabaseCredentials, disconnectSupabase, isLoading, lastError, syncStatus } = useStockFlow();
  const [urlInput, setUrlInput] = useState(supabaseUrl);
  const [keyInput, setKeyInput] = useState(supabaseKey);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await connectSupabaseCredentials(urlInput, keyInput);
    if (ok) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Connect Supabase Database">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white mb-1">Real Supabase Integration</p>
            Connect your Supabase project URL and Anon API Key below. All inventory, sales, purchasing, and CRM data will sync directly to your real PostgreSQL tables.
          </div>
        </div>

        {lastError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">{lastError}</p>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Supabase Project URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                required
                placeholder="https://your-project.supabase.co"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Supabase Anon Key</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Database Setup SQL</span>
              <span className="text-[10px] text-slate-400">File: supabase_schema.sql</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Run <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-800 dark:text-slate-200">supabase_schema.sql</code> in your Supabase SQL Editor to create tables & initial seed data.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSupabaseConnected ? (
              <button
                type="button"
                onClick={disconnectSupabase}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 text-xs font-semibold"
              >
                Disconnect DB
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isSupabaseConnected ? 'Update Credentials' : 'Connect Supabase'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// 2. ADD PRODUCT MODAL
export function AddProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProduct, categories, addCategory } = useStockFlow();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [cat, setCat] = useState(categories[0] || 'Electronics');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [qty, setQty] = useState(25);
  const [min, setMin] = useState(10);
  const [price, setPrice] = useState(99.99);
  const [wh, setWh] = useState('');

  const handleCreateCategory = () => {
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setCat(newCatInput.trim());
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct({
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      name,
      cat,
      qty: Number(qty),
      min: Number(min),
      price: Number(price),
      wh: wh.trim() || 'Main Warehouse',
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Inventory Product">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Code</label>
            <input
              type="text"
              placeholder="e.g. ELC-MON-4K"
              value={sku}
              onChange={e => setSku(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Category</label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {showNewCatInput ? 'Select existing' : 'Create new category'}
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Enter new category..."
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-2.5 py-2 bg-[#2563EB] text-white rounded-lg font-bold text-xs shrink-0"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g. UltraWide Curved 34' Display"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Qty</label>
            <input
              type="number"
              min="0"
              required
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reorder Point (Min)</label>
            <input
              type="number"
              min="1"
              required
              value={min}
              onChange={e => setMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price in pkr</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warehouse Location</label>
          <input
            type="text"
            required
            placeholder="Enter warehouse location (e.g. Main Warehouse, Rack A-1, Lahore Hub)"
            value={wh}
            onChange={e => setWh(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Save Product</button>
        </div>
      </form>
    </Modal>
  );
}

// 3. EDIT PRODUCT & ADJUST STOCK MODAL
export function EditProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { updateProduct, adjustStock, deleteProduct, categories, addCategory } = useStockFlow();
  if (!product) return null;

  const [qty, setQty] = useState(product.qty);
  const [price, setPrice] = useState(product.price);
  const [min, setMin] = useState(product.min);
  const [name, setName] = useState(product.name);
  const [cat, setCat] = useState(product.cat);
  const [wh, setWh] = useState(product.wh || 'Main Warehouse');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const handleCreateCategory = () => {
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setCat(newCatInput.trim());
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProduct(product.id, {
      name,
      cat,
      wh,
      price: Number(price),
      min: Number(min),
    });
    if (qty !== product.qty) {
      await adjustStock(product.id, Number(qty));
    }
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      await deleteProduct(product.id);
      onClose();
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={`Edit ${product.name}`}>
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{product.name}</p>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Category</label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {showNewCatInput ? 'Select' : 'New category'}
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New category..."
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-2.5 py-2 bg-[#2563EB] text-white rounded-lg font-bold text-xs shrink-0"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warehouse Location</label>
            <input
              type="text"
              required
              placeholder="Enter location..."
              value={wh}
              onChange={e => setWh(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Stock Qty</label>
            <input
              type="number"
              value={qty}
              min="0"
              onChange={e => setQty(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reorder Point (Min)</label>
            <input
              type="number"
              value={min}
              min="1"
              onChange={e => setMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price in pkr</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={handleDelete} className="px-3 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/40">
            Delete Item
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Update Product</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// 4. NEW INVOICE MODAL
export function AddInvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addInvoice, customers } = useStockFlow();
  const [customer, setCustomer] = useState('');
  const [isCustomCustomer, setIsCustomCustomer] = useState(false);
  const [customCustomer, setCustomCustomer] = useState('');
  const [amount, setAmount] = useState(2500);
  const [items, setItems] = useState(5);
  const [dueDays, setDueDays] = useState(30);

  // Default customer selection from CRM
  React.useEffect(() => {
    if (customers.length > 0 && !customer) {
      setCustomer(customers[0].name);
    }
  }, [customers, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCustomer = isCustomCustomer ? customCustomer.trim() : customer;
    if (!finalCustomer) return;

    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dueObj = new Date();
    dueObj.setDate(dueObj.getDate() + Number(dueDays));
    const dueStr = dueObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await addInvoice({
      customer: finalCustomer,
      date: dateStr,
      due: dueStr,
      amount: Number(amount),
      items: Number(items),
      status: 'pending',
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Sales Invoice">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300">Customer (Select from CRM)</label>
            <button
              type="button"
              onClick={() => setIsCustomCustomer(!isCustomCustomer)}
              className="text-[11px] text-[#2563EB] hover:underline font-semibold"
            >
              {isCustomCustomer ? 'Select saved customer' : '+ Custom customer name'}
            </button>
          </div>

          {isCustomCustomer ? (
            <input
              type="text"
              required
              placeholder="Enter customer name..."
              value={customCustomer}
              onChange={e => setCustomCustomer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          ) : (
            <select
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {customers.length === 0 ? (
                <option value="">No customers found in CRM</option>
              ) : (
                customers.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.city ? `(${c.city})` : c.company ? `(${c.company})` : ''} — Balance: PKR {(c.balance || 0).toLocaleString()}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Amount (PKR)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Line Items</label>
            <input
              type="number"
              min="1"
              required
              value={items}
              onChange={e => setItems(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
            <select
              value={dueDays}
              onChange={e => setDueDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="15">Net 15 Days</option>
              <option value="30">Net 30 Days</option>
              <option value="60">Net 60 Days</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Issue Invoice</button>
        </div>
      </form>
    </Modal>
  );
}

// 5. NEW PURCHASE ORDER MODAL
export function AddPOModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addPurchaseOrder, vendors } = useStockFlow();
  const [vendor, setVendor] = useState(vendors[0]?.name || 'TechSource Global');
  const [amount, setAmount] = useState(15000);
  const [items, setItems] = useState(8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const expObj = new Date();
    expObj.setDate(expObj.getDate() + 10);
    const expStr = expObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await addPurchaseOrder({
      vendor,
      date: dateStr,
      expected: expStr,
      amount: Number(amount),
      items: Number(items),
      status: 'approved',
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Purchase Order">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor / Supplier</label>
          <select
            value={vendor}
            onChange={e => setVendor(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">PO Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Line Items Count</label>
            <input
              type="number"
              min="1"
              required
              value={items}
              onChange={e => setItems(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Issue PO</button>
        </div>
      </form>
    </Modal>
  );
}

// 6. ADD VENDOR MODAL
export function AddVendorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addVendor } = useStockFlow();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [paymentsSlot, setPaymentsSlot] = useState('Bank Transfer (HBL / IBAN)');
  const [terms, setTerms] = useState('Net 30');

  useEffect(() => {
    if (open) {
      setName('');
      setContact('');
      setPaymentsSlot('Bank Transfer (HBL / IBAN)');
      setTerms('Net 30');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVendor({
      name,
      contact,
      paymentsSlot,
      paymentMethod: paymentsSlot,
      orders: 0,
      spend: 0,
      status: 'active',
      terms,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Register New Vendor">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor Company Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Apex Global Components"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
            <input
              type="text"
              required
              placeholder="e.g. David Lin"
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payments / Account Slot</label>
            <input
              type="text"
              required
              placeholder="e.g. Bank Transfer (HBL / IBAN), Cash, Cheque"
              value={paymentsSlot}
              onChange={e => setPaymentsSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
          <select
            value={terms}
            onChange={e => setTerms(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option>Net 15</option>
            <option>Net 30</option>
            <option>Net 45</option>
            <option>Net 60</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Register Vendor</button>
        </div>
      </form>
    </Modal>
  );
}

// 7. ADD CUSTOMER MODAL
export function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { customers, addCustomer } = useStockFlow();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [product, setProduct] = useState('');
  const [credit, setCredit] = useState<number | string>('');
  const [debit, setDebit] = useState<number | string>('');
  const [status, setStatus] = useState('active');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form fields cleanly every time modal is opened
  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setCity('');
      setProduct('');
      setCredit('');
      setDebit('');
      setStatus('active');
      setErrorMsg('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    // Security Check: Verify customer does not already exist
    const isDuplicate = customers.some(c => 
      c.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
      (trimmedPhone && c.phone && c.phone.trim() === trimmedPhone)
    );

    if (isDuplicate) {
      setErrorMsg(`Security Alert: Customer "${trimmedName}" already exists in CRM! Duplicate customer addition blocked.`);
      return;
    }

    const cr = Number(credit) || 0;
    const dr = Number(debit) || 0;
    await addCustomer({
      name: trimmedName,
      phone: trimmedPhone,
      city: city.trim(),
      product: product.trim(),
      credit: cr,
      debit: dr,
      balance: dr - cr,
      status,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Customer Ledger">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-200">
            <span className="font-bold text-xs">⚠️ {errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={e => { setName(e.target.value); setErrorMsg(''); }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +92 300 1234567"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrorMsg(''); }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
            <input
              type="text"
              required
              placeholder="e.g. Lahore, Karachi, Islamabad"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product / Item Purchased</label>
            <input
              type="text"
              placeholder="e.g. ProVision 4K Monitor"
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Debit (Amount Billed)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={debit}
              onChange={e => setDebit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Credit (Amount Paid)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={credit}
              onChange={e => setCredit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-400">Calculated Net Balance:</span>
          <span className={`font-mono font-bold text-sm ${(Number(debit || 0) - Number(credit || 0)) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            PKR {(Number(debit || 0) - Number(credit || 0)).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">Add Customer Ledger</button>
        </div>
      </form>
    </Modal>
  );
}

// 8. PROFESSIONAL POS RECEIPT MODAL
export function POSReceiptModal({
  open,
  onClose,
  receiptData,
}: {
  open: boolean;
  onClose: () => void;
  receiptData: {
    transactionId: string;
    customer: string;
    date: string;
    items: Array<{ id: string; name: string; price: number; qty: number }>;
    subtotal: number;
    tax: number;
    taxRate: number;
    taxEnabled: boolean;
    total: number;
    paymentMethod: string;
  } | null;
}) {
  if (!open || !receiptData) return null;

  const handlePrintReceipt = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const itemRowsHtml = receiptData.items.map(item => `
      <tr>
        <td style="padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 600;">${item.name}</td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #cbd5e1; text-align: center;">${item.qty}</td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #cbd5e1; text-align: right; font-family: monospace;">PKR ${item.price.toLocaleString()}</td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">PKR ${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Receipt - ${receiptData.transactionId}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 320px; margin: 0 auto; padding: 16px; color: #000; background: #fff; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 11px; margin-bottom: 8px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
            table { width: 100%; font-size: 11px; border-collapse: collapse; margin: 8px 0; }
            th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; font-size: 10px; }
            .totals-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px; }
            .grand-total { font-size: 15px; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 2px solid #000; }
            .footer { font-size: 10px; text-align: center; margin-top: 16px; color: #444; }
            @media print { body { width: 100%; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="title">StockFlow ERP</div>
            <div class="subtitle">Official POS Retail Receipt</div>
            <div style="font-size: 10px;">Main Blvd, DHA, Lahore · Tel: +92 300 1234567</div>
          </div>

          <div class="divider"></div>

          <div class="meta-row"><span>Receipt #:</span><strong>${receiptData.transactionId}</strong></div>
          <div class="meta-row"><span>Date:</span><span>${receiptData.date}</span></div>
          <div class="meta-row"><span>Customer:</span><span>${receiptData.customer}</span></div>
          <div class="meta-row"><span>Payment Mode:</span><span>${receiptData.paymentMethod}</span></div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals-row"><span>Subtotal:</span><span>PKR ${receiptData.subtotal.toLocaleString()}</span></div>
          <div class="totals-row"><span>Tax (${receiptData.taxEnabled ? `${receiptData.taxRate}%` : 'Disabled'}):</span><span>PKR ${receiptData.tax.toLocaleString()}</span></div>
          <div class="totals-row grand-total"><span>TOTAL PAID:</span><span>PKR ${receiptData.total.toLocaleString()}</span></div>

          <div class="divider"></div>

          <div class="footer">
            <p style="font-weight: bold; margin-bottom: 2px;">Thank you for your business!</p>
            <p style="margin: 0;">Powered by StockFlow ERP Enterprise Platform</p>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <Modal open={open} onClose={onClose} title="POS Transaction Receipt">
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ✓
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Transaction Completed</h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Inventory updated & payment recorded successfully.</p>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 space-y-3">
          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">StockFlow ERP Store</h3>
            <p className="text-[10px] text-slate-500 font-sans">Official Retail POS Terminal · Tax Invoice</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 dark:border-slate-700 pb-3">
            <div><span className="text-slate-400 block text-[9px]">RECEIPT #</span><span className="font-bold text-[#2563EB]">{receiptData.transactionId}</span></div>
            <div><span className="text-slate-400 block text-[9px]">DATE & TIME</span><span>{receiptData.date}</span></div>
            <div><span className="text-slate-400 block text-[9px]">CUSTOMER</span><span className="font-bold">{receiptData.customer}</span></div>
            <div><span className="text-slate-400 block text-[9px]">PAYMENT METHOD</span><span className="font-bold">{receiptData.paymentMethod}</span></div>
          </div>

          <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3 max-h-48 overflow-y-auto">
            {receiptData.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-[11px]">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.qty} x PKR {item.price.toLocaleString()}</p>
                </div>
                <span className="font-bold shrink-0">PKR {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>PKR {receiptData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax ({receiptData.taxEnabled ? `${receiptData.taxRate}%` : 'Disabled'})</span>
              <span>PKR {receiptData.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Charged</span>
              <span className="text-[#2563EB]">PKR {receiptData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold flex items-center gap-2"
          >
            🖨️ Print Thermal Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}

// 9. QUICK LEDGER TRANSACTION MODAL (Debit / Credit)
export function QuickLedgerModal({
  open,
  onClose,
  type,
  selectedCustomerId,
}: {
  open: boolean;
  onClose: () => void;
  type: 'debit' | 'credit';
  selectedCustomerId?: string;
}) {
  const { customers, updateCustomer, addActivity } = useStockFlow();
  const [customerId, setCustomerId] = useState(selectedCustomerId || '');
  const [amount, setAmount] = useState<number | string>('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('Cash');

  useEffect(() => {
    if (open) {
      setCustomerId(selectedCustomerId || (customers[0]?.id || ''));
      setAmount('');
      setNote('');
      setMethod('Cash');
    }
  }, [open, selectedCustomerId, customers]);

  const activeCustomer = customers.find(c => c.id === customerId);
  const isDebit = type === 'debit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !amount) return;

    const val = Number(amount) || 0;
    if (val <= 0) return;

    const curDebit = activeCustomer.debit || 0;
    const curCredit = activeCustomer.credit || 0;

    const newDebit = isDebit ? curDebit + val : curDebit;
    const newCredit = !isDebit ? curCredit + val : curCredit;
    const newBalance = newDebit - newCredit;

    await updateCustomer(activeCustomer.id, {
      debit: newDebit,
      credit: newCredit,
      balance: newBalance,
    });

    const actType = isDebit ? 'order' : 'payment';
    const actTitle = isDebit
      ? `Debit Added (PKR ${val.toLocaleString()})`
      : `Credit Paid (PKR ${val.toLocaleString()})`;
    const actBody = `${activeCustomer.name} · ${note || (isDebit ? 'Manual Billed Charge' : `Paid via ${method}`)}`;

    await addActivity(actType, actTitle, actBody);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDebit ? "Post Debit Transaction (Customer Billed)" : "Post Credit Transaction (Payment Received)"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Banner indicator */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDebit 
            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
            : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
              isDebit ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isDebit ? 'DEBIT (+) BILLED' : 'CREDIT (-) PAID'}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
              {isDebit ? 'Record New Billed Invoice / Charge' : 'Record Received Customer Payment'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Transaction Impact</span>
            <span className={`font-mono font-black text-base ${isDebit ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDebit ? `+ PKR ${Number(amount || 0).toLocaleString()}` : `- PKR ${Number(amount || 0).toLocaleString()}`}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Customer</label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone || c.city}) — Net Bal: PKR {(c.balance ?? ((c.debit || 0) - (c.credit || 0))).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {activeCustomer && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Debit</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">PKR {(activeCustomer.debit || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Credit</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {(activeCustomer.credit || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Balance</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">PKR {(activeCustomer.balance ?? ((activeCustomer.debit || 0) - (activeCustomer.credit || 0))).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (PKR)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 5000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment / Reference Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (HBL/IBAN)</option>
              <option value="Easypaisa / JazzCash">Easypaisa / JazzCash</option>
              <option value="Cheque">Cheque / Demand Draft</option>
              <option value="POS Card">Credit/Debit Card</option>
              <option value="Other">Other Reference</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Note / Description / Invoice #</label>
          <input
            type="text"
            placeholder={isDebit ? "e.g. Billed for 2x ProVision Monitors (Inv #1042)" : "e.g. Payment received against Inv #1042"}
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button
            type="submit"
            className={`px-5 py-2 rounded-lg text-white font-bold transition-all shadow-md ${
              isDebit
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            {isDebit ? 'Confirm Debit Entry' : 'Confirm Credit Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// 10. CROSS-DEVICE DATA SYNC & BACKUP MODAL
export function DataSyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    isSupabaseConnected,
    supabaseUrl,
    supabaseKey,
    connectSupabaseCredentials,
    exportAllDataJSON,
    importAllDataJSON,
    pushLocalToSupabase,
    refreshData,
  } = useStockFlow();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) setMessage(null);
  }, [open]);

  // Handle Export Backup
  const handleExportBackup = () => {
    try {
      const jsonStr = exportAllDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `StockFlow_Full_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `Backup file "${filename}" downloaded successfully!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to generate backup export file.' });
    }
  };

  // Handle Import Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importAllDataJSON(text);
        if (res.success) {
          setMessage({ type: 'success', text: `✓ Backup restored successfully! Loaded ${res.count} records.` });
        } else {
          setMessage({ type: 'error', text: res.error || 'Failed to import backup.' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Invalid JSON file format.' });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  // Generate Quick Multi-PC Cloud Link Code (Base64)
  const getCloudLinkCode = () => {
    if (!supabaseUrl || !supabaseKey) return '';
    try {
      return btoa(JSON.stringify({ u: supabaseUrl, k: supabaseKey }));
    } catch {
      return '';
    }
  };

  const handleCopyCloudCode = () => {
    const code = getCloudLinkCode();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleApplyQuickCode = async () => {
    if (!quickCodeInput.trim()) return;
    setIsProcessing(true);
    setMessage(null);
    try {
      const decoded = JSON.parse(atob(quickCodeInput.trim()));
      if (decoded.u && decoded.k) {
        const ok = await connectSupabaseCredentials(decoded.u, decoded.k);
        if (ok) {
          setMessage({ type: 'success', text: '🟢 Connected to Cloud Database successfully! Multi-PC Sync active.' });
          setQuickCodeInput('');
        } else {
          setMessage({ type: 'error', text: 'Could not connect using this cloud code.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Invalid Cloud Link Code format.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Invalid Cloud Link Code.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushLocalData = async () => {
    setIsProcessing(true);
    setMessage(null);
    const res = await pushLocalToSupabase();
    setIsProcessing(false);
    if (res.success) {
      setMessage({ type: 'success', text: `Uploaded ${res.count} local records to Cloud Database!` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to push local records.' });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cross-Device Data Sync & Backup Manager">
      <div className="space-y-5 text-xs">
        {/* Status Indicator Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isSupabaseConnected 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
              isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {isSupabaseConnected ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {isSupabaseConnected ? '🟢 Cloud Database Active (Multi-PC Sync On)' : '🟡 Local Storage Only (PC-Isolated Mode)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isSupabaseConnected 
                  ? 'All customers, ledgers, and transactions automatically sync across all your PCs & browsers.'
                  : 'Data is saved on this browser only. Export backup or connect cloud sync to access from other PCs.'}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-100 dark:bg-red-950/80 border-red-300 text-red-900 dark:text-red-200'
          }`}>
            <span className="font-bold">{message.type === 'success' ? '✓' : '⚠️'} {message.text}</span>
          </div>
        )}

        {/* SECTION 1: 1-CLICK BACKUP EXPORT & IMPORT */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#2563EB]" />
                1-Click Backup Export & Restore
              </h3>
              <p className="text-[10px] text-slate-500">Transfer 100% of your saved customers and ledgers between any PC without losing data.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 font-bold transition-all flex flex-col items-center justify-center gap-1 text-center"
            >
              <Download className="w-5 h-5 text-[#2563EB]" />
              <span>Export Portable Backup</span>
              <span className="text-[9px] font-normal text-slate-400">Save .json file to USB / Disk</span>
            </button>

            <label className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-bold transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Import & Restore Backup</span>
              <span className="text-[9px] font-normal text-slate-400">Upload .json file from another PC</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* SECTION 2: MULTI-PC CLOUD SYNC CONFIGURATION */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-600" />
                Multi-PC Cloud Link Code
              </h3>
              <p className="text-[10px] text-slate-500">Connect multiple PCs to the same database so all browsers show identical live data.</p>
            </div>
          </div>

          {isSupabaseConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Device Cloud Link Code</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[240px] block">
                    {getCloudLinkCode().slice(0, 30)}...
                  </span>
                </div>
                <button
                  onClick={handleCopyCloudCode}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold hover:bg-blue-100 flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode ? 'Copied!' : 'Copy Code for PC #2'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePushLocalData}
                  disabled={isProcessing}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Cloud className="w-4 h-4" />
                  Sync All Local Ledgers to Cloud
                </button>
                <button
                  onClick={() => refreshData()}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paste Cloud Link Code from PC #1</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste link code copied from PC #1..."
                    value={quickCodeInput}
                    onChange={e => setQuickCodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                  <button
                    onClick={handleApplyQuickCode}
                    disabled={isProcessing || !quickCodeInput.trim()}
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold disabled:opacity-50 shrink-0"
                  >
                    Connect & Sync
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

