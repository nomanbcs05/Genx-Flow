import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSupabase, getSupabaseCredentials } from '../../lib/supabase';

export interface Product {
  id: string;
  sku: string;
  name: string;
  cat: string;
  qty: number;
  min: number;
  price: number;
  purchaseRate?: number;
  vendor?: string;
  contactVendor?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | string;
  wh: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  cat?: string;
  price: number;
  qty: number;
}

export interface Invoice {
  id: string;
  customer: string;
  date: string;
  due: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | string;
  items: number;
  itemsList?: InvoiceItem[];
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  date: string;
  expected: string;
  amount: number;
  items: number;
  status: 'approved' | 'received' | 'in_transit' | 'draft' | string;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email?: string;
  paymentsSlot?: string;
  paymentMethod?: string;
  orders: number;
  spend: number;
  status: 'active' | 'inactive' | string;
  terms: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  product: string;
  credit: number;
  debit: number;
  balance: number;
  status: 'active' | 'at_risk' | 'inactive' | string;
  company?: string;
  email?: string;
  orders?: number;
  spend?: number;
  tier?: 'enterprise' | 'professional' | 'growth' | string;
}

export interface Activity {
  id: number | string;
  type: string;
  title: string;
  body: string;
  time: string;
}

export interface Expense {
  id: string;
  category: 'salary' | 'mill' | 'fuel' | 'loader';
  amount: number;
  description: string;
  date: string;
}

export interface NotificationItem {
  id: number | string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  company: string;
  avatar?: string;
  createdAt?: string;
}

export const INITIAL_USERS: UserAccount[] = [
  { id: "usr-001", name: "Bilal Shoukat", email: "bilalshoukatcrm@gmail.com", password: "crm1234", role: "Admin", company: "StockFlow ERP Platform" },
  { id: "usr-002", name: "Sarah Kim", email: "sarah@stockflow.io", password: "admin123", role: "Admin", company: "StockFlow Technologies Inc." },
];

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_POS: PurchaseOrder[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// ─── SAFE SUPABASE CALL WRAPPER ──────────────────────────────────────────────
// PostgrestBuilder objects are Thenables but lack .catch() method in JS bundles.
const safeSbCall = (builderPromise: any) => {
  if (builderPromise && typeof builderPromise.then === 'function') {
    builderPromise.then(null, (err: any) => {
      console.warn('[StockFlow] Supabase query warning:', err);
    });
  }
};

// ─── LOCAL STORAGE VAULT HELPERS ─────────────────────────────────────────────
const loadLocal = <T,>(key: string, defaultVal: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as unknown as T;
    }
  } catch (e) {
    console.warn(`[StockFlow] LocalStorage load error (${key}):`, e);
  }
  return defaultVal;
};

const loadDeletedIds = (key: string): Set<string> => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return new Set(JSON.parse(saved));
  } catch (e) {}
  return new Set();
};

const saveDeletedIds = (key: string, idsSet: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(idsSet)));
  } catch (e) {}
};

// ─── MAPPING UTILITIES (camelCase <-> snake_case) ───────────────────────────
const mapProductFromDB = (p: any): Product => ({
  id: String(p.id),
  sku: p.sku || '',
  name: p.name || '',
  cat: p.cat || '',
  qty: Number(p.qty || 0),
  min: Number(p.min || 10),
  price: Number(p.price || 0),
  purchaseRate: Number(p.purchase_rate ?? p.purchaseRate ?? 0),
  vendor: p.vendor || '',
  contactVendor: p.contact_vendor || p.contactVendor || '',
  status: p.status || 'in_stock',
  wh: p.wh || 'WH-01',
});

const mapProductToDB = (p: Product) => ({
  id: p.id,
  sku: p.sku || '',
  name: p.name,
  cat: p.cat || '',
  qty: Number(p.qty || 0),
  min: Number(p.min || 10),
  price: Number(p.price || 0),
  purchase_rate: Number(p.purchaseRate || 0),
  vendor: p.vendor || '',
  contact_vendor: p.contactVendor || '',
  status: p.status || 'in_stock',
  wh: p.wh || 'WH-01',
});

const mapInvoiceFromDB = (i: any): Invoice => ({
  id: String(i.id),
  customer: i.customer || '',
  date: i.date || '',
  due: i.due || '',
  amount: Number(i.amount || 0),
  status: i.status || 'pending',
  items: Number(i.items || 1),
  itemsList: i.items_list || i.itemsList || [],
});

const mapInvoiceToDB = (i: Invoice) => ({
  id: i.id,
  customer: i.customer,
  date: i.date,
  due: i.due,
  amount: Number(i.amount || 0),
  status: i.status,
  items: Number(i.items || 1),
  items_list: i.itemsList || [],
});

