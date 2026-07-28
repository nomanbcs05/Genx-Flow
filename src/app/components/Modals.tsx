import React, { useState } from 'react';
import { X, Check, Database, AlertCircle, Plus, RefreshCw, Key, Globe, Package, DollarSign, User, Building2, Truck } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [terms, setTerms] = useState('Net 30');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVendor({
      name,
      contact,
      email,
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
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="d.lin@apex.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
  const { addCustomer } = useStockFlow();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [product, setProduct] = useState('');
  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState(0);
  const [status, setStatus] = useState('active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cr = Number(credit) || 0;
    const dr = Number(debit) || 0;
    await addCustomer({
      name,
      phone,
      city,
      product,
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={e => setName(e.target.value)}
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
              onChange={e => setPhone(e.target.value)}
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
              value={debit}
              onChange={e => setDebit(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Credit (Amount Paid)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={credit}
              onChange={e => setCredit(Number(e.target.value))}
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
          <span className={`font-mono font-bold text-sm ${(Number(debit) - Number(credit)) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            PKR {(Number(debit) - Number(credit)).toLocaleString()}
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
