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
  DispatchRecord,
  DispatchItem,
  DispatchCustomerGroup,
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

import { PWAInstallBanner } from "./components/PWAInstallBanner";

// ═══════════════════════════════════════════════════════════
// TYPES & CHARTS DATA
// ═══════════════════════════════════════════════════════════

type Screen =
  | "auth"
  | "dashboard" | "inventory" | "sales" | "purchase" | "dispatch"
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
    dispatched: { v: "info", l: "Dispatched" }, delivered: { v: "success", l: "Delivered" },
    cancelled: { v: "danger", l: "Cancelled" },
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
    { id: "dispatch", label: "Dispatch System", icon: Truck },
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

function Topbar({ screen, setCommandOpen, setNotifOpen, unread, onOpenMobileMenu, onOpenPWAInstall }: {
  screen: string; setCommandOpen: (o: boolean) => void; setNotifOpen: (o: boolean) => void; unread: number;
  onOpenMobileMenu?: () => void;
  onOpenPWAInstall?: () => void;
}) {
  const { currentUser, logout, refreshData, isLoading } = useStockFlow();
  const initials = currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "BS";
  const labels: Record<string, string> = {
    dashboard: "Executive Dashboard", inventory: "Inventory Management",
    sales: "Sales", purchase: "Purchasing", dispatch: "Dispatch & Gate Pass (GOT)",
    finance: "Finance", crm: "Customer Relationship",
    reports: "Reports", settings: "Settings",
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

function DashboardScreen({ onViewAllInvoices }: { onViewAllInvoices?: () => void }) {
  const { products, invoices, purchaseOrders, refreshData, isLoading, currentUser } = useStockFlow();
  const [insightIdx, setInsightIdx] = useState(0);

  // ── Dynamic KPI calculations from live data ──
  const totalRev = invoices.reduce((s, i) => s + (i.status === 'paid' ? i.amount : 0), 0);
  const totalCost = purchaseOrders.reduce((s, po) => s + (po.total ?? 0), 0);
  const grossMarginPct = totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) + '%' : '0.0%';

  // Revenue & Profit per month — built from real invoices
  const revenueChartData = useMemo(() => {
    const byMonth: Record<string, { revenue: number; profit: number }> = {};
    MONTH_LABELS.forEach(m => { byMonth[m] = { revenue: 0, profit: 0 }; });
    invoices.forEach(inv => {
      if (!inv.date) return;
      const d = new Date(inv.date);
      if (isNaN(d.getTime())) return;
      const m = MONTH_LABELS[d.getMonth()];
      if (!m) return;
      byMonth[m].revenue += inv.amount || 0;
      if (inv.status === 'paid') byMonth[m].profit += inv.amount || 0;
    });
    // deduct PO costs from profit proportionally across months
    purchaseOrders.forEach(po => {
      const d = new Date(po.date ?? '');
      if (isNaN(d.getTime())) return;
      const m = MONTH_LABELS[d.getMonth()];
      if (!m) return;
      byMonth[m].profit -= po.total ?? 0;
    });
    return MONTH_LABELS.map(m => ({ month: m, revenue: Math.max(0, byMonth[m].revenue), profit: Math.max(0, byMonth[m].profit) }));
  }, [invoices, purchaseOrders]);

  // Orders by channel — derived from invoice notes/channel field or fallback to 'Direct'
  const channelChartData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => {
      const ch = (inv as any).channel || 'Direct';
      map[ch] = (map[ch] || 0) + 1;
    });
    if (Object.keys(map).length === 0) return [{ channel: 'Direct', orders: 0 }];
    return Object.entries(map).map(([channel, orders]) => ({ channel, orders })).sort((a, b) => b.orders - a.orders);
  }, [invoices]);
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live real-time business overview — StockFlow ERP.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={handleExportPDF} icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
          <Btn size="sm" onClick={async () => { await refreshData(); }} disabled={isLoading} icon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-white")} />}>{isLoading ? "Refreshing…" : "Refresh"}</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue MTD" value={fmtC(totalRev)}
          delta={18.4} deltaLabel="vs last mo."
          icon={<DollarSign className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50 dark:bg-blue-950/50" />
        <StatCard label="Total Orders" value={fmtN(invoices.length)}
          delta={0} deltaLabel="total invoices"
          icon={<ShoppingCart className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-50 dark:bg-emerald-950/50" />
        <StatCard label="Gross Margin" value={grossMarginPct}
          delta={0} deltaLabel="revenue vs cost"
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
            <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
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
            <BarChart data={channelChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
// DISPATCH & GATE PASS (GOT) SYSTEM
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// DISPATCH & GATE PASS (GOT) SYSTEM — MULTI-CUSTOMER IN ONE GOT
// ═══════════════════════════════════════════════════════════

interface CustomerOrderItem {
  productId: string;
  sku: string;
  name: string;
  cat: string;
  wh: string;
  price: number;
  availableQty: number;
  dispatchQty: number;
}

interface CustomerOrderEntry {
  id: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  address: string;
  items: CustomerOrderItem[];
}

function DispatchScreen() {
  const {
    products,
    dispatches,
    addDispatch,
    updateDispatchStatus,
    adjustStock,
    customers,
    currentUser,
    addInvoice,
  } = useStockFlow();

  const [tab, setTab] = useState("New Dispatch");
  const tabs = ["New Dispatch", "Dispatch History", "Analytics"];

  // Product Selection & Search State (Feature 2)
  const [prodSearch, setProdSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock">("all");

  // Multi-Customer State
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderEntry[]>([
    {
      id: "cust-1",
      customerName: "",
      contactPerson: "",
      phone: "",
      address: "",
      items: [],
    },
  ]);
  const [activeCustIdx, setActiveCustIdx] = useState(0);

  // Common Dispatch Info
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [notes, setNotes] = useState("");

  // History Filter & Modal State
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [viewingDispatch, setViewingDispatch] = useState<DispatchRecord | null>(null);
  const [createdDispatchSuccess, setCreatedDispatchSuccess] = useState<DispatchRecord | null>(null);

  // Categories list
  const productCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.cat).filter(Boolean)));
  }, [products]);

  // Filter products for selection
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !prodSearch ||
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.cat.toLowerCase().includes(prodSearch.toLowerCase()) ||
        (p.wh && p.wh.toLowerCase().includes(prodSearch.toLowerCase()));

      const matchCat = selectedCat === "All" || p.cat === selectedCat;

      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.qty > 0) ||
        (stockFilter === "low_stock" && p.qty <= p.min);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, prodSearch, selectedCat, stockFilter]);

  // Customer Management
  const handleAddCustomer = () => {
    const newEntry: CustomerOrderEntry = {
      id: `cust-${Date.now()}`,
      customerName: "",
      contactPerson: "",
      phone: "",
      address: "",
      items: [],
    };
    setCustomerOrders(prev => [...prev, newEntry]);
    setActiveCustIdx(customerOrders.length);
  };

  const handleRemoveCustomer = (idx: number) => {
    if (customerOrders.length <= 1) return;
    const updated = customerOrders.filter((_, i) => i !== idx);
    setCustomerOrders(updated);
    setActiveCustIdx(Math.max(0, Math.min(activeCustIdx, updated.length - 1)));
  };

  const handleUpdateCustomerField = (custIdx: number, field: keyof CustomerOrderEntry, val: string) => {
    setCustomerOrders(prev =>
      prev.map((c, i) => {
        if (i !== custIdx) return c;
        const updated = { ...c, [field]: val };
        if (field === "customerName") {
          const match = customers.find(
            cust =>
              cust.name.toLowerCase() === val.toLowerCase() ||
              cust.company.toLowerCase() === val.toLowerCase()
          );
          if (match) {
            updated.contactPerson = match.name;
            updated.phone = match.email;
            updated.address = match.company;
          }
        }
        return updated;
      })
    );
  };

  // Product Cart Management for Active Customer
  const handleAddToCart = (prod: Product, targetCustIdx = activeCustIdx) => {
    setCustomerOrders(prev =>
      prev.map((cust, i) => {
        if (i !== targetCustIdx) return cust;
        const existing = cust.items.find(item => item.productId === prod.id);
        if (existing) {
          return {
            ...cust,
            items: cust.items.map(item =>
              item.productId === prod.id
                ? { ...item, dispatchQty: item.dispatchQty + 1 }
                : item
            ),
          };
        }
        return {
          ...cust,
          items: [
            ...cust.items,
            {
              productId: prod.id,
              sku: prod.sku,
              name: prod.name,
              cat: prod.cat,
              wh: prod.wh || "Main Warehouse",
              price: prod.price,
              availableQty: prod.qty,
              dispatchQty: 1,
            },
          ],
        };
      })
    );
  };

  const handleUpdateCartQty = (custIdx: number, productId: string, qty: number) => {
    setCustomerOrders(prev =>
      prev.map((cust, i) => {
        if (i !== custIdx) return cust;
        if (qty <= 0) {
          return {
            ...cust,
            items: cust.items.filter(item => item.productId !== productId),
          };
        }
        return {
          ...cust,
          items: cust.items.map(item =>
            item.productId === productId ? { ...item, dispatchQty: qty } : item
          ),
        };
      })
    );
  };

  const handleRemoveFromCart = (custIdx: number, productId: string) => {
    setCustomerOrders(prev =>
      prev.map((cust, i) => {
        if (i !== custIdx) return cust;
        return {
          ...cust,
          items: cust.items.filter(item => item.productId !== productId),
        };
      })
    );
  };

  // Combined Totals Across ALL Customers
  const combinedTotalUnits = customerOrders.reduce(
    (total, cust) => total + cust.items.reduce((s, i) => s + i.dispatchQty, 0),
    0
  );
  const combinedTotalValue = customerOrders.reduce(
    (total, cust) => total + cust.items.reduce((s, i) => s + i.price * i.dispatchQty, 0),
    0
  );
  const combinedTotalLineItems = customerOrders.reduce(
    (total, cust) => total + cust.items.length,
    0
  );
  const hasAnyShortage = customerOrders.some(cust =>
    cust.items.some(item => item.dispatchQty > item.availableQty)
  );
  const totalShortageUnits = customerOrders.reduce(
    (sum, cust) =>
      sum +
      cust.items.reduce(
        (s, i) => s + Math.max(0, i.dispatchQty - i.availableQty),
        0
      ),
    0
  );

  const safeActiveCustIdx = Math.min(activeCustIdx, customerOrders.length - 1);
  const activeCustomer = customerOrders[safeActiveCustIdx] || customerOrders[0];

  // ═══════════════════════════════════════════════════════════
  // SINGLE GOT PRINT (MULTIPLE CUSTOMERS IN ONE RECEIPT)
  // ═══════════════════════════════════════════════════════════
  const handlePrintGOT = (record: DispatchRecord) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the Gate Out Token (GOT).");
      return;
    }

    const totalUnits = record.items.reduce((s, i) => s + i.dispatchQty, 0);

    // Build customers and products sequence for single GOT
    let customerSectionsHtml = "";
    if (record.customerGroups && record.customerGroups.length > 0) {
      customerSectionsHtml = record.customerGroups.map((cg, idx) => `
        <div style="margin-bottom: 14px;">
          <div style="font-weight: 900; font-size: 15px; color: #000; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
            ${cg.customerName || `CUSTOMER ${idx + 1}`}
          </div>
          <div style="padding-left: 2px;">
            ${cg.items.map(item => `
              <div style="margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 13px; text-transform: uppercase; color: #000; line-height: 1.2;">
                  ${item.name}
                </div>
                <div style="font-weight: 900; font-family: monospace; font-size: 14px; color: #000; margin-top: 2px;">
                  x ${item.dispatchQty}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('<div style="border-top: 1px dashed #666; margin: 10px 0;"></div>');
    } else {
      customerSectionsHtml = `
        <div style="margin-bottom: 14px;">
          <div style="font-weight: 900; font-size: 15px; color: #000; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
            ${record.dispatchTo || "CUSTOMER"}
          </div>
          <div style="padding-left: 2px;">
            ${record.items.map(item => `
              <div style="margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 13px; text-transform: uppercase; color: #000; line-height: 1.2;">
                  ${item.name}
                </div>
                <div style="font-weight: 900; font-family: monospace; font-size: 14px; color: #000; margin-top: 2px;">
                  x ${item.dispatchQty}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GOT #${record.tokenNo} — Single Gate Out Token</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 4mm 6mm;
            }
            body {
              font-family: 'Courier New', Courier, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, monospace;
              width: 330px;
              max-width: 100%;
              margin: 0 auto;
              padding: 12px 10px;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .text-center { text-align: center; }
            .header-title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
            .header-sub { font-size: 11px; font-weight: bold; margin-top: 2px; text-transform: uppercase; }
            .header-meta { font-size: 10.5px; margin-top: 3px; color: #111; }
            .divider { border-top: 1.5px dashed #000; margin: 10px 0; }
            .solid-divider { border-top: 2px solid #000; margin: 12px 0 10px 0; }
            .dispatch-heading { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .total-section { font-size: 14px; font-weight: 900; text-transform: uppercase; display: flex; justify-content: space-between; padding: 4px 0; }
            .footer { font-size: 10px; text-align: center; margin-top: 14px; color: #222; }
            .signatures-box { margin-top: 20px; padding-top: 10px; border-top: 1px dashed #666; display: flex; justify-content: space-between; font-size: 9.5px; font-weight: bold; }
            @media print {
              body { width: 100%; padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="header-title">${currentUser?.company || "StockFlow ERP Platform"}</div>
            <div class="header-sub">Goods Outward Token (Gate Out Pass)</div>
            <div class="header-meta">Token #: <strong>${record.tokenNo}</strong></div>
            <div class="header-meta">Date: ${record.date} · Time: ${record.time}</div>
            ${record.createdBy ? `<div class="header-meta">Issued By: ${record.createdBy}</div>` : ""}
          </div>

          <div class="divider"></div>

          <div class="dispatch-heading">DISPATCH TO:</div>

          ${customerSectionsHtml}

          <div class="solid-divider"></div>

          <div class="total-section">
            <span>TOTAL ITEMS:</span>
            <span style="font-family: monospace; font-size: 16px;">${fmtN(totalUnits)}</span>
          </div>

          ${
            record.notes
              ? `<div style="font-size: 10px; margin-top: 6px; padding: 4px 0; border-top: 1px dotted #999;">
                  <strong>Notes:</strong> ${record.notes}
                 </div>`
              : ""
          }

          <div class="divider"></div>

          <div class="footer">
            <p style="font-weight: bold; margin: 0 0 2px 0;">Official Warehouse &amp; Security Clearance</p>
            <p style="margin: 0;">Verified &amp; Released from Production Dispatch</p>
          </div>

          <div class="signatures-box">
            <div>DISPATCH OFFICER<br><span style="font-weight: normal; font-size: 8px;">(Sign)</span></div>
            <div>SECURITY GATE<br><span style="font-weight: normal; font-size: 8px;">(Stamp/Out)</span></div>
            <div>RECEIVER<br><span style="font-weight: normal; font-size: 8px;">(Sign)</span></div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ═══════════════════════════════════════════════════════════
  // COMPLETE BILL PRINT
  // ═══════════════════════════════════════════════════════════
  const handlePrintBill = (record: DispatchRecord) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the Complete Sales Bill.");
      return;
    }

    const totalUnits = record.items.reduce((s, i) => s + i.dispatchQty, 0);

    let subtotal = 0;
    let tableRows = "";

    if (record.customerGroups && record.customerGroups.length > 0) {
      tableRows = record.customerGroups.map((cg, gIdx) => {
        const groupRows = cg.items.map((item, idx) => {
          const prod = products.find(p => p.id === item.productId || p.sku === item.sku);
          const price = prod ? prod.price : 100;
          const lineTotal = price * item.dispatchQty;
          subtotal += lineTotal;

          return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 6px; text-align: center; font-family: monospace;">${gIdx + 1}.${idx + 1}</td>
              <td style="padding: 8px 6px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 12px;">${item.name}</div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">For: <strong>${cg.customerName}</strong> · SKU: ${item.sku}</div>
              </td>
              <td style="padding: 8px 6px; text-align: center; font-family: monospace; font-weight: bold;">
                ${fmtN(item.dispatchQty)}
              </td>
              <td style="padding: 8px 6px; text-align: right; font-family: monospace;">
                ${fmtC(price)}
              </td>
              <td style="padding: 8px 6px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">
                ${fmtC(lineTotal)}
              </td>
            </tr>
          `;
        }).join("");
        return groupRows;
      }).join("");
    } else {
      tableRows = record.items.map((item, idx) => {
        const prod = products.find(p => p.id === item.productId || p.sku === item.sku);
        const price = prod ? prod.price : 100;
        const lineTotal = price * item.dispatchQty;
        subtotal += lineTotal;

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 6px; text-align: center; font-family: monospace;">${idx + 1}</td>
            <td style="padding: 8px 6px;">
              <div style="font-weight: 700; color: #0f172a; font-size: 12px;">${item.name}</div>
              <div style="font-size: 10px; color: #64748b; font-family: monospace;">SKU: ${item.sku}</div>
            </td>
            <td style="padding: 8px 6px; text-align: center; font-family: monospace; font-weight: bold;">
              ${fmtN(item.dispatchQty)}
            </td>
            <td style="padding: 8px 6px; text-align: right; font-family: monospace;">
              ${fmtC(price)}
            </td>
            <td style="padding: 8px 6px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">
              ${fmtC(lineTotal)}
            </td>
          </tr>
        `;
      }).join("");
    }

    const grandTotal = subtotal;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Bill #${record.tokenNo} — ${record.dispatchTo}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 15px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #16a34a; padding-bottom: 14px; margin-bottom: 16px; }
            .title-box h1 { margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; }
            .title-box .sub { font-size: 13px; font-weight: 800; color: #16a34a; text-transform: uppercase; margin-top: 4px; }
            .inv-badge { background: #16a34a; color: #fff; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-family: monospace; font-size: 14px; display: inline-block; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 12px; }
            .box-heading { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 12px; }
            th { background: #f1f5f9; padding: 8px 6px; text-align: left; font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; }
            .sum-box { width: 280px; margin-left: auto; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 12px; margin-bottom: 20px; }
            .sum-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grand-total { border-top: 2px solid #16a34a; padding-top: 6px; margin-top: 6px; font-size: 15px; font-weight: 900; color: #16a34a; }
            .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 36px; }
            .sig-col { border-top: 1.5px dashed #64748b; padding-top: 6px; text-align: center; font-size: 10px; font-weight: 700; color: #334155; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-box">
              <h1>${currentUser?.company || "StockFlow ERP Platform"}</h1>
              <div class="sub">Complete Commercial Sale &amp; Dispatch Bill</div>
            </div>
            <div style="text-align: right;">
              <div class="inv-badge">BILL-${record.tokenNo}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${record.date} · ${record.time}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="box">
              <div class="box-heading">Dispatched &amp; Billed To</div>
              <div class="row"><span>Customers:</span><strong>${record.dispatchTo}</strong></div>
              <div class="row"><span>Total Customer Groups:</span><strong>${record.customerGroups?.length || 1} Customer(s)</strong></div>
            </div>
            <div class="box">
              <div class="box-heading">Token Reference</div>
              <div class="row"><span>Token #:</span><strong style="color: #2563eb; font-family: monospace;">${record.tokenNo}</strong></div>
              <div class="row"><span>Status:</span><strong style="color: #16a34a;">Sale Completed &amp; Delivered</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Item Description &amp; Customer Group</th>
                <th style="width: 90px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 130px; text-align: right;">Total (PKR)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="sum-box">
            <div class="sum-row"><span>Total Units:</span><strong>${fmtN(totalUnits)} Units</strong></div>
            <div class="sum-row"><span>Subtotal:</span><strong>${fmtC(subtotal)}</strong></div>
            <div class="sum-row grand-total"><span>Grand Total:</span><span>${fmtC(grandTotal)}</span></div>
          </div>

          <div class="sig-grid">
            <div class="sig-col">PREPARED BY</div>
            <div class="sig-col">OFFICIAL ERP SEAL</div>
            <div class="sig-col">CUSTOMER ACCEPTANCE</div>
          </div>

          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ═══════════════════════════════════════════════════════════
  // PRINT ALL / CREATE MULTI-CUSTOMER DISPATCH
  // ═══════════════════════════════════════════════════════════
  const handlePrintAll = async () => {
    const validCustomers = customerOrders.filter(c => c.items.length > 0);
    if (validCustomers.length === 0) {
      alert("Please add at least one product for at least one customer before printing.");
      return;
    }

    const tokenNumber = `GOT-${new Date().getFullYear()}-${String(dispatches.length + 101).padStart(4, "0")}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const customerGroups: DispatchCustomerGroup[] = validCustomers.map((cust, idx) => {
      const cName = cust.customerName.trim() || `Customer ${idx + 1}`;
      return {
        id: cust.id,
        customerName: cName,
        contactPerson: cust.contactPerson.trim() || cName,
        phone: cust.phone.trim() || "",
        address: cust.address.trim() || "",
        items: cust.items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          dispatchQty: item.dispatchQty,
          availableQty: item.availableQty,
          overDispatched: item.dispatchQty > item.availableQty,
          shortage: Math.max(0, item.dispatchQty - item.availableQty),
        })),
      };
    });

    const allItems: DispatchItem[] = [];
    customerGroups.forEach(cg => {
      cg.items.forEach(it => {
        allItems.push(it);
      });
    });

    // Deduct stock for all items
    for (const item of allItems) {
      const prod = products.find(p => p.id === item.productId);
      const currentQty = prod ? prod.qty : item.availableQty;
      const newQty = Math.max(0, currentQty - item.dispatchQty);
      await adjustStock(item.productId, newQty);
    }

    const dispatchToSummary = customerGroups.map(cg => cg.customerName).join(", ");
    const hasOver = allItems.some(i => i.overDispatched);

    const newRecord: Omit<DispatchRecord, "id"> = {
      tokenNo: tokenNumber,
      dispatchTo: dispatchToSummary,
      customerGroups,
      address: customerGroups[0]?.address || "Standard Client Destinations",
      contactPerson: customerGroups[0]?.contactPerson || "Various Consignees",
      phone: customerGroups[0]?.phone || "",
      date: dateStr,
      time: timeStr,
      items: allItems,
      status: "dispatched",
      notes: notes.trim(),
      createdBy: currentUser?.name || "Dispatch Officer",
      hasOverDispatch: hasOver,
    };

    addDispatch(newRecord);

    const createdWithId: DispatchRecord = {
      ...newRecord,
      id: `DSP-${Date.now().toString().slice(-8)}`,
    };
    setCreatedDispatchSuccess(createdWithId);

    // 🖨️ Instantly trigger SINGLE GOT PRINT for all customers!
    handlePrintGOT(createdWithId);

    // Reset Form to initial 1 empty customer
    setCustomerOrders([
      { id: `cust-${Date.now()}`, customerName: "", contactPerson: "", phone: "", address: "", items: [] },
    ]);
    setActiveCustIdx(0);
    setNotes("");
  };

  // Complete Sale and Print Bill Handler from History
  const handleCompleteSaleAndBill = async (record: DispatchRecord) => {
    updateDispatchStatus(record.id, "delivered");

    const billTotal = record.items.reduce((s, i) => {
      const prod = products.find(p => p.id === i.productId || p.sku === i.sku);
      return s + (prod ? prod.price * i.dispatchQty : 100 * i.dispatchQty);
    }, 0);

    const totalUnits = record.items.reduce((s, i) => s + i.dispatchQty, 0);

    await addInvoice({
      id: `INV-${record.tokenNo}`,
      customer: record.dispatchTo,
      date: record.date,
      due: record.date,
      amount: billTotal,
      status: "paid",
      items: totalUnits,
    });

    handlePrintBill({ ...record, status: "delivered" });
  };

  // Filter dispatch history
  const filteredDispatches = dispatches.filter(d => {
    const matchSearch =
      !historySearch ||
      d.tokenNo.toLowerCase().includes(historySearch.toLowerCase()) ||
      d.dispatchTo.toLowerCase().includes(historySearch.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(historySearch.toLowerCase()) ||
      d.items.some(i => i.name.toLowerCase().includes(historySearch.toLowerCase()) || i.sku.toLowerCase().includes(historySearch.toLowerCase()));

    const matchStatus = historyStatusFilter === "all" || d.status === historyStatusFilter;

    return matchSearch && matchStatus;
  });

  // KPI calculations
  const totalDispatchesCount = dispatches.length;
  const totalDispatchedUnits = dispatches.reduce(
    (sum, d) => sum + d.items.reduce((s, i) => s + i.dispatchQty, 0),
    0
  );
  const overDispatchedCount = dispatches.filter(d => d.hasOverDispatch).length;
  const deliveredSalesCount = dispatches.filter(d => d.status === "delivered").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" /> Dispatch &amp; Gate Pass (GOT) System
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Multiple Customers in One GOT · Real-time inventory sync &amp; instant thermal printing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            variant={tab === "New Dispatch" ? "primary" : "outline"}
            size="sm"
            onClick={() => setTab("New Dispatch")}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Dispatch
          </Btn>
          <Btn
            variant={tab === "Dispatch History" ? "primary" : "outline"}
            size="sm"
            onClick={() => setTab("Dispatch History")}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            Dispatch History ({dispatches.length})
          </Btn>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* Success Notification Modal / Card after creation */}
      {createdDispatchSuccess && (
        <Card className="p-5 border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Single GOT Token Generated: <span className="font-mono text-blue-600 dark:text-blue-400">{createdDispatchSuccess.tokenNo}</span>
                  </h3>
                  {createdDispatchSuccess.hasOverDispatch && (
                    <Badge variant="warning">⚠️ Shortage Permitted &amp; Saved</Badge>
                  )}
                  <Badge variant="blue">{createdDispatchSuccess.customerGroups?.length || 1} Customer(s) Included</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Dispatched to <strong>{createdDispatchSuccess.dispatchTo}</strong> ({createdDispatchSuccess.items.length} product lines, {createdDispatchSuccess.items.reduce((s, i) => s + i.dispatchQty, 0)} combined units).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Btn
                variant="primary"
                size="sm"
                onClick={() => handlePrintGOT(createdDispatchSuccess)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Print Single GOT
              </Btn>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => handlePrintBill(createdDispatchSuccess)}
                icon={<Receipt className="w-3.5 h-3.5" />}
              >
                Print Complete Bill
              </Btn>
              <button
                onClick={() => setCreatedDispatchSuccess(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 1: NEW DISPATCH CREATION (MULTI-CUSTOMER IN ONE GOT)   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === "New Dispatch" && (
        <div className="space-y-5">
          {/* Top Multi-Customer Bar & Tab Switcher */}
          <Card className="p-4 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Customers in this GOT ({customerOrders.length})
                </span>
              </div>

              <Btn
                variant="primary"
                size="sm"
                onClick={handleAddCustomer}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Another Customer
              </Btn>
            </div>

            {/* Customer Selector Pills */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {customerOrders.map((cust, idx) => {
                const isActive = idx === safeActiveCustIdx;
                const custItemsCount = cust.items.reduce((s, i) => s + i.dispatchQty, 0);
                const displayName = cust.customerName.trim() || `Customer ${idx + 1}`;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setActiveCustIdx(idx)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-150 shrink-0",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[140px]">{displayName}</span>
                    <Badge variant={custItemsCount > 0 ? "blue" : "neutral"} className="text-[10px] px-1.5 py-0">
                      {custItemsCount} items
                    </Badge>
                    {customerOrders.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomer(idx);
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5 ml-1 transition-colors"
                        title="Remove this customer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Main Work Area: Left (Products Catalog) & Right (Customer Orders Manifest) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Product Search & Quick Add to Active Customer */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Product Catalog
                    </h3>
                  </div>
                  <Badge variant="blue">
                    Adding to: {activeCustomer.customerName.trim() || `Customer ${safeActiveCustIdx + 1}`}
                  </Badge>
                </div>

                {/* 2# Professional Search Bar with Search Icon */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={prodSearch}
                      onChange={e => setProdSearch(e.target.value)}
                      placeholder="Search product by name, SKU, category, warehouse…"
                      className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                    />
                    {prodSearch && (
                      <button
                        onClick={() => setProdSearch("")}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                    className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none shrink-0"
                  >
                    <option value="All">All Categories</option>
                    {productCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={stockFilter}
                    onChange={e => setStockFilter(e.target.value as any)}
                    className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none shrink-0"
                  >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock Only</option>
                    <option value="low_stock">Low Stock Only</option>
                  </select>
                </div>
              </Card>

              {/* Products List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No products match your search</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try searching with a different product name or SKU</p>
                  </div>
                ) : (
                  filteredProducts.map(p => {
                    const activeCustItem = activeCustomer.items.find(i => i.productId === p.id);
                    const isShortage = p.qty <= 0;

                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between bg-white dark:bg-slate-800/80 hover:shadow-md",
                          activeCustItem
                            ? "border-blue-500/60 ring-1 ring-blue-500/20 bg-blue-50/[0.04]"
                            : "border-slate-200 dark:border-slate-700/80 hover:border-blue-400"
                        )}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                              {p.sku}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {p.wh || "Main Warehouse"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5 line-clamp-2">
                            {p.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{p.cat}</p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              {fmtC(p.price)}
                            </p>
                            <p className={cn("text-[10px] font-bold mt-0.5", isShortage ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                              Stock: {p.qty} {isShortage && "(0 in prod)"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(p, safeActiveCustIdx)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                              activeCustItem
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white"
                            )}
                          >
                            <Plus className="w-3 h-3" />
                            {activeCustItem ? `+ Add (${activeCustItem.dispatchQty})` : `Add to Cust ${safeActiveCustIdx + 1}`}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Multi-Customer Manifest & Print All (Single GOT) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Customer Groups Display & Form */}
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                {customerOrders.map((cust, custIdx) => {
                  const isActive = custIdx === safeActiveCustIdx;
                  const custTotalUnits = cust.items.reduce((s, i) => s + i.dispatchQty, 0);

                  return (
                    <Card
                      key={cust.id}
                      className={cn(
                        "p-4 transition-all duration-150 space-y-3",
                        isActive
                          ? "ring-2 ring-blue-500/40 border-blue-400 shadow-md bg-white dark:bg-slate-800"
                          : "border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40"
                      )}
                    >
                      {/* Customer Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {custIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Customer {custIdx + 1} Order
                          </span>
                          {isActive && (
                            <Badge variant="blue" className="text-[10px]">Active for Adding</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="neutral">{custTotalUnits} units</Badge>
                          {customerOrders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomer(custIdx)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete this customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Customer Name Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        <div className="sm:col-span-8">
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Customer / Dispatch To Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. WAQAS, ALI, AHMED, Walk-in"
                            value={cust.customerName}
                            onChange={e => handleUpdateCustomerField(custIdx, "customerName", e.target.value)}
                            onFocus={() => setActiveCustIdx(custIdx)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </div>

                        {customers.length > 0 && (
                          <div className="sm:col-span-4">
                            <label className="block font-semibold text-slate-500 mb-1">Select Client</label>
                            <select
                              onChange={e => {
                                if (e.target.value) handleUpdateCustomerField(custIdx, "customerName", e.target.value);
                              }}
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <option value="">Choose</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Customer Products List */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Products for {cust.customerName || `Customer ${custIdx + 1}`} ({cust.items.length})</span>
                          <button
                            type="button"
                            onClick={() => setActiveCustIdx(custIdx)}
                            className="text-blue-600 hover:underline"
                          >
                            + Select from Catalog
                          </button>
                        </div>

                        {cust.items.length === 0 ? (
                          <div
                            onClick={() => setActiveCustIdx(custIdx)}
                            className="py-4 text-center text-xs text-slate-400 border border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors"
                          >
                            No products added yet. Click catalog items to add here.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {cust.items.map(item => {
                              const isShortage = item.dispatchQty > item.availableQty;
                              const shortageAmt = item.dispatchQty - item.availableQty;

                              return (
                                <div
                                  key={item.productId}
                                  className={cn(
                                    "p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all",
                                    isShortage
                                      ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                  )}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {item.name}
                                      </p>
                                      {isShortage && (
                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">
                                          +{shortageAmt} shortage
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      {item.sku} · Avail: {item.availableQty}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCartQty(custIdx, item.productId, item.dispatchQty - 1)}
                                      className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.dispatchQty}
                                      onChange={e => handleUpdateCartQty(custIdx, item.productId, parseInt(e.target.value) || 1)}
                                      className="w-12 px-1 py-0.5 text-xs text-center font-mono font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCartQty(custIdx, item.productId, item.dispatchQty + 1)}
                                      className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFromCart(custIdx, item.productId)}
                                      className="text-slate-300 hover:text-red-500 p-1 ml-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Combined Totals & Print All Action Card */}
              <Card className="p-5 space-y-3.5 border-2 border-blue-500/30 bg-blue-50/[0.15] dark:bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Combined GOT Manifest Summary
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {customerOrders.length} Customer Group(s) · {combinedTotalLineItems} Total Product Lines
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Items</span>
                    <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                      {fmtN(combinedTotalUnits)}
                    </span>
                  </div>
                </div>

                {/* Over-dispatch status */}
                {hasAnyShortage && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Total Shortage: +{fmtN(totalShortageUnits)} units (Allowed — Over-Dispatch Active)</span>
                  </div>
                )}

                {/* Action: Add Another Customer & Print All */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <Btn
                    variant="outline"
                    size="md"
                    onClick={handleAddCustomer}
                    icon={<Plus className="w-4 h-4" />}
                    className="w-full font-bold"
                  >
                    Add Another Customer
                  </Btn>
                  <Btn
                    variant="primary"
                    size="md"
                    onClick={handlePrintAll}
                    disabled={combinedTotalUnits === 0}
                    icon={<Download className="w-4 h-4" />}
                    className="w-full font-bold shadow-md shadow-blue-500/25 text-sm"
                  >
                    Print All (Single GOT)
                  </Btn>
                </div>
                <p className="text-[10px] text-center text-slate-400">
                  Clicking "Print All" saves all customer groups and prints them together in ONE SINGLE GOT receipt.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 2: DISPATCH HISTORY & DIRECT PRINTING */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === "Dispatch History" && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Inp
                placeholder="Search history by Token #, Customer, or SKU…"
                value={historySearch}
                onChange={setHistorySearch}
                icon={<Search className="w-3.5 h-3.5" />}
                className="w-full sm:w-80"
              />
              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered / Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredDispatches.length} of {dispatches.length} records
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Token No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Dispatch To (Customers)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date &amp; Time
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Items
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Actions (Single GOT / Bill)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                {filteredDispatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No dispatch records found</p>
                      <p className="text-xs mt-0.5">Create your first multi-customer dispatch in the "New Dispatch" tab</p>
                    </td>
                  </tr>
                ) : (
                  filteredDispatches.map(record => {
                    const totalUnits = record.items.reduce((s, i) => s + i.dispatchQty, 0);
                    const custCount = record.customerGroups?.length || 1;

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors"
                      >
                        {/* Token No */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                            {record.tokenNo}
                          </span>
                        </td>

                        {/* Dispatch To */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {record.dispatchTo}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {custCount} Customer Group(s)
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          <div>{record.date}</div>
                          <div className="text-[10px] text-slate-400">{record.time}</div>
                        </td>

                        {/* Items / Units */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {fmtN(totalUnits)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            ({record.items.length} lines)
                          </span>
                        </td>

                        {/* Over-dispatch indicator */}
                        <td className="px-4 py-3.5 text-center">
                          {record.hasOverDispatch ? (
                            <Badge variant="warning">⚠️ Shortage Permitted</Badge>
                          ) : (
                            <Badge variant="success">✓ Verified Stock</Badge>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          {statusBadge(record.status)}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handlePrintGOT(record)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Print Single GOT for All Customers"
                            >
                              <Download className="w-3 h-3" />
                              <span>GOT Print</span>
                            </button>

                            {record.status !== "delivered" ? (
                              <button
                                type="button"
                                onClick={() => handleCompleteSaleAndBill(record)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                                title="Mark as Delivered and Print Complete Sales Bill"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete &amp; Bill</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePrintBill(record)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Print Complete Sales Bill"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Print Bill</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setViewingDispatch(record)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="View Full Dispatch Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB 3: DISPATCH ANALYTICS & KPIS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === "Analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Dispatches"
              value={fmtN(totalDispatchesCount)}
              icon={<Truck className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50 dark:bg-blue-950/50"
            />
            <StatCard
              label="Dispatched Units"
              value={fmtN(totalDispatchedUnits)}
              icon={<Package className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50 dark:bg-emerald-950/50"
            />
            <StatCard
              label="Over-Dispatch Tokens"
              value={fmtN(overDispatchedCount)}
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-50 dark:bg-amber-950/50"
              mono={false}
            />
            <StatCard
              label="Delivered / Completed"
              value={fmtN(deliveredSalesCount)}
              icon={<CheckCircle className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-50 dark:bg-purple-950/50"
              mono={false}
            />
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Dispatch Operational Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1">
                <p className="font-bold text-blue-700 dark:text-blue-300">Multi-Customer Single GOT</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Add unlimited customers and products in one dispatch session and print them together in a single official GOT receipt.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                <p className="font-bold text-amber-700 dark:text-amber-300">Over-Dispatch Allowance</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Allows emergency release of goods even when production inventory is low, automatically logging shortage amounts.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Instant Commercial Billing</p>
                <p className="text-slate-600 dark:text-slate-400">
                  1-Click Complete Sale converts dispatches directly into finalized commercial sales invoices and printable bills.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Dispatch Detail Modal Drawer */}
      {viewingDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                  {viewingDispatch.tokenNo}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Dispatch: {viewingDispatch.dispatchTo}
                </span>
              </div>
              <button
                onClick={() => setViewingDispatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-semibold">Date &amp; Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDispatch.date} {viewingDispatch.time}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-semibold">Customers</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDispatch.customerGroups?.length || 1} Group(s)</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-semibold">Status</span>
                <span className="font-bold">{statusBadge(viewingDispatch.status)}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-semibold">Authorized By</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDispatch.createdBy}</span>
              </div>
            </div>

            {/* Customer Groups Breakdown */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Groups &amp; Items</p>
              {viewingDispatch.customerGroups && viewingDispatch.customerGroups.length > 0 ? (
                viewingDispatch.customerGroups.map((cg, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-blue-600 dark:text-blue-400 border-b pb-1.5">
                      <span>{idx + 1}. {cg.customerName}</span>
                      <span>{cg.items.reduce((s, i) => s + i.dispatchQty, 0)} Units</span>
                    </div>
                    <div className="space-y-1">
                      {cg.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300">{item.name} ({item.sku})</span>
                          <span className="font-mono font-bold">x {item.dispatchQty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                  {viewingDispatch.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-slate-800/40">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {fmtN(item.dispatchQty)} Units
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => handlePrintGOT(viewingDispatch)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Print Single GOT
              </Btn>
              <Btn
                variant="primary"
                size="sm"
                onClick={() => handleCompleteSaleAndBill(viewingDispatch)}
                icon={<Receipt className="w-3.5 h-3.5" />}
              >
                Complete Sale &amp; Print Bill
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════

function FinanceScreen() {
  const { invoices, purchaseOrders, products } = useStockFlow();
  const [tab, setTab] = useState("P&L");
  const tabs = ["P&L", "Balance Sheet", "Cash Flow"];

  // ── P&L: quarter buckets derived from real invoices & purchase orders ──
  const plData = useMemo(() => {
    const qRev = [0, 0, 0, 0];
    const qCost = [0, 0, 0, 0];
    invoices.forEach(inv => {
      const d = new Date(inv.date ?? '');
      if (isNaN(d.getTime())) return;
      const q = Math.floor(d.getMonth() / 3);
      qRev[q] += inv.amount || 0;
    });
    purchaseOrders.forEach(po => {
      const d = new Date(po.date ?? '');
      if (isNaN(d.getTime())) return;
      const q = Math.floor(d.getMonth() / 3);
      qCost[q] += po.total ?? 0;
    });
    const qGross = qRev.map((r, i) => r - qCost[i]);
    const opex = qRev.map(r => r * 0.15); // estimate 15% opex of revenue
    const ebitda = qGross.map((g, i) => g - opex[i]);
    const netInc = ebitda.map(e => e * 0.93); // ~7% tax/interest
    return [
      { label: "Revenue",            q1: qRev[0],   q2: qRev[1],   q3: qRev[2],   q4: qRev[3],   type: "revenue" },
      { label: "Cost of Goods Sold", q1: qCost[0],  q2: qCost[1],  q3: qCost[2],  q4: qCost[3],  type: "cost" },
      { label: "Gross Profit",       q1: qGross[0], q2: qGross[1], q3: qGross[2], q4: qGross[3], type: "profit" },
      { label: "Operating Expenses", q1: opex[0],   q2: opex[1],   q3: opex[2],   q4: opex[3],   type: "sub" },
      { label: "EBITDA",             q1: ebitda[0], q2: ebitda[1], q3: ebitda[2], q4: ebitda[3], type: "profit" },
      { label: "Net Income",         q1: netInc[0], q2: netInc[1], q3: netInc[2], q4: netInc[3], type: "profit" },
    ];
  }, [invoices, purchaseOrders]);

  // ── Balance Sheet: computed from real inventory, invoices, POs ──
  const balanceSheet = useMemo(() => {
    const inventoryVal = products.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0);
    const accountsReceivable = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0);
    const accountsPayable = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'ordered').reduce((s, po) => s + (po.total || 0), 0);
    const totalRevenue = invoices.reduce((s, i) => s + (i.status === 'paid' ? (i.amount || 0) : 0), 0);
    const totalCosts = purchaseOrders.reduce((s, po) => s + (po.total || 0), 0);
    const retainedEarnings = Math.max(0, totalRevenue - totalCosts);
    return {
      assets: [
        { label: "Accounts Receivable", value: accountsReceivable },
        { label: "Inventory (Stock Value)", value: inventoryVal },
      ],
      liabilities: [
        { label: "Accounts Payable", value: accountsPayable },
      ],
      equity: [
        { label: "Retained Earnings", value: retainedEarnings },
      ],
    };
  }, [invoices, purchaseOrders, products]);

  // ── Cash Flow: monthly operating cash derived from paid invoices minus PO spend ──
  const cashFlowData = useMemo(() => {
    const byMonth: Record<string, { operating: number; investing: number; financing: number }> = {};
    MONTH_LABELS.forEach(m => { byMonth[m] = { operating: 0, investing: 0, financing: 0 }; });
    invoices.forEach(inv => {
      if (inv.status !== 'paid') return;
      const d = new Date(inv.date ?? '');
      if (isNaN(d.getTime())) return;
      const m = MONTH_LABELS[d.getMonth()];
      if (!m) return;
      byMonth[m].operating += Math.round((inv.amount || 0) / 1000);
    });
    purchaseOrders.forEach(po => {
      const d = new Date(po.date ?? '');
      if (isNaN(d.getTime())) return;
      const m = MONTH_LABELS[d.getMonth()];
      if (!m) return;
      byMonth[m].investing -= Math.round((po.total || 0) / 1000);
    });
    return MONTH_LABELS.map(m => ({ month: m, ...byMonth[m] }));
  }, [invoices, purchaseOrders]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Finance & Accounting</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fiscal Year {currentYear} · All figures in PKR</p>
        </div>
        <Btn variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Btn>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "P&L" && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Profit & Loss Statement — FY {currentYear}</h3>
          {invoices.length === 0 && purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No financial data yet</p>
              <p className="text-xs mt-1">Add invoices and purchase orders to see your P&L statement</p>
            </div>
          ) : (
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
                {plData.map(row => {
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
                          )}>{fmtC(v)}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      )}

      {tab === "Balance Sheet" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { title: "Assets", rows: balanceSheet.assets, color: "blue", total: balanceSheet.assets.reduce((s, r) => s + r.value, 0) },
            { title: "Liabilities", rows: balanceSheet.liabilities, color: "red", total: balanceSheet.liabilities.reduce((s, r) => s + r.value, 0) },
            { title: "Equity", rows: balanceSheet.equity, color: "green", total: balanceSheet.equity.reduce((s, r) => s + r.value, 0) },
          ].map(sec => (
            <Card key={sec.title} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                <span className={cn("text-sm font-mono font-bold",
                  sec.color === "blue" ? "text-[#2563EB]" : sec.color === "red" ? "text-red-600 dark:text-red-400" : "text-[#16A34A] dark:text-green-400"
                )}>{fmtC(sec.total)}</span>
              </div>
              <div className="space-y-2.5">
                {sec.rows.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
                ) : sec.rows.map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{r.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{fmtC(r.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Cash Flow" && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Cash Flow Statement — FY {currentYear} (PKR thousands)</h3>
          {invoices.length === 0 && purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No cash flow data yet</p>
              <p className="text-xs mt-1">Add paid invoices and purchase orders to see cash flow</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cashFlowData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}K`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #E2E8F0" }} formatter={(v: any) => [`${v}K PKR`, ""]} />
              <Legend />
              <Bar dataKey="operating" name="Operating" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="investing" name="Investing" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="financing" name="Financing" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
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
    { label: "Dispatch", hint: "Gate pass (GOT) & delivery notes", screen: "dispatch" as Screen, icon: <Box className="w-4 h-4" /> },
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
  const { notifications, isAuthenticated } = useStockFlow();
  const [screen, setScreen] = useState<Screen>("dashboard");
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
      case "dispatch": return <DispatchScreen />;
      case "finance": return <FinanceScreen />;
      case "crm": return <CRMScreen onOpenAddCustomer={() => setAddCustomerModalOpen(true)} />;
      case "reports": return <ReportsScreen />;
      case "settings": return <SettingsScreen onOpenSupabaseModal={() => setSupabaseModalOpen(true)} />;
      default: return <DashboardScreen onViewAllInvoices={() => setScreen("sales")} />;
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