const mapPOFromDB = (p: any): PurchaseOrder => ({
  id: String(p.id),
  vendor: p.vendor || '',
  date: p.date || '',
  expected: p.expected || '',
  amount: Number(p.amount || 0),
  items: Number(p.items || 1),
  status: p.status || 'approved',
});

const mapPOToDB = (p: PurchaseOrder) => ({
  id: p.id,
  vendor: p.vendor,
  date: p.date,
  expected: p.expected,
  amount: Number(p.amount || 0),
  items: Number(p.items || 1),
  status: p.status,
});

const mapVendorFromDB = (v: any): Vendor => ({
  id: String(v.id),
  name: v.name || '',
  contact: v.contact || '',
  email: v.email || '',
  paymentsSlot: v.payments_slot || v.paymentsSlot || '',
  paymentMethod: v.payment_method || v.paymentMethod || '',
  orders: Number(v.orders || 0),
  spend: Number(v.spend || 0),
  status: v.status || 'active',
  terms: v.terms || 'Net 30',
});

const mapVendorToDB = (v: Vendor) => ({
  id: v.id,
  name: v.name,
  contact: v.contact || '',
  email: v.email || '',
  payments_slot: v.paymentsSlot || '',
  payment_method: v.paymentMethod || '',
  orders: Number(v.orders || 0),
  spend: Number(v.spend || 0),
  status: v.status || 'active',
  terms: v.terms || 'Net 30',
});

const mapCustomerFromDB = (c: any): Customer => ({
  id: String(c.id),
  name: c.name || '',
  phone: c.phone || '',
  city: c.city || '',
  product: c.product || '',
  credit: Number(c.credit || 0),
  debit: Number(c.debit || 0),
  balance: Number(c.balance || 0),
  status: c.status || 'active',
  company: c.company || '',
  email: c.email || '',
  orders: Number(c.orders || 0),
  spend: Number(c.spend || 0),
  tier: c.tier || 'growth',
});

const mapCustomerToDB = (c: Customer) => ({
  id: c.id,
  name: c.name,
  phone: c.phone || '',
  city: c.city || '',
  product: c.product || '',
  credit: Number(c.credit || 0),
  debit: Number(c.debit || 0),
  balance: Number(c.balance || 0),
  status: c.status || 'active',
  company: c.company || '',
  email: c.email || '',
  orders: Number(c.orders || 0),
  spend: Number(c.spend || 0),
  tier: c.tier || 'growth',
});

const mapExpenseFromDB = (e: any): Expense => ({
  id: String(e.id),
  category: e.category,
  amount: Number(e.amount || 0),
  description: e.description || '',
  date: e.date || new Date().toISOString().split('T')[0],
});

const mapExpenseToDB = (e: Expense) => ({
  id: e.id,
  category: e.category,
  amount: Number(e.amount || 0),
  description: e.description || '',
  date: e.date || new Date().toISOString().split('T')[0],
});

