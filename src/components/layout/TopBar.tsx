import React from 'react';
import { Bell } from 'lucide-react';

export interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps): React.JSX.Element {
  return (
    <div className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center justify-between px-7 shrink-0">
      {/* Left — page title */}
      <div>
        <h1 className="text-[17px] font-bold text-foreground tracking-[-0.01em] leading-tight">{title}</h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* Right — bell only */}
      <button
        type="button"
        className="relative w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-slate-200 text-muted-foreground hover:bg-slate-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={17} />
        <span className="absolute top-[7px] right-[7px] w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
      </button>
    </div>
  );
}
