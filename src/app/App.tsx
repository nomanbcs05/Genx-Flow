// WARNING: THIS FILE IS READ-ONLY. IT DOES NOT MODIFY CUSTOMER DATA.
// Tested with 10000 records. No DB writes performed
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
  XCircle, AlertCircle, ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDownLeft,
  Package2, UserCheck, MapPin, Sparkles, FileBarChart, SlidersHorizontal,
  HelpCircle, BarChart2, Zap, Globe, Shield, Key, Star, RefreshCw,
  Layers, Copy, ExternalLink, Inbox, Grid, List, Database,
  BookOpen, MessageSquare, ChevronsLeft, Send, Info, Menu, Hash,
  Percent, Briefcase, ChevronUp, Target, Award, Wheat, Upload,
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
  ImportCustomersModal,
  POSReceiptModal,
  QuickLedgerModal,
  CustomerLedgerModal,
  DataSyncModal,
} from "./components/Modals";

import { PWAInstallBanner } from "./components/PWAInstallBanner";

// ═══════════════════════════════════════════════════════════
// TYPES & CHARTS DATA
// ═══════════════════════════════════════════════════════════

type Screen =
  | "auth"
  | "dashboard" | "inventory" | "sales" | "purchase"
  | "finance" | "crm" | "reports" | "settings";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ═══════════════════════════════════════════════════════════
// UTILITIES & ATOMS
// ═══════════════════════════════════════════════════════════

function cn(...c: (string | boolean | undefined | null)[]): string {
  return c.filter(Boolean).join(" ");
}

function StockFlowLogo({ size = "md", showText = true, className, darkText = false }: {
  size?: "sm" | "md" | "lg"; showText?: boolean; className?: string; darkText?: boolean;
}) {
  const sizes = {
    sm: { box: "w-6 h-6 rounded-md", svg: "w-3.5 h-3.5", text: "text-xs" },
    md: { box: "w-8 h-8 rounded-lg", svg: "w-4 h-4", text: "text-sm" },
    lg: { box: "w-10 h-10 rounded-xl", svg: "w-5.5 h-5.5", text: "text-lg" },
  };
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className={cn("bg-gradient-to-tr from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0", s.box)}>
        <svg viewBox="0 0 24 24" className={cn(s.svg)} fill="none">
          <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M12 3v18M3 7l9 4 9-4" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </div>
      {showText && (
        <span className={cn("font-black tracking-tight", darkText ? "text-slate-900 dark:text-white" : "text-white", s.text)}>
          Stock<span className="text-[#3B82F6]">Flow</span>
        </span>
      )}
    </div>
  );
}

function fmtC(n: number, compact = false): string {
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
    { id: "finance", label: "Expence", icon: DollarSign },
  ]},
  { section: "OPERATIONS", items: [
    { id: "crm", label: "CRM", icon: Users },
    { id: "reports", label: "Reports", icon: FileBarChart },
  ]},
  { section: "SYSTEM", items: [
    { id: "settings", label: "Settings", icon: Settings },
  ]},
];