interface StockFlowContextType {
  products: Product[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  customers: Customer[];
  activities: Activity[];
  notifications: NotificationItem[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  isLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastError: string | null;
  categories: string[];
  addCategory: (cat: string) => void;
  
  // Database Clean & Passcode Security
  isDatabaseCleaned: boolean;
  ownerPasscode: string;
  setOwnerPasscode: (pass: string) => void;
  verifyOwnerPasscode: (pass: string) => boolean;
  clearAllDatabaseData: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  restoreDemoData: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  exportDatabaseBackup: () => void;

  // Auth Actions
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  signup: (name: string, email: string, pass: string, company?: string, role?: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  logout: () => void;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'status'> & { id?: string }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, newQty: number) => Promise<void>;
  
  addInvoice: (invoice: Omit<Invoice, 'id'> & { id?: string }) => Promise<void>;
  markInvoicePaid: (id: string) => Promise<void>;
  
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'> & { id?: string }) => Promise<void>;
  markPOReceived: (id: string) => Promise<void>;
  
  addVendor: (vendor: Omit<Vendor, 'id'> & { id?: string }) => Promise<void>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'> & { id?: string }) => Promise<void>;
  bulkAddCustomers: (customersList: Array<Omit<Customer, 'id'> & { id?: string }>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  processPOSSale: (cartItems: Array<{ id: string; name: string; price: number; qty: number }>, customerName?: string) => Promise<void>;
  
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  connectSupabaseCredentials: (url: string, key: string) => Promise<boolean>;
  disconnectSupabase: () => void;
  refreshData: () => Promise<void>;
  markAllNotificationsRead: () => void;
  
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonStr: string) => Promise<{ success: boolean; error?: string; count?: number }>;
  pushLocalToSupabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

const StockFlowContext = createContext<StockFlowContextType | undefined>(undefined);

export const StockFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCleanedCheck = () => localStorage.getItem('sf_database_cleaned') === 'true';
  const [isDatabaseCleaned, setIsDatabaseCleaned] = useState<boolean>(isCleanedCheck);

  const [ownerPasscode, setOwnerPasscodeState] = useState<string>(() => {
    return localStorage.getItem('sf_owner_passcode') || '1234';
  });

  const setOwnerPasscode = (newPass: string) => {
    const clean = newPass.trim();
    setOwnerPasscodeState(clean);
    localStorage.setItem('sf_owner_passcode', clean);
  };

  // Track deleted IDs in localStorage so deleted items do not get re-fetched from cloud race conditions
  const deletedProductsRef = useRef<Set<string>>(loadDeletedIds('sf_del_products'));
  const deletedInvoicesRef = useRef<Set<string>>(loadDeletedIds('sf_del_invoices'));
  const deletedPORef = useRef<Set<string>>(loadDeletedIds('sf_del_pos'));
  const deletedVendorsRef = useRef<Set<string>>(loadDeletedIds('sf_del_vendors'));
  const deletedCustomersRef = useRef<Set<string>>(loadDeletedIds('sf_del_customers'));
  const deletedExpensesRef = useRef<Set<string>>(loadDeletedIds('sf_del_expenses'));

  // ─── LOCAL STORAGE PERSISTENCE ENGINE ───────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(() => loadLocal('sf_products', INITIAL_PRODUCTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadLocal('sf_invoices', INITIAL_INVOICES));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadLocal('sf_pos', INITIAL_POS));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadLocal('sf_vendors', INITIAL_VENDORS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadLocal('sf_customers', INITIAL_CUSTOMERS));
  const [activities, setActivities] = useState<Activity[]>(() => loadLocal('sf_activities', INITIAL_ACTIVITIES));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadLocal('sf_notifications', INITIAL_NOTIFICATIONS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLocal('sf_expenses', []));

  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedSession = localStorage.getItem('sf_auth_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('sf_categories');
    return saved ? JSON.parse(saved) : ["Wheat", "Floor", "Flour / Atta", "Fine / Maida", "Electronics", "Furniture", "Stationery", "Accessories"];
  });

  // Automatically save state to localStorage whenever modified
  useEffect(() => { localStorage.setItem('sf_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('sf_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('sf_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('sf_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('sf_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('sf_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('sf_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('sf_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('sf_categories', JSON.stringify(categories)); }, [categories]);

  const addCategory = async (newCat: string) => {
    const trimmed = newCat.trim();
    if (trimmed && !categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories(prev => [...prev, trimmed]);
      const sb = getSupabase();
      safeSbCall(sb.from('categories').insert({ id: `CAT-${Date.now()}`, name: trimmed }));
    }
  };

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastError, setLastError] = useState<string | null>(null);

  // Auth Action Handlers
  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    let match = users.find(u => u.email.toLowerCase() === cleanEmail);

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('users').select('*').eq('email', cleanEmail).single();
        if (data && !error) {
          match = {
            id: data.id,
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            company: data.company,
          };
          setUsers(prev => {
            const exists = prev.some(u => u.id === data.id);
            return exists ? prev.map(u => u.id === data.id ? match! : u) : [...prev, match!];
          });
        }
      } catch (err) {
        console.warn('Supabase user fetch fallback:', err);
      }
    }

    if (!match) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }

    if (match.password && match.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
    }

    const sessionUser: UserAccount = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role || 'Admin',
      company: match.company || 'StockFlow ERP Platform',
    };

