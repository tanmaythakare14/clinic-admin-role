import React, { useState } from 'react';
import { Pill, LinkIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type MedicationStatus = 'active' | 'inactive';
type MealTime = 'Before Meal' | 'After Meal' | 'With Meal' | 'No Restriction';
type Frequency = 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'Every 8 Hours' | 'As Needed' | 'Weekly';

interface Medication {
  id: string;
  drugName: string;
  dosageMg: number;
  pillsPerDose: number;
  mealTime: MealTime;
  startDate: string;
  endDate: string | null;
  frequency: Frequency;
  prescribedBy: string;
  prescribedBySpecialty: string;
  status: MedicationStatus;
  linkedCarePlan: string | null;
  notes?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MEDICATIONS: Medication[] = [
  {
    id: 'm-001',
    drugName: 'Metformin',
    dosageMg: 500,
    pillsPerDose: 2,
    mealTime: 'After Meal',
    startDate: 'Jan 10, 2024',
    endDate: null,
    frequency: 'Twice Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'active',
    linkedCarePlan: 'Diabetes Management Plan',
  },
  {
    id: 'm-002',
    drugName: 'Lisinopril',
    dosageMg: 10,
    pillsPerDose: 1,
    mealTime: 'No Restriction',
    startDate: 'Feb 05, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'active',
    linkedCarePlan: 'Hypertension Care Plan',
  },
  {
    id: 'm-003',
    drugName: 'Atorvastatin',
    dosageMg: 20,
    pillsPerDose: 1,
    mealTime: 'After Meal',
    startDate: 'Mar 01, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Sarah Kim',
    prescribedBySpecialty: 'Cardiology',
    status: 'active',
    linkedCarePlan: null,
  },
  {
    id: 'm-004',
    drugName: 'Aspirin',
    dosageMg: 81,
    pillsPerDose: 1,
    mealTime: 'With Meal',
    startDate: 'Mar 15, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Sarah Kim',
    prescribedBySpecialty: 'Cardiology',
    status: 'active',
    linkedCarePlan: null,
  },
  {
    id: 'm-005',
    drugName: 'Amoxicillin',
    dosageMg: 500,
    pillsPerDose: 1,
    mealTime: 'Before Meal',
    startDate: 'Oct 10, 2023',
    endDate: 'Oct 20, 2023',
    frequency: 'Three Times Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'inactive',
    linkedCarePlan: null,
    notes: 'Course completed',
  },
  {
    id: 'm-006',
    drugName: 'Prednisone',
    dosageMg: 10,
    pillsPerDose: 2,
    mealTime: 'With Meal',
    startDate: 'Aug 01, 2023',
    endDate: 'Aug 14, 2023',
    frequency: 'Once Daily',
    prescribedBy: 'Dr. James Patel',
    prescribedBySpecialty: 'Rheumatology',
    status: 'inactive',
    linkedCarePlan: null,
    notes: 'Tapered and discontinued',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_TIME_COLOR: Record<MealTime, string> = {
  'Before Meal': 'bg-slate-100 text-slate-600 border-slate-200',
  'After Meal': 'bg-slate-100 text-slate-600 border-slate-200',
  'With Meal': 'bg-slate-100 text-slate-600 border-slate-200',
  'No Restriction': 'bg-slate-100 text-slate-600 border-slate-200',
};

function InfoChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn(className)}>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{label}</p>
      <p className="text-[13px] font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ─── Medication Card ──────────────────────────────────────────────────────────

function MedicationCard({ med }: { med: Medication }): React.JSX.Element {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Pill size={18} className="text-slate-500" />
          </div>
          <div>
            <h4 className="text-[14.5px] font-bold text-foreground leading-tight">{med.drugName}</h4>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {med.dosageMg}mg &middot; {med.pillsPerDose} {med.pillsPerDose === 1 ? 'pill' : 'pills'} per dose
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Meal time badge */}
          <span
            className={cn(
              'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
              MEAL_TIME_COLOR[med.mealTime]
            )}
          >
            {med.mealTime}
          </span>

          {/* Care plan chip */}
          {med.linkedCarePlan && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-100">
              <LinkIcon size={10} />
              {med.linkedCarePlan}
            </span>
          )}
        </div>
      </div>

      {/* Details row with separators */}
      <div className="flex items-stretch divide-x divide-slate-100">
        <InfoChip label="Frequency" value={med.frequency} className="flex-1 pr-4" />
        <InfoChip label="Start Date" value={med.startDate} className="flex-1 px-4" />
        <InfoChip label="End Date" value={med.endDate ?? 'Ongoing'} className="flex-1 px-4" />
        <InfoChip label="Prescribed By" value={med.prescribedBy} className="flex-1 pl-4" />
      </div>

      {/* Notes row */}
      {med.notes && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
          <AlertCircle size={12} className="text-slate-500 shrink-0" />
          {med.notes}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MedicationTab(): React.JSX.Element {
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');

  const filtered = MEDICATIONS.filter((m) => m.status === filter);

  const activeCount = MEDICATIONS.filter((m) => m.status === 'active').length;
  const inactiveCount = MEDICATIONS.filter((m) => m.status === 'inactive').length;

  return (
    <div className="space-y-5">
      {/* Filter pills */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              filter === 'active'
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Active Medications
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                filter === 'active' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
              )}
            >
              {activeCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('inactive')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              filter === 'inactive'
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Inactive Medications
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                filter === 'inactive' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
              )}
            >
              {inactiveCount}
            </span>
          </button>
        </div>
      </div>

      {/* Medication cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Pill size={24} className="text-slate-400" />
          </div>
          <p className="text-[13.5px] font-semibold text-foreground">No {filter} medications</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            {filter === 'active'
              ? 'No active medications have been prescribed yet.'
              : 'No discontinued or expired medications on record.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((med) => (
            <MedicationCard key={med.id} med={med} />
          ))}
        </div>
      )}
    </div>
  );
}
