import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Database, AlertCircle, Plus, RefreshCw, Key, Globe, Package, DollarSign, User, Building2, Truck, TrendingUp, ArrowDownLeft, Download, Upload, Share2, Cloud, CloudOff, Copy, HardDrive, Smartphone, FileSpreadsheet, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useStockFlow, Product, Invoice, PurchaseOrder, Vendor, Customer } from '../context/StockFlowContext';
import { parseCustomerFile, ParsedCustomerRecord } from '../utils/customerParser';

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

          {isSupabaseConnected && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Mobile Device Cross-Sync Link</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">Live Sync Ready</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Open this app on your mobile phone and paste this sync link (or open directly in your phone browser) to automatically pair your phone with this exact cloud database.
              </p>
              <button
                type="button"
                onClick={() => {
                  const shareLink = `${window.location.origin}${window.location.pathname}#config=${btoa(JSON.stringify({ u: supabaseUrl || urlInput, k: supabaseKey || keyInput }))}`;
                  navigator.clipboard.writeText(shareLink);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors shadow-sm"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Mobile Sync Link Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Mobile Sync Link (Pairs Phone Instantly)
                  </>
                )}
              </button>
            </div>
          )}

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
  const { addProduct, categories, addCategory, vendors } = useStockFlow();
  const [vendor, setVendor] = useState('');
  const [contactVendor, setContactVendor] = useState('');
  const [name, setName] = useState('');
  const [cat, setCat] = useState(categories[0] || 'Wheat');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [qty, setQty] = useState<number | string>('');
  const [min, setMin] = useState<number | string>('');
  const [purchaseRate, setPurchaseRate] = useState<number | string>('');
  const [sellingRate, setSellingRate] = useState<number | string>('');
  const [wh, setWh] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) {
      setVendor('');
      setContactVendor('');
      setName('');
      setCat(categories[0] || 'Wheat');
      setNewCatInput('');
      setShowNewCatInput(false);
      setQty('');
      setMin('');
      setPurchaseRate('');
      setSellingRate('');
      setWh('');
      setErrorMsg('');
    }
  }, [open, categories]);

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
    setErrorMsg('');
    const res = await addProduct({
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      cat,
      qty: Number(qty) || 0,
      min: Number(min) || 0,
      price: Number(sellingRate) || 0,
      purchaseRate: Number(purchaseRate) || 0,
      vendor: vendor.trim(),
      contactVendor: contactVendor.trim(),
      wh: wh.trim() || 'Main Warehouse',
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save product in Supabase');
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Inventory Product">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}
        {/* Header Indicator */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white text-xs">Inventory Product Registration</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Configure stock rates, vendor contacts &amp; storage</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            New Item
          </span>
        </div>

        {/* Row 1: Vendor & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor</label>
            <input
              type="text"
              list="vendor-options"
              placeholder=""
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <datalist id="vendor-options">
              {vendors.map(v => (
                <option key={v.id} value={v.name} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Category</label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[10px] text-[#2563EB] hover:underline font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                {showNewCatInput ? 'Existing' : 'Create new category'}
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New category..."
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-[#2563EB] text-white rounded-xl font-bold text-xs shrink-0 shadow-sm"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Row 2: Product Name & Initial Qty (in SAME line, small boxes) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder=""
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Qty</label>
            <input
              type="number"
              min="0"
              required
              placeholder=""
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-center outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Min Qty, Purchase Rate, Selling Rate (in SAME line) */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Qty</label>
            <input
              type="number"
              min="0"
              placeholder="10"
              value={min}
              onChange={e => setMin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-center outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Rate</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={purchaseRate}
              onChange={e => setPurchaseRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Rate</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={sellingRate}
              onChange={e => setSellingRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Row 4: Warehouse Location & Contact Vendor (in SAME line, small boxes each size) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warehouse Location</label>
            <input
              type="text"
              placeholder="Main Warehouse"
              value={wh}
              onChange={e => setWh(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Vendor</label>
            <input
              type="text"
              placeholder=""
              value={contactVendor}
              onChange={e => setContactVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            Save Product
          </button>
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
    const finalCustomer = isCustomCustomer ? customCustomer.trim() : (customer || customers[0]?.name || 'Walk-in Customer');
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
    const res = await addCustomer({
      name: trimmedName,
      phone: trimmedPhone,
      city: city.trim(),
      product: product.trim(),
      credit: cr,
      debit: dr,
      balance: dr - cr,
      status,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save customer in Supabase');
      return;
    }
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

// ── Customer Search + Select Component ──
function CustomerSearchSelect({
  customers,
  value,
  onChange,
}: {
  customers: Customer[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = customers.find(c => c.id === value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = query.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.phone || '').includes(query)
      )
    : customers;

  return (
    <div className="relative">
      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Search Customer & Select</label>
      <div
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? 'text-slate-900 dark:text-white text-sm' : 'text-slate-400 text-sm'}>
          {selected ? `${selected.name}${selected.phone ? ` · ${selected.phone}` : ''}` : 'Search customer…'}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <input
              autoFocus
              type="text"
              placeholder="Type name or phone…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-slate-400 text-xs text-center">No customers found</li>
            ) : (
              filtered.map(c => (
                <li
                  key={c.id}
                  className={`px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors ${c.id === value ? 'bg-blue-50 dark:bg-blue-950/40 font-semibold text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}
                  onClick={() => { onChange(c.id); setQuery(''); setOpen(false); }}
                >
                  <span>{c.name}{c.phone ? ` · ${c.phone}` : ''}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Bal: PKR {((c.balance ?? ((c.debit || 0) - (c.credit || 0)))).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
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
  const { customers, updateCustomer, addLedgerTransaction, addActivity } = useStockFlow();
  const [customerId, setCustomerId] = useState(selectedCustomerId || '');
  const [amount, setAmount] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setCustomerId(selectedCustomerId || (customers[0]?.id || ''));
      setAmount('');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [open, selectedCustomerId, customers]);

  const activeCustomer = customers.find(c => c.id === customerId);
  const isDebit = type === 'debit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!activeCustomer || !amount) return;

    const val = Number(amount) || 0;
    if (val <= 0) return;

    setIsSubmitting(true);
    try {
      const curDebit = activeCustomer.debit || 0;
      const curCredit = activeCustomer.credit || 0;

      const newDebit = isDebit ? curDebit + val : curDebit;
      const newCredit = !isDebit ? curCredit + val : curCredit;
      const newBalance = newDebit - newCredit;

      // 1. Create persistent ledger audit record in Supabase
      const ledRes = await addLedgerTransaction({
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        type: isDebit ? 'debit' : 'credit',
        amount: val,
        description: isDebit ? 'Manual Billed Charge' : 'Payment Received',
        date: new Date().toISOString().split('T')[0],
      });

      if (!ledRes.success) {
        setErrorMsg(ledRes.error || 'Failed to save ledger record in Supabase');
        setIsSubmitting(false);
        return;
      }

      // 2. Update customer aggregate balances in Supabase
      const custRes = await updateCustomer(activeCustomer.id, {
        debit: newDebit,
        credit: newCredit,
        balance: newBalance,
      });

      if (!custRes.success) {
        setErrorMsg(custRes.error || 'Failed to update customer balance in Supabase');
        setIsSubmitting(false);
        return;
      }

      const actType = isDebit ? 'order' : 'payment';
      const actTitle = isDebit
        ? `Debit Added (PKR ${val.toLocaleString()})`
        : `Credit Paid (PKR ${val.toLocaleString()})`;
      const actBody = `${activeCustomer.name} · ${isDebit ? 'Manual Billed Charge' : 'Payment Received'}`;

      await addActivity(actType, actTitle, actBody);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDebit ? "Debit" : "Credit"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Banner indicator */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDebit 
            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
            : 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
        }`}>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
              isDebit ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {isDebit ? 'DEBIT (+) BILLED' : 'CREDIT (-) PAID'}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
              {isDebit ? 'Record New Billed Charge' : 'Record Customer Payment'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Amount</span>
            <span className={`font-mono font-black text-base ${isDebit ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {isDebit ? `+ PKR ${Number(amount || 0).toLocaleString()}` : `- PKR ${Number(amount || 0).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Search Customer & Select */}
        <CustomerSearchSelect
          customers={customers}
          value={customerId}
          onChange={setCustomerId}
        />

        {/* Amount */}
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

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-lg text-white font-bold transition-all shadow-md ${
              isDebit
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving to Supabase...' : isDebit ? 'Confirm Debit' : 'Confirm Credit'}
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

// ═══════════════════════════════════════════════════════════
// IMPORT CUSTOMERS MODAL (PDF & Excel)
// ═══════════════════════════════════════════════════════════
export function ImportCustomersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bulkAddCustomers, customers } = useStockFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ImportStep = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';
  const [step, setStep] = useState<ImportStep>('idle');
  const [records, setRecords] = useState<ParsedCustomerRecord[]>([]);
  const [duplicateIds, setDuplicateIds] = useState<Set<number>>(new Set());
  const [skippedDuplicates, setSkippedDuplicates] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('idle');
      setRecords([]);
      setDuplicateIds(new Set());
      setSkippedDuplicates(0);
      setImportedCount(0);
      setErrorMsg('');
      setFileName('');
    }
  }, [open]);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStep('parsing');
    setErrorMsg('');
    try {
      const parsed = await parseCustomerFile(file);
      // Detect duplicates by name+phone match against existing customers
      const dupSet = new Set<number>();
      parsed.forEach((rec, idx) => {
        const isDup = customers.some(c =>
          c.name.trim().toLowerCase() === rec.name.trim().toLowerCase() ||
          (rec.phone && c.phone && c.phone.trim() === rec.phone.trim())
        );
        if (isDup) dupSet.add(idx);
      });
      setRecords(parsed);
      setDuplicateIds(dupSet);
      setStep('preview');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      setStep('error');
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    const toImport = records.filter((_, idx) => !duplicateIds.has(idx));
    setSkippedDuplicates(duplicateIds.size);
    setStep('importing');
    await bulkAddCustomers(toImport.map(r => ({
      name: r.name,
      phone: r.phone,
      city: r.city,
      product: r.product,
      debit: r.debit,
      credit: r.credit,
      balance: r.debit - r.credit,
      status: r.status,
    })));
    setImportedCount(toImport.length);
    setStep('done');
  };

  const fmtPKR = (n: number) => n > 0 ? `PKR ${n.toLocaleString()}` : '—';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Import Customers</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload PDF or Excel file — data is mapped automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {/* STEP: IDLE — Drop zone */}
          {(step === 'idle' || step === 'error') && (
            <div className="space-y-4">
              {/* Supported Fields Info */}
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                {['Customer Name','Phone Number','City','Product / Item','Debit (Billed)','Credit (Paid)','Status'].map(f => (
                  <div key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />{f}
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-500 dark:text-red-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Drop your file here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">Supports Excel (.xlsx, .xls), CSV (.csv) and PDF (.pdf)</p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">XLSX</span>
                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">XLS</span>
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">CSV</span>
                    <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full">PDF</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  className="hidden"
                  onChange={onFileInput}
                />
              </div>

              {step === 'error' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">Parsing Failed</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Format Hints */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1.5">📋 File Format Tips</p>
                <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
                  <li>First row should be column headers (Name, Phone, City, Product, Debit, Credit, Status)</li>
                  <li>Numeric fields can include commas and currency symbols — they are cleaned automatically</li>
                  <li>Status can be: active, inactive, at_risk, pending, paid — anything else defaults to active</li>
                  <li>Duplicate customers (same name or phone) will be detected and skipped</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP: PARSING */}
          {step === 'parsing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center animate-pulse">
                <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-white">Parsing file…</p>
                <p className="text-sm text-slate-500 mt-1">{fileName}</p>
              </div>
            </div>
          )}

          {/* STEP: IMPORTING */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center animate-pulse">
                <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              </div>
              <p className="font-bold text-slate-800 dark:text-white">Importing customers into CRM…</p>
            </div>
          )}

          {/* STEP: PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-slate-800 dark:text-white">{records.length} records found</span>
                  <span className="text-slate-400">in <span className="font-semibold text-slate-600 dark:text-slate-300">{fileName}</span></span>
                </div>
                <div className="flex gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    ✓ {records.length - duplicateIds.size} new
                  </span>
                  {duplicateIds.size > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      ⚠ {duplicateIds.size} duplicate{duplicateIds.size > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Records table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                      <tr>
                        {['#','Customer Name','Phone','City','Product / Item','Debit','Credit','Status',''].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, idx) => {
                        const isDup = duplicateIds.has(idx);
                        return (
                          <tr key={idx} className={`border-t border-slate-100 dark:border-slate-800 ${
                            isDup ? 'bg-amber-50/60 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}>
                            <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-white whitespace-nowrap max-w-[140px] truncate">{r.name}</td>
                            <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap">{r.phone || '—'}</td>
                            <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{r.city || '—'}</td>
                            <td className="px-3 py-2 text-slate-500 whitespace-nowrap max-w-[120px] truncate">{r.product || '—'}</td>
                            <td className="px-3 py-2 font-mono font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">{fmtPKR(r.debit)}</td>
                            <td className="px-3 py-2 font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">{fmtPKR(r.credit)}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                                r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                                r.status === 'at_risk' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                              }`}>{r.status}</span>
                            </td>
                            <td className="px-3 py-2">
                              {isDup && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  <AlertTriangle className="w-2.5 h-2.5" />DUP
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {duplicateIds.size > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  ⚠ {duplicateIds.size} record{duplicateIds.size > 1 ? 's' : ''} marked as duplicate will be automatically skipped.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setStep('idle'); setRecords([]); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  ← Upload Different File
                </button>
                <button
                  onClick={handleImport}
                  disabled={records.length - duplicateIds.size === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-blue-500/20 transition-all text-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import {records.length - duplicateIds.size} Customer{records.length - duplicateIds.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Import Complete!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{importedCount}</span> customer{importedCount !== 1 ? 's' : ''} successfully added to CRM
                  {skippedDuplicates > 0 && <> · <span className="font-bold text-amber-500">{skippedDuplicates}</span> duplicate{skippedDuplicates > 1 ? 's' : ''} skipped</>}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('idle'); setRecords([]); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Import More
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
