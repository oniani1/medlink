import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiUserCheck, FiBarChart2, FiDollarSign, FiActivity, FiClipboard, FiX } from 'react-icons/fi';

interface SidebarProps {
  lang: 'ka' | 'en';
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: FiGrid, labelKa: 'მიმოხილვა', labelEn: 'Overview', end: true },
  { to: '/dashboard/doctors', icon: FiUserCheck, labelKa: 'ექიმები', labelEn: 'Doctors' },
  { to: '/dashboard/patients', icon: FiUsers, labelKa: 'პაციენტები', labelEn: 'Patients' },
  { to: '/dashboard/analytics', icon: FiBarChart2, labelKa: 'ანალიტიკა', labelEn: 'Analytics' },
  { to: '/dashboard/prescriptions', icon: FiClipboard, labelKa: 'დანიშნულებები', labelEn: 'Prescriptions' },
  { to: '/dashboard/financial', icon: FiDollarSign, labelKa: 'ფინანსები', labelEn: 'Financial' },
];

export function Sidebar({ lang, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={`
        h-screen flex flex-col bg-slate-900 text-slate-400 transition-all duration-300 flex-shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'fixed inset-y-0 left-0 z-50 w-60 shadow-2xl' : 'hidden'}
        md:relative md:flex md:shadow-none
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
          <FiActivity className="text-white text-lg" />
        </div>
        {(!collapsed || mobileOpen) && (
          <div className="overflow-hidden flex-1">
            <div className="text-white font-semibold text-sm leading-tight">MedLink</div>
            <div className="text-[10px] text-teal-400 uppercase tracking-wider">Analytics</div>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden ml-auto text-slate-400 hover:text-white p-1"
        >
          <FiX className="text-lg" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600/15 text-teal-400 border-l-2 border-teal-400 -ml-[2px]'
                  : 'hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="text-lg flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>{lang === 'ka' ? item.labelKa : item.labelEn}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {(!collapsed || mobileOpen) && (
          <div className="text-xs">
            <div className="text-slate-500">{lang === 'ka' ? 'გაგუას კლინიკა' : 'Gagua Clinic'}</div>
            <div className="text-slate-600 mt-0.5">MedLink Analytics v1.0</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="mt-2 w-full hidden md:flex items-center justify-center py-1.5 rounded text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
}
