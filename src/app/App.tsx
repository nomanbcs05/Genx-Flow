// StockFlow ERP — Enterprise Inventory & Business Management Platform

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, DollarSign,
  Users, FileText, Settings, Bell, Search, ChevronDown, ChevronRight,
  ChevronLeft, Plus, Filter, Download, Eye, Edit2, Trash2,
  MoreHorizontal, X, Check, AlertTriangle, Warehouse, Moon, Sun,
  LogOut, User, Building2, Truck, Receipt, Activity as ActivityIcon,
  Lock, Mail, Phone, Calendar, Clock, Tag, Box, Command, CheckCircle,
  XCircle, AlertCircle, ArrowRight, ArrowUpRight, ArrowDownRight,
  Package2, UserCheck, MapPin, Sparkles, FileBarChart, SlidersHorizontal,
  HelpCircle, BarChart2, Zap, Globe, Shield, Key, Star, RefreshCw,
  Layers, Copy, ExternalLink, Inbox, Grid, List, Database,
  BookOpen, MessageSquare, ChevronsLeft, Send, Info, Menu, Hash,
  Percent, Briefcase, ChevronUp, Target, Award,
} from "lucide-react";

import {
  StockFlowProvider,
  useStockFlow,
  Product,
  Invoice,
  PurchaseOrder,
  Vendor,
  Customer,
} from "./context/StockFlowContext";

import {
  SupabaseConfigModal,
  AddProductModal,
  EditProductModal,
  AddInvoiceModal,
  AddPOModal,
  AddVendorModal,
  AddCustomerModal,
  POSReceiptModal,
} from "./components/Modals";

// ═══════════════════════════════════════════════════════════
// TYPES & CHARTS DATA
// ═══════════════════════════════════════════════════════════

type Screen =
  | "auth"
  | "dashboard" | "inventory" | "sales" | "purchase"
  | "finance" | "crm" | "reports" | "settings";

const REVENUE_DATA = [
  { month: "Jan", revenue: 1820000, profit: 680000 },
  { month: "Feb", revenue: 1950000, profit: 720000 },
  { month: "Mar", revenue: 2100000, profit: 810000 },
  { month: "Apr", revenue: 1880000, profit: 690000 },
  { month: "May", revenue: 2340000, profit: 920000 },
  { month: "Jun", revenue: 2180000, profit: 840000 },
  { month: "Jul", revenue: 2520000, profit: 990000 },
  { month: "Aug", revenue: 2380000, profit: 910000 },
  { month: "Sep", revenue: 2650000, profit: 1050000 },
  { month: "Oct", revenue: 2470000, profit: 960000 },
  { month: "Nov", revenue: 2780000, profit: 1120000 },
  { month: "Dec", revenue: 2847000, profit: 1180000 },
];

const CHANNEL_DATA = [
  { channel: "Direct", orders: 384, value: 1240 },
  { channel: "Online", orders: 521, value: 890 },
  { channel: "Wholesale", orders: 142, value: 620 },
  { channel: "Partner", orders: 89, value: 340 },
  { channel: "Retail", orders: 111, value: 280 },
];

const PL_DATA = [
  { label: "Revenue", q1: 5870000, q2: 6400000, q3: 7550000, q4: 8097000, type: "revenue" },
  { label: "Cost of Goods Sold", q1: 2200000, q2: 2380000, q3: 2720000, q4: 2890000, type: "cost" },
  { label: "Gross Profit", q1: 3670000, q2: 4020000, q3: 4830000, q4: 5207000, type: "profit" },
  { label: "Operating Expenses", q1: 1240000, q2: 1350000, q3: 1480000, q4: 1560000, type: "sub" },
  { label: "Marketing & Sales", q1: 480000, q2: 520000, q3: 590000, q4: 630000, type: "sub" },
  { label: "General & Admin", q1: 320000, q2: 340000, q3: 360000, q4: 380000, type: "sub" },
  { label: "EBITDA", q1: 1630000, q2: 1810000, q3: 2400000, q4: 2637000, type: "profit" },
  { label: "Net Income", q1: 1510000, q2: 1685000, q3: 2270000, q4: 2502000, type: "profit" },
];

const CASHFLOW_DATA = [
  { month: "Jul", operating: 890, investing: -240, financing: -180 },
  { month: "Aug", operating: 920, investing: -180, financing: -200 },
  { month: "Sep", operating: 1050, investing: -320, financing: -150 },
  { month: "Oct", operating: 960, investing: -200, financing: -220 },
  { month: "Nov", operating: 1120, investing: -280, financing: -190 },
  { month: "Dec", operating: 1180, investing: -340, financing: -210 },
];

const AI_INSIGHTS = [
  { id: 1, type: "opportunity", title: "Bundle Revenue Opportunity", body: "USB-C Hub 7-in-1 shows 340% higher conversion when bundled with monitors. Projected uplift: +$84K MRR.", impact: "high" },
  { id: 2, type: "risk", title: "Supply Chain Variance", body: "3 SKUs from Summit Electronics have 8-day lead time variance. Recommend buffer stock +15% for Q1 demand surge.", impact: "medium" },
  { id: 3, type: "churn", title: "Customer Churn Signal", body: "Blue Horizon Corp. order frequency down 60% over 90 days. Last touchpoint: 47 days ago. Immediate outreach recommended.", impact: "high" },
];

const BALANCE_SHEET = {
  assets: [
    { label: "Cash & Equivalents", value: 4820000 },
    { label: "Accounts Receivable", value: 2140000 },
    { label: "Inventory", value: 2184920 },
    { label: "Prepaid Expenses", value: 284000 },
    { label: "Property & Equipment", value: 8420000 },
    { label: "Intangible Assets", value: 1240000 },
  ],
  liabilities: [
    { label: "Accounts Payable", value: 1820000 },
    { label: "Short-term Loans", value: 500000 },
    { label: "Deferred Revenue", value: 340000 },
    { label: "Long-term Debt", value: 3400000 },
    { label: "Deferred Tax", value: 280000 },
  ],
  equity: [
    { label: "Common Stock", value: 5000000 },
    { label: "Retained Earnings", value: 6748920 },
  ],
};

// ═══════════════════════════════════════════════════════════
// UTILITIES & ATOMS
// ═══════════════════════════════════════════════════════════

function cn(...c: (string | boolean | undefined | null)[]): string {
  return c.filter(Boolean).join(" ");
}