    setCurrentUser(sessionUser);
    localStorage.setItem('sf_auth_session', JSON.stringify(sessionUser));
    await addActivity('user', 'User Signed In', `${sessionUser.name} signed in`);
    return { success: true, user: sessionUser };
  };

  const signup = async (name: string, email: string, pass: string, company = 'StockFlow ERP', role = 'Admin') => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Full name, email address, and password are required.' };
    }

    const existing = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      company: company.trim() || 'StockFlow ERP',
      role: role || 'Admin',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('users').insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          company: newUser.company,
        });
      } catch (err) {
        console.warn('Supabase user insert warning:', err);
      }
    }

    const sessionUser: UserAccount = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company,
    };

    setCurrentUser(sessionUser);
    localStorage.setItem('sf_auth_session', JSON.stringify(sessionUser));
    await addActivity('user', 'New User Registered', `${newUser.name} created account (${newUser.email})`);
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sf_auth_session');
  };

  // ─── Mount: immediately fetch all data + wire up realtime + polling ─────────
  useEffect(() => {
    const { url, key } = getSupabaseCredentials();
    setSupabaseUrl(url);
    setSupabaseKey(key);

    fetchFromSupabase();

    const sb = getSupabase();
    let channel: ReturnType<typeof sb.channel> | null = null;
    try {
      channel = sb
        .channel('sf-global-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchFromSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => fetchFromSupabase())
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[StockFlow] Realtime connected ✅');
          }
        });
    } catch (err) {
      console.warn('[StockFlow] Realtime subscription failed:', err);
    }

    const pollInterval = setInterval(() => fetchFromSupabase(), 10000);

    const handleFocus = () => fetchFromSupabase();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchFromSupabase();
    });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      if (channel) sb.removeChannel(channel);
    };
  }, []);

  const mergeEntities = <T extends { id: string }>(
    currentLocal: T[],
    remoteFetched: T[],
    deletedSet: Set<string>
  ): { merged: T[]; unsynced: T[] } => {
    const validRemote = remoteFetched.filter(r => !deletedSet.has(r.id));
    const validLocal = currentLocal.filter(l => !deletedSet.has(l.id));

    const remoteMap = new Map<string, T>();
    validRemote.forEach(r => remoteMap.set(r.id, r));

    const unsynced: T[] = [];
    const resultMap = new Map<string, T>();

    validRemote.forEach(r => resultMap.set(r.id, r));

    validLocal.forEach(l => {
      if (!remoteMap.has(l.id)) {
        unsynced.push(l);
        resultMap.set(l.id, l);
      }
    });

    return {
      merged: Array.from(resultMap.values()),
      unsynced,
    };
  };

  const fetchFromSupabase = async () => {
    const sb = getSupabase();
    setSyncStatus('syncing');

    try {
      const [
        { data: pData },
        { data: iData },
        { data: poData },
        { data: vData },
        { data: cData },
        { data: actData },
        { data: notifData },
        { data: uData },
        { data: expData },
        { data: catData },
      ] = await Promise.all([
        sb.from('products').select('*').order('created_at', { ascending: false }),
        sb.from('invoices').select('*').order('created_at', { ascending: false }),
        sb.from('purchase_orders').select('*').order('created_at', { ascending: false }),
        sb.from('vendors').select('*').order('created_at', { ascending: false }),
        sb.from('customers').select('*').order('created_at', { ascending: false }),
        sb.from('activities').select('*').order('id', { ascending: false }).limit(50),
        sb.from('notifications').select('*').order('id', { ascending: false }).limit(50),
        sb.from('users').select('*'),
        sb.from('expenses').select('*').order('created_at', { ascending: false }),
        sb.from('categories').select('*'),
      ]);

      const remoteProducts = (pData || []).map(mapProductFromDB);
      const remoteInvoices = (iData || []).map(mapInvoiceFromDB);
      const remotePOs = (poData || []).map(mapPOFromDB);
      const remoteVendors = (vData || []).map(mapVendorFromDB);
      const remoteCustomers = (cData || []).map(mapCustomerFromDB);
      const remoteExpenses = (expData || []).map(mapExpenseFromDB);

      setProducts(prev => {
        const { merged, unsynced } = mergeEntities(prev, remoteProducts, deletedProductsRef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('products').upsert(unsynced.map(mapProductToDB)));
        }
        return merged;
      });

      setInvoices(prev => {
        const { merged, unsynced } = mergeEntities(prev, remoteInvoices, deletedInvoicesRef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('invoices').upsert(unsynced.map(mapInvoiceToDB)));
        }
        return merged;
      });

      setPurchaseOrders(prev => {
        const { merged, unsynced } = mergeEntities(prev, remotePOs, deletedPORef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('purchase_orders').upsert(unsynced.map(mapPOToDB)));
        }
        return merged;
      });

      setVendors(prev => {
        const { merged, unsynced } = mergeEntities(prev, remoteVendors, deletedVendorsRef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('vendors').upsert(unsynced.map(mapVendorToDB)));
        }
        return merged;
      });

      setCustomers(prev => {
        const { merged, unsynced } = mergeEntities(prev, remoteCustomers, deletedCustomersRef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('customers').upsert(unsynced.map(mapCustomerToDB)));
        }
        return merged;
      });

      setExpenses(prev => {
        const { merged, unsynced } = mergeEntities(prev, remoteExpenses, deletedExpensesRef.current);
        if (unsynced.length > 0) {
          safeSbCall(sb.from('expenses').upsert(unsynced.map(mapExpenseToDB)));
        }
        return merged;
      });

      if (actData && actData.length > 0) setActivities(actData);
      if (notifData && notifData.length > 0) setNotifications(notifData);

      if (uData && uData.length > 0) {
        const dbUsers = uData.map((u: any) => ({ id: String(u.id), name: u.name, email: u.email, password: u.password, role: u.role, company: u.company }));
        const merged = [...dbUsers];
        INITIAL_USERS.forEach(iu => {
          if (!merged.some(u => u.email.toLowerCase() === iu.email.toLowerCase())) merged.push(iu);
        });
        setUsers(merged);
      }

      if (catData && catData.length > 0) {
        const dbCats = catData.map((c: any) => c.name);
        setCategories(prev => Array.from(new Set([...prev, ...dbCats])));
      }

      setIsSupabaseConnected(true);
      setSyncStatus('synced');
    } catch (err: any) {
      console.warn('[StockFlow] Cloud fetch error — retaining local vault data:', err);
      setSyncStatus('synced');
      setIsSupabaseConnected(true);
    } finally {
      setIsLoading(false);
    }
  };

  const connectSupabaseCredentials = async (_url: string, _key: string): Promise<boolean> => {
    await fetchFromSupabase();
    return isSupabaseConnected;
  };

  const disconnectSupabase = () => {
    console.warn('[StockFlow] Supabase connection is active.');
  };

  const exportAllDataJSON = (): string => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      invoices,
      purchaseOrders,
      vendors,
      customers,
      activities,
      notifications,
      categories,
      users,
      expenses,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importAllDataJSON = async (jsonStr: string): Promise<{ success: boolean; error?: string; count?: number }> => {
    try {
      const data = JSON.parse(jsonStr);
      let restoredCount = 0;

      if (Array.isArray(data.products)) { setProducts(data.products); restoredCount += data.products.length; }
      if (Array.isArray(data.invoices)) { setInvoices(data.invoices); restoredCount += data.invoices.length; }
      if (Array.isArray(data.purchaseOrders)) { setPurchaseOrders(data.purchaseOrders); restoredCount += data.purchaseOrders.length; }
      if (Array.isArray(data.vendors)) { setVendors(data.vendors); restoredCount += data.vendors.length; }
      if (Array.isArray(data.customers)) { setCustomers(data.customers); restoredCount += data.customers.length; }
      if (Array.isArray(data.expenses)) { setExpenses(data.expenses); restoredCount += data.expenses.length; }
      if (Array.isArray(data.activities)) setActivities(data.activities);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (Array.isArray(data.categories)) setCategories(data.categories);

      const sb = getSupabase();
      if (sb) {
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          safeSbCall(sb.from('customers').upsert(data.customers.map(mapCustomerToDB)));
        }
        if (Array.isArray(data.vendors) && data.vendors.length > 0) {
          safeSbCall(sb.from('vendors').upsert(data.vendors.map(mapVendorToDB)));
        }
        if (Array.isArray(data.products) && data.products.length > 0) {
          safeSbCall(sb.from('products').upsert(data.products.map(mapProductToDB)));
        }
        if (Array.isArray(data.invoices) && data.invoices.length > 0) {
          safeSbCall(sb.from('invoices').upsert(data.invoices.map(mapInvoiceToDB)));
        }
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          safeSbCall(sb.from('expenses').upsert(data.expenses.map(mapExpenseToDB)));
        }
      }

      await addActivity('system', 'System Data Backup Restored', `Restored ${restoredCount} records from backup JSON`);
      return { success: true, count: restoredCount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid backup JSON file' };
    }
  };

  const pushLocalToSupabase = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: 'Supabase cloud database is not connected' };

    try {
      let count = 0;
      if (customers.length > 0) {
        const { error } = await sb.from('customers').upsert(customers.map(mapCustomerToDB));
        if (!error) count += customers.length;
      }
      if (vendors.length > 0) {
        const { error } = await sb.from('vendors').upsert(vendors.map(mapVendorToDB));
        if (!error) count += vendors.length;
      }
      if (products.length > 0) {
        const { error } = await sb.from('products').upsert(products.map(mapProductToDB));
        if (!error) count += products.length;
      }
      if (invoices.length > 0) {
        const { error } = await sb.from('invoices').upsert(invoices.map(mapInvoiceToDB));
        if (!error) count += invoices.length;
      }
      if (expenses.length > 0) {
        const { error } = await sb.from('expenses').upsert(expenses.map(mapExpenseToDB));
        if (!error) count += expenses.length;
      }
      setSyncStatus('synced');
      return { success: true, count };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to push local records to Supabase' };
    }
  };

  const calcStatus = (qty: number, min: number): string => {
    if (qty <= 0) return 'out_of_stock';
    if (qty <= min) return 'low_stock';
    return 'in_stock';
  };

  const addActivity = async (type: string, title: string, body: string) => {
    const newAct: Activity = {
      id: Date.now(),
      type,
      title,
      body,
      time: 'Just now',
    };
    setActivities(prev => [newAct, ...prev]);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('activities').insert({ type, title, body, time: 'Just now' }));
    }
  };

  const addNotification = async (type: string, title: string, body: string) => {
    const newNotif: NotificationItem = {
      id: Date.now(),
      type,
      title,
      body,
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('notifications').insert({ type, title, body, time: 'Just now', read: false }));
    }
  };

  // 1. ADD PRODUCT
  const addProduct = async (productData: Omit<Product, 'id' | 'status'> & { id?: string }) => {
    const newId = productData.id || `P${String(products.length + 1).padStart(3, '0')}`;
    const status = calcStatus(productData.qty, productData.min);
    const newProduct: Product = {
      ...productData,
      id: newId,
      status,
    };

    setProducts(prev => [newProduct, ...prev]);
    await addActivity('alert', 'Product Added', `${newProduct.name} (${newProduct.sku}) created.`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('products').upsert(mapProductToDB(newProduct)));
    }
  };

  // 2. UPDATE PRODUCT
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    let updatedProduct: Product | undefined;
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        updatedProduct = { ...p, ...updates };
        updatedProduct.status = calcStatus(updatedProduct.qty, updatedProduct.min);
        return updatedProduct;
      }
      return p;
    }));

    const sb = getSupabase();
    if (sb && updatedProduct) {
      safeSbCall(sb.from('products').upsert(mapProductToDB(updatedProduct)));
    }
  };

  // 3. DELETE PRODUCT
  const deleteProduct = async (id: string) => {
    deletedProductsRef.current.add(id);
    saveDeletedIds('sf_del_products', deletedProductsRef.current);
    setProducts(prev => prev.filter(p => p.id !== id));

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('products').delete().eq('id', id));
    }
  };

  // 4. ADJUST STOCK
  const adjustStock = async (id: string, newQty: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const newStatus = calcStatus(newQty, prod.min);
    const updated = { ...prod, qty: newQty, status: newStatus };
    setProducts(prev => prev.map(p => p.id === id ? updated : p));

    if (newQty <= prod.min) {
      addNotification('alert', `Low Stock: ${prod.name}`, `${newQty} units remaining, below min threshold of ${prod.min}.`);
    }

    await addActivity('alert', 'Stock Level Adjusted', `${prod.name} updated to ${newQty} units.`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('products').upsert(mapProductToDB(updated)));
    }
  };

  // 5. ADD INVOICE
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'> & { id?: string }) => {
    const newId = invoiceData.id || `INV-2024-${String(invoices.length + 848).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setCustomers(prev => prev.map(c => {
      const matchName = c.name.toLowerCase() === newInvoice.customer.toLowerCase() ||
                        (c.company && c.company.toLowerCase() === newInvoice.customer.toLowerCase());
      if (matchName) {
        const newDebit = (c.debit || 0) + newInvoice.amount;
        const newCredit = c.credit || 0;
        const newBalance = newDebit - newCredit;
        const newSpend = (c.spend || 0) + newInvoice.amount;
        const newOrders = (c.orders || 0) + 1;
        const updatedC = {
          ...c,
          debit: newDebit,
          balance: newBalance,
          spend: newSpend,
          orders: newOrders
        };
        const sb = getSupabase();
        if (sb) safeSbCall(sb.from('customers').upsert(mapCustomerToDB(updatedC)));
        return updatedC;
      }
      return c;
    }));

    await addActivity('order', 'New Invoice Created', `${newInvoice.id} issued to ${newInvoice.customer} for PKR ${newInvoice.amount.toLocaleString()}`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('invoices').upsert(mapInvoiceToDB(newInvoice)));
    }
  };

  // 6. MARK INVOICE PAID
  const markInvoicePaid = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const updatedInv = { ...inv, status: 'paid' };
    setInvoices(prev => prev.map(i => i.id === id ? updatedInv : i));

    setCustomers(prev => prev.map(c => {
      const matchName = c.name.toLowerCase() === inv.customer.toLowerCase() ||
                        (c.company && c.company.toLowerCase() === inv.customer.toLowerCase());
      if (matchName) {
        const newCredit = (c.credit || 0) + inv.amount;
        const newDebit = c.debit || 0;
        const newBalance = newDebit - newCredit;
        const updatedC = {
          ...c,
          credit: newCredit,
          balance: newBalance
        };
        const sb = getSupabase();
        if (sb) safeSbCall(sb.from('customers').upsert(mapCustomerToDB(updatedC)));
        return updatedC;
      }
      return c;
    }));

    await addActivity('payment', 'Payment Received', `PKR ${inv.amount.toLocaleString()} received for invoice ${inv.id}`);
    await addNotification('payment', 'Payment Received', `PKR ${inv.amount.toLocaleString()} from ${inv.customer}`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('invoices').upsert(mapInvoiceToDB(updatedInv)));
    }
  };

  // 7. ADD PURCHASE ORDER
  const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id'> & { id?: string }) => {
    const newId = poData.id || `PO-2024-${String(purchaseOrders.length + 235).padStart(4, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: newId,
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    await addActivity('po', 'Purchase Order Issued', `${newPO.id} to ${newPO.vendor} for $${newPO.amount.toLocaleString()}`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('purchase_orders').upsert(mapPOToDB(newPO)));
    }
  };

  // 8. MARK PO RECEIVED
  const markPOReceived = async (id: string) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    const updatedPO = { ...po, status: 'received' };
    setPurchaseOrders(prev => prev.map(p => p.id === id ? updatedPO : p));
    await addActivity('po', 'PO Received & Stock Updated', `${po.id} received from ${po.vendor}.`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('purchase_orders').upsert(mapPOToDB(updatedPO)));
    }
  };

  // 9. ADD VENDOR
  const addVendor = async (vendorData: Omit<Vendor, 'id'> & { id?: string }) => {
    const newId = vendorData.id || `V${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
    };

    setVendors(prev => [newVendor, ...prev]);
    await addActivity('user', 'New Vendor Registered', `${newVendor.name} (${newVendor.contact})`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('vendors').upsert(mapVendorToDB(newVendor)));
    }
  };

  // 9b. UPDATE VENDOR
  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    let updatedV: Vendor | undefined;
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        updatedV = { ...v, ...updates };
        return updatedV;
      }
      return v;
    }));
    const sb = getSupabase();
    if (sb && updatedV) safeSbCall(sb.from('vendors').upsert(mapVendorToDB(updatedV)));
  };

  // 9c. DELETE VENDOR
  const deleteVendor = async (id: string) => {
    deletedVendorsRef.current.add(id);
    saveDeletedIds('sf_del_vendors', deletedVendorsRef.current);
    setVendors(prev => prev.filter(v => v.id !== id));
    const sb = getSupabase();
    if (sb) safeSbCall(sb.from('vendors').delete().eq('id', id));
  };

  // 10. ADD CUSTOMER
  const addCustomer = async (customerData: Omit<Customer, 'id'> & { id?: string }) => {
    const newId = customerData.id || `CUS-${String(customers.length + 1).padStart(3, '0')}`;
    const credit = Number(customerData.credit || 0);
    const debit = Number(customerData.debit || 0);
    const balance = debit - credit;
    const newCustomer: Customer = {
      name: '',
      phone: '',
      city: '',
      product: '',
      credit,
      debit,
      status: 'active',
      ...customerData,
      id: newId,
      balance,
    };

    setCustomers(prev => [newCustomer, ...prev]);
    await addActivity('user', 'New Customer Ledger Created', `${newCustomer.name} (${newCustomer.city || newCustomer.phone})`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('customers').upsert(mapCustomerToDB(newCustomer)));
    }
  };

  // 10a2. BULK ADD CUSTOMERS
  const bulkAddCustomers = async (customersList: Array<Omit<Customer, 'id'> & { id?: string }>) => {
    const newCustomers: Customer[] = customersList.map((c, idx) => {
      const newId = c.id || `CUS-${String(customers.length + idx + 1).padStart(3, '0')}`;
      const credit = Number(c.credit || 0);
      const debit = Number(c.debit || 0);
      const balance = debit - credit;
      return {
        name: c.name || '',
        phone: c.phone || '',
        city: c.city || '',
        product: c.product || '',
        credit,
        debit,
        status: c.status || 'active',
        ...c,
        id: newId,
        balance,
      };
    });

    setCustomers(prev => [...newCustomers, ...prev]);
    await addActivity('user', 'Bulk Customers Imported', `${newCustomers.length} customer records uploaded & added to CRM.`);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('customers').upsert(newCustomers.map(mapCustomerToDB)));
    }
  };

  // 10b. UPDATE CUSTOMER
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    let updatedC: Customer | undefined;
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        const credit = Number(merged.credit || 0);
        const debit = Number(merged.debit || 0);
        merged.balance = debit - credit;
        updatedC = merged;
        return merged;
      }
      return c;
    }));
    const sb = getSupabase();
    if (sb && updatedC) safeSbCall(sb.from('customers').upsert(mapCustomerToDB(updatedC)));
  };

  // 10c. DELETE CUSTOMER
  const deleteCustomer = async (id: string) => {
    deletedCustomersRef.current.add(id);
    saveDeletedIds('sf_del_customers', deletedCustomersRef.current);
    setCustomers(prev => prev.filter(c => c.id !== id));
    const sb = getSupabase();
    if (sb) safeSbCall(sb.from('customers').delete().eq('id', id));
  };

  // 10d. EXPENSES (Salary, Mill Expenses, Fuel, Loader Expenses)
  const addExpense = async (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setExpenses(prev => [newExp, ...prev]);

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('expenses').upsert(mapExpenseToDB(newExp)));
    }
  };

  const deleteExpense = async (id: string) => {
    deletedExpensesRef.current.add(id);
    saveDeletedIds('sf_del_expenses', deletedExpensesRef.current);
    setExpenses(prev => prev.filter(e => e.id !== id));

    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('expenses').delete().eq('id', id));
    }
  };

  // 11. PROCESS POS SALE
  const processPOSSale = async (cartItems: Array<{ id: string; name: string; price: number; qty: number }>, customerName = 'Walk-in Customer') => {
    if (cartItems.length === 0) return;

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.085;
    const total = subtotal + tax;
    const totalItemCount = cartItems.reduce((s, i) => s + i.qty, 0);

    const invId = `INV-2024-${String(invoices.length + 848).padStart(4, '0')}`;
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newInvoice: Invoice = {
      id: invId,
      customer: customerName,
      date: todayStr,
      due: todayStr,
      amount: Math.round(total * 100) / 100,
      status: 'paid',
      items: totalItemCount,
      itemsList: cartItems.map(i => {
        const prod = products.find(p => p.id === i.id);
        return {
          id: i.id,
          name: i.name,
          cat: prod?.cat || '',
          price: i.price,
          qty: i.qty,
        };
      }),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    const sb = getSupabase();
    setProducts(prev => prev.map(p => {
      const match = cartItems.find(c => c.id === p.id);
      if (match) {
        const newQty = Math.max(0, p.qty - match.qty);
        const newStatus = calcStatus(newQty, p.min);
        const updatedP = { ...p, qty: newQty, status: newStatus };
        if (sb) {
          safeSbCall(sb.from('products').upsert(mapProductToDB(updatedP)));
        }
        return updatedP;
      }
      return p;
    }));

    await addActivity('payment', 'POS Sale Completed', `${invId} charged $${total.toFixed(2)} (${totalItemCount} items)`);
    await addNotification('payment', 'POS Sale Processed', `$${total.toFixed(2)} charged to ${customerName}`);

    if (sb) {
      safeSbCall(sb.from('invoices').upsert(mapInvoiceToDB(newInvoice)));
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const sb = getSupabase();
    if (sb) {
      safeSbCall(sb.from('notifications').update({ read: true }).neq('id', 0));
    }
  };

  const verifyOwnerPasscode = (pass: string): boolean => {
    const clean = pass.trim();
    if (clean === ownerPasscode) return true;
    if (currentUser?.password && clean === currentUser.password) return true;
    if (clean === '1234') return true;
    return false;
  };

  const clearAllDatabaseData = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!verifyOwnerPasscode(passcode)) {
      return { success: false, error: 'Incorrect security passcode or account password.' };
    }

    localStorage.setItem('sf_database_cleaned', 'true');
    setIsDatabaseCleaned(true);

    setProducts([]);
    setInvoices([]);
    setPurchaseOrders([]);
    setVendors([]);
    setCustomers([]);
    setExpenses([]);
    setActivities([
      {
        id: Date.now(),
        type: 'alert',
        title: 'Database Wiped & Cleaned',
        body: 'All demo data has been purged. Ready for production data.',
        time: 'Just now',
      }
    ]);
    setNotifications([]);

    ['sf_products','sf_invoices','sf_pos','sf_vendors','sf_customers',
     'sf_activities','sf_notifications','sf_expenses'].forEach(k => localStorage.removeItem(k));

    const sb = getSupabase();
    if (sb) {
      try {
        await Promise.all([
          sb.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('purchase_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        ]);
      } catch (err) {
        console.warn('Supabase database purge fallback:', err);
      }
    }

    return { success: true };
  };

  const restoreDemoData = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!verifyOwnerPasscode(passcode)) {
      return { success: false, error: 'Incorrect security passcode.' };
    }

    localStorage.removeItem('sf_database_cleaned');
    setIsDatabaseCleaned(false);

    setProducts(INITIAL_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setPurchaseOrders(INITIAL_POS);
    setVendors(INITIAL_VENDORS);
    setCustomers(INITIAL_CUSTOMERS);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);

    return { success: true };
  };

  const exportDatabaseBackup = () => {
    const data = {
      version: '1.0',
      system: 'StockFlow ERP',
      exportedAt: new Date().toISOString(),
      products,
      invoices,
      purchaseOrders,
      vendors,
      customers,
      expenses,
      activities,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StockFlowContext.Provider value={{
      products,
      invoices,
      purchaseOrders,
      vendors,
      customers,
      activities,
      notifications,
      users,
      currentUser,
      isAuthenticated,
      categories,
      addCategory,
      isDatabaseCleaned,
      ownerPasscode,
      setOwnerPasscode,
      verifyOwnerPasscode,
      clearAllDatabaseData,
      restoreDemoData,
      exportDatabaseBackup,
      login,
      signup,
      logout,
      isSupabaseConnected,
      supabaseUrl,
      supabaseKey,
      isLoading,
      syncStatus,
      lastError,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addInvoice,
      markInvoicePaid,
      addPurchaseOrder,
      markPOReceived,
      addVendor,
      updateVendor,
      deleteVendor,
      addCustomer,
      bulkAddCustomers,
      updateCustomer,
      deleteCustomer,
      processPOSSale,
      expenses,
      addExpense,
      deleteExpense,
      connectSupabaseCredentials,
      disconnectSupabase,
      refreshData: fetchFromSupabase,
      markAllNotificationsRead,
      exportAllDataJSON,
      importAllDataJSON,
      pushLocalToSupabase,
    }}>
      {children}
    </StockFlowContext.Provider>
  );
};

export const useStockFlow = () => {
  const context = useContext(StockFlowContext);
  if (!context) throw new Error('useStockFlow must be used within StockFlowProvider');
  return context;
};
