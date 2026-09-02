export interface CloudDatabaseData {
  products: any[];
  invoices: any[];
  purchaseOrders: any[];
  vendors: any[];
  customers: any[];
  activities: any[];
  notifications: any[];
  expenses: any[];
  categories: string[];
  users: any[];
  updatedAt?: number;
}

const CLOUD_DB_ID = 'ff8081819f7e10ae019fe32a155e1300';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_ID}`;

export async function fetchCloudData(): Promise<CloudDatabaseData | null> {
  try {
    const res = await fetch(CLOUD_DB_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('Cloud DB fetch error:', err);
    return null;
  }
}

export async function saveCloudData(data: CloudDatabaseData): Promise<boolean> {
  try {
    const payload = {
      name: 'StockFlow Production DB',
      data: {
        ...data,
        updatedAt: Date.now(),
      },
    };
    const res = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud DB save error:', err);
    return false;
  }
}