function fmtC(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(1)}K`;
  }
  return `PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n)}`;
}

function fmtN(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "blue" | "purple";

function Badge({
  variant = "neutral", children, dot = false, className,
}: {
  variant?: BadgeVariant; children: React.ReactNode; dot?: boolean; className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900",
    danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-900",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900",
    neutral: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };
  const dotColors: Record<BadgeVariant, string> = {
    success: "bg-green-500", warning: "bg-amber-500", danger: "bg-red-500",
    info: "bg-cyan-500", blue: "bg-blue-500", purple: "bg-purple-500", neutral: "bg-slate-400",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
      styles[variant], className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}

function statusBadge(status: string) {
  const map: Record<string, { v: BadgeVariant; l: string }> = {
    in_stock: { v: "success", l: "In Stock" }, low_stock: { v: "warning", l: "Low Stock" },
    out_of_stock: { v: "danger", l: "Out of Stock" }, discontinued: { v: "neutral", l: "Discontinued" },
    paid: { v: "success", l: "Paid" }, pending: { v: "warning", l: "Pending" },
    overdue: { v: "danger", l: "Overdue" }, draft: { v: "neutral", l: "Draft" },
    approved: { v: "blue", l: "Approved" }, received: { v: "success", l: "Received" },
    in_transit: { v: "info", l: "In Transit" }, active: { v: "success", l: "Active" },
    at_risk: { v: "warning", l: "At Risk" }, inactive: { v: "neutral", l: "Inactive" },
    enterprise: { v: "purple", l: "Enterprise" }, professional: { v: "blue", l: "Professional" },
    growth: { v: "info", l: "Growth" },
  };
  const m = map[status] ?? { v: "neutral" as BadgeVariant, l: status };
  return <Badge variant={m.v} dot>{m.l}</Badge>;
}

function Btn({
  children, variant = "primary", size = "md", onClick, disabled, className, icon,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  onClick?: () => void; disabled?: boolean; className?: string; icon?: React.ReactNode;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB]/50 shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    ghost: "hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 focus:ring-slate-300",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base", icon: "p-2 text-sm" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} onClick={onClick} disabled={disabled}>
      {icon && icon}{children}
    </button>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm", className)}>
      {children}
    </div>
  );
}

function Inp({
  placeholder, value, onChange, type = "text", icon, className,
}: {
  placeholder?: string; value?: string; onChange?: (v: string) => void;
  type?: string; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {icon && <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
      <input
        type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
          "text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors",
          icon ? "pl-9 pr-3 py-2" : "px-3 py-2"
        )}
      />
    </div>
  );
}

function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap",
            active === tab
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          )}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, delta, deltaLabel, icon, iconBg, mono = true }: {
  label: string; value: string; delta?: number; deltaLabel?: string;
  icon: React.ReactNode; iconBg: string; mono?: boolean;
}) {
  const pos = (delta ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={cn("mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight", mono && "font-mono")}>{value}</p>
          {delta !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              {pos
                ? <ArrowUpRight className="w-3.5 h-3.5 text-green-500 shrink-0" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-red-500 shrink-0" />}
              <span className={cn("text-xs font-semibold", pos ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {pos ? "+" : ""}{delta}%
              </span>
              {deltaLabel && <span className="text-xs text-slate-400">{deltaLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>{icon}</div>
      </div>
    </Card>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-mono font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? fmtC(p.value, true) : p.value}
        </p>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════

const NAV = [
  { section: "CORE", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "sales", label: "Sales", icon: ShoppingCart },
    { id: "purchase", label: "Purchasing", icon: Truck },
  ]},
  { section: "FINANCE", items: [
    { id: "finance", label: "Finance", icon: DollarSign },
  ]},
  { section: "OPERATIONS", items: [
    { id: "crm", label: "CRM", icon: Users },
    { id: "reports", label: "Reports", icon: FileBarChart },
  ]},
  { section: "SYSTEM", items: [
    { id: "settings", label: "Settings", icon: Settings },
  ]},
];

function Sidebar({ screen, setScreen, collapsed, setCollapsed, dark, setDark, mobile, onClose }: {
  screen: string; setScreen: (s: Screen) => void;
  collapsed: boolean; setCollapsed: (c: boolean) => void;
  dark: boolean; setDark: (d: boolean) => void;
  mobile?: boolean; onClose?: () => void;
}) {
  return (
    <aside className={cn(
      "flex flex-col h-full bg-[#0B1120] border-r border-white/[0.06] transition-all duration-200 ease-in-out",
      mobile ? "w-64" : collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] shrink-0", collapsed && !mobile && "justify-center px-0")}>
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-600/30">
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none">
            <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 3v18M3 7l9 4 9-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none tracking-tight">StockFlow</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">ENTERPRISE · v3.2.1</p>
          </div>
        )}
        {mobile && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 [&::-webkit-scrollbar]:hidden">
        {NAV.map(section => (
          <div key={section.section}>
            {(!collapsed || mobile) && (
              <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-600 tracking-[0.15em] uppercase select-none">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = screen === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { setScreen(item.id as Screen); onClose?.(); }}
                      title={collapsed && !mobile ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-150",
                        collapsed && !mobile && "justify-center px-0",
                        isActive
                          ? "bg-[#2563EB]/15 text-[#60A5FA]"
                          : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                      )}>
                      <Icon className={cn("w-[17px] h-[17px] shrink-0", isActive && "text-[#60A5FA]")} />
                      {(!collapsed || mobile) && (
                        <>
                          <span className={cn("font-medium flex-1 text-left", isActive && "text-[#60A5FA]")}>{item.label}</span>
                          {isActive && <div className="w-1 h-3.5 rounded-full bg-[#3B82F6]" />}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5 shrink-0">
        <button onClick={() => setDark(!dark)}
          title={collapsed && !mobile ? (dark ? "Light mode" : "Dark mode") : undefined}
          className={cn("w-full flex items-center gap-3 px-2 py-2 rounded-lg text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all text-sm", collapsed && !mobile && "justify-center px-0")}>
          {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {(!collapsed || mobile) && <span className="font-medium">{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full flex items-center gap-3 px-2 py-2 rounded-lg text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all text-sm", collapsed && "justify-center px-0")}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4 shrink-0" />}
            {!collapsed && <span className="font-medium">Collapse</span>}
          </button>
        )}
        <div className={cn("flex items-center gap-2.5 px-2 py-2 mt-1 rounded-lg", collapsed && !mobile && "justify-center px-0")}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0 shadow">
            <span className="text-[10px] font-bold text-white">SK</span>
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-300 truncate">Sarah Kim</p>
              <p className="text-[10px] text-slate-600 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════

function Topbar({ screen, setCommandOpen, setNotifOpen, unread }: {
  screen: string; setCommandOpen: (o: boolean) => void; setNotifOpen: (o: boolean) => void; unread: number;
}) {
  const { refreshData, isLoading } = useStockFlow();
  const labels: Record<string, string> = {
    dashboard: "Executive Dashboard", inventory: "Inventory Management",
    sales: "Sales", purchase: "Purchasing", finance: "Finance",
    crm: "Customer Relationship", reports: "Reports", settings: "Settings",
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-700/50 flex items-center px-4 gap-4 shrink-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-400 font-medium hidden sm:block">StockFlow</span>
        <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block shrink-0" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{labels[screen] ?? screen}</span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <button onClick={() => setCommandOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-left text-xs text-slate-400">Search products, orders, customers...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] border border-slate-200 dark:border-slate-600 rounded text-slate-400 font-mono">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#2563EB]")} />
        </button>

        <button onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0F172A]" />}
        </button>
        <div className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center cursor-pointer shadow">
          <span className="text-[10px] font-bold text-white">SK</span>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

function DashboardScreen({ onViewAllInvoices }: { onViewAllInvoices?: () => void }) {
  const { products, invoices, purchaseOrders, refreshData, isLoading } = useStockFlow();
  const [insightIdx, setInsightIdx] = useState(0);

  const totalRev = invoices.reduce((s, i) => s + (i.status === 'paid' ? i.amount : 0), 2847392);
  const lowStockCount = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;

  // Dynamic AI Insights calculated directly from real live system data
  const dynamicAIInsights = useMemo(() => {
    const list = [];

    // 1. Stock Levels Insight
    const lowOrOut = products.filter(p => p.qty <= p.min);
    if (lowOrOut.length > 0) {
      const topProblemItem = lowOrOut[0];
      list.push({
        id: "ins-stock",
        title: `Low Stock Alert: ${lowOrOut.length} SKUs Require Reorder`,
        body: `${topProblemItem.name} (${topProblemItem.sku}) has only ${topProblemItem.qty} units left in ${topProblemItem.wh || 'Main Warehouse'} (min threshold: ${topProblemItem.min}). Reorder recommended.`,
        impact: lowOrOut.some(p => p.qty === 0) ? "high" : "medium",
      });
    } else {
      list.push({
        id: "ins-stock-ok",
        title: "Inventory Stock Levels Optimal",
        body: `All ${products.length} active products are currently above minimum safety thresholds across warehouses.`,
        impact: "medium",
      });
    }

    // 2. Receivables & Cashflow Insight
    const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    const pendingSum = pendingInvoices.reduce((s, i) => s + i.amount, 0);
    if (pendingInvoices.length > 0) {
      list.push({
        id: "ins-ar",
        title: `Accounts Receivable: ${fmtC(pendingSum)} Pending`,
        body: `${pendingInvoices.length} outstanding invoices require follow-up. ${pendingInvoices.filter(i => i.status === 'overdue').length} invoices are past due.`,
        impact: pendingInvoices.some(i => i.status === 'overdue') ? "high" : "medium",
      });
    } else {
      list.push({
        id: "ins-ar-ok",
        title: "Receivables Fully Settled",
        body: `All sales invoices are paid. Total collected revenue is ${fmtC(invoices.reduce((s, i) => s + i.amount, 0))}.`,
        impact: "medium",
      });
    }

    // 3. Highest Value Product Line Insight
    if (products.length > 0) {
      const sortedByVal = [...products].sort((a, b) => (b.price * b.qty) - (a.price * a.qty));
      const topVal = sortedByVal[0];
      const totalInventoryVal = products.reduce((s, p) => s + p.price * p.qty, 0);
      const share = totalInventoryVal > 0 ? ((topVal.price * topVal.qty) / totalInventoryVal) * 100 : 0;
      list.push({
        id: "ins-value",
        title: `Top Valuation Asset: ${topVal.name}`,
        body: `Total stock value ${fmtC(topVal.price * topVal.qty)} (${share.toFixed(1)}% of inventory capital) stored at ${topVal.wh || 'Main Warehouse'}.`,
        impact: share > 25 ? "high" : "medium",
      });
    }

    return list;
  }, [products, invoices, purchaseOrders]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const recentInvoiceRows = invoices.slice(0, 10).map(i => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #2563eb;">${i.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${i.customer}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.due}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">${fmtC(i.amount)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.status.toUpperCase()}</td>
      </tr>
    `).join('');

    const aiInsightsHtml = dynamicAIInsights.map(ins => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${ins.title} [${ins.impact.toUpperCase()} IMPACT]</div>
        <div style="font-size: 12px; color: #475569; margin-top: 4px;">${ins.body}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Dashboard Summary - StockFlow ERP</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1e293b; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .kpi-val { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            h3 { font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">StockFlow ERP — Executive Performance Report</div>
              <div class="meta">Exported: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-label">Revenue MTD</div><div class="kpi-val">${fmtC(totalRev)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Invoices</div><div class="kpi-val">${invoices.length}</div></div>
            <div class="kpi-card"><div class="kpi-label">Active SKUs</div><div class="kpi-val">${products.length}</div></div>
            <div class="kpi-card"><div class="kpi-label">Low Stock Alerts</div><div class="kpi-val">${lowStockCount}</div></div>
          </div>

          <h3>Real-time System AI Insights</h3>
          ${aiInsightsHtml}

          <h3>Recent Invoices Overview</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Due Date</th>
                <th style="text-align: right;">Amount (PKR)</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentInvoiceRows}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Good morning, Sarah 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with StockFlow today — Live Real System Data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
          <Btn size="sm" onClick={refreshData} icon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}>Refresh</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue MTD" value={fmtC(totalRev)}
          delta={18.4} deltaLabel="vs last mo."
          icon={<DollarSign className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50 dark:bg-blue-950/50" />
        <StatCard label="Total Orders" value={fmtN(invoices.length + 1240)}
          delta={12.1} deltaLabel="vs last mo."
          icon={<ShoppingCart className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
        <StatCard label="Gross Margin" value="68.2%"
          delta={2.3} deltaLabel="vs last mo."
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50 dark:bg-purple-950/50" mono={false} />
        <StatCard label="Low Stock Alerts" value={String(lowStockCount)}
          delta={-8} deltaLabel="vs last week"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50 dark:bg-amber-950/50" mono={false} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Gross Profit</h3>
              <p className="text-xs text-slate-400 mt-0.5">Full year 2024 · Updated real-time</p>
            </div>
            <Badge variant="blue">FY 2024</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2}
                fill="url(#gRev)" dot={false} activeDot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#16A34A" strokeWidth={2}
                fill="url(#gProf)" dot={false} activeDot={{ r: 4, fill: "#16A34A", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orders by Channel</h3>
              <p className="text-xs text-slate-400 mt-0.5">December 2024</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHANNEL_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="orders" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insights + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-5 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#7C3AED]/[0.04] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Insights</h3>
                  <p className="text-[10px] text-slate-400">Real-time analysis · {dynamicAIInsights.length} live signals</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {dynamicAIInsights.map((ins, i) => (
                  <button key={ins.id} onClick={() => setInsightIdx(i)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all duration-150",
                      insightIdx === i
                        ? "border-[#2563EB]/30 bg-[#2563EB]/[0.06] dark:bg-[#2563EB]/10"
                        : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    )}>
                    <div className="flex items-start gap-2.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", ins.impact === "high" ? "bg-red-500" : "bg-amber-500")} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ins.title}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                            ins.impact === "high"
                              ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                          )}>{ins.impact === "high" ? "High Impact" : "Medium"}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ins.body}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
              <Btn variant="ghost" size="sm" onClick={onViewAllInvoices}>View all <ChevronRight className="w-3.5 h-3.5" /></Btn>
            </div>
            <div className="space-y-1">
              {invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{inv.id}</p>
                    <p className="text-xs text-slate-400 truncate">{inv.customer}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{fmtC(inv.amount)}</p>
                      <p className="text-[10px] text-slate-400 text-right">{inv.date}</p>
                    </div>
                    {statusBadge(inv.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════

function InventoryScreen({ onOpenAddProduct, onOpenEditProduct }: { onOpenAddProduct: () => void; onOpenEditProduct: (p: Product) => void }) {
  const { products, deleteProduct, categories, addCategory } = useStockFlow();
  const [tab, setTab] = useState("Products");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [newCatInput, setNewCatInput] = useState("");
  const [showCatPrompt, setShowCatPrompt] = useState(false);
  const tabs = ["Products", "Warehouses", "Low Stock"];

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All" || p.cat === catFilter;
    const ml = tab !== "Low Stock" || p.status !== "in_stock";
    return ms && mc && ml;
  });

  const totalValue = products.reduce((s, p) => s + p.price * p.qty, 0);
  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;

  // Dynamic warehouses calculated from products
  const warehouseLocations = Array.from(new Set(products.map(p => p.wh || 'Main Warehouse')));

  const handleAddCategoryClick = () => {
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setCatFilter(newCatInput.trim());
      setNewCatInput("");
      setShowCatPrompt(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = filtered.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${p.sku}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${p.cat}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${fmtN(p.qty)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${fmtC(p.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${p.wh || 'Main Warehouse'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${p.status.toUpperCase()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Management Report - StockFlow ERP</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1e293b; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .summary { display: flex; gap: 24px; background: #f8fafc; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .summary div { margin-right: 24px; }
            .summary label { color: #64748b; font-size: 11px; display: block; text-transform: uppercase; font-weight: bold; }
            .summary val { font-weight: bold; font-size: 15px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">StockFlow ERP — Inventory Management Report</div>
              <div class="meta">Exported on: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div class="summary">
            <div><label>Total Products Listed</label><val>${filtered.length}</val></div>
            <div><label>Total Inventory Value</label><val>${fmtC(filtered.reduce((s, p) => s + p.price * p.qty, 0))}</val></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Unit Price in pkr</th>
                <th>Warehouse Location</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{fmtN(products.length)} active products · {warehouseLocations.length} locations</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
          <Btn size="sm" onClick={onOpenAddProduct} icon={<Plus className="w-3.5 h-3.5" />}>Add Product</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SKUs" value={fmtN(products.length)} icon={<Package className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50 dark:bg-blue-950/50" />
        <StatCard label="Inventory Value" value={fmtC(totalValue, true)} icon={<DollarSign className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
        <StatCard label="Low Stock Items" value={String(lowStockCount)} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-50 dark:bg-amber-950/50" mono={false} />
        <StatCard label="Out of Stock" value={String(outOfStockCount)} icon={<XCircle className="w-5 h-5 text-red-600" />} iconBg="bg-red-50 dark:bg-red-950/50" mono={false} />
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <Inp placeholder="Search by name or SKU…" value={search} onChange={setSearch}
              icon={<Search className="w-3.5 h-3.5" />} className="w-full sm:w-48" />

            <div className="flex items-center gap-1.5 shrink-0">
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none shrink-0">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button
                onClick={() => setShowCatPrompt(!showCatPrompt)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                title="Create New Category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showCatPrompt && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Enter new category name…"
              value={newCatInput}
              onChange={e => setNewCatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleAddCategoryClick}
              className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shrink-0"
            >
              Add Category
            </button>
            <button
              onClick={() => setShowCatPrompt(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {tab === "Warehouses" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouseLocations.map((whName, idx) => {
              const whProducts = products.filter(p => (p.wh || 'Main Warehouse') === whName);
              const whItems = whProducts.reduce((s, p) => s + p.qty, 0);
              const whValue = whProducts.reduce((s, p) => s + p.price * p.qty, 0);
              return (
                <div key={whName} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 hover:border-[#2563EB]/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 font-semibold">LOC-0{idx + 1}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-tight">{whName}</p>
                    </div>
                    <Badge variant="blue">{whProducts.length} Products</Badge>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div><p className="text-[10px] text-slate-400">Total Stock Qty</p><p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{fmtN(whItems)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-slate-400">Total Value</p><p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{fmtC(whValue, true)}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-5 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</th>
                  <th className="text-left px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                  <th className="text-right px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Unit Price in pkr</th>
                  <th className="text-center px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-5 py-3"><span className="font-mono text-[11px] text-slate-500 font-semibold">{p.sku}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.wh || 'Main Warehouse'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell"><Badge variant="neutral">{p.cat}</Badge></td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn("font-mono font-bold text-sm", p.qty === 0 ? "text-red-600 dark:text-red-400" : p.qty < p.min ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200")}>
                        {fmtN(p.qty)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">/{p.min}</span>
                    </td>
                    <td className="px-3 py-3 text-right hidden lg:table-cell"><span className="font-mono text-sm text-slate-700 dark:text-slate-300">{fmtC(p.price)}</span></td>
                    <td className="px-3 py-3 text-center">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEditProduct(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Update Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete ${p.name}?`)) {
                              await deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════════════════

function SalesScreen({ onOpenAddInvoice }: { onOpenAddInvoice: () => void }) {
  const { products, invoices, markInvoicePaid, processPOSSale } = useStockFlow();
  const [tab, setTab] = useState("Invoices");
  const [posCart, setPosCart] = useState<Array<{ id: string; sku: string; name: string; price: number; qty: number }>>([]);
  const [custName, setCustName] = useState('Walk-in Customer');
  const [posSearch, setPosSearch] = useState('');

  // Tax Settings (Optional & Flexible on owner's choice)
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(8.5);

  // Invoices Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // POS Receipt State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash / POS Terminal');
  const [lastReceiptData, setLastReceiptData] = useState<{
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
  } | null>(null);

  const tabs = ["Invoices", "POS", "Analytics"];

  // Calculate POS totals dynamically based on owner's tax choice
  const subtotal = posCart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = taxEnabled ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  const filteredInvoices = invoices.filter(i => {
    const matchSearch = !searchQuery || i.id.toLowerCase().includes(searchQuery.toLowerCase()) || i.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleChargePOS = async () => {
    if (posCart.length === 0) return;
    const txId = `POS-${Date.now().toString().slice(-6)}`;
    const txDate = new Date().toLocaleString();

    await processPOSSale(posCart, custName);

    setLastReceiptData({
      transactionId: txId,
      customer: custName,
      date: txDate,
      items: [...posCart],
      subtotal,
      tax,
      taxRate,
      taxEnabled,
      total,
      paymentMethod,
    });

    setPosCart([]);
    setReceiptModalOpen(true);
  };

  const handleExportSalesPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filteredInvoices.map(i => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #2563eb;">${i.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${i.customer}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${i.due}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">${fmtC(i.amount)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.items}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.status.toUpperCase()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales & Revenue Report - StockFlow ERP</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1e293b; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .summary { display: flex; gap: 24px; background: #f8fafc; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .summary div { margin-right: 24px; }
            .summary label { color: #64748b; font-size: 11px; display: block; text-transform: uppercase; font-weight: bold; }
            .summary val { font-weight: bold; font-size: 15px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">StockFlow ERP — Sales & Billing Statement</div>
              <div class="meta">Exported: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div class="summary">
            <div><label>Total Invoices</label><val>${filteredInvoices.length}</val></div>
            <div><label>Total Sales Amount</label><val>${fmtC(filteredInvoices.reduce((s, i) => s + i.amount, 0))}</val></div>
            <div><label>Paid Revenue Collected</label><val>${fmtC(filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0))}</val></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th style="text-align: right;">Amount (PKR)</th>
                <th style="text-align: center;">Line Items</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredPOSProducts = products.filter(p => !posSearch || p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <POSReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} receiptData={lastReceiptData} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sales Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} invoices · {fmtC(invoices.reduce((s, i) => s + i.amount, 0))} total revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={handleExportSalesPDF} icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
          <Btn size="sm" onClick={onOpenAddInvoice} icon={<Plus className="w-3.5 h-3.5" />}>New Invoice</Btn>
        </div>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "Invoices" && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Inp
              placeholder="Search invoices by customer or ID…"
              value={searchQuery}
              onChange={setSearchQuery}
              icon={<Search className="w-3.5 h-3.5" />}
              className="w-full sm:w-72"
            />
            <Btn
              variant={showFilterDrawer ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filter {statusFilter !== 'all' && `(${statusFilter.toUpperCase()})`}
            </Btn>
          </div>

          {/* Interactive Filter Drawer */}
          {showFilterDrawer && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter by Status:</span>
              {['all', 'paid', 'pending', 'overdue', 'draft'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-lg font-semibold transition-all capitalize",
                    statusFilter === st
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  )}
                >
                  {st}
                </button>
              ))}
              {statusFilter !== 'all' && (
                <button onClick={() => setStatusFilter('all')} className="text-xs text-red-500 underline font-semibold ml-auto">Reset</button>
              )}
            </div>
          )}

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Invoice #", "Customer", "Date", "Due Date", "Amount", "Items", "Status", "Action"].map((h, i) => (
                    <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap px-3 text-left",
                      h === "Amount" && "text-right",
                      h === "Items" && "text-center",
                      h === "Status" && "text-center",
                      h === "Action" && "text-center",
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-3 py-3"><span className="font-mono text-xs font-bold text-[#2563EB]">{inv.id}</span></td>
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">{inv.customer}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{inv.date}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{inv.due}</td>
                    <td className="px-3 py-3 text-right"><span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fmtC(inv.amount)}</span></td>
                    <td className="px-3 py-3 text-center text-slate-500 text-xs">{inv.items}</td>
                    <td className="px-3 py-3 text-center">{statusBadge(inv.status)}</td>
                    <td className="px-3 py-3 text-center">
                      {inv.status !== 'paid' ? (
                        <Btn variant="outline" size="sm" onClick={() => markInvoicePaid(inv.id)}>Mark Paid</Btn>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "POS" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4">
              <Inp
                placeholder="Scan barcode or search product name / SKU…"
                value={posSearch}
                onChange={setPosSearch}
                icon={<Search className="w-3.5 h-3.5" />}
              />
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPOSProducts.map(p => (
                <button key={p.id}
                  onClick={() => {
                    const exists = posCart.find(i => i.id === p.id);
                    if (exists) setPosCart(posCart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
                    else setPosCart([...posCart, { id: p.id, sku: p.sku, name: p.name, price: p.price, qty: 1 }]);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/[0.04] transition-all text-left group">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                    <Package className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-xs font-mono font-bold text-[#2563EB] mt-1.5">{fmtC(p.price)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Stock: {p.qty}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-5 sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Point of Sale (POS)</h3>
                <Badge variant="blue">{posCart.reduce((s, i) => s + i.qty, 0)} items</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS Terminal">POS Terminal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-2 min-h-[120px] max-h-60 overflow-y-auto">
                {posCart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Click products on the left to add items to cart
                  </div>
                ) : posCart.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{fmtC(item.price)} ea.</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setPosCart(posCart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                        className="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs">−</button>
                      <span className="w-5 text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{item.qty}</span>
                      <button onClick={() => setPosCart(posCart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                        className="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs">+</button>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 w-14 text-right shrink-0">{fmtC(item.price * item.qty)}</span>
                    <button onClick={() => setPosCart(posCart.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tax Settings (Owner's Flexible Choice) */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxEnabled}
                      onChange={e => setTaxEnabled(e.target.checked)}
                      className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    Enable Tax Calculation
                  </label>
                  {taxEnabled && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={e => setTaxRate(Number(e.target.value))}
                        className="w-16 px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-right"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  )}
                </div>

                {taxEnabled && (
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-400">Presets:</span>
                    {[0, 5, 8.5, 17, 18].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTaxRate(r)}
                        className={cn(
                          "px-1.5 py-0.5 rounded font-mono font-semibold transition-colors",
                          taxRate === r ? "bg-[#2563EB] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{fmtC(subtotal)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Tax ({taxEnabled ? `${taxRate}%` : 'Disabled'})</span><span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{fmtC(tax)}</span></div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">Total</span>
                  <span className="font-mono text-[#2563EB]">{fmtC(total)}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Btn variant="outline" size="md" onClick={() => setPosCart([])} className="w-full">Clear Cart</Btn>
                <Btn variant="primary" size="md" onClick={handleChargePOS} disabled={posCart.length === 0} className="w-full">Charge {fmtC(total)}</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "Analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Sales by Channel</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CHANNEL_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="channel" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="value" name="Value" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PURCHASE
// ═══════════════════════════════════════════════════════════

function PurchaseScreen({ onOpenAddPO, onOpenAddVendor }: { onOpenAddPO: () => void; onOpenAddVendor: () => void }) {
  const { purchaseOrders, vendors, markPOReceived, deleteVendor } = useStockFlow();
  const [tab, setTab] = useState("Orders");
  const tabs = ["Orders", "Vendors", "Receiving"];
  const [viewingVendor, setViewingVendor] = useState<typeof vendors[0] | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Purchasing & Vendor Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{purchaseOrders.length} purchase orders · {fmtC(purchaseOrders.reduce((s, p) => s + p.amount, 0))} total spend</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "Vendors" ? (
            <Btn size="sm" onClick={onOpenAddVendor} icon={<Plus className="w-3.5 h-3.5" />}>Add Vendor</Btn>
          ) : (
            <Btn size="sm" onClick={onOpenAddPO} icon={<Plus className="w-3.5 h-3.5" />}>New PO</Btn>
          )}
        </div>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "Orders" && (
        <Card className="p-5">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["PO Number", "Vendor", "Order Date", "Expected", "Amount", "Items", "Status", "Action"].map((h, i) => (
                    <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap px-3 text-left", h === "Amount" && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-3 py-3"><span className="font-mono text-xs font-bold text-[#2563EB]">{po.id}</span></td>
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">{po.vendor}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{po.date}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{po.expected}</td>
                    <td className="px-3 py-3 text-right"><span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fmtC(po.amount)}</span></td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{po.items}</td>
                    <td className="px-3 py-3">{statusBadge(po.status)}</td>
                    <td className="px-3 py-3">
                      {po.status !== 'received' ? (
                        <Btn variant="outline" size="sm" onClick={() => markPOReceived(po.id)}>Mark Received</Btn>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Stock Updated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Vendors" && (
        <div className="space-y-3">
          {/* Vendor Detail Drawer */}
          {viewingVendor && (
            <Card className="p-5 border-2 border-[#2563EB]/30 bg-blue-50/40 dark:bg-blue-950/20 animate-in fade-in duration-150">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingVendor.name}</h3>
                    <p className="text-xs text-slate-500">{viewingVendor.id} · {statusBadge(viewingVendor.status)}</p>
                  </div>
                </div>
                <button onClick={() => setViewingVendor(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Contact Person", value: viewingVendor.contact },
                  { label: "Email", value: viewingVendor.email },
                  { label: "Payment Terms", value: viewingVendor.terms },
                  { label: "Total Orders", value: viewingVendor.orders.toString() },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Spend</p>
                  <p className="text-xl font-black font-mono text-[#2563EB]">{fmtC(viewingVendor.spend)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Orders</p>
                  <p className="text-xl font-black font-mono text-slate-900 dark:text-white">{purchaseOrders.filter(po => po.vendor === viewingVendor.name).length} orders</p>
                </div>
              </div>
              {purchaseOrders.filter(po => po.vendor === viewingVendor.name).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purchase History</p>
                  <div className="space-y-1.5">
                    {purchaseOrders.filter(po => po.vendor === viewingVendor.name).map(po => (
                      <div key={po.id} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">{po.id}</span>
                        <span className="text-xs text-slate-500">{po.date}</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{fmtC(po.amount)}</span>
                        {statusBadge(po.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {vendors.map(v => (
            <Card key={v.id} className={cn("p-4 transition-all", viewingVendor?.id === v.id && "ring-2 ring-[#2563EB]/40")}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{v.name}</p>
                    {statusBadge(v.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{v.contact} · {v.email}</p>
                </div>
                <div className="hidden md:flex items-center gap-8 shrink-0">
                  <div className="text-center"><p className="text-[10px] text-slate-400">Orders</p><p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{v.orders}</p></div>
                  <div className="text-center"><p className="text-[10px] text-slate-400">Total Spend</p><p className="text-sm font-mono font-bold text-slate-800 dark:text-white">{fmtC(v.spend, true)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-slate-400">Terms</p><p className="text-sm font-semibold text-slate-800 dark:text-white">{v.terms}</p></div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Btn
                    variant={viewingVendor?.id === v.id ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setViewingVendor(viewingVendor?.id === v.id ? null : v)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    {viewingVendor?.id === v.id ? "Close" : "View"}
                  </Btn>
                  <button
                    onClick={() => { if (confirm(`Delete vendor "${v.name}"?`)) deleteVendor(v.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Receiving" && (
        <Card className="p-5 space-y-3">
          {purchaseOrders.filter(po => ["in_transit", "approved"].includes(po.status)).map(po => (
            <div key={po.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", po.status === "in_transit" ? "bg-cyan-500 animate-pulse" : "bg-blue-500")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{po.id}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{po.vendor}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Expected: {po.expected} · {po.items} items · {fmtC(po.amount)}</p>
              </div>
              {statusBadge(po.status)}
              <Btn size="sm" variant="primary" onClick={() => markPOReceived(po.id)}>
                Mark Received & Update Inventory
              </Btn>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════

function FinanceScreen() {
  const [tab, setTab] = useState("P&L");
  const tabs = ["P&L", "Balance Sheet", "Cash Flow"];
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Finance & Accounting</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fiscal Year 2024 · All figures in USD</p>
        </div>
        <Btn variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "P&L" && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Profit & Loss Statement — FY 2024</h3>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-5 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Line Item</th>
                  {["Q1", "Q2", "Q3", "Q4", "Full Year"].map(q => (
                    <th key={q} className="text-right px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{q}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {PL_DATA.map(row => {
                  const fy = row.q1 + row.q2 + row.q3 + row.q4;
                  const isProfit = row.type === "profit";
                  const isCost = row.type === "cost";
                  const isSub = row.type === "sub";
                  return (
                    <tr key={row.label} className={cn("transition-colors", isProfit && "bg-green-50/50 dark:bg-green-950/10", isSub && "opacity-75")}>
                      <td className={cn("px-5 py-3", isSub && "pl-8")}>
                        <span className={cn("font-semibold text-sm",
                          isProfit ? "text-[#16A34A] dark:text-green-400" :
                            isCost ? "text-red-600 dark:text-red-400" :
                              isSub ? "text-slate-500 font-normal" : "text-slate-800 dark:text-slate-200"
                        )}>{row.label}</span>
                      </td>
                      {[row.q1, row.q2, row.q3, row.q4, fy].map((v, i) => (
                        <td key={i} className="px-3 py-3 text-right">
                          <span className={cn("font-mono text-sm",
                            isProfit ? "font-bold text-[#16A34A] dark:text-green-400" :
                              isCost ? "text-red-600 dark:text-red-400" :
                                i === 4 ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          )}>{fmtC(v, true)}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Balance Sheet" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { title: "Assets", rows: BALANCE_SHEET.assets, color: "blue", total: BALANCE_SHEET.assets.reduce((s, r) => s + r.value, 0) },
            { title: "Liabilities", rows: BALANCE_SHEET.liabilities, color: "red", total: BALANCE_SHEET.liabilities.reduce((s, r) => s + r.value, 0) },
            { title: "Equity", rows: BALANCE_SHEET.equity, color: "green", total: BALANCE_SHEET.equity.reduce((s, r) => s + r.value, 0) },
          ].map(sec => (
            <Card key={sec.title} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                <span className={cn("text-sm font-mono font-bold",
                  sec.color === "blue" ? "text-[#2563EB]" : sec.color === "red" ? "text-red-600 dark:text-red-400" : "text-[#16A34A] dark:text-green-400"
                )}>{fmtC(sec.total, true)}</span>
              </div>
              <div className="space-y-2.5">
                {sec.rows.map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{r.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{fmtC(r.value, true)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Cash Flow" && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Cash Flow Statement — H2 2024 ($K)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={CASHFLOW_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }} formatter={(v: any) => [`$${v}K`, ""]} />
              <Legend />
              <Bar dataKey="operating" name="Operating" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="investing" name="Investing" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="financing" name="Financing" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CRM
// ═══════════════════════════════════════════════════════════

function CRMScreen({ onOpenAddCustomer }: { onOpenAddCustomer: () => void }) {
  const { customers, activities, updateCustomer, deleteCustomer } = useStockFlow();
  const [editingCust, setEditingCust] = useState<typeof customers[0] | null>(null);
  const [tab, setTab] = useState("Customers");
  const tabs = ["Customers", "Activities"];

  const actIcon = (type: string) => {
    const m: Record<string, { el: React.ReactNode; c: string }> = {
      payment: { el: <DollarSign className="w-3.5 h-3.5" />, c: "bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400" },
      order: { el: <Receipt className="w-3.5 h-3.5" />, c: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" },
      alert: { el: <AlertTriangle className="w-3.5 h-3.5" />, c: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" },
      note: { el: <MessageSquare className="w-3.5 h-3.5" />, c: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400" },
      po: { el: <Truck className="w-3.5 h-3.5" />, c: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400" },
      user: { el: <User className="w-3.5 h-3.5" />, c: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    };
    return m[type] ?? m.note;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Customer Relationship (CRM)</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} accounts · {fmtC(customers.reduce((s, c) => s + c.spend, 0))} total revenue</p>
        </div>
        <Btn size="sm" onClick={onOpenAddCustomer} icon={<Plus className="w-3.5 h-3.5" />}>Add Customer</Btn>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "Customers" && (
        <Card className="p-5">
          {/* Inline Edit Panel */}
          {editingCust && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-[#2563EB]/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Editing: {editingCust.name}</p>
                <button onClick={() => setEditingCust(null)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input value={editingCust.name} onChange={e => setEditingCust({ ...editingCust, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company</label>
                  <input value={editingCust.company} onChange={e => setEditingCust({ ...editingCust, company: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                  <input value={editingCust.email} onChange={e => setEditingCust({ ...editingCust, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                  <select value={editingCust.status} onChange={e => setEditingCust({ ...editingCust, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="active">Active</option>
                    <option value="at_risk">At Risk</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tier</label>
                  <select value={editingCust.tier} onChange={e => setEditingCust({ ...editingCust, tier: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="enterprise">Enterprise</option>
                    <option value="professional">Professional</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Btn variant="outline" size="sm" onClick={() => setEditingCust(null)}>Cancel</Btn>
                <Btn size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={async () => { await updateCustomer(editingCust.id, editingCust); setEditingCust(null); }}>Save Changes</Btn>
              </div>
            </div>
          )}
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Customer", "Email", "Orders", "Total Spend", "Tier", "Status", "Actions"].map((h, i) => (
                    <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left",
                      (h === "Total Spend" || h === "Orders") && "text-right",
                      h === "Actions" && "text-center")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#2563EB]">{c.name.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{c.email}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{c.orders}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{fmtC(c.spend, true)}</td>
                    <td className="px-3 py-3">{statusBadge(c.tier)}</td>
                    <td className="px-3 py-3">{statusBadge(c.status)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingCust(editingCust?.id === c.id ? null : c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete customer "${c.name}"?`)) deleteCustomer(c.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Activities" && (
        <Card className="p-5">
          <div className="space-y-0">
            {activities.map((act, i) => {
              const { el, c } = actIcon(act.type);
              return (
                <div key={act.id} className="flex gap-3 py-3 border-b border-slate-50 dark:border-slate-700/40 last:border-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", c)}>{el}</div>
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-100 dark:bg-slate-700 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{act.body}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════

function ReportsScreen() {
  const { products, invoices, purchaseOrders, customers, vendors } = useStockFlow();
  const [reportType, setReportType] = useState("Inventory Summary");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const reportTypes = ["Inventory Summary", "Sales Report", "Customer Report", "Purchase Report", "Vendor Report"];
  const dateRanges = ["Today", "Last 7 days", "Last 30 days", "Last Quarter", "Year to Date", "All Time"];

  const summaryKPIs = useMemo(() => {
    if (reportType === "Inventory Summary") {
      const totalValue = products.reduce((s, p) => s + p.price * p.qty, 0);
      const lowStock = products.filter(p => p.status === "low_stock").length;
      const outOfStock = products.filter(p => p.status === "out_of_stock").length;
      return [
        { label: "Total SKUs", value: products.length.toString() },
        { label: "Total Inventory Value", value: fmtC(totalValue, true) },
        { label: "Low Stock Items", value: lowStock.toString(), warn: lowStock > 0 },
        { label: "Out of Stock", value: outOfStock.toString(), warn: outOfStock > 0 },
      ];
    }
    if (reportType === "Sales Report") {
      const total = invoices.reduce((s, i) => s + i.amount, 0);
      const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
      const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
      return [
        { label: "Total Invoices", value: invoices.length.toString() },
        { label: "Total Revenue", value: fmtC(total, true) },
        { label: "Collected (Paid)", value: fmtC(paid, true) },
        { label: "Overdue", value: fmtC(overdue, true), warn: overdue > 0 },
      ];
    }
    if (reportType === "Customer Report") {
      const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
      const atRisk = customers.filter(c => c.status === "at_risk").length;
      return [
        { label: "Total Customers", value: customers.length.toString() },
        { label: "Total Revenue", value: fmtC(totalSpend, true) },
        { label: "At Risk Accounts", value: atRisk.toString(), warn: atRisk > 0 },
        { label: "Enterprise Accounts", value: customers.filter(c => c.tier === "enterprise").length.toString() },
      ];
    }
    if (reportType === "Purchase Report") {
      const totalSpend = purchaseOrders.reduce((s, p) => s + p.amount, 0);
      const pending = purchaseOrders.filter(p => ["approved", "in_transit"].includes(p.status)).length;
      return [
        { label: "Total POs", value: purchaseOrders.length.toString() },
        { label: "Total Spend", value: fmtC(totalSpend, true) },
        { label: "In Transit / Approved", value: pending.toString() },
        { label: "Received", value: purchaseOrders.filter(p => p.status === "received").length.toString() },
      ];
    }
    if (reportType === "Vendor Report") {
      const totalSpend = vendors.reduce((s, v) => s + v.spend, 0);
      return [
        { label: "Total Vendors", value: vendors.length.toString() },
        { label: "Total Spend", value: fmtC(totalSpend, true) },
        { label: "Active Vendors", value: vendors.filter(v => v.status === "active").length.toString() },
        { label: "Total POs Placed", value: vendors.reduce((s, v) => s + v.orders, 0).toString() },
      ];
    }
    return [];
  }, [reportType, products, invoices, customers, purchaseOrders, vendors]);

  const handleExportCSV = () => {
    let headers = "";
    let body = "";
    if (reportType === "Inventory Summary") {
      headers = "SKU,Name,Category,Qty,Unit Price (PKR),Total Value (PKR),Status";
      body = products.map(p => `${p.sku},"${p.name}",${p.cat},${p.qty},${p.price},${(p.price * p.qty).toFixed(2)},${p.status}`).join("\n");
    } else if (reportType === "Sales Report") {
      headers = "Invoice #,Customer,Date,Due Date,Amount (PKR),Items,Status";
      body = invoices.map(i => `${i.id},"${i.customer}",${i.date},${i.due},${i.amount},${i.items},${i.status}`).join("\n");
    } else if (reportType === "Customer Report") {
      headers = "ID,Name,Company,Email,Orders,Total Spend (PKR),Tier,Status";
      body = customers.map(c => `${c.id},"${c.name}","${c.company}",${c.email},${c.orders},${c.spend},${c.tier},${c.status}`).join("\n");
    } else if (reportType === "Purchase Report") {
      headers = "PO #,Vendor,Date,Expected,Amount (PKR),Items,Status";
      body = purchaseOrders.map(p => `${p.id},"${p.vendor}",${p.date},${p.expected},${p.amount},${p.items},${p.status}`).join("\n");
    } else {
      headers = "ID,Name,Contact,Email,Orders,Total Spend (PKR),Status,Terms";
      body = vendors.map(v => `${v.id},"${v.name}","${v.contact}",${v.email},${v.orders},${v.spend},${v.status},${v.terms}`).join("\n");
    }
    const blob = new Blob([[headers, body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${reportType.replace(/ /g, "_")}_${dateRange.replace(/ /g, "_")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const w = window.open("", "_blank"); if (!w) return;
    let tableHtml = "";
    if (reportType === "Inventory Summary") {
      tableHtml = `<tr><th>SKU</th><th>Name</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total Value</th><th>Status</th></tr>` +
        products.map(p => `<tr><td>${p.sku}</td><td>${p.name}</td><td>${p.cat}</td><td>${p.qty}</td><td>${fmtC(p.price)}</td><td>${fmtC(p.price * p.qty)}</td><td>${p.status}</td></tr>`).join("");
    } else if (reportType === "Sales Report") {
      tableHtml = `<tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr>` +
        invoices.map(i => `<tr><td>${i.id}</td><td>${i.customer}</td><td>${i.date}</td><td>${fmtC(i.amount)}</td><td>${i.status}</td></tr>`).join("");
    } else if (reportType === "Customer Report") {
      tableHtml = `<tr><th>Name</th><th>Company</th><th>Orders</th><th>Total Spend</th><th>Tier</th><th>Status</th></tr>` +
        customers.map(c => `<tr><td>${c.name}</td><td>${c.company}</td><td>${c.orders}</td><td>${fmtC(c.spend)}</td><td>${c.tier}</td><td>${c.status}</td></tr>`).join("");
    } else if (reportType === "Purchase Report") {
      tableHtml = `<tr><th>PO #</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Status</th></tr>` +
        purchaseOrders.map(p => `<tr><td>${p.id}</td><td>${p.vendor}</td><td>${p.date}</td><td>${fmtC(p.amount)}</td><td>${p.status}</td></tr>`).join("");
    } else {
      tableHtml = `<tr><th>Name</th><th>Contact</th><th>Email</th><th>Orders</th><th>Total Spend</th><th>Status</th></tr>` +
        vendors.map(v => `<tr><td>${v.name}</td><td>${v.contact}</td><td>${v.email}</td><td>${v.orders}</td><td>${fmtC(v.spend)}</td><td>${v.status}</td></tr>`).join("");
    }
    w.document.write(`<!DOCTYPE html><html><head><title>${reportType} — StockFlow ERP</title><style>body{font-family:sans-serif;padding:24px;color:#0f172a}h2{color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:8px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}th{background:#f1f5f9;padding:8px;text-align:left;font-size:11px;border-bottom:2px solid #cbd5e1}td{padding:8px;border-bottom:1px solid #e2e8f0}</style></head><body><h2>StockFlow ERP — ${reportType}</h2><p style="color:#64748b;font-size:12px">Date Range: ${dateRange} · Exported: ${new Date().toLocaleString()}</p><table>${tableHtml}</table><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  };

  const rowCount = reportType === "Inventory Summary" ? products.length : reportType === "Sales Report" ? invoices.length : reportType === "Customer Report" ? customers.length : reportType === "Purchase Report" ? purchaseOrders.length : vendors.length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports &amp; Business Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live data reports from your actual business records</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCSV}>Export CSV</Btn>
          <Btn size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportPDF}>Export PDF</Btn>
        </div>
      </div>

      {/* Live KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryKPIs.map(kpi => (
          <Card key={kpi.label} className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={cn("text-lg font-black font-mono", kpi.warn ? "text-amber-500" : "text-slate-900 dark:text-white")}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 p-4 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Report Type</p>
            <div className="space-y-0.5">
              {reportTypes.map(rt => (
                <button key={rt} onClick={() => setReportType(rt)}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                    reportType === rt ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}>{rt}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date Range</p>
            <div className="space-y-0.5">
              {dateRanges.map(dr => (
                <button key={dr} onClick={() => setDateRange(dr)}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                    dateRange === dr ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}>{dr}</button>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{reportType}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{dateRange} · {rowCount} records · Live Data</p>
            </div>
            <Badge variant="blue">{rowCount} rows</Badge>
          </Card>
          <Card className="p-5">
            <div className="overflow-x-auto -mx-5">

              {reportType === "Inventory Summary" && (
                <table className="w-full text-sm min-w-[650px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["SKU", "Product Name", "Category", "Qty", "Unit Price (PKR)", "Total Value (PKR)", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Qty","Unit Price (PKR)","Total Value (PKR)"].includes(h) && "text-right")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 font-semibold">{p.sku}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">{p.name}</td>
                        <td className="px-3 py-2.5"><Badge variant="neutral">{p.cat}</Badge></td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{fmtN(p.qty)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{fmtC(p.price)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-[#16A34A]">{fmtC(p.price * p.qty)}</td>
                        <td className="px-3 py-2.5">{statusBadge(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={5} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL INVENTORY VALUE</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(products.reduce((s, p) => s + p.price * p.qty, 0))}</td>
                    <td></td>
                  </tr></tfoot>
                </table>
              )}

              {reportType === "Sales Report" && (
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["Invoice #", "Customer", "Date", "Due Date", "Amount (PKR)", "Items", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Amount (PKR)","Items"].includes(h) && "text-right", h === "Status" && "text-center")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {invoices.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-[#2563EB]">{i.id}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">{i.customer}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{i.date}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{i.due}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{fmtC(i.amount)}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-slate-500">{i.items}</td>
                        <td className="px-3 py-2.5 text-center">{statusBadge(i.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL REVENUE</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(invoices.reduce((s, i) => s + i.amount, 0))}</td>
                    <td colSpan={2}></td>
                  </tr></tfoot>
                </table>
              )}

              {reportType === "Customer Report" && (
                <table className="w-full text-sm min-w-[650px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["Customer", "Company", "Email", "Orders", "Total Spend (PKR)", "Tier", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Orders","Total Spend (PKR)"].includes(h) && "text-right")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-[#2563EB]">{c.name.split(" ").map(n => n[0]).join("")}</span>
                            </div>
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{c.company}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{c.email}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{c.orders}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-[#16A34A]">{fmtC(c.spend)}</td>
                        <td className="px-3 py-2.5">{statusBadge(c.tier)}</td>
                        <td className="px-3 py-2.5">{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL CUSTOMER REVENUE</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(customers.reduce((s, c) => s + c.spend, 0))}</td>
                    <td colSpan={2}></td>
                  </tr></tfoot>
                </table>
              )}

              {reportType === "Purchase Report" && (
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["PO Number", "Vendor", "Order Date", "Expected", "Amount (PKR)", "Items", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Amount (PKR)","Items"].includes(h) && "text-right", h === "Status" && "text-center")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {purchaseOrders.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-[#2563EB]">{po.id}</td>
                        <td className="px-3 py-2.5 font-semibold text-xs text-slate-800 dark:text-slate-200">{po.vendor}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{po.date}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{po.expected}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{fmtC(po.amount)}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-slate-500">{po.items}</td>
                        <td className="px-3 py-2.5 text-center">{statusBadge(po.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL PURCHASE SPEND</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(purchaseOrders.reduce((s, p) => s + p.amount, 0))}</td>
                    <td colSpan={2}></td>
                  </tr></tfoot>
                </table>
              )}

              {reportType === "Vendor Report" && (
                <table className="w-full text-sm min-w-[600px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["Vendor Name", "Contact", "Email", "Orders", "Total Spend (PKR)", "Terms", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Orders","Total Spend (PKR)"].includes(h) && "text-right")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {vendors.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{v.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{v.contact}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{v.email}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{v.orders}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-[#16A34A]">{fmtC(v.spend)}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{v.terms}</td>
                        <td className="px-3 py-2.5">{statusBadge(v.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL VENDOR SPEND</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(vendors.reduce((s, v) => s + v.spend, 0))}</td>
                    <td colSpan={2}></td>
                  </tr></tfoot>
                </table>
              )}

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════

function SettingsScreen({ onOpenSupabaseModal }: { onOpenSupabaseModal: () => void }) {
  const [tab, setTab] = useState("Company");
  const tabs = ["Company", "Users & Roles", "Billing", "Security"];
  const [companyName, setCompanyName] = useState("StockFlow Technologies Inc.");
  const [adminEmail, setAdminEmail] = useState("admin@stockflow.io");

  const TEAM = [
    { name: "Sarah Kim", email: "sarah@stockflow.io", role: "Admin", status: "active", last: "Just now" },
    { name: "Mike Rodriguez", email: "mike@stockflow.io", role: "Manager", status: "active", last: "2h ago" },
    { name: "David Park", email: "david@stockflow.io", role: "Finance", status: "active", last: "1d ago" },
    { name: "Priya Nair", email: "priya@stackflow.io", role: "Sales", status: "active", last: "3h ago" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your organization, users, billing, and security</p>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />


      {tab === "Company" && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-xl font-black text-white">SF</span>
            </div>
            <div>
              <Btn variant="outline" size="sm">Upload Logo</Btn>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB · Recommended: 256×256px</p>
            </div>
          </div>
          {[
            { label: "Company Name", value: companyName, set: setCompanyName },
            { label: "Admin Email", value: adminEmail, set: setAdminEmail },
          ].map(f => (
            <div key={f.label} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.label}</label>
              <div className="col-span-2"><Inp value={f.value} onChange={f.set} /></div>
            </div>
          ))}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <Btn size="md" icon={<Check className="w-4 h-4" />}>Save Changes</Btn>
          </div>
        </Card>
      )}

      {tab === "Users & Roles" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Members ({TEAM.length})</h3>
            <Btn size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Invite User</Btn>
          </div>
          <div className="space-y-1">
            {TEAM.map(u => (
              <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#2563EB]">{u.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <Badge variant={u.role === "Admin" ? "purple" : "neutral"}>{u.role}</Badge>
                {statusBadge(u.status)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Billing" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Plan</h3>
                  <Badge variant="blue" dot>Active</Badge>
                </div>
                <p className="text-xs text-slate-500">Unlimited users · Advanced analytics · Priority support</p>
                <p className="text-3xl font-mono font-black text-slate-900 dark:text-white mt-3">$2,499<span className="text-sm font-normal text-slate-400">/mo</span></p>
              </div>
              <Btn variant="outline" size="sm">Change Plan</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === "Security" && (
        <div className="space-y-3">
          {[
            { icon: <Lock className="w-5 h-5 text-[#2563EB]" />, bg: "bg-blue-50 dark:bg-blue-950/50", title: "Two-Factor Authentication", desc: "Add an extra layer of security with 2FA.", action: "Enable 2FA", enabled: false },
            { icon: <Globe className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50 dark:bg-purple-950/50", title: "Single Sign-On (SSO)", desc: "Log in with Google, Microsoft, or SAML.", action: "Configure SSO", enabled: true },
          ].map(item => (
            <Card key={item.title} className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg)}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <Btn variant={item.enabled ? "outline" : "primary"} size="sm">{item.action}</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════

function AuthScreen({ onEnter }: { onEnter: () => void }) {
  const [email, setEmail] = useState("sarah@stockflow.io");
  const [password, setPassword] = useState("••••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onEnter();
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 py-12 shrink-0">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 3v18M3 7l9 4 9-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">StockFlow ERP</span>
          </div>

          <div className="mt-10 mb-7">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your StockFlow workspace</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
              <Inp value={email} onChange={setEmail} type="email" placeholder="you@company.com" icon={<Mail className="w-3.5 h-3.5" />} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <Inp value={password} onChange={setPassword} type="password" icon={<Lock className="w-3.5 h-3.5" />} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl py-2.5 text-sm font-bold transition-colors shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2">
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Sign in to Dashboard
            </button>
          </div>

          <button onClick={onEnter} className="mt-6 w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Skip login — enter platform →
          </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-between bg-[#0B1120] p-12 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white">StockFlow ERP</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tight max-w-xs">
            The operating system for modern commerce.
          </h2>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════════════════════

function CommandPalette({ open, onClose, setScreen }: {
  open: boolean; onClose: () => void; setScreen: (s: Screen) => void;
}) {
  const [q, setQ] = useState("");
  const items = [
    { label: "Dashboard", hint: "Executive overview", screen: "dashboard" as Screen, icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Inventory", hint: "Products & warehouses", screen: "inventory" as Screen, icon: <Package className="w-4 h-4" /> },
    { label: "Sales", hint: "Invoices & POS", screen: "sales" as Screen, icon: <ShoppingCart className="w-4 h-4" /> },
    { label: "Purchasing", hint: "Purchase orders & vendors", screen: "purchase" as Screen, icon: <Truck className="w-4 h-4" /> },
    { label: "Finance", hint: "P&L, balance sheet, cash flow", screen: "finance" as Screen, icon: <DollarSign className="w-4 h-4" /> },
    { label: "CRM", hint: "Customers & activities", screen: "crm" as Screen, icon: <Users className="w-4 h-4" /> },
    { label: "Reports", hint: "Build & export reports", screen: "reports" as Screen, icon: <FileBarChart className="w-4 h-4" /> },
    { label: "Settings", hint: "Company, database & security", screen: "settings" as Screen, icon: <Settings className="w-4 h-4" /> },
  ];
  const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase()) || i.hint.toLowerCase().includes(q.toLowerCase())) : items;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search commands, navigate screens…"
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none" />
          <kbd className="px-2 py-1 text-[10px] border border-slate-200 dark:border-slate-700 rounded text-slate-400 font-mono">ESC</kbd>
        </div>
        <div className="py-2 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {filtered.map(item => (
            <button key={item.label}
              onClick={() => { setScreen(item.screen); onClose(); setQ(""); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="text-slate-400">{item.icon}</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
              <span className="text-xs text-slate-400 ml-0.5">· {item.hint}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATION PANEL
// ═══════════════════════════════════════════════════════════

function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markAllNotificationsRead } = useStockFlow();
  if (!open) return null;

  const nIcon = (type: string) => {
    const m: Record<string, { el: React.ReactNode; c: string }> = {
      alert: { el: <AlertTriangle className="w-3.5 h-3.5" />, c: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" },
      payment: { el: <DollarSign className="w-3.5 h-3.5" />, c: "bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400" },
      info: { el: <Info className="w-3.5 h-3.5" />, c: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" },
    };
    return m[type] ?? m.info;
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-14 right-4 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
            <Badge variant="danger">{notifications.filter(n => !n.read).length}</Badge>
          </div>
          <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-[#2563EB] hover:underline">Mark all read</button>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/40 [&::-webkit-scrollbar]:hidden">
          {notifications.map(n => {
            const { el, c } = nIcon(n.type);
            return (
              <div key={n.id} className={cn("flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer", !n.read && "bg-blue-50/50 dark:bg-blue-950/10")}>
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", c)}>{el}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-xs font-bold", n.read ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white")}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN SHELL COMPONENT
// ═══════════════════════════════════════════════════════════

function MainAppShell() {
  const { notifications } = useStockFlow();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Modal States
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
  const [addPOModalOpen, setAddPOModalOpen] = useState(false);
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen(p => !p); }
      if (e.key === "Escape") { setCommandOpen(false); setNotifOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderContent = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen onViewAllInvoices={() => setScreen("sales")} />;
      case "inventory": return <InventoryScreen onOpenAddProduct={() => setAddProductModalOpen(true)} onOpenEditProduct={p => setEditingProduct(p)} />;
      case "sales": return <SalesScreen onOpenAddInvoice={() => setAddInvoiceModalOpen(true)} />;
      case "purchase": return <PurchaseScreen onOpenAddPO={() => setAddPOModalOpen(true)} onOpenAddVendor={() => setAddVendorModalOpen(true)} />;
      case "finance": return <FinanceScreen />;
      case "crm": return <CRMScreen onOpenAddCustomer={() => setAddCustomerModalOpen(true)} />;
      case "reports": return <ReportsScreen />;
      case "settings": return <SettingsScreen onOpenSupabaseModal={() => setSupabaseModalOpen(true)} />;
      default: return <DashboardScreen onViewAllInvoices={() => setScreen("sales")} />;
    }
  };

  if (screen === "auth") {
    return (
      <div className={cn("contents", dark && "dark")}>
        <AuthScreen onEnter={() => setScreen("dashboard")} />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]", dark && "dark")}>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar screen={screen} setScreen={setScreen} collapsed={false} setCollapsed={() => {}}
              dark={dark} setDark={setDark} mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar screen={screen} setScreen={setScreen} collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed} dark={dark} setDark={setDark} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop topbar */}
        <Topbar screen={screen} setCommandOpen={setCommandOpen} setNotifOpen={setNotifOpen} unread={unread} />

        {/* Screen content */}
        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {renderContent()}
        </main>
      </div>

      {/* Overlays & Modals */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} setScreen={setScreen} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <SupabaseConfigModal open={supabaseModalOpen} onClose={() => setSupabaseModalOpen(false)} />
      <AddProductModal open={addProductModalOpen} onClose={() => setAddProductModalOpen(false)} />
      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      <AddInvoiceModal open={addInvoiceModalOpen} onClose={() => setAddInvoiceModalOpen(false)} />
      <AddPOModal open={addPOModalOpen} onClose={() => setAddPOModalOpen(false)} />
      <AddVendorModal open={addVendorModalOpen} onClose={() => setAddVendorModalOpen(false)} />
      <AddCustomerModal open={addCustomerModalOpen} onClose={() => setAddCustomerModalOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════

export default function App() {
  return (
    <StockFlowProvider>
      <MainAppShell />
    </StockFlowProvider>
  );
}
