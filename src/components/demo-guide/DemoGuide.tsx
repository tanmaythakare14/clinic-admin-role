import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  FlaskConical,
  ChevronUp,
  ChevronDown,
  PlugZap,
  ServerCrash,
  Users,
  UserX,
  ClipboardList,
  MonitorSmartphone,
  Activity,
  Gauge,
} from 'lucide-react';
import { SIGN_IN_PATH, REVIEW_EHR_PATH } from '@/modules/onboarding/constants';
import { PATIENT_BASE_PATH } from '@/modules/patient/constants';

interface DemoAction {
  label: string;
  desc: string;
  icon: React.ReactNode;
  iconBgClass: string;
  onClick: () => void;
}

interface DemoSection {
  title: string;
  actions: DemoAction[];
}

export function DemoGuide(): React.JSX.Element {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const sections: DemoSection[] = [
    {
      title: 'Onboarding',
      actions: [
        {
          label: 'Restart Flow',
          desc: 'Go back to Sign In',
          icon: <RotateCcw size={13} className="text-teal-600" />,
          iconBgClass: 'bg-teal-600/20',
          onClick: () => navigate(SIGN_IN_PATH),
        },
        {
          label: 'EHR: Setup by Super Admin',
          desc: 'View EHR connected state',
          icon: <PlugZap size={13} className="text-emerald-500" />,
          iconBgClass: 'bg-emerald-500/15',
          onClick: () => navigate(REVIEW_EHR_PATH),
        },
        {
          label: 'EHR: Not Setup',
          desc: 'View empty EHR state',
          icon: <ServerCrash size={13} className="text-amber-400" />,
          iconBgClass: 'bg-amber-400/15',
          onClick: () => navigate(`${REVIEW_EHR_PATH}?scenario=empty`),
        },
      ],
    },
    {
      title: 'Patient Management',
      actions: [
        {
          label: 'Patient List',
          desc: 'View all enrolled patients',
          icon: <Users size={13} className="text-blue-400" />,
          iconBgClass: 'bg-blue-400/15',
          onClick: () => navigate(PATIENT_BASE_PATH),
        },
        {
          label: 'Patient List: Empty',
          desc: 'First-time, no patients yet',
          icon: <UserX size={13} className="text-rose-400" />,
          iconBgClass: 'bg-rose-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}?scenario=empty`),
        },
        {
          label: 'Patient Detail',
          desc: 'Overview, alerts & tabs',
          icon: <ClipboardList size={13} className="text-teal-400" />,
          iconBgClass: 'bg-teal-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}/p-001`),
        },
        {
          label: 'Vitals: All Devices',
          desc: 'BP, HR, Weight, Glucose',
          icon: <MonitorSmartphone size={13} className="text-emerald-400" />,
          iconBgClass: 'bg-emerald-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}/p-001?devices=all#vitals`),
        },
        {
          label: 'Vitals: BP & HR only',
          desc: 'Partial device assignment',
          icon: <Activity size={13} className="text-blue-400" />,
          iconBgClass: 'bg-blue-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}/p-001?devices=bp-hr#vitals`),
        },
        {
          label: 'Vitals: Glucose & Weight',
          desc: 'Partial device assignment',
          icon: <Gauge size={13} className="text-violet-400" />,
          iconBgClass: 'bg-violet-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}/p-001?devices=glucose-weight#vitals`),
        },
        {
          label: 'Vitals: No Devices',
          desc: 'No RPM devices assigned',
          icon: <ServerCrash size={13} className="text-rose-400" />,
          iconBgClass: 'bg-rose-400/15',
          onClick: () => navigate(`${PATIENT_BASE_PATH}/p-001?devices=none#vitals`),
        },
      ],
    },
  ];

  return (
    <div className="fixed z-50 flex flex-col bottom-6 right-6 min-w-[210px]">
      {/* Panel */}
      {open && (
        <div className="mb-2 rounded-2xl overflow-hidden bg-slate-800 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
            <FlaskConical size={14} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wide text-slate-100">Demo Guide</span>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">
              Prototype
            </span>
          </div>

          {/* Sections */}
          <div className="px-3 py-3 space-y-3">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 px-3 mb-1">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors text-slate-100 hover:bg-white/[0.07]"
                    >
                      <span
                        className={`flex items-center justify-center rounded-lg flex-shrink-0 w-7 h-7 ${action.iconBgClass}`}
                      >
                        {action.icon}
                      </span>
                      <div>
                        <p className="text-xs font-semibold">{action.label}</p>
                        <p className="text-[10px] mt-0.5 text-slate-500">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="self-end flex items-center gap-2 px-4 py-2 rounded-full transition-all bg-slate-800 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] text-slate-100 hover:bg-[#273449]"
      >
        <FlaskConical size={13} className="text-emerald-400" />
        <span className="text-xs font-semibold">Demo</span>
        {open ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronUp size={12} className="text-slate-500" />
        )}
      </button>
    </div>
  );
}
