import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/dashboard' },
  { id: 'patients', label: 'Patient Management', icon: <Users size={17} />, path: '/patients' },
  { id: 'users', label: 'User Management', icon: <UserCog size={17} />, path: '/users' },
  { id: 'billing', label: 'Billing', icon: <Receipt size={17} />, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: <Settings size={17} />, path: '/settings' },
];

export interface LeftNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavButton({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div className="relative group/nav">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center rounded-[9px] transition-colors duration-150',
          collapsed ? 'justify-center p-2.5' : 'gap-[11px] px-3 py-[9px]',
          active
            ? 'bg-primary text-primary-foreground font-semibold'
            : 'text-muted-foreground font-normal hover:bg-slate-100 hover:text-foreground'
        )}
      >
        <span className={cn('flex items-center shrink-0', active ? 'opacity-100' : 'opacity-65')}>{item.icon}</span>
        {!collapsed && <span className="flex-1 text-left text-[13.5px] truncate">{item.label}</span>}
        {!collapsed && item.badge !== undefined && (
          <span
            className={cn(
              'text-[10.5px] font-bold px-1.5 py-0.5 rounded-full leading-[1.4]',
              active ? 'bg-white/25 text-white' : 'bg-primary text-primary-foreground'
            )}
          >
            {item.badge}
          </span>
        )}
      </button>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[12.5px] font-medium px-3 py-1.5 rounded-[7px] whitespace-nowrap pointer-events-none z-[200] shadow-[0_4px_14px_rgba(0,0,0,0.22)] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-100">
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-slate-800" />
          {item.label}
          {item.badge !== undefined && (
            <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LeftNav({ collapsed, onToggle }: LeftNavProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  function getActiveId(): string {
    if (location.pathname.startsWith('/patients')) return 'patients';
    if (location.pathname.startsWith('/users')) return 'users';
    if (location.pathname.startsWith('/billing')) return 'billing';
    if (location.pathname.startsWith('/messages')) return 'messages';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }

  const activeId = getActiveId();

  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-40 flex flex-col',
        'shadow-[2px_0_12px_rgba(0,0,0,0.04)]',
        'transition-[width] duration-[220ms] ease-in-out',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-20 border-b border-slate-100 shrink-0',
          collapsed ? 'justify-center px-0' : 'px-5 gap-3'
        )}
      >
        <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9 shrink-0 shadow-[0_4px_10px_rgba(13,148,136,0.27)]">
          <Activity size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-[13.5px] text-foreground leading-tight truncate">Health Telematix</p>
            <p className="text-[11px] text-muted-foreground">Clinic Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-300 px-3 mb-2.5">
            {/* Main Menu */}
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-100 p-3 shrink-0 relative">
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setProfileOpen(false)} />
            <div
              className={cn(
                'absolute bottom-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl z-[100] py-1 overflow-hidden',
                'shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]',
                collapsed ? 'left-0 w-[200px]' : 'left-3 right-3'
              )}
            >
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((o) => !o)}
          className={cn(
            'w-full flex items-center rounded-[9px] hover:bg-slate-50 transition-colors',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            SM
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[12.5px] font-semibold text-foreground truncate leading-tight">Sarah Mitchell</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">Clinic Admin</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            </>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-[1.5px] border-slate-200 flex items-center justify-center text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.08)] z-50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-150"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
}
