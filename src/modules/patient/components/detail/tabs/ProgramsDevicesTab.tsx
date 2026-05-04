import React from 'react';
import { Activity, Calendar, HeartPulse, MonitorSmartphone, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgramType } from '@/modules/patient/@types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgramCode = 'APCM' | 'RPM';
type ProgramStatus = 'active' | 'inactive' | 'pending';
type DeviceStatus = 'active' | 'inactive';

interface EnrolledProgram {
  id: string;
  code: ProgramCode;
  label: string;
  fullName: string;
  status: ProgramStatus;
  enrolledDate: string;
}

interface Device {
  id: string;
  name: string;
  vitalsCovered: string;
  frequency: string;
  lastSync: string;
  status: DeviceStatus;
  program: ProgramCode;
}

// ─── Mock Devices (keyed by program code) ────────────────────────────────────

const DEVICES_BY_PROGRAM: Record<ProgramCode, Device[]> = {
  RPM: [
    {
      id: 'd-001',
      name: 'Blood Pressure Cuff',
      vitalsCovered: 'Blood Pressure, Heart Rate',
      frequency: 'Twice Daily',
      lastSync: 'Today, 8:42 AM',
      status: 'active',
      program: 'RPM',
    },
    {
      id: 'd-002',
      name: 'Dexcom CGM',
      vitalsCovered: 'Blood Glucose',
      frequency: 'Continuous',
      lastSync: 'Today, 9:15 AM',
      status: 'active',
      program: 'RPM',
    },
    {
      id: 'd-003',
      name: 'Weight Scale',
      vitalsCovered: 'Body Weight',
      frequency: 'Once Daily',
      lastSync: 'Yesterday, 7:30 AM',
      status: 'active',
      program: 'RPM',
    },
    {
      id: 'd-004',
      name: 'FreeStyle Libre CGM',
      vitalsCovered: 'Blood Glucose',
      frequency: 'Continuous',
      lastSync: 'Oct 12, 2023',
      status: 'inactive',
      program: 'RPM',
    },
  ],
  APCM: [
    {
      id: 'd-101',
      name: 'Smart Stethoscope',
      vitalsCovered: 'Heart & Lung Sounds',
      frequency: 'On Demand',
      lastSync: 'Today, 10:00 AM',
      status: 'active',
      program: 'APCM',
    },
    {
      id: 'd-102',
      name: 'Pulse Oximeter',
      vitalsCovered: 'SpO2, Heart Rate',
      frequency: 'Twice Daily',
      lastSync: 'Today, 8:30 AM',
      status: 'active',
      program: 'APCM',
    },
    {
      id: 'd-103',
      name: 'Digital Thermometer',
      vitalsCovered: 'Body Temperature',
      frequency: 'Once Daily',
      lastSync: 'Yesterday, 9:00 AM',
      status: 'active',
      program: 'APCM',
    },
  ],
};

const PROGRAM_META: Record<
  ProgramCode,
  { label: string; fullName: string; enrolledDate: string; status: ProgramStatus }
> = {
  RPM: { label: 'RPM', fullName: 'Remote Patient Monitoring', enrolledDate: 'Jan 10, 2024', status: 'active' },
  APCM: { label: 'RPM Program', fullName: 'Remote Patient Monitoring', enrolledDate: 'Feb 5, 2024', status: 'active' },
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_CONFIG: Record<
  ProgramCode,
  {
    icon: React.JSX.Element;
    iconBg: string;
    accentText: string;
    deviceIconBg: string;
    deviceIconColor: string;
  }
> = {
  RPM: {
    icon: <HeartPulse size={20} className="text-primary" />,
    iconBg: 'bg-primary/10',
    accentText: 'text-primary',
    deviceIconBg: 'bg-slate-100',
    deviceIconColor: 'text-slate-500',
  },
  APCM: {
    icon: <Activity size={20} className="text-teal-600" />,
    iconBg: 'bg-teal-50',
    accentText: 'text-teal-700',
    deviceIconBg: 'bg-slate-100',
    deviceIconColor: 'text-slate-500',
  },
};

const STATUS_STYLE: Record<ProgramStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-rose-50 text-rose-700 border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
};

const STATUS_DOT: Record<ProgramStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-rose-500',
  pending: 'bg-amber-400',
};

// ─── Device Card ──────────────────────────────────────────────────────────────

function DeviceCard({ device, program }: { device: Device; program: ProgramCode }): React.JSX.Element {
  const cfg = PROGRAM_CONFIG[program];
  const isActive = device.status === 'active';

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
      <div className={cn(!isActive && 'opacity-40')}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.deviceIconBg)}>
              <MonitorSmartphone size={17} className={cfg.deviceIconColor} />
            </div>
            <h4 className="text-[14px] font-bold text-foreground leading-tight">{device.name}</h4>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 text-[11px] font-medium shrink-0',
              isActive ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isActive ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="flex items-stretch divide-x divide-slate-100">
          <div className="flex-1 pr-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Frequency</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.frequency}</p>
          </div>
          <div className="flex-1 px-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Last Sync</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.lastSync}</p>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Vitals Covered
            </p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {device.vitalsCovered.split(', ').map((vital) => (
                <span
                  key={vital}
                  className="inline-flex items-center text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
                >
                  {vital}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgramsDevicesTab({ programs }: { programs: ProgramType[] }): React.JSX.Element {
  const programCode = (programs[0] ?? null) as ProgramCode | null;

  if (!programCode) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <HeartPulse size={24} className="text-slate-400" />
        </div>
        <p className="text-[13.5px] font-semibold text-foreground">No program enrolled</p>
        <p className="text-[12px] text-muted-foreground mt-1">This patient has not been enrolled in a program yet.</p>
      </div>
    );
  }

  const cfg = PROGRAM_CONFIG[programCode];
  const meta = PROGRAM_META[programCode];
  const program: EnrolledProgram = {
    id: 'prog-001',
    code: programCode,
    label: meta.label,
    fullName: meta.fullName,
    enrolledDate: meta.enrolledDate,
    status: meta.status,
  };
  const devices = DEVICES_BY_PROGRAM[programCode] ?? [];

  return (
    <div className="space-y-5">
      {/* Program card */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', cfg.iconBg)}>
              {cfg.icon}
            </div>
            <div>
              <h4 className={cn('text-[15px] font-bold leading-tight', cfg.accentText)}>{program.label}</h4>
              <p className={cn('text-[12px] font-medium mt-0.5 opacity-80', cfg.accentText)}>{program.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
              <Calendar size={11} className="text-slate-400" />
              Enrolled: {program.enrolledDate}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                STATUS_STYLE[program.status]
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[program.status])} />
              {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Devices section */}
      <div>
        <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
          Assigned Devices
        </p>
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <MonitorSmartphone size={20} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No devices assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {devices.map((d) => (
              <DeviceCard key={d.id} device={d} program={program.code} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
