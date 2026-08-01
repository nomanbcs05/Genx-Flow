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

// No mock data — app always starts clean on every device
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_POS: PurchaseOrder[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

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

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sf_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('sf_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('sf_pos');
    return saved ? JSON.parse(saved) : [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('sf_vendors');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('sf_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('sf_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sf_notifications');
    return saved ? JSON.parse(saved) : [];
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
    return saved ? JSON.parse(saved) : ["Wheat", "Floor", "Flour / Atta", "Fine / Maida", "Electronics", "Furniture", "Stationery", "Accessories"];
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

  // Automatic legacy mock data purge to guarantee 100% real database start
  useEffect(() => {
    const isCleaned = localStorage.getItem('sf_clean_v3');
    if (!isCleaned) {
      localStorage.setItem('sf_products', JSON.stringify([]));
      localStorage.setItem('sf_invoices', JSON.stringify([]));
      localStorage.setItem('sf_pos', JSON.stringify([]));
      localStorage.setItem('sf_vendors', JSON.stringify([]));
      localStorage.setItem('sf_customers', JSON.stringify([]));
      localStorage.setItem('sf_activities', JSON.stringify([]));
      localStorage.setItem('sf_notifications', JSON.stringify([]));
      localStorage.setItem('sf_clean_v3', 'true');
      setProducts([]);
      setInvoices([]);
      setPurchaseOrders([]);
      setVendors([]);
      setCustomers([]);
      setActivities([]);
      setNotifications([]);
    }
  }, []);

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

      // 8. Users
      const { data: uData } = await sb.from('users').select('*');
      if (uData && uData.length > 0) {
        setUsers(uData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          company: u.company,
        })));
      }

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

  // Realtime Supabase channel & auto-sync polling across mobile and laptop devices
  useEffect(() => {
    if (!isSupabaseConnected) return;

    const handleFocus = () => {
      fetchFromSupabase().catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => {
      fetchFromSupabase().catch(() => {});
    }, 10000); // 10s background sync across devices

    // Supabase Realtime channel subscription
    const sb = getSupabase();
    let channel: any = null;
    if (sb) {
      try {
        channel = sb.channel('stockflow-realtime-sync')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            fetchFromSupabase().catch(() => {});
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      if (channel && sb) {
        sb.removeChannel(channel);
      }
    };
  }, [isSupabaseConnected, supabaseUrl, supabaseKey]);

  // Export All ERP & Customer Ledger Data to portable JSON file string
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
    };
    return JSON.stringify(backupObj, null, 2);
  };

  // Import Portable Data JSON (Syncs to localStorage and Supabase if connected)
  const importAllDataJSON = async (jsonStr: string): Promise<{ success: boolean; error?: string; count?: number }> => {
    try {
      const data = JSON.parse(jsonStr);
      let restoredCount = 0;

      if (Array.isArray(data.products)) { setProducts(data.products); restoredCount += data.products.length; }
      if (Array.isArray(data.invoices)) { setInvoices(data.invoices); restoredCount += data.invoices.length; }
      if (Array.isArray(data.purchaseOrders)) { setPurchaseOrders(data.purchaseOrders); restoredCount += data.purchaseOrders.length; }
      if (Array.isArray(data.vendors)) { setVendors(data.vendors); restoredCount += data.vendors.length; }
      if (Array.isArray(data.customers)) { setCustomers(data.customers); restoredCount += data.customers.length; }
      if (Array.isArray(data.activities)) setActivities(data.activities);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (Array.isArray(data.categories)) setCategories(data.categories);

      // If Supabase is connected, push imported records to cloud database
      const sb = getSupabase();
      if (sb) {
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          await sb.from('customers').upsert(data.customers).catch(() => {});
        }
        if (Array.isArray(data.vendors) && data.vendors.length > 0) {
          await sb.from('vendors').upsert(data.vendors).catch(() => {});
        }
        if (Array.isArray(data.products) && data.products.length > 0) {
          await sb.from('products').upsert(data.products).catch(() => {});
        }
        if (Array.isArray(data.invoices) && data.invoices.length > 0) {
          await sb.from('invoices').upsert(data.invoices).catch(() => {});
        }
      }

      await addActivity('system', 'System Data Backup Restored', `Restored ${restoredCount} records from backup JSON`);
      return { success: true, count: restoredCount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid backup JSON file' };
    }
  };

  // Push local data to Supabase database
  const pushLocalToSupabase = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    const sb = getSupabase();
    if (!sb) return { success: false, error: 'Supabase cloud database is not connected' };

    try {
      let count = 0;
      if (customers.length > 0) {
        const { error } = await sb.from('customers').upsert(customers);
        if (!error) count += customers.length;
      }
      if (vendors.length > 0) {
        const { error } = await sb.from('vendors').upsert(vendors);
        if (!error) count += vendors.length;
      }
      if (products.length > 0) {
        const { error } = await sb.from('products').upsert(products);
        if (!error) count += products.length;
      }
      if (invoices.length > 0) {
        const { error } = await sb.from('invoices').upsert(invoices);
        if (!error) count += invoices.length;
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

    // Automatically update customer ledger in CRM if customer exists
    setCustomers(prev => prev.map(c => {
      const matchName = c.name.toLowerCase() === newInvoice.customer.toLowerCase() ||
                        (c.company && c.company.toLowerCase() === newInvoice.customer.toLowerCase());
      if (matchName) {
        const newDebit = (c.debit || 0) + newInvoice.amount;
        const newCredit = c.credit || 0;
        const newBalance = newDebit - newCredit;
        const newSpend = (c.spend || 0) + newInvoice.amount;
        const newOrders = (c.orders || 0) + 1;
        return {
          ...c,
          debit: newDebit,
          balance: newBalance,
          spend: newSpend,
          orders: newOrders
        };
      }
      return c;
    }));

    await addActivity('order', 'New Invoice Created', `${newInvoice.id} issued to ${newInvoice.customer} for PKR ${newInvoice.amount.toLocaleString()}`);

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

    // Update customer credit & balance upon receiving payment
    setCustomers(prev => prev.map(c => {
      const matchName = c.name.toLowerCase() === inv.customer.toLowerCase() ||
                        (c.company && c.company.toLowerCase() === inv.customer.toLowerCase());
      if (matchName) {
        const newCredit = (c.credit || 0) + inv.amount;
        const newDebit = c.debit || 0;
        const newBalance = newDebit - newCredit;
        return {
          ...c,
          credit: newCredit,
          balance: newBalance
        };
      }
      return c;
    }));

    await addActivity('payment', 'Payment Received', `PKR ${inv.amount.toLocaleString()} received for invoice ${inv.id}`);
    await addNotification('payment', 'Payment Received', `PKR ${inv.amount.toLocaleString()} from ${inv.customer}`);

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
      await sb.from('customers').insert(newCustomer);
    }
  };

  // 10b. UPDATE CUSTOMER
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        const credit = Number(merged.credit || 0);
        const debit = Number(merged.debit || 0);
        merged.balance = debit - credit;
        return merged;
      }
      return c;
    }));
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
