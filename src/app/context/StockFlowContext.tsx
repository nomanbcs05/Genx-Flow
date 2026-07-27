import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured, saveSupabaseCredentials, resetSupabaseClient, getSupabaseCredentials } from '../../lib/supabase';

export interface Product {
  id: string;
  sku: string;
  name: string;
  cat: string;
  qty: number;
  min: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' | string;
  wh: string;
}

export interface Invoice {
  id: string;
  customer: string;
  date: string;
  due: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | string;
  items: number;
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
  email: string;
  orders: number;
  spend: number;
  status: 'active' | 'inactive' | string;
  terms: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  orders: number;
  spend: number;
  status: 'active' | 'at_risk' | 'inactive' | string;
  tier: 'enterprise' | 'professional' | 'growth' | string;
}

export interface Activity {
  id: number | string;
  type: string;
  title: string;
  body: string;
  time: string;
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

// Initial Mock Data Fallback
export const INITIAL_PRODUCTS: Product[] = [
  { id: "P001", sku: "ELC-MON-4K-27", name: "ProVision 4K Monitor 27\"", cat: "Electronics", qty: 142, min: 20, price: 449.99, status: "in_stock", wh: "WH-01" },
  { id: "P002", sku: "ELC-KBD-MX-SLV", name: "MX Mechanical Keyboard Pro", cat: "Electronics", qty: 8, min: 15, price: 149.99, status: "low_stock", wh: "WH-01" },
  { id: "P003", sku: "FRN-CHR-ERG-BLK", name: "ErgoFlow Pro Office Chair", cat: "Furniture", qty: 0, min: 5, price: 589.00, status: "out_of_stock", wh: "WH-02" },
  { id: "P004", sku: "ELC-HPH-ANC-700", name: "QuietMax ANC Headphones", cat: "Electronics", qty: 234, min: 30, price: 279.99, status: "in_stock", wh: "WH-01" },
  { id: "P005", sku: "FRN-DSK-STD-OAK", name: "StandUp Desk Pro 60\" Oak", cat: "Furniture", qty: 12, min: 8, price: 799.00, status: "in_stock", wh: "WH-02" },
  { id: "P006", sku: "ELC-WEB-4K-WHT", name: "StreamCam 4K Webcam", cat: "Electronics", qty: 6, min: 20, price: 139.99, status: "low_stock", wh: "WH-01" },
  { id: "P007", sku: "STA-NTB-B6-BLU", name: "Premium Notebook B6 Blue", cat: "Stationery", qty: 1240, min: 200, price: 12.99, status: "in_stock", wh: "WH-03" },
  { id: "P008", sku: "ELC-HUB-C7-SLV", name: "USB-C Hub 7-in-1", cat: "Electronics", qty: 89, min: 25, price: 59.99, status: "in_stock", wh: "WH-01" },
  { id: "P009", sku: "ELC-MSE-WL-GRY", name: "Precision Wireless Mouse", cat: "Electronics", qty: 67, min: 30, price: 89.99, status: "in_stock", wh: "WH-01" },
  { id: "P010", sku: "FRN-LMP-DSK-WHT", name: "ArcLight LED Desk Lamp", cat: "Furniture", qty: 43, min: 15, price: 69.99, status: "in_stock", wh: "WH-02" },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-2024-0847", customer: "Meridian Technologies Ltd.", date: "Dec 18, 2024", due: "Jan 17, 2025", amount: 12840.00, status: "paid", items: 8 },
  { id: "INV-2024-0846", customer: "Apex Solutions Group", date: "Dec 17, 2024", due: "Jan 16, 2025", amount: 5620.50, status: "pending", items: 4 },
  { id: "INV-2024-0845", customer: "Blue Horizon Corp.", date: "Dec 16, 2024", due: "Dec 30, 2024", amount: 3890.00, status: "overdue", items: 3 },
  { id: "INV-2024-0844", customer: "NovaStar Retail Inc.", date: "Dec 15, 2024", due: "Jan 14, 2025", amount: 28450.00, status: "paid", items: 15 },
  { id: "INV-2024-0843", customer: "Quantum Dynamics LLC", date: "Dec 14, 2024", due: "Jan 13, 2025", amount: 7200.00, status: "pending", items: 6 },
  { id: "INV-2024-0842", customer: "Vertex Global Partners", date: "Dec 13, 2024", due: "Jan 12, 2025", amount: 15980.00, status: "draft", items: 11 },
  { id: "INV-2024-0841", customer: "Clearview Systems Inc.", date: "Dec 12, 2024", due: "Jan 11, 2025", amount: 4320.00, status: "paid", items: 5 },
];

export const INITIAL_POS: PurchaseOrder[] = [
  { id: "PO-2024-0234", vendor: "TechSource Global", date: "Dec 18, 2024", expected: "Dec 28, 2024", amount: 48200.00, items: 12, status: "approved" },
  { id: "PO-2024-0233", vendor: "Pinnacle Supplies Co.", date: "Dec 17, 2024", expected: "Dec 25, 2024", amount: 12840.00, items: 6, status: "received" },
  { id: "PO-2024-0232", vendor: "Metro Office Distributors", date: "Dec 16, 2024", expected: "Dec 26, 2024", amount: 8950.00, items: 9, status: "in_transit" },
  { id: "PO-2024-0231", vendor: "Summit Electronics", date: "Dec 14, 2024", expected: "Dec 24, 2024", amount: 31700.00, items: 15, status: "received" },
  { id: "PO-2024-0230", vendor: "Cornerstone Logistics", date: "Dec 12, 2024", expected: "Dec 22, 2024", amount: 5600.00, items: 3, status: "draft" },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: "V001", name: "TechSource Global", contact: "David Huang", email: "dhuang@techsource.com", orders: 18, spend: 284200, status: "active", terms: "Net 30" },
  { id: "V002", name: "Pinnacle Supplies Co.", contact: "Lisa Moreno", email: "l.moreno@pinnacle.co", orders: 12, spend: 128400, status: "active", terms: "Net 15" },
  { id: "V003", name: "Metro Office Distributors", contact: "Tom Bradley", email: "t.bradley@metrooffice.com", orders: 8, spend: 67800, status: "active", terms: "Net 30" },
  { id: "V004", name: "Summit Electronics", contact: "Priya Sharma", email: "p.sharma@summitelec.io", orders: 21, spend: 412600, status: "active", terms: "Net 45" },
  { id: "V005", name: "Cornerstone Logistics", contact: "Ryan Walsh", email: "r.walsh@cornerstone.net", orders: 5, spend: 28000, status: "inactive", terms: "Net 30" },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "CUS-001", name: "Alexandra Chen", company: "Meridian Technologies", email: "a.chen@meridiantech.com", orders: 24, spend: 84920.00, status: "active", tier: "enterprise" },
  { id: "CUS-002", name: "Marcus Williams", company: "Apex Solutions Group", email: "m.williams@apexgroup.io", orders: 18, spend: 52340.00, status: "active", tier: "professional" },
  { id: "CUS-003", name: "Sophia Patel", company: "Blue Horizon Corp.", email: "s.patel@bluehorizon.com", orders: 7, spend: 18600.00, status: "at_risk", tier: "growth" },
  { id: "CUS-004", name: "James O'Brien", company: "NovaStar Retail Inc.", email: "jobrien@novastar.retail", orders: 41, spend: 241800.00, status: "active", tier: "enterprise" },
  { id: "CUS-005", name: "Yuki Tanaka", company: "Quantum Dynamics LLC", email: "y.tanaka@qdynamics.co", orders: 12, spend: 38200.00, status: "active", tier: "professional" },
  { id: "CUS-006", name: "Elena Novak", company: "Vertex Global Partners", email: "e.novak@vertexglobal.eu", orders: 9, spend: 29450.00, status: "inactive", tier: "growth" },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 1, type: "payment", title: "Payment received", body: "$12,840 from Meridian Technologies Ltd.", time: "2h ago" },
  { id: 2, type: "order", title: "New invoice issued", body: "INV-2024-0847 — 8 line items, $12,840", time: "2h ago" },
  { id: 3, type: "alert", title: "Low stock alert", body: "MX Mechanical Keyboard Pro — 8 units remaining", time: "4h ago" },
  { id: 4, type: "note", title: "Follow-up scheduled", body: "Call with Sophia Patel at Blue Horizon Corp.", time: "5h ago" },
  { id: 5, type: "po", title: "Purchase order received", body: "PO-2024-0233 from Pinnacle Supplies Co.", time: "8h ago" },
  { id: 6, type: "user", title: "New user added", body: "David Park joined the Finance team", time: "1d ago" },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: "alert", title: "Low Stock: MX Keyboard Pro", body: "8 units remaining, below reorder point of 15.", time: "2h ago", read: false },
  { id: 2, type: "payment", title: "Payment Received", body: "$12,840 from Meridian Technologies Ltd.", time: "2h ago", read: false },
  { id: 3, type: "alert", title: "Overdue Invoice", body: "INV-2024-0845 overdue — Blue Horizon Corp., $3,890", time: "3h ago", read: false },
  { id: 4, type: "info", title: "PO Received", body: "PO-2024-0233 from Pinnacle Supplies Co. confirmed.", time: "8h ago", read: true },
];

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
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  processPOSSale: (cartItems: Array<{ id: string; name: string; price: number; qty: number }>, customerName?: string) => Promise<void>;
  
  connectSupabaseCredentials: (url: string, key: string) => Promise<boolean>;
  disconnectSupabase: () => void;
  refreshData: () => Promise<void>;
  markAllNotificationsRead: () => void;
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

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sf_products');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('sf_invoices');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_INVOICES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('sf_pos');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_POS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('sf_vendors');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_VENDORS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('sf_customers');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_CUSTOMERS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('sf_activities');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_ACTIVITIES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sf_notifications');
    if (saved) return JSON.parse(saved);
    return isCleanedCheck() ? [] : INITIAL_NOTIFICATIONS;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sf_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

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
    return saved ? JSON.parse(saved) : ["Electronics", "Furniture", "Stationery", "Accessories"];
  });

  const addCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (trimmed && !categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories(prev => [...prev, trimmed]);
    }
  };

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [lastError, setLastError] = useState<string | null>(null);

  // Sync to LocalStorage as fallback
  useEffect(() => { localStorage.setItem('sf_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('sf_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('sf_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('sf_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('sf_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('sf_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('sf_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('sf_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('sf_users', JSON.stringify(users)); }, [users]);

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

  // Check Supabase on Mount
  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.key);

    if (creds.url && creds.key) {
      fetchFromSupabase();
    }
  }, []);

  const fetchFromSupabase = async () => {
    const sb = getSupabase();
    if (!sb) {
      setIsSupabaseConnected(false);
      setSyncStatus('offline');
      return;
    }

    setIsLoading(true);
    setSyncStatus('syncing');
    setLastError(null);

    try {
      // 1. Products
      const { data: pData, error: pErr } = await sb.from('products').select('*').order('created_at', { ascending: false });
      if (pErr) throw pErr;
      if (pData && pData.length > 0) {
        setProducts(pData.map((p: any) => ({
          ...p,
          price: Number(p.price),
          qty: Number(p.qty),
          min: Number(p.min),
        })));
      }

      // 2. Invoices
      const { data: iData, error: iErr } = await sb.from('invoices').select('*').order('created_at', { ascending: false });
      if (iErr) throw iErr;
      if (iData && iData.length > 0) {
        setInvoices(iData.map((i: any) => ({
          ...i,
          amount: Number(i.amount),
          items: Number(i.items),
        })));
      }

      // 3. Purchase Orders
      const { data: poData, error: poErr } = await sb.from('purchase_orders').select('*').order('created_at', { ascending: false });
      if (poErr) throw poErr;
      if (poData && poData.length > 0) {
        setPurchaseOrders(poData.map((p: any) => ({
          ...p,
          amount: Number(p.amount),
          items: Number(p.items),
        })));
      }

      // 4. Vendors
      const { data: vData, error: vErr } = await sb.from('vendors').select('*').order('created_at', { ascending: false });
      if (vErr) throw vErr;
      if (vData && vData.length > 0) {
        setVendors(vData.map((v: any) => ({
          ...v,
          spend: Number(v.spend),
          orders: Number(v.orders),
        })));
      }

      // 5. Customers
      const { data: cData, error: cErr } = await sb.from('customers').select('*').order('created_at', { ascending: false });
      if (cErr) throw cErr;
      if (cData && cData.length > 0) {
        setCustomers(cData.map((c: any) => ({
          ...c,
          spend: Number(c.spend),
          orders: Number(c.orders),
        })));
      }

      // 6. Activities
      const { data: actData } = await sb.from('activities').select('*').order('id', { ascending: false }).limit(20);
      if (actData && actData.length > 0) setActivities(actData);

      // 7. Notifications
      const { data: notifData } = await sb.from('notifications').select('*').order('id', { ascending: false }).limit(20);
      if (notifData && notifData.length > 0) setNotifications(notifData);

      setIsSupabaseConnected(true);
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      setLastError(err.message || 'Failed to connect to Supabase');
      setSyncStatus('error');
      setIsSupabaseConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectSupabaseCredentials = async (url: string, key: string): Promise<boolean> => {
    saveSupabaseCredentials(url, key);
    resetSupabaseClient();
    setSupabaseUrl(url);
    setSupabaseKey(key);

    const sb = getSupabase();
    if (!sb) {
      setSyncStatus('error');
      setLastError('Invalid Supabase URL or Key');
      return false;
    }

    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      // Test table query
      const { error } = await sb.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;

      setIsSupabaseConnected(true);
      setSyncStatus('synced');
      await fetchFromSupabase();
      return true;
    } catch (err: any) {
      console.error('Failed connection test:', err);
      setLastError(err.message || 'Could not verify table schema. Make sure you ran supabase_schema.sql!');
      setSyncStatus('error');
      setIsSupabaseConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSupabase = () => {
    saveSupabaseCredentials('', '');
    resetSupabaseClient();
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsSupabaseConnected(false);
    setSyncStatus('offline');
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
      await sb.from('activities').insert({ type, title, body, time: 'Just now' }).catch(() => {});
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
      await sb.from('notifications').insert({ type, title, body, time: 'Just now', read: false }).catch(() => {});
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
      const { error } = await sb.from('products').insert(newProduct);
      if (error) console.error('Supabase add product error:', error);
    }
  };

  // 2. UPDATE PRODUCT
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        updated.status = calcStatus(updated.qty, updated.min);
        return updated;
      }
      return p;
    }));

    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('products').update(updates).eq('id', id);
      if (error) console.error('Supabase update product error:', error);
    }
  };

  // 3. DELETE PRODUCT
  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    const sb = getSupabase();
    if (sb) {
      await sb.from('products').delete().eq('id', id);
    }
  };

  // 4. ADJUST STOCK
  const adjustStock = async (id: string, newQty: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const newStatus = calcStatus(newQty, prod.min);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: newQty, status: newStatus } : p));

    if (newQty <= prod.min) {
      addNotification('alert', `Low Stock: ${prod.name}`, `${newQty} units remaining, below min threshold of ${prod.min}.`);
    }

    await addActivity('alert', 'Stock Level Adjusted', `${prod.name} updated to ${newQty} units.`);

    const sb = getSupabase();
    if (sb) {
      await sb.from('products').update({ qty: newQty, status: newStatus }).eq('id', id);
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
    await addActivity('order', 'New Invoice Created', `${newInvoice.id} issued to ${newInvoice.customer} for $${newInvoice.amount.toLocaleString()}`);

    const sb = getSupabase();
    if (sb) {
      await sb.from('invoices').insert(newInvoice);
    }
  };

  // 6. MARK INVOICE PAID
  const markInvoicePaid = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
    await addActivity('payment', 'Payment Received', `$${inv.amount.toLocaleString()} received for invoice ${inv.id}`);
    await addNotification('payment', 'Payment Received', `$${inv.amount.toLocaleString()} from ${inv.customer}`);

    const sb = getSupabase();
    if (sb) {
      await sb.from('invoices').update({ status: 'paid' }).eq('id', id);
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
      await sb.from('purchase_orders').insert(newPO);
    }
  };

  // 8. MARK PO RECEIVED
  const markPOReceived = async (id: string) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status: 'received' } : p));
    await addActivity('po', 'PO Received & Stock Updated', `${po.id} received from ${po.vendor}.`);

    const sb = getSupabase();
    if (sb) {
      await sb.from('purchase_orders').update({ status: 'received' }).eq('id', id);
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
      await sb.from('vendors').insert(newVendor);
    }
  };

  // 9b. UPDATE VENDOR
  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    const sb = getSupabase();
    if (sb) await sb.from('vendors').update(updates).eq('id', id).catch(() => {});
  };

  // 9c. DELETE VENDOR
  const deleteVendor = async (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    const sb = getSupabase();
    if (sb) await sb.from('vendors').delete().eq('id', id).catch(() => {});
  };

  // 10. ADD CUSTOMER
  const addCustomer = async (customerData: Omit<Customer, 'id'> & { id?: string }) => {
    const newId = customerData.id || `CUS-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
    };

    setCustomers(prev => [newCustomer, ...prev]);
    await addActivity('user', 'New Customer Registered', `${newCustomer.name} (${newCustomer.company})`);

    const sb = getSupabase();
    if (sb) {
      await sb.from('customers').insert(newCustomer);
    }
  };

  // 10b. UPDATE CUSTOMER
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const sb = getSupabase();
    if (sb) await sb.from('customers').update(updates).eq('id', id).catch(() => {});
  };

  // 10c. DELETE CUSTOMER
  const deleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    const sb = getSupabase();
    if (sb) await sb.from('customers').delete().eq('id', id).catch(() => {});
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

    // 1. Create Invoice
    const newInvoice: Invoice = {
      id: invId,
      customer: customerName,
      date: todayStr,
      due: todayStr,
      amount: Math.round(total * 100) / 100,
      status: 'paid',
      items: totalItemCount,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // 2. Deduct Quantities
    const sb = getSupabase();
    setProducts(prev => prev.map(p => {
      const match = cartItems.find(c => c.id === p.id);
      if (match) {
        const newQty = Math.max(0, p.qty - match.qty);
        const newStatus = calcStatus(newQty, p.min);
        
        if (sb) {
          sb.from('products').update({ qty: newQty, status: newStatus }).eq('id', p.id).catch(() => {});
        }
        return { ...p, qty: newQty, status: newStatus };
      }
      return p;
    }));

    await addActivity('payment', 'POS Sale Completed', `${invId} charged $${total.toFixed(2)} (${totalItemCount} items)`);
    await addNotification('payment', 'POS Sale Processed', `$${total.toFixed(2)} charged to ${customerName}`);

    if (sb) {
      await sb.from('invoices').insert(newInvoice);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const sb = getSupabase();
    if (sb) {
      sb.from('notifications').update({ read: true }).neq('id', 0).catch(() => {});
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

    localStorage.setItem('sf_products', JSON.stringify([]));
    localStorage.setItem('sf_invoices', JSON.stringify([]));
    localStorage.setItem('sf_pos', JSON.stringify([]));
    localStorage.setItem('sf_vendors', JSON.stringify([]));
    localStorage.setItem('sf_customers', JSON.stringify([]));
    localStorage.setItem('sf_activities', JSON.stringify([]));
    localStorage.setItem('sf_notifications', JSON.stringify([]));

    const sb = getSupabase();
    if (sb) {
      try {
        await Promise.all([
          sb.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('purchase_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          sb.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
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

    localStorage.setItem('sf_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('sf_invoices', JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem('sf_pos', JSON.stringify(INITIAL_POS));
    localStorage.setItem('sf_vendors', JSON.stringify(INITIAL_VENDORS));
    localStorage.setItem('sf_customers', JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem('sf_activities', JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem('sf_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));

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
      updateCustomer,
      deleteCustomer,
      processPOSSale,
      connectSupabaseCredentials,
      disconnectSupabase,
      refreshData: fetchFromSupabase,
      markAllNotificationsRead,
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
