import React, { useMemo } from 'react';
import {
  Users,
  Activity,
  HeartPulse,
  Percent,
  UserPlus,
  UserMinus,
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import { PATIENT_LIST_STORAGE_KEY } from '@/modules/patient/constants';
import type { PatientListItem, ProgramType } from '@/modules/patient/@types';
import type { KPIStat } from '../../@types';

const CPT_RATES: Record<ProgramType, number> = { APCM: 62, RPM: 57 };

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<KPIStat['iconKey'], React.JSX.Element> = {
  users: <Users size={18} />,
  activity: <Activity size={18} />,
  'heart-pulse': <HeartPulse size={18} />,
  percent: <Percent size={18} />,
  'user-plus': <UserPlus size={18} />,
  'user-minus': <UserMinus size={18} />,
  receipt: <Receipt size={18} />,
  'dollar-sign': <DollarSign size={18} />,
};

const COLOR_MAP: Record<KPIStat['color'], { icon: string; trend: string; bg: string }> = {
  teal: { icon: 'bg-teal-100 text-teal-600', trend: 'text-teal-600', bg: 'bg-teal-50/60' },
  violet: { icon: 'bg-violet-100 text-violet-600', trend: 'text-violet-600', bg: 'bg-violet-50/60' },
  blue: { icon: 'bg-blue-100 text-blue-600', trend: 'text-blue-600', bg: 'bg-blue-50/60' },
  amber: { icon: 'bg-amber-100 text-amber-600', trend: 'text-amber-600', bg: 'bg-amber-50/60' },
  emerald: { icon: 'bg-emerald-100 text-emerald-600', trend: 'text-emerald-600', bg: 'bg-emerald-50/60' },
  rose: { icon: 'bg-rose-100 text-rose-600', trend: 'text-rose-600', bg: 'bg-rose-50/60' },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function KPICard({ stat }: { stat: KPIStat }): React.JSX.Element {
  const colors = COLOR_MAP[stat.color];
  const isUp = stat.trend.direction === 'up';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col gap-4">
      {/* Row 1 — Icon + Title + Subtitle */}
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors.icon)}>
          {ICON_MAP[stat.iconKey]}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{stat.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.subtitle}</p>
        </div>
      </div>

      {/* Row 2 — Value + Trend */}
      <div className="flex items-center gap-2.5">
        <p className="text-[1.75rem] font-bold leading-none text-foreground">{stat.value}</p>
        <span
          className={cn(
            'flex items-center gap-1 text-[12px] font-semibold',
            isUp ? 'text-emerald-600' : 'text-rose-500'
          )}
        >
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isUp ? '+' : '-'}
          {stat.trend.percent}%
        </span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KPICards(): React.JSX.Element {
  const stats = useMemo<KPIStat[]>(() => {
    const patients = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];

    const total = patients.length;
    const apcm = patients.filter((p) => p.programs.includes('APCM')).length;
    const rpm = patients.filter((p) => p.programs.includes('RPM')).length;
    const eligible = Math.max(total + 12, 20);
    const enrollmentRate = total === 0 ? 0 : Math.round((total / eligible) * 100);
    const billable = patients.filter((p) => p.programs.length > 0).length;
    const totalRevenue = apcm * CPT_RATES.APCM + rpm * CPT_RATES.RPM;
    const revenuePerPatient = billable > 0 ? Math.round(totalRevenue / billable) : 127;

    return [
      {
        id: 'total-enrolled',
        title: 'Total Enrolled Patients',
        value: total,
        subtitle: 'Active patients across all programs',
        trend: { direction: 'up', percent: 12 },
        iconKey: 'users',
        color: 'teal',
      },
      {
        id: 'apcm',
        title: 'Total APCM Enrollments',
        value: apcm,
        subtitle: 'Accountable Primary Care Model',
        trend: { direction: 'up', percent: 8 },
        iconKey: 'activity',
        color: 'violet',
      },
      {
        id: 'rpm',
        title: 'Total RPM Enrollments',
        value: rpm,
        subtitle: 'Remote Patient Monitoring',
        trend: { direction: 'up', percent: 15 },
        iconKey: 'heart-pulse',
        color: 'blue',
      },
      {
        id: 'enrollment-rate',
        title: 'Enrollment Rate',
        value: `${enrollmentRate}%`,
        subtitle: 'Eligible vs enrolled patients',
        trend: { direction: 'up', percent: 4 },
        iconKey: 'percent',
        color: 'amber',
      },
      {
        id: 'new-enrollments',
        title: 'New Enrollments This Month',
        value: 4,
        subtitle: 'Added in the current month',
        trend: { direction: 'up', percent: 33 },
        iconKey: 'user-plus',
        color: 'emerald',
      },
      {
        id: 'disenrollments',
        title: 'Disenrollments',
        value: 2,
        subtitle: 'Voluntary withdrawal · Insurance lapse',
        trend: { direction: 'down', percent: 50 },
        iconKey: 'user-minus',
        color: 'rose',
      },
      {
        id: 'billable-patients',
        title: 'Total Billable Patients',
        value: billable,
        subtitle: 'Enrolled in at least one program',
        trend: { direction: 'up', percent: 10 },
        iconKey: 'receipt',
        color: 'teal',
      },
      {
        id: 'revenue-per-patient',
        title: 'Revenue per Enrolled Patient',
        value: `$${revenuePerPatient}`,
        subtitle: 'Avg. monthly CPT reimbursement',
        trend: { direction: 'up', percent: 6 },
        iconKey: 'dollar-sign',
        color: 'emerald',
      },
    ];
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Enrollment Overview</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Live patient enrollment stats across all programs</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <KPICard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
}
