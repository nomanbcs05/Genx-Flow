import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Calculator, FileText, Sparkles, ShieldCheck,
  Building2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { StaffDirectoryTab } from './StaffDirectoryTab';
import { StaffAttendanceTab } from './StaffAttendanceTab';
import { StaffPayrollTab } from './StaffPayrollTab';
import { StaffSalaryVouchersTab } from './StaffSalaryVouchersTab';

type StaffTabKey = 'directory' | 'attendance' | 'payroll' | 'vouchers';

interface StaffManagementV2Props {
  restaurantId?: string;
  isFeatureFlagEnabled?: boolean;
}

export function StaffManagementV2({
  restaurantId = 'default_restaurant',
  isFeatureFlagEnabled,
}: StaffManagementV2Props) {
  const [activeTab, setActiveTab] = useState<StaffTabKey>('directory');
  const [v2Enabled, setV2Enabled] = useState<boolean>(() => {
    if (typeof isFeatureFlagEnabled === 'boolean') return isFeatureFlagEnabled;
    return true; // Default PRO mode
  });

  // Part D: Testing requirement — console.log "Staff v2 loaded" when feature flag is true
  useEffect(() => {
    if (v2Enabled) {
      console.log('Staff v2 loaded');
    }
  }, [v2Enabled]);

  // Tab navigation items
  const tabs = [
    {
      key: 'directory' as StaffTabKey,
      label: 'Staff Directory',
      icon: Users,
      badge: 'PRO',
      description: 'CNIC, bank accounts & staff profiles',
    },
    {
      key: 'attendance' as StaffTabKey,
      label: 'Daily Attendance',
      icon: Calendar,
      badge: 'Live',
      description: '1-tap shifts & monthly audit',
    },
    {
      key: 'payroll' as StaffTabKey,
      label: 'Payroll Sheet',
      icon: Calculator,
      badge: '1/30 Rule',
      description: 'Advances, bonus & auto deductions',
    },
    {
      key: 'vouchers' as StaffTabKey,
      label: 'Salary Vouchers',
      icon: FileText,
      badge: 'PDF',
      description: 'Vercel Blob receipts & disbursements',
    },
  ];

  if (!v2Enabled) {
    return (
      <div className="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
          Staff Management V1 (Legacy Mode Active)
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto">
          The Staff Management V2 PRO module is disabled for this restaurant. Enable <code>staff_management_v2 = true</code> in settings table or set <code>STAFF_V2_ENABLED=true</code> to upgrade.
        </p>
        <button
          onClick={() => setV2Enabled(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Activate Staff V2 PRO for Testing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Feature Flag Indicator */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Staff Management PRO v2
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Multi-Tenant Isolated
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Restaurant Staff & Automated Payroll</h1>
            <p className="text-xs text-blue-200/80 mt-1 max-w-xl">
              Complete POS human resource lifecycle: CNIC & bank registry, 1-tap shift attendance, daily 1/30 salary math, advance deductions, and Vercel Blob salary vouchers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-right">
              <div className="text-[10px] uppercase font-bold text-blue-200">Restaurant Tenant</div>
              <div className="text-xs font-mono font-bold text-white truncate max-w-[150px]">{restaurantId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ant Design Style Tabbed Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Staff Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group inline-flex items-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isActive
                      ? 'bg-blue-700/60 text-blue-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab View */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'directory' && <StaffDirectoryTab restaurantId={restaurantId} />}
        {activeTab === 'attendance' && <StaffAttendanceTab restaurantId={restaurantId} />}
        {activeTab === 'payroll' && (
          <StaffPayrollTab
            restaurantId={restaurantId}
            onSwitchToVouchers={() => setActiveTab('vouchers')}
          />
        )}
        {activeTab === 'vouchers' && <StaffSalaryVouchersTab restaurantId={restaurantId} />}
      </div>
    </div>
  );
}