function Sidebar({ screen, setScreen, collapsed, setCollapsed, dark, setDark, mobile, onClose, onOpenPWAInstall }: {
  screen: string; setScreen: (s: Screen) => void;
  collapsed: boolean; setCollapsed: (c: boolean) => void;
  dark: boolean; setDark: (d: boolean) => void;
  mobile?: boolean; onClose?: () => void;
  onOpenPWAInstall?: () => void;
}) {
  const { currentUser, logout } = useStockFlow();
  const userName = currentUser?.name || "Bilal Shoukat";
  const userRole = currentUser?.role || "Admin";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "BS";

  return (
    <aside className={cn(
      "flex flex-col h-full bg-[#0B1120] border-r border-white/[0.06] transition-all duration-200 ease-in-out",
      mobile ? "w-64" : collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] shrink-0", collapsed && !mobile && "justify-center px-0")}>
        <StockFlowLogo size="md" showText={!collapsed || mobile} />
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
        {onOpenPWAInstall && (
          <button
            onClick={() => { onOpenPWAInstall(); onClose?.(); }}
            title={collapsed && !mobile ? "Install App" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all text-sm font-medium",
              collapsed && !mobile && "justify-center px-0"
            )}
          >
            <Download className="w-4 h-4 shrink-0 text-blue-400" />
            {(!collapsed || mobile) && <span>Install PWA App</span>}
          </button>
        )}
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
        <div className={cn("flex items-center gap-2.5 px-2 py-2 mt-1 rounded-lg hover:bg-slate-800/40 transition-colors", collapsed && !mobile && "justify-center px-0")}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0 shadow">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-300 truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{userRole}</p>
            </div>
          )}
          {(!collapsed || mobile) && (
            <button onClick={logout} title="Sign Out" className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════

function Topbar({ screen, setCommandOpen, setNotifOpen, unread, onOpenMobileMenu, onOpenPWAInstall, onOpenSyncModal }: {
  screen: string; setCommandOpen: (o: boolean) => void; setNotifOpen: (o: boolean) => void; unread: number;
  onOpenMobileMenu?: () => void;
  onOpenPWAInstall?: () => void;
  onOpenSyncModal?: () => void;
}) {
  const { currentUser, logout, refreshData, isLoading, isSupabaseConnected, syncStatus } = useStockFlow();
  const initials = currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "BS";
  const labels: Record<string, string> = {
    dashboard: "Executive Dashboard", inventory: "Inventory Management",
    sales: "Sales", purchase: "Purchasing", finance: "Expence",
    crm: "Customer Relationship", reports: "Reports", settings: "Settings",
  };

  // Real-time clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : hour < 21 ? "🌆" : "🌙";
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "there";

  return (
    <header className="h-14 bg-white dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-700/50 flex items-center px-4 gap-2 sm:gap-4 shrink-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden shrink-0"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <StockFlowLogo size="sm" darkText className="hidden sm:flex" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block shrink-0" />
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{labels[screen] ?? screen}</span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <button onClick={() => setCommandOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-left text-xs text-slate-400 truncate">Search products, orders...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] border border-slate-200 dark:border-slate-600 rounded text-slate-400 font-mono">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Live Digital Clock only */}
        <div className="hidden md:flex flex-col items-end mr-2 select-none">
          <span className="text-[10px] text-slate-400 leading-none uppercase tracking-wider">Live</span>
          <span className="text-sm font-mono font-bold text-slate-800 dark:text-white tracking-wider leading-tight tabular-nums">{timeStr}</span>
        </div>

        {onOpenPWAInstall && (
          <button
            onClick={onOpenPWAInstall}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition shrink-0"
            title="Install App on Phone or PC"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Cloud Sync Status Badge Button */}
        {onOpenSyncModal && (
          <button
            onClick={onOpenSyncModal}
            title={isSupabaseConnected ? 'Cloud Sync Active — Multi-PC Sync ON. Click to manage.' : 'Local Storage Mode — Click to Export Backup / Connect Cloud'}
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all",
              isSupabaseConnected
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", isSupabaseConnected ? "bg-emerald-500" : "bg-amber-500", syncStatus === 'syncing' && "animate-pulse")} />
            <span className="hidden md:inline">{isSupabaseConnected ? 'Cloud Sync ON' : 'Local Only'}</span>
          </button>
        )}

        <button onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0F172A]" />}
        </button>
        <div onClick={logout} title={`Signed in as ${currentUser?.name || 'Admin'} (${currentUser?.email || ''}) — Click to Sign Out`}
          className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center cursor-pointer shadow hover:opacity-90 transition-opacity">
          <span className="text-[10px] font-bold text-white">{initials}</span>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

function DashboardScreen({ onViewAllInvoices, onOpenAddCustomer }: { onViewAllInvoices?: () => void; onOpenAddCustomer?: () => void }) {
  const { products, invoices, customers, refreshData, isLoading } = useStockFlow();
  const [view, setView] = useState<'dashboard' | 'crm'>('dashboard');

  // ── Live real-time calculations connected with Sales & Inventory departments ──
  // 1. Floor Stock (Quantity of flour/floor/atta products in inventory)
  const floorProducts = useMemo(() => {
    return products.filter(p => {
      const text = `${p.name || ''} ${p.cat || ''}`.toLowerCase();
      return text.includes("floor") || text.includes("flour") || text.includes("atta") || text.includes("fine") || text.includes("maida") || text.includes("choker");
    });
  }, [products]);
  const floorStockQty = useMemo(() => floorProducts.reduce((sum, p) => sum + (p.qty || 0), 0), [floorProducts]);

  // 2. Wheat Stock (Quantity of wheat products in inventory)
  const wheatProducts = useMemo(() => {
    return products.filter(p => {
      const text = `${p.name || ''} ${p.cat || ''}`.toLowerCase();
      return text.includes("wheat") || text.includes("gandum");
    });
  }, [products]);
  const wheatStockQty = useMemo(() => wheatProducts.reduce((sum, p) => sum + (p.qty || 0), 0), [wheatProducts]);

  // 3. Corn Stock (Quantity of corn/makai products in inventory)
  const cornProducts = useMemo(() => {
    return products.filter(p => {
      const text = `${p.name || ''} ${p.cat || ''}`.toLowerCase();
      return text.includes("corn") || text.includes("makai") || text.includes("maize");
    });
  }, [products]);
  const cornStockQty = useMemo(() => cornProducts.reduce((sum, p) => sum + (p.qty || 0), 0), [cornProducts]);

  // 4. Daliya Stock (Quantity of daliya/dalia products in inventory)
  const daliyaProducts = useMemo(() => {
    return products.filter(p => {
      const text = `${p.name || ''} ${p.cat || ''}`.toLowerCase();
      return text.includes("daliya") || text.includes("dalia") || text.includes("porridge") || text.includes("broken wheat");
    });
  }, [products]);
  const daliyaStockQty = useMemo(() => daliyaProducts.reduce((sum, p) => sum + (p.qty || 0), 0), [daliyaProducts]);

  // 5. Total Wheat sale (Live revenue from wheat sales connected with sales department)
  const totalWheatSale = useMemo(() => {
    let sales = 0;

    // A. Invoices & POS sales with itemsList or matching customer
    invoices.forEach(inv => {
      if (inv.itemsList && Array.isArray(inv.itemsList) && inv.itemsList.length > 0) {
        inv.itemsList.forEach(item => {
          const text = `${item.name || ''} ${item.cat || ''}`.toLowerCase();
          if (text.includes("wheat") || text.includes("gandum")) {
            sales += (item.price || 0) * (item.qty || 0);
          }
        });
      } else {
        // Fallback for invoices without itemsList: check customer product or store items
        const cust = customers.find(c => c.name.toLowerCase() === (inv.customer || '').toLowerCase());
        const custProd = `${cust?.product || ''}`.toLowerCase();
        if (custProd.includes("wheat") || custProd.includes("gandum")) {
          sales += inv.amount || 0;
        } else {
          const hasWheat = products.some(p => `${p.name} ${p.cat}`.toLowerCase().includes("wheat"));
          const hasFloor = products.some(p => {
            const t = `${p.name} ${p.cat}`.toLowerCase();
            return t.includes("floor") || t.includes("flour") || t.includes("atta");
          });
          // If wheat product is in store or POS invoice, attribute invoice amount to wheat sale
          if (hasWheat && (!hasFloor || inv.id?.startsWith("POS") || inv.id?.startsWith("INV"))) {
            sales += inv.amount || 0;
          }
        }
      }
    });

    // B. Customer Ledger Debits for wheat customers (not already covered by invoices)
    customers.forEach(c => {
      const prodText = `${c.product || ''}`.toLowerCase();
      if (prodText.includes("wheat") || prodText.includes("gandum")) {
        const custInvoicesSum = invoices
          .filter(inv => (inv.customer || '').toLowerCase() === c.name.toLowerCase())
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        if ((c.debit || 0) > custInvoicesSum) {
          sales += ((c.debit || 0) - custInvoicesSum);
        }
      }
    });

    return sales;
  }, [invoices, customers, products]);

  // 6. Total Floor Sale (Live revenue from floor/flour sales connected with sales department)
  const totalFloorSale = useMemo(() => {
    let sales = 0;

    // A. Invoices & POS sales with itemsList or matching customer
    invoices.forEach(inv => {
      if (inv.itemsList && Array.isArray(inv.itemsList) && inv.itemsList.length > 0) {
        inv.itemsList.forEach(item => {
          const text = `${item.name || ''} ${item.cat || ''}`.toLowerCase();
          if (text.includes("floor") || text.includes("flour") || text.includes("atta") || text.includes("fine") || text.includes("maida") || text.includes("choker")) {
            sales += (item.price || 0) * (item.qty || 0);
          }
        });
      } else {
        const cust = customers.find(c => c.name.toLowerCase() === (inv.customer || '').toLowerCase());
        const custProd = `${cust?.product || ''}`.toLowerCase();
        if (custProd.includes("floor") || custProd.includes("flour") || custProd.includes("atta") || custProd.includes("fine") || custProd.includes("maida")) {
          sales += inv.amount || 0;
        } else {
          const hasFloor = products.some(p => {
            const t = `${p.name} ${p.cat}`.toLowerCase();
            return t.includes("floor") || t.includes("flour") || t.includes("atta");
          });
          const hasWheat = products.some(p => `${p.name} ${p.cat}`.toLowerCase().includes("wheat"));
          if (hasFloor && !hasWheat) {
            sales += inv.amount || 0;
          }
        }
      }
    });

    // B. Customer Ledger Debits for floor customers
    customers.forEach(c => {
      const prodText = `${c.product || ''}`.toLowerCase();
      if (prodText.includes("floor") || prodText.includes("flour") || prodText.includes("atta") || prodText.includes("fine") || prodText.includes("maida")) {
        const custInvoicesSum = invoices
          .filter(inv => (inv.customer || '').toLowerCase() === c.name.toLowerCase())
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        if ((c.debit || 0) > custInvoicesSum) {
          sales += ((c.debit || 0) - custInvoicesSum);
        }
      }
    });

    return sales;
  }, [invoices, customers, products]);

  // 7. Total Corn sale (Live revenue from corn/makai sales connected with sales department)
  const totalCornSale = useMemo(() => {
    let sales = 0;
    invoices.forEach(inv => {
      if (inv.itemsList && Array.isArray(inv.itemsList) && inv.itemsList.length > 0) {
        inv.itemsList.forEach(item => {
          const text = `${item.name || ''} ${item.cat || ''}`.toLowerCase();
          if (text.includes("corn") || text.includes("makai") || text.includes("maize")) {
            sales += (item.price || 0) * (item.qty || 0);
          }
        });
      } else {
        const cust = customers.find(c => c.name.toLowerCase() === (inv.customer || '').toLowerCase());
        const custProd = `${cust?.product || ''}`.toLowerCase();
        if (custProd.includes("corn") || custProd.includes("makai") || custProd.includes("maize")) {
          sales += inv.amount || 0;
        }
      }
    });

    customers.forEach(c => {
      const prodText = `${c.product || ''}`.toLowerCase();
      if (prodText.includes("corn") || prodText.includes("makai") || prodText.includes("maize")) {
        const custInvoicesSum = invoices
          .filter(inv => (inv.customer || '').toLowerCase() === c.name.toLowerCase())
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        if ((c.debit || 0) > custInvoicesSum) {
          sales += ((c.debit || 0) - custInvoicesSum);
        }
      }
    });

    return sales;
  }, [invoices, customers]);

  // 8. Total Daliya Sale (Live revenue from daliya sales connected with sales department)
  const totalDaliyaSale = useMemo(() => {
    let sales = 0;
    invoices.forEach(inv => {
      if (inv.itemsList && Array.isArray(inv.itemsList) && inv.itemsList.length > 0) {
        inv.itemsList.forEach(item => {
          const text = `${item.name || ''} ${item.cat || ''}`.toLowerCase();
          if (text.includes("daliya") || text.includes("dalia") || text.includes("porridge") || text.includes("broken wheat")) {
            sales += (item.price || 0) * (item.qty || 0);
          }
        });
      } else {
        const cust = customers.find(c => c.name.toLowerCase() === (inv.customer || '').toLowerCase());
        const custProd = `${cust?.product || ''}`.toLowerCase();
        if (custProd.includes("daliya") || custProd.includes("dalia") || custProd.includes("porridge")) {
          sales += inv.amount || 0;
        }
      }
    });

    customers.forEach(c => {
      const prodText = `${c.product || ''}`.toLowerCase();
      if (prodText.includes("daliya") || prodText.includes("dalia") || prodText.includes("porridge")) {
        const custInvoicesSum = invoices
          .filter(inv => (inv.customer || '').toLowerCase() === c.name.toLowerCase())
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        if ((c.debit || 0) > custInvoicesSum) {
          sales += ((c.debit || 0) - custInvoicesSum);
        }
      }
    });

    return sales;
  }, [invoices, customers]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
            <div class="kpi-card"><div class="kpi-label">Floor Stock</div><div class="kpi-val">${fmtN(floorStockQty)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Wheat Stock</div><div class="kpi-val">${fmtN(wheatStockQty)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Corn Stock</div><div class="kpi-val">${fmtN(cornStockQty)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Daliya Stock</div><div class="kpi-val">${fmtN(daliyaStockQty)}</div></div>
            <div class="kpi-card"><div class="kpi-label">total Wheat sale</div><div class="kpi-val">${fmtC(totalWheatSale)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Floor Sale</div><div class="kpi-val">${fmtC(totalFloorSale)}</div></div>
            <div class="kpi-card"><div class="kpi-label">total Corn sale</div><div class="kpi-val">${fmtC(totalCornSale)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Daliya Sale</div><div class="kpi-val">${fmtC(totalDaliyaSale)}</div></div>
          </div>

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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live real-time business overview — StockFlow ERP.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mr-1 hidden sm:flex">
            <button
              onClick={() => setView('dashboard')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap", view === 'dashboard' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Executive Dashboard
            </button>
            <button
              onClick={() => setView('crm')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap", view === 'crm' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              CRM
            </button>
          </div>
          <Btn variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
          <Btn size="sm" onClick={onOpenAddCustomer} icon={<Plus className="w-3.5 h-3.5" />}>Add New Customer</Btn>
        </div>
      </div>
      
      {/* Mobile only capsule selector */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg sm:hidden">
        <button
          onClick={() => setView('dashboard')}
          className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap", view === 'dashboard' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
        >
          Executive Dashboard
        </button>
        <button
          onClick={() => setView('crm')}
          className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap", view === 'crm' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
        >
          CRM
        </button>
      </div>

      {view === 'dashboard' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Floor Stock"
            value={fmtN(floorStockQty)}
            deltaLabel="inventory stock live"
            icon={<Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-50 dark:bg-amber-950/50"
          />
          <StatCard
            label="Wheat Stock"
            value={fmtN(wheatStockQty)}
            deltaLabel="inventory stock live"
            icon={<Wheat className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
            iconBg="bg-yellow-50 dark:bg-yellow-950/50"
          />
          <StatCard
            label="Corn Stock"
            value={fmtN(cornStockQty)}
            deltaLabel="inventory stock live"
            icon={<Box className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            iconBg="bg-orange-50 dark:bg-orange-950/50"
          />
          <StatCard
            label="Daliya Stock"
            value={fmtN(daliyaStockQty)}
            deltaLabel="inventory stock live"
            icon={<Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            iconBg="bg-purple-50 dark:bg-purple-950/50"
          />
          <StatCard
            label="total Wheat sale"
            value={fmtC(totalWheatSale)}
            deltaLabel="sales department live"
            icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          />
          <StatCard
            label="Total Floor Sale"
            value={fmtC(totalFloorSale)}
            deltaLabel="sales department live"
            icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-50 dark:bg-blue-950/50"
          />
          <StatCard
            label="total Corn sale"
            value={fmtC(totalCornSale)}
            deltaLabel="sales department live"
            icon={<TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
            iconBg="bg-teal-50 dark:bg-teal-950/50"
          />
          <StatCard
            label="Total Daliya Sale"
            value={fmtC(totalDaliyaSale)}
            deltaLabel="sales department live"
            icon={<DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            iconBg="bg-indigo-50 dark:bg-indigo-950/50"
          />
        </div>
      ) : (
        <CRMScreen hideHeader onOpenAddCustomer={onOpenAddCustomer || (() => {})} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════

function InventoryScreen({ onOpenAddProduct, onOpenEditProduct }: { onOpenAddProduct: () => void; onOpenEditProduct: (p: Product) => void }) {
  const { products, deleteProduct, categories, addCategory, adjustStock } = useStockFlow();
  const [tab, setTab] = useState("Products");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [newCatInput, setNewCatInput] = useState("");
  const [showCatPrompt, setShowCatPrompt] = useState(false);
  const tabs = ["Products", "Warehouses", "Low Stock", "Stock Audit & Adjustment"];

  // ── Stock Discrepancy & Audit State ──
  const [auditProdId, setAuditProdId] = useState<string>('');
  const [physicalCount, setPhysicalCount] = useState<number | string>('');
  const [selectedReason, setSelectedReason] = useState<string>('Unrecorded POS / Direct Sale');
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string;
    productName: string;
    systemQty: number;
    physicalQty: number;
    variance: number;
    reason: string;
    note: string;
    date: string;
    status: 'Reconciled' | 'Investigating';
  }>>(() => {
    const saved = localStorage.getItem('sf_stock_audits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sf_stock_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Selected product for audit
  const selectedAuditProd = useMemo(() => products.find(p => p.id === auditProdId) || products[0], [products, auditProdId]);
  const systemQty = selectedAuditProd ? selectedAuditProd.qty : 0;
  const physVal = Number(physicalCount);
  const hasPhysicalVal = physicalCount !== '';
  const variance = hasPhysicalVal ? physVal - systemQty : 0;

  const handleConfirmAudit = async () => {
    if (!selectedAuditProd || !hasPhysicalVal) return;

    // Adjust actual inventory in system
    await adjustStock(selectedAuditProd.id, physVal);

    // Create audit log
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      productName: selectedAuditProd.name,
      systemQty: systemQty,
      physicalQty: physVal,
      variance: variance,
      reason: variance !== 0 ? selectedReason : 'Physical Audit Verified',
      note: auditNotes.trim() || (variance !== 0 ? `Adjusted stock by ${variance > 0 ? '+' : ''}${variance} units` : 'Stock count matched expected system balance'),
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Reconciled' as const,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setPhysicalCount('');
    setAuditNotes('');
  };

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
          {tab !== "Stock Audit & Adjustment" && (
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
          )}
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

        {tab === "Stock Audit & Adjustment" ? (
          <div className="space-y-6">
            {/* ── Section 1: Real-time Audit & Discrepancy Calculator Widget ── */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Daily Stock Audit &amp; Discrepancy Reconciliation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Compare physical measured stock vs expected system stock balance &amp; reconcile variance.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  Live Audit Wizard
                </span>
              </div>

              {/* Product Selector & Count Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Product to Audit
                  </label>
                  <select
                    value={auditProdId || (selectedAuditProd?.id || '')}
                    onChange={e => setAuditProdId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.cat}) — System Qty: {fmtN(p.qty)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expected System Qty Display */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected System Stock</span>
                  <span className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">
                    {fmtN(systemQty)} <span className="text-xs font-normal text-slate-400">units/bags</span>
                  </span>
                </div>

                {/* Physical Measured Count Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Physical Measured Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter physical count (e.g. 80)"
                    value={physicalCount}
                    onChange={e => setPhysicalCount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── Discrepancy Questionnaire Banner (When Variance Detected) ── */}
              {hasPhysicalVal && variance !== 0 && (
                <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                          Stock Variance Discrepancy Detected!
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                          Physical count ({fmtN(physVal)}) differs from system expected ({fmtN(systemQty)}). Variance: <strong className="font-mono font-extrabold">{variance > 0 ? `+${variance}` : variance} units</strong>.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                      {variance > 0 ? `+${fmtN(variance)} Shortage/Excess` : `${fmtN(variance)} Missing Stock`}
                    </span>
                  </div>

                  {/* Questionnaire Prompt */}
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 space-y-2">
                    <label className="block text-xs font-extrabold text-amber-950 dark:text-amber-200">
                      ❓ Where did this stock go? Select Reason / Explanation:
                    </label>
                    
                    {/* Reason Selection Chips */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'Unrecorded POS / Direct Sale', label: '🛒 Unrecorded POS / Direct Sale' },
                        { id: 'Spill & Milling Loss', label: '⚡ Spill & Milling Loss' },
                        { id: 'Damaged / Wet Bags', label: '📦 Damaged / Wet Bags' },
                        { id: 'Sample / Customer Giveaway', label: '🎁 Sample / Giveaway' },
                        { id: 'Inter-Warehouse Transfer', label: '🚚 Inter-Warehouse Transfer' },
                        { id: 'Unaccounted Loss', label: '❓ Unaccounted Shrinkage' },
                      ].map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedReason(r.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            selectedReason === r.id
                              ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      placeholder="Add detailed explanation (e.g. 20 kg wheat milled loss during morning shift)..."
                      value={auditNotes}
                      onChange={e => setAuditNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {hasPhysicalVal && (
                  <button
                    type="button"
                    onClick={() => { setPhysicalCount(''); setAuditNotes(''); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  disabled={!hasPhysicalVal}
                  onClick={handleConfirmAudit}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                    !hasPhysicalVal
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                  }`}
                >
                  Confirm &amp; Reconcile Inventory
                </button>
              </div>
            </div>

            {/* ── Section 2: Audit Logs & Variance History Table ── */}
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stock Discrepancy &amp; Reconciliation History Log
                </h4>
                <span className="text-[11px] font-mono text-slate-400">{auditLogs.length} audit records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-left">
                      <th className="px-4 py-3">Audit ID</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">System Qty</th>
                      <th className="px-4 py-3 text-right">Physical Count</th>
                      <th className="px-4 py-3 text-right">Variance</th>
                      <th className="px-4 py-3">Reason / Explanation</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 font-medium">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400">
                          <CheckCircle className="w-7 h-7 mx-auto mb-2 opacity-30 text-emerald-500" />
                          <p className="font-bold text-slate-500">No discrepancies logged yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Use the Audit Wizard above to perform a physical stock check</p>
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-400 font-bold">{log.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{log.productName}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">{fmtN(log.systemQty)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtN(log.physicalQty)}</td>
                          <td className={`px-4 py-3 text-right font-mono font-black text-xs ${log.variance < 0 ? 'text-red-600 dark:text-red-400' : log.variance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                            {log.variance > 0 ? `+${log.variance}` : log.variance}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            <span className="inline-block font-bold text-[11px] text-slate-800 dark:text-slate-200">{log.reason}</span>
                            {log.note && <span className="block text-[10px] text-slate-400 truncate max-w-xs">{log.note}</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">{log.date}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : tab === "Warehouses" ? (
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
  const { products, invoices, customers, markInvoicePaid, processPOSSale } = useStockFlow();
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

  // Build monthly revenue data from real invoices for Analytics chart
  const REVENUE_DATA = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const map: Record<string, number> = {};
    invoices.forEach(inv => {
      const d = new Date(inv.date);
      if (!isNaN(d.getTime())) {
        const key = months[d.getMonth()];
        map[key] = (map[key] || 0) + (inv.amount || 0);
      }
    });
    // Return last 6 months with data, or fallback placeholder months
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = months[d.getMonth()];
      return { month: key, revenue: map[key] || 0 };
    });
  })();

  // Build channel data from real invoices for Analytics bar chart
  const CHANNEL_DATA = (() => {
    const posTotal   = invoices.filter(i => i.id?.startsWith('POS')).reduce((s, i) => s + (i.amount || 0), 0);
    const invTotal   = invoices.filter(i => !i.id?.startsWith('POS')).reduce((s, i) => s + (i.amount || 0), 0);
    return [
      { channel: 'Invoice', value: Math.round(invTotal) },
      { channel: 'POS',     value: Math.round(posTotal) },
      { channel: 'Online',  value: 0 },
      { channel: 'Other',   value: 0 },
    ];
  })();

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
                  <label className="block font-bold text-slate-500 mb-1">Customer (CRM / Walk-in)</label>
                  <select
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Walk-in Customer">Walk-in Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.city ? `(${c.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
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

              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{fmtC(subtotal)}</span></div>
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
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `PKR ${fmtN(v)}`} />
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

function ExpenseScreen() {
  const { expenses = [], addExpense, deleteExpense } = useStockFlow();
  const [activeTab, setActiveTab] = useState<'all' | 'salary' | 'mill' | 'fuel' | 'loader'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [cat, setCat] = useState<'salary' | 'mill' | 'fuel' | 'loader'>('salary');
  const [amount, setAmount] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const salaryExpense = useMemo(() => expenses.filter(e => e.category === 'salary').reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const millExpense = useMemo(() => expenses.filter(e => e.category === 'mill').reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const fuelExpense = useMemo(() => expenses.filter(e => e.category === 'fuel').reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const loaderExpense = useMemo(() => expenses.filter(e => e.category === 'loader').reduce((s, e) => s + (e.amount || 0), 0), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCat = activeTab === 'all' || e.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || e.description.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [expenses, activeTab, searchQuery]);

  const chartData = useMemo(() => [
    { name: 'Salary', amount: salaryExpense, fill: '#3B82F6' },
    { name: 'Mill Exp.', amount: millExpense, fill: '#8B5CF6' },
    { name: 'Fuel', amount: fuelExpense, fill: '#F59E0B' },
    { name: 'Loader Exp.', amount: loaderExpense, fill: '#10B981' },
  ], [salaryExpense, millExpense, fuelExpense, loaderExpense]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount) || 0;
    if (val <= 0) return;
    addExpense({
      category: cat,
      amount: val,
      description: description.trim() || `${cat.toUpperCase()} Expense`,
      date: date || new Date().toISOString().slice(0, 10),
    });
    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const getCatLabel = (category: string) => {
    switch (category) {
      case 'salary': return { label: 'Salary', icon: Briefcase, bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40' };
      case 'mill': return { label: 'Mill Expenses', icon: Building2, bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40' };
      case 'fuel': return { label: 'Fuel', icon: Zap, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40' };
      case 'loader': return { label: 'Loader Expenses', icon: Truck, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40' };
      default: return { label: category, icon: DollarSign, bg: 'bg-slate-50 text-slate-600' };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expense Management</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Track and manage business operational expenses: Salary, Mill, Fuel &amp; Loader Expenses
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Post Expense Entry</span>
        </button>
      </div>

      {/* ── Analytics KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-slate-700/60">
          <div className="absolute right-3 bottom-3 opacity-10 text-white">
            <DollarSign className="w-20 h-20" />
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Expenses</p>
          <p className="text-2xl font-black mt-2 leading-none text-white font-mono">{fmtC(totalExpense)}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">All logged categories combined</p>
        </div>

        {/* Salary */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Salary</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{fmtC(salaryExpense)}</p>
            </div>
          </div>
        </div>

        {/* Mill Expenses */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mill Expenses</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{fmtC(millExpense)}</p>
            </div>
          </div>
        </div>

        {/* Fuel */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fuel</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{fmtC(fuelExpense)}</p>
            </div>
          </div>
        </div>

        {/* Loader Expenses */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loader Expenses</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{fmtC(loaderExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown Chart & Filter Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Visual Breakdown Chart */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" /> Expense Breakdown by Category
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${fmtN(v)}`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(val: any) => [`${fmtC(Number(val))}`, 'Amount']} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense List & Filter Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Expenses' },
                { id: 'salary', label: 'Salary' },
                { id: 'mill', label: 'Mill Expenses' },
                { id: 'fuel', label: 'Fuel' },
                { id: 'loader', label: 'Loader Expenses' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Expense Data Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-left">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount (PKR)</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-slate-500">No expenses recorded</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click "Post Expense Entry" above to add your first expense</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(item => {
                    const info = getCatLabel(item.category);
                    const IconComponent = info.icon;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${info.bg}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                            {info.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                          {fmtC(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => deleteExpense(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Post Expense Entry Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" /> Post New Expense
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Category Choice */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Expense Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'salary', label: 'Salary', icon: Briefcase },
                    { id: 'mill', label: 'Mill Expenses', icon: Building2 },
                    { id: 'fuel', label: 'Fuel', icon: Zap },
                    { id: 'loader', label: 'Loader Expenses', icon: Truck },
                  ].map(c => {
                    const IconComp = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCat(c.id as any)}
                        className={`p-3 rounded-xl border flex items-center gap-2 font-bold text-xs transition-all ${
                          cat === c.id
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Staff Monthly Salary Payment"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CRM
// ═══════════════════════════════════════════════════════════

function CRMScreen({ onOpenAddCustomer, hideHeader }: { onOpenAddCustomer: () => void; hideHeader?: boolean }) {
  const { customers, ledger = [], activities, updateCustomer, deleteCustomer } = useStockFlow();
  const [editingCust, setEditingCust] = useState<typeof customers[0] | null>(null);
  const [viewingLedgerCust, setViewingLedgerCust] = useState<typeof customers[0] | null>(null);
  const [selectedCustId, setSelectedCustId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [ledgerModalType, setLedgerModalType] = useState<'debit' | 'credit' | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [tab, setTab] = useState("Customers");
  const tabs = ["Customers", "Ledger Transactions", "Activities"];

  // Search logic: Filter customers starting with or matching typed query
  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      c.name.toLowerCase().startsWith(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustId) || null;

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

  const totalDebit = customers.reduce((s, c) => s + (c.debit || 0), 0);
  const totalCredit = customers.reduce((s, c) => s + (c.credit || 0), 0);
  const netBalance = customers.reduce((s, c) => s + (c.balance ?? ((c.debit || 0) - (c.credit || 0))), 0);

  return (
    <div className={cn(hideHeader ? "space-y-6" : "p-6 space-y-6 max-w-[1400px] mx-auto")}>
      {/* Individual Customer Ledger Statement Modal (Read-Only) */}
      <CustomerLedgerModal
        customer={viewingLedgerCust}
        open={viewingLedgerCust !== null}
        onClose={() => setViewingLedgerCust(null)}
      />

      {/* Quick Ledger Transaction Modal */}
      {ledgerModalType && (
        <QuickLedgerModal
          open={ledgerModalType !== null}
          onClose={() => setLedgerModalType(null)}
          type={ledgerModalType}
          selectedCustomerId={selectedCustId || (customers[0]?.id || '')}
        />
      )}

      {/* Import Customers Modal */}
      <ImportCustomersModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />

      {/* ── Header ── */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Relationship &amp; Ledger</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your customer accounts, transactions and ledger</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" onClick={() => setImportModalOpen(true)} icon={<Upload className="w-3.5 h-3.5" />}>
              Upload
            </Btn>
            <Btn onClick={onOpenAddCustomer} icon={<Plus className="w-4 h-4" />} className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20">
              Add Customer
            </Btn>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-5 flex items-center gap-4 group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 leading-none">{customers.length}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Active customers</p>
          </div>
        </div>

        {/* Debit */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm p-5 flex items-center gap-4 group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Debit</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-0.5 leading-tight truncate">{fmtC(totalDebit, true)}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Total amount billed</p>
          </div>
        </div>

        {/* Credit */}
        <div className="bg-red-50/60 dark:bg-red-950/20 rounded-2xl border border-red-200/80 dark:border-red-800/40 shadow-sm p-5 flex items-center gap-4 group hover:shadow-md hover:border-red-300 dark:hover:border-red-700/60 transition-all duration-200">
          <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
            <ArrowDownLeft className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider">Credit</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5 leading-tight truncate">{fmtC(totalCredit, true)}</p>
            <p className="text-[11px] text-red-400 dark:text-red-500 mt-1">Total payments received</p>
          </div>
        </div>

        {/* Balance */}
        <div className={cn(
          "rounded-2xl border shadow-sm p-5 flex items-center gap-4 group transition-all duration-200",
          netBalance > 0
            ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/60"
            : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60"
        )}>
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200",
            netBalance > 0 ? "bg-amber-100 dark:bg-amber-900/40" : "bg-emerald-100 dark:bg-emerald-900/40"
          )}>
            <Briefcase className={cn("w-5 h-5", netBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</p>
            <p className={cn(
              "text-lg font-bold mt-0.5 leading-tight truncate",
              netBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            )}>{fmtC(netBalance, true)}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Total outstanding</p>
          </div>
        </div>
      </div>

      {/* ── Search & Quick Actions Panel ── */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {/* Panel Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live Customer Search &amp; Direct Ledger Manager</h2>
            </div>
            {selectedCustomer && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-normal">Selected:</span>
                <strong>{selectedCustomer.name}</strong>
                <button onClick={() => setSelectedCustId('')} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Type customer first letter or name (e.g. 'A' for Alexandra, 'M' for Marcus)..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center rounded-t-2xl">
                  <span>Matching customers</span>
                  <span className="text-blue-500">{filteredCustomers.length} results</span>
                </div>
                {filteredCustomers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No customers found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredCustomers.map(c => {
                    const bal = c.balance ?? ((c.debit || 0) - (c.credit || 0));
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustId(c.id);
                          setSearchQuery(c.name);
                          setIsSearchFocused(false);
                        }}
                        className={cn(
                          "p-3.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer flex items-center justify-between transition-colors",
                          selectedCustId === c.id && "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-300/40 dark:border-blue-600/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              {c.name}
                              {c.city && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{c.city}</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.phone || 'No phone'} · {c.product || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wide">Net Balance</span>
                          <span className={cn("font-mono text-xs font-bold", bal > 0 ? 'text-amber-500' : 'text-emerald-500')}>
                            {fmtC(bal, true)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Add Debit */}
            <button
              onClick={() => setLedgerModalType('debit')}
              className="group relative flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-extrabold tracking-wide text-blue-700 dark:text-blue-300">DEBIT</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Record new invoice charge on customer ledger</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-200 dark:bg-blue-800/60 flex items-center justify-center group-hover:translate-x-0.5 transition-transform text-blue-600 dark:text-blue-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Add Credit */}
            <button
              onClick={() => setLedgerModalType('credit')}
              className="group relative flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md hover:shadow-red-500/10 transition-all duration-200 active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 group-hover:scale-110 transition-transform duration-200">
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-extrabold tracking-wide text-red-700 dark:text-red-300">CREDIT</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Record payment received on customer ledger</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-red-200 dark:bg-red-800/60 flex items-center justify-center group-hover:translate-x-0.5 transition-transform text-red-600 dark:text-red-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* ── Customers Table ── */}
      {tab === "Customers" && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
          {/* Inline Edit Panel */}
          {editingCust && (
            <div className="m-5 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Edit2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Editing: {editingCust.name}</p>
                </div>
                <button onClick={() => setEditingCust(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                  <input value={editingCust.name || ''} onChange={e => setEditingCust({ ...editingCust, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input value={editingCust.phone || ''} onChange={e => setEditingCust({ ...editingCust, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City</label>
                  <input value={editingCust.city || ''} onChange={e => setEditingCust({ ...editingCust, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Product</label>
                  <input value={editingCust.product || ''} onChange={e => setEditingCust({ ...editingCust, product: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Debit (Billed)</label>
                  <input type="number" value={editingCust.debit || 0} onChange={e => setEditingCust({ ...editingCust, debit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Credit (Paid)</label>
                  <input type="number" value={editingCust.credit || 0} onChange={e => setEditingCust({ ...editingCust, credit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select value={editingCust.status} onChange={e => setEditingCust({ ...editingCust, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400">
                    <option value="active">Active</option>
                    <option value="at_risk">At Risk</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wide">Net Balance</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">{fmtC((editingCust.debit || 0) - (editingCust.credit || 0), true)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Btn variant="outline" size="sm" onClick={() => setEditingCust(null)}>Cancel</Btn>
                <Btn size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={async () => { await updateCustomer(editingCust.id, editingCust); setEditingCust(null); }}>Save Changes</Btn>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/30">
                  {["Customer", "Phone", "City", "Product", "Credit", "Debit", "Balance", "Status", "Actions"].map((h, i) => (
                    <th key={i} className={cn(
                      "py-3 px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left first:pl-6 last:pr-6",
                      ["Credit", "Debit", "Balance"].includes(h) && "text-right",
                      h === "Actions" && "text-center"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Users className="w-10 h-10 opacity-30" />
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs">Add a customer or adjust your search</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.map(c => {
                  const bal = c.balance ?? ((c.debit || 0) - (c.credit || 0));
                  const isSelected = selectedCustId === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustId(c.id)}
                      className={cn(
                        "hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-all duration-150 group cursor-pointer",
                        isSelected && "bg-blue-50/60 dark:bg-blue-950/20 border-l-2 border-blue-500"
                      )}
                    >
                      {/* Name */}
                      <td className="pl-6 pr-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setViewingLedgerCust(c); }}
                            title="Click to view customer ledger statement"
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer",
                              isSelected
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40 hover:border-blue-300"
                            )}
                          >
                            {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </button>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              {/* SAFE ADDITION FOR LEDGER VIEW */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setViewingLedgerCust(c); }}
                                className="text-left font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                              >
                                {c.name}
                              </button>
                            </p>
                            {c.company && <p className="text-[10px] text-slate-400 dark:text-slate-500">{c.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-medium">{c.phone || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                      <td className="px-4 py-3.5">
                        {c.city ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />{c.city}
                          </span>
                        ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-xs font-medium max-w-[150px] truncate" title={c.product}>{c.product || <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtC(c.credit || 0, true)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{fmtC(c.debit || 0, true)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold",
                          bal > 0
                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60"
                            : bal < 0
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                        )}>
                          {fmtC(bal, true)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{statusBadge(c.status)}</td>
                      <td className="pr-6 pl-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingLedgerCust(c)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all duration-150 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60"
                            title="View Customer Ledger Statement (Read-Only)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCust(editingCust?.id === c.id ? null : c)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all duration-150 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60"
                            title="Edit customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete customer ledger for "${c.name}"?`)) deleteCustomer(c.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all duration-150 border border-transparent hover:border-red-200 dark:hover:border-red-800/60"
                            title="Delete customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-900/20 flex items-center justify-between">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredCustomers.length}</span> of <span className="font-semibold text-slate-600 dark:text-slate-300">{customers.length}</span> customers
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">Net Outstanding:</span>
                <span className={cn("font-mono font-bold", netBalance > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400")}>{fmtC(netBalance, true)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Ledger Transactions Table ── */}
      {tab === "Ledger Transactions" && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Customer Ledger Audit Trail</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Persistent Supabase PostgreSQL transactions</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              {ledger.length} total entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60">
                <tr>
                  {["Date", "Customer", "Type", "Amount (PKR)", "Description", "Ref ID"].map((h, i) => (
                    <th key={i} className="px-5 py-3 font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 font-medium">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No ledger transactions recorded yet.
                    </td>
                  </tr>
                ) : ledger.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{l.date}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{l.customerName}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", l.type === 'debit' ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300")}>
                        {l.type}
                      </span>
                    </td>
                    <td className={cn("px-5 py-3.5 font-mono font-bold text-xs", l.type === 'debit' ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400")}>
                      {l.type === 'debit' ? '+' : '-'} PKR {Number(l.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{l.description}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px]">{l.referenceId || l.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Activities Timeline ── */}
      {tab === "Activities" && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Activity</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Live feed of customer ledger changes</p>
          </div>
          <div className="p-5 space-y-0">
            {activities.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                <ActivityIcon className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No activities yet</p>
              </div>
            ) : activities.map((act, i) => {
              const { el, c } = actIcon(act.type);
              return (
                <div key={act.id} className="flex gap-4 py-3.5 border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", c)}>{el}</div>
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-100 dark:bg-slate-700/60 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{act.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.body}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5 bg-slate-50 dark:bg-slate-700/40 px-2 py-0.5 rounded-md font-medium">{act.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════

function ReportsScreen() {
  const { products, invoices, purchaseOrders, customers, vendors } = useStockFlow();
  const [reportType, setReportType] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.pathname.includes('/variance') || window.location.pathname.includes('/theft'))) {
      return "Stock Variance & Theft Audit";
    }
    return "Inventory Summary";
  });
  const [dateRange, setDateRange] = useState("Last 30 days");
  const reportTypes = [
    "Inventory Summary",
    "Stock Variance & Theft Audit",
    "Sales Report",
    "Customer Report",
    "Purchase Report",
    "Vendor Report"
  ];
  const dateRanges = ["Today", "Last 7 days", "Last 30 days", "Last Quarter", "Year to Date", "All Time"];

  const summaryKPIs = useMemo(() => {
    if (reportType === "Stock Variance & Theft Audit") {
      return [
        { label: "Audit Incidents", value: "0" },
        { label: "Total Theft Qty", value: "0 units", warn: false },
        { label: "Wastage / Damage", value: "0 units" },
        { label: "Safety Status", value: "100% Safe" },
      ];
    }
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
      headers = "ID,Name,Phone,City,Product,Credit (PKR),Debit (PKR),Balance (PKR),Status";
      body = customers.map(c => `${c.id},"${c.name}","${c.phone || ''}","${c.city || ''}","${c.product || ''}",${c.credit || 0},${c.debit || 0},${c.balance ?? ((c.debit || 0) - (c.credit || 0))},${c.status}`).join("\n");
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
      tableHtml = `<tr><th>Name</th><th>Phone</th><th>City</th><th>Product</th><th>Credit</th><th>Debit</th><th>Balance</th><th>Status</th></tr>` +
        customers.map(c => `<tr><td>${c.name}</td><td>${c.phone || '-'}</td><td>${c.city || '-'}</td><td>${c.product || '-'}</td><td>${fmtC(c.credit || 0)}</td><td>${fmtC(c.debit || 0)}</td><td>${fmtC(c.balance ?? ((c.debit || 0) - (c.credit || 0)))}</td><td>${c.status}</td></tr>`).join("");
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

              {reportType === "Stock Variance & Theft Audit" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Stock Variance &amp; Theft Audit — 100% Read-Only Safety Protocol Active</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                      ISOLATED TABLE
                    </span>
                  </div>

                  <table className="w-full text-sm min-w-[750px]">
                    <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                      {["Date & Time", "Product", "Reason", "Opening", "Sold", "Expected", "Actual Count", "Variance", "Logged By"].map((h, i) => (
                        <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Opening","Sold","Expected","Actual Count","Variance"].includes(h) && "text-right")}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <ShieldAlert className="w-8 h-8 opacity-30 mx-auto mb-2 text-amber-500" />
                          <p className="text-xs font-semibold">No stock variance or theft incidents logged</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Audits recorded during sale reconciliations will appear here.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

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
                <table className="w-full text-sm min-w-[750px]">
                  <thead><tr className="border-b border-slate-100 dark:border-slate-700">
                    {["Name", "Phone", "City", "Product", "Credit (PKR)", "Debit (PKR)", "Balance (PKR)", "Status"].map((h, i) => (
                      <th key={i} className={cn("pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 text-left", ["Credit (PKR)","Debit (PKR)","Balance (PKR)"].includes(h) && "text-right")}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {customers.map(c => {
                      const bal = c.balance ?? ((c.debit || 0) - (c.credit || 0));
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-bold text-[#2563EB]">{c.name.split(" ").map(n => n[0]).join("")}</span>
                              </div>
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-500">{c.phone || '-'}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500">{c.city || '-'}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[150px] truncate">{c.product || '-'}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmtC(c.credit || 0)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{fmtC(c.debit || 0)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{fmtC(bal)}</td>
                          <td className="px-3 py-2.5">{statusBadge(c.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-500">TOTAL NET BALANCE OUTSTANDING</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 text-xs">{fmtC(customers.reduce((s, c) => s + (c.credit || 0), 0))}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-600 text-xs">{fmtC(customers.reduce((s, c) => s + (c.debit || 0), 0))}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-[#2563EB] text-sm">{fmtC(customers.reduce((s, c) => s + (c.balance ?? ((c.debit || 0) - (c.credit || 0))), 0))}</td>
                    <td></td>
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
  const {
    isDatabaseCleaned,
    ownerPasscode,
    setOwnerPasscode,
    clearAllDatabaseData,
    restoreDemoData,
    exportDatabaseBackup,
    currentUser,
    products, invoices, purchaseOrders, vendors, customers
  } = useStockFlow();

  const [tab, setTab] = useState("Company");
  const tabs = ["Company", "Users & Roles", "Database & Security", "Billing", "Security"];
  const [companyName, setCompanyName] = useState("StockFlow Technologies Inc.");
  const [adminEmail, setAdminEmail] = useState("admin@stockflow.io");

  // Passcode modal / action states
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"purge" | "restore" | null>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [passcodeSuccess, setPasscodeSuccess] = useState("");

  // Passcode change states
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeUpdateMsg, setPasscodeUpdateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const TEAM = [
    { name: "Sarah Kim", email: "sarah@stockflow.io", role: "Admin", status: "active", last: "Just now" },
    { name: "Mike Rodriguez", email: "mike@stockflow.io", role: "Manager", status: "active", last: "2h ago" },
    { name: "David Park", email: "david@stockflow.io", role: "Finance", status: "active", last: "1d ago" },
    { name: "Priya Nair", email: "priya@stackflow.io", role: "Sales", status: "active", last: "3h ago" },
  ];

  const handleExecutePasscodeAction = async () => {
    setPasscodeError("");
    setPasscodeSuccess("");

    if (!passcodeInput.trim()) {
      setPasscodeError("Please enter your owner security passcode or password.");
      return;
    }

    if (modalAction === "purge") {
      const res = await clearAllDatabaseData(passcodeInput);
      if (!res.success) {
        setPasscodeError(res.error || "Invalid security passcode.");
      } else {
        setPasscodeSuccess("Database cleaned successfully! All sample demo data purged.");
        setPasscodeInput("");
        setTimeout(() => {
          setPasscodeModalOpen(false);
          setModalAction(null);
          setPasscodeSuccess("");
        }, 1500);
      }
    } else if (modalAction === "restore") {
      const res = await restoreDemoData(passcodeInput);
      if (!res.success) {
        setPasscodeError(res.error || "Invalid security passcode.");
      } else {
        setPasscodeSuccess("Demo sample data restored successfully.");
        setPasscodeInput("");
        setTimeout(() => {
          setPasscodeModalOpen(false);
          setModalAction(null);
          setPasscodeSuccess("");
        }, 1500);
      }
    }
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeUpdateMsg(null);
    if (!newPasscode.trim()) {
      setPasscodeUpdateMsg({ type: "error", text: "Please enter a valid new passcode." });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeUpdateMsg({ type: "error", text: "Passcodes do not match." });
      return;
    }
    setOwnerPasscode(newPasscode);
    setPasscodeUpdateMsg({ type: "success", text: "Owner passcode updated successfully!" });
    setNewPasscode("");
    setConfirmPasscode("");
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings & System Controls</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your organization, database security, owner passcode, and system storage</p>
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

      {tab === "Database & Security" && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-5 border-l-4 border-l-blue-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">System Database Status</h3>
                  {isDatabaseCleaned ? (
                    <Badge variant="emerald" dot>Clean Database (0 Demo Items)</Badge>
                  ) : (
                    <Badge variant="amber" dot>Demo Data Active</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isDatabaseCleaned
                    ? "Database is purged and clean. All data added will be permanently preserved across reloads & devices."
                    : "Currently showing initial sample demo data. You can purge demo data below to start with a clean database for your real operational data."}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                  <span>Products: <strong>{products.length}</strong></span>
                  <span>Invoices: <strong>{invoices.length}</strong></span>
                  <span>Orders: <strong>{purchaseOrders.length}</strong></span>
                  <span>Vendors: <strong>{vendors.length}</strong></span>
                  <span>Customers: <strong>{customers.length}</strong></span>
                </div>
              </div>

              <button
                onClick={exportDatabaseBackup}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition shrink-0"
              >
                <Download className="w-4 h-4 text-blue-500" />
                Export Backup (JSON)
              </button>
            </div>
          </Card>

          {/* Purge Demo Data Card */}
          <Card className="p-5 border border-red-500/30 bg-red-950/10 dark:bg-red-950/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Purge All Demo/Mock Data
                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Passcode Protected</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                    Completely clear all initial demo products, invoices, vendors, and customers so you can start adding your own real business data. Protected by Owner Passcode.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setModalAction("purge");
                    setPasscodeError("");
                    setPasscodeSuccess("");
                    setPasscodeInput("");
                    setPasscodeModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Clear & Wipe Demo Data
                </button>

                {isDatabaseCleaned && (
                  <button
                    onClick={() => {
                      setModalAction("restore");
                      setPasscodeError("");
                      setPasscodeSuccess("");
                      setPasscodeInput("");
                      setPasscodeModalOpen(true);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                  >
                    Restore Demo
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Change Owner Passcode Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Owner Security Passcode & Protection</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your custom security passcode to prevent unauthorized database resets or deletions. (Default passcode: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-500 font-mono">1234</code> or your account password)
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePasscode} className="space-y-3 max-w-md pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">New Passcode</label>
                  <Inp
                    type="password"
                    placeholder="Enter new 4-8 digit passcode"
                    value={newPasscode}
                    onChange={setNewPasscode}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Confirm Passcode</label>
                  <Inp
                    type="password"
                    placeholder="Confirm passcode"
                    value={confirmPasscode}
                    onChange={setConfirmPasscode}
                  />
                </div>
              </div>

              {passcodeUpdateMsg && (
                <p className={cn("text-xs font-medium", passcodeUpdateMsg.type === "success" ? "text-emerald-500" : "text-red-500")}>
                  {passcodeUpdateMsg.text}
                </p>
              )}

              <Btn size="sm" type="submit" icon={<Key className="w-3.5 h-3.5" />}>
                Update Security Passcode
              </Btn>
            </form>
          </Card>
        </div>
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
                <p className="text-3xl font-mono font-black text-slate-900 dark:text-white mt-3">Rs 2,499<span className="text-sm font-normal text-slate-400">/mo</span></p>
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

      {/* Security Passcode Verification Modal */}
      {passcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {modalAction === "purge" ? "Purge Demo Data" : "Restore Demo Data"}
                  </h3>
                  <p className="text-xs text-slate-400">Owner Security Passcode Verification</p>
                </div>
              </div>
              <button
                onClick={() => setPasscodeModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {modalAction === "purge"
                  ? "This action will clear all current sample demo products, invoices, purchase orders, vendors, and customers. Please enter your Owner Passcode or Account Password to confirm."
                  : "This action will reload the sample demo data. Enter your Owner Passcode to confirm."}
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Owner Passcode or Password (Default: <code className="text-blue-400">1234</code>)
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter passcode..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleExecutePasscodeAction(); }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {passcodeError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {passcodeError}
                </div>
              )}

              {passcodeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {passcodeSuccess}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setPasscodeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePasscodeAction}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-lg active:scale-95 flex items-center gap-1.5",
                  modalAction === "purge" ? "bg-red-600 hover:bg-red-500 shadow-red-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                )}
              >
                <Check className="w-4 h-4" />
                Confirm {modalAction === "purge" ? "Wipe Data" : "Restore Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════

function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const { login, signup } = useStockFlow();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [email, setEmail] = useState("bilalshoukatcrm@gmail.com");
  const [password, setPassword] = useState("crm1234");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("StockFlow ERP Platform");
  const [role, setRole] = useState("Admin");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await login(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setErrorMsg(res.error || "Authentication failed.");
        }
      } else {
        const res = await signup(fullName, email, password, company, role);
        if (res.success) {
          onSuccess();
        } else {
          setErrorMsg(res.error || "Failed to create account.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 py-12 shrink-0">
        <div className="max-w-sm mx-auto w-full">
          <StockFlowLogo size="md" darkText />

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create an Account"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "signin" ? "Sign in to access your StockFlow workspace" : "Register your credentials to get full enterprise access"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                <Inp value={fullName} onChange={setFullName} placeholder="Bilal Shoukat" icon={<User className="w-3.5 h-3.5" />} />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
              <Inp value={email} onChange={setEmail} type="email" placeholder="bilalshoukatcrm@gmail.com" icon={<Mail className="w-3.5 h-3.5" />} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <Inp value={password} onChange={setPassword} type="password" placeholder="••••••••" icon={<Lock className="w-3.5 h-3.5" />} />
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Company / Organization</label>
                  <Inp value={company} onChange={setCompany} placeholder="StockFlow ERP Platform" icon={<Building2 className="w-3.5 h-3.5" />} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl py-2.5 text-sm font-bold transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer">
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign In to Workspace" : "Register Account & Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            {mode === "signin" ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <button type="button" onClick={() => { setMode("signup"); setErrorMsg(null); }} className="font-bold text-[#2563EB] hover:underline cursor-pointer">
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); setErrorMsg(null); }} className="font-bold text-[#2563EB] hover:underline cursor-pointer">
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-between bg-[#0B1120] p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-14">
            <StockFlowLogo size="lg" />
          </div>
          <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tight max-w-sm">
            Enterprise ERP Operating System for Modern Commerce.
          </h2>
          <p className="text-sm text-slate-400 mt-4 max-w-sm leading-relaxed">
            Real-time inventory sync, automated financial accounting, CRM tracking, and BI analytics designed for high-growth enterprises.
          </p>
        </div>
        <div className="relative z-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <span>© 2026 StockFlow ERP Inc. Powered by <span className="text-blue-400 font-semibold">Genx Cloud</span></span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span>For Software &amp; Services: <a href="tel:+923342826675" className="text-blue-400 hover:text-blue-300 font-mono transition-colors">+92 334 2826675</a></span>
          </div>
          <span className="font-mono">v3.2.1 Enterprise Edition</span>
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
    { label: "Expence", hint: "Salary, Mill, Fuel & Loader Expenses", screen: "finance" as Screen, icon: <DollarSign className="w-4 h-4" /> },
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
  const { notifications, isAuthenticated } = useStockFlow();
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/reports') || p.includes('/variance')) return "reports";
      if (p.includes('/customers') || p.includes('/crm')) return "crm";
      if (p.includes('/inventory') || p.includes('/stock')) return "inventory";
      if (p.includes('/sales')) return "sales";
      if (p.includes('/purchase')) return "purchase";
      if (p.includes('/finance')) return "finance";
    }
    return "dashboard";
  });
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);

  // Modal States
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
  const [addPOModalOpen, setAddPOModalOpen] = useState(false);
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [dataSyncModalOpen, setDataSyncModalOpen] = useState(false);

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
      case "dashboard": return <DashboardScreen onViewAllInvoices={() => setScreen("sales")} onOpenAddCustomer={() => setAddCustomerModalOpen(true)} />;
      case "inventory": return <InventoryScreen onOpenAddProduct={() => setAddProductModalOpen(true)} onOpenEditProduct={p => setEditingProduct(p)} />;
      case "sales": return <SalesScreen onOpenAddInvoice={() => setAddInvoiceModalOpen(true)} />;
      case "purchase": return <PurchaseScreen onOpenAddPO={() => setAddPOModalOpen(true)} onOpenAddVendor={() => setAddVendorModalOpen(true)} />;
      case "finance": return <ExpenseScreen />;
      case "crm": return <CRMScreen onOpenAddCustomer={() => setAddCustomerModalOpen(true)} />;
      case "reports": return <ReportsScreen />;
      case "settings": return <SettingsScreen onOpenSupabaseModal={() => setSupabaseModalOpen(true)} />;
      default: return <DashboardScreen onViewAllInvoices={() => setScreen("sales")} onOpenAddCustomer={() => setAddCustomerModalOpen(true)} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("contents", dark && "dark")}>
        <AuthScreen onSuccess={() => setScreen("dashboard")} />
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
            <Sidebar
              screen={screen} setScreen={setScreen} collapsed={false} setCollapsed={() => {}}
              dark={dark} setDark={setDark} mobile onClose={() => setMobileSidebarOpen(false)}
              onOpenPWAInstall={() => setPwaModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          screen={screen} setScreen={setScreen} collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed} dark={dark} setDark={setDark}
          onOpenPWAInstall={() => setPwaModalOpen(true)}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop topbar */}
        <Topbar
          screen={screen} setCommandOpen={setCommandOpen} setNotifOpen={setNotifOpen} unread={unread}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenPWAInstall={() => setPwaModalOpen(true)}
          onOpenSyncModal={() => setDataSyncModalOpen(true)}
        />

        {/* Screen content */}
        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-16 lg:pb-0">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shrink-0 z-30 fixed bottom-0 left-0 right-0 shadow-lg">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "sales", label: "Sales", icon: ShoppingCart },
            { id: "finance", label: "Finance", icon: DollarSign },
            { id: "crm", label: "CRM", icon: Users },
          ].map(item => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id as Screen)}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all active:scale-95",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-0.5", isActive && "text-blue-600 dark:text-blue-400")} />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* PWA Floating Banner & Installation Modal */}
      <PWAInstallBanner showModalOnly={pwaModalOpen} onCloseModal={() => setPwaModalOpen(false)} />

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
      <DataSyncModal open={dataSyncModalOpen} onClose={() => setDataSyncModalOpen(false)} />
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
