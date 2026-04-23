import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, FlaskConical, ChevronUp, ChevronDown, PlugZap, ServerCrash } from 'lucide-react';
import { SIGN_IN_PATH, REVIEW_EHR_PATH } from '@/modules/onboarding/constants';

const TEAL = '#0D9488';

interface DemoAction {
  label: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  onClick: () => void;
}

export function DemoGuide(): React.JSX.Element {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const actions: DemoAction[] = [
    {
      label: 'Restart Flow',
      desc: 'Go back to Sign In',
      icon: <RotateCcw size={13} style={{ color: TEAL }} />,
      iconBg: 'rgba(13,148,136,0.2)',
      onClick: () => navigate(SIGN_IN_PATH),
    },
    {
      label: 'EHR: Setup by Super Admin',
      desc: 'View EHR connected state',
      icon: <PlugZap size={13} style={{ color: '#10B981' }} />,
      iconBg: 'rgba(16,185,129,0.15)',
      onClick: () => navigate(REVIEW_EHR_PATH),
    },
    {
      label: 'EHR: Not Setup',
      desc: 'View empty EHR state',
      icon: <ServerCrash size={13} style={{ color: '#F59E0B' }} />,
      iconBg: 'rgba(245,158,11,0.15)',
      onClick: () => navigate(`${REVIEW_EHR_PATH}?scenario=empty`),
    },
  ];

  return (
    <div className="fixed z-50 flex flex-col" style={{ bottom: 24, right: 24, minWidth: 210 }}>
      {/* Panel */}
      {open && (
        <div
          className="mb-2 rounded-2xl overflow-hidden"
          style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <FlaskConical size={14} style={{ color: '#34d399' }} />
            <span className="text-xs font-bold tracking-wide" style={{ color: '#f1f5f9' }}>
              Demo Guide
            </span>
            <span
              className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
            >
              Prototype
            </span>
          </div>

          {/* Actions */}
          <div className="px-3 py-3 space-y-1">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors"
                style={{ color: '#f1f5f9' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 28, height: 28, background: action.iconBg }}
                >
                  {action.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold">{action.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="self-end flex items-center gap-2 px-4 py-2 rounded-full transition-all"
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          color: '#f1f5f9',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#273449')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1e293b')}
      >
        <FlaskConical size={13} style={{ color: '#34d399' }} />
        <span className="text-xs font-semibold">Demo</span>
        {open ? (
          <ChevronDown size={12} style={{ color: '#64748b' }} />
        ) : (
          <ChevronUp size={12} style={{ color: '#64748b' }} />
        )}
      </button>
    </div>
  );
}
