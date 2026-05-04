import React from 'react';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Link2,
  Pill,
  RefreshCw,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type CarePlanTemplate = 'Obesity' | 'Hypertension' | 'Diabetes' | 'Heart Failure' | 'Custom';
type ItemStatus = 'active' | 'completed' | 'pending';
type MealTime = 'Before Meal' | 'After Meal' | 'With Meal' | 'No Restriction';

interface CarePlanGoal {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ItemStatus;
  progress: number;
}

interface CarePlanActivity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ItemStatus;
  progress: number;
}

interface CarePlanMedication {
  id: string;
  drugName: string;
  dosageMg: number;
  pillsPerDose: number;
  mealTime: MealTime;
  frequency: string;
  startDate: string;
  endDate: string | null;
  prescribedBy: string;
  linkedCarePlan: string;
  notes?: string;
}

interface CarePlan {
  id: string;
  template: CarePlanTemplate;
  name: string;
  description: string;
  touchpointFrequency: string;
  startDate: string;
  endDate: string;
  goals: CarePlanGoal[];
  activities: CarePlanActivity[];
  medications: CarePlanMedication[];
  notes?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CARE_PLAN: CarePlan = {
  id: 'cp-001',
  template: 'Diabetes',
  name: 'Comprehensive Diabetes Management Plan',
  description:
    'A structured care plan designed to help the patient achieve glycemic control, reduce cardiovascular risk factors, and improve overall quality of life through lifestyle modifications, medication adherence, and regular monitoring.',
  touchpointFrequency: 'Bi-weekly',
  startDate: 'Jan 10, 2024',
  endDate: 'Jan 10, 2025',
  goals: [
    {
      id: 'g-001',
      name: 'Achieve Target HbA1c',
      description: 'Reduce HbA1c to below 7.0% within 6 months through medication adherence and dietary changes.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jul 10, 2024',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'g-002',
      name: 'Blood Pressure Control',
      description: 'Maintain systolic blood pressure below 130 mmHg and diastolic below 80 mmHg.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 68,
    },
    {
      id: 'g-003',
      name: 'Weight Reduction',
      description: 'Achieve a 5–10% reduction in body weight over 12 months through supervised diet and exercise.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 45,
    },
    {
      id: 'g-004',
      name: 'Improve Lipid Profile',
      description: 'Reduce LDL cholesterol to below 100 mg/dL and increase HDL to above 40 mg/dL.',
      startDate: 'Mar 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'pending',
      progress: 12,
    },
  ],
  activities: [
    {
      id: 'a-001',
      name: 'Daily Blood Glucose Monitoring',
      description: 'Patient to log fasting and post-meal glucose readings twice daily using the assigned Dexcom CGM.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 82,
    },
    {
      id: 'a-002',
      name: 'Diabetic Diet Counseling',
      description:
        'Monthly 30-minute sessions with the registered dietitian to review carbohydrate intake and meal planning.',
      startDate: 'Jan 15, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 60,
    },
    {
      id: 'a-003',
      name: 'Aerobic Exercise Program',
      description: '150 minutes of moderate-intensity walking or cycling per week, tracked via wearable device.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 55,
    },
    {
      id: 'a-004',
      name: 'Foot Care Education',
      description: 'Completed one-time education session on diabetic foot care and ulcer prevention.',
      startDate: 'Jan 20, 2024',
      endDate: 'Jan 20, 2024',
      status: 'completed',
      progress: 100,
    },
  ],
  medications: [
    {
      id: 'cm-001',
      drugName: 'Metformin',
      dosageMg: 500,
      pillsPerDose: 2,
      mealTime: 'After Meal',
      frequency: 'Twice Daily',
      startDate: 'Jan 10, 2024',
      endDate: null,
      prescribedBy: 'Dr. Michael Torres',
      linkedCarePlan: 'Diabetes Management Plan',
    },
    {
      id: 'cm-002',
      drugName: 'Lisinopril',
      dosageMg: 10,
      pillsPerDose: 1,
      mealTime: 'No Restriction',
      frequency: 'Once Daily',
      startDate: 'Feb 05, 2024',
      endDate: null,
      prescribedBy: 'Dr. Michael Torres',
      linkedCarePlan: 'Diabetes Management Plan',
    },
    {
      id: 'cm-003',
      drugName: 'Atorvastatin',
      dosageMg: 20,
      pillsPerDose: 1,
      mealTime: 'After Meal',
      frequency: 'Once Daily',
      startDate: 'Mar 01, 2024',
      endDate: null,
      prescribedBy: 'Dr. Sarah Kim',
      linkedCarePlan: 'Diabetes Management Plan',
    },
  ],
  notes:
    'Patient has strong motivation and good family support. Care team should reinforce positive behavior at every touchpoint. Re-evaluate plan goals at the 6-month mark and adjust targets based on lab results.',
};

// ─── Config ───────────────────────────────────────────────────────────────────

const TEMPLATE_STYLE: Record<CarePlanTemplate, { bg: string; text: string; border: string }> = {
  Diabetes: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Hypertension: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Obesity: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Heart Failure': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Custom: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_CONFIG: Record<
  ItemStatus,
  { bg: string; text: string; border: string; dot: string; label: string; bar: string }
> = {
  active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Active',
    bar: 'bg-emerald-500',
  },
  completed: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Completed',
    bar: 'bg-slate-400',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    label: 'Pending',
    bar: 'bg-amber-400',
  },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ItemStatus }): React.JSX.Element {
  const s = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0',
        s.bg,
        s.text,
        s.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Segmented Progress Bar ───────────────────────────────────────────────────

const TOTAL_SEGMENTS = 12;

function SegmentedBar({ progress, status }: { progress: number; status: ItemStatus }): React.JSX.Element {
  const s = STATUS_CONFIG[status];
  const filled = Math.round((progress / 100) * TOTAL_SEGMENTS);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
        <div
          key={i}
          className={cn('flex-1 h-[6px] rounded-sm transition-all duration-300', i < filled ? s.bar : 'bg-slate-100')}
        />
      ))}
    </div>
  );
}

// ─── Goal / Activity Card ─────────────────────────────────────────────────────

function ItemCard({
  title,
  status,
  startDate,
  endDate,
  description,
  progress,
  accentIcon,
}: {
  title: string;
  status: ItemStatus;
  startDate: string;
  endDate: string;
  description: string;
  progress: number;
  accentIcon: React.ReactNode;
}): React.JSX.Element {
  const s = STATUS_CONFIG[status];

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3.5">
      {/* Row 1 — Icon + Title + Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">{accentIcon}</div>
          <p
            className={cn(
              'text-[13px] font-semibold leading-snug',
              status === 'completed' ? 'text-muted-foreground line-through decoration-slate-300' : 'text-foreground'
            )}
          >
            {title}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Row 2 — Progress label + % */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-[0.07em]">Progress</span>
          <span className={cn('text-[12px] font-bold tabular-nums', s.text)}>{progress}%</span>
        </div>
        <SegmentedBar progress={progress} status={status} />
      </div>

      {/* Row 3 — Dates */}
      <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <CalendarDays size={11} className="shrink-0" />
        <span>{startDate}</span>
        <span className="text-slate-300">→</span>
        <span>{endDate}</span>
      </div>

      {/* Row 4 — Description (subtle, always visible) */}
      <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 border-t border-slate-100 pt-3">
        {description}
      </p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  count,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  iconBg: string;
  iconColor: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <span className="text-[13px] font-bold text-foreground">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-slate-100 ml-1" />
    </div>
  );
}

// ─── Medication Card ──────────────────────────────────────────────────────────

function MedicationCard({ med }: { med: CarePlanMedication }): React.JSX.Element {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Top section */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Pill size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground leading-tight">{med.drugName}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {med.dosageMg}mg · {med.pillsPerDose} {med.pillsPerDose === 1 ? 'pill' : 'pills'} per dose
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {med.mealTime !== 'No Restriction' && (
            <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {med.mealTime}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
            <Link2 size={10} />
            {med.linkedCarePlan}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-slate-100" />

      {/* Meta 2×2 grid */}
      <div className="grid grid-cols-2 divide-y divide-slate-100 px-0">
        {/* Row 1 */}
        <div className="flex divide-x divide-slate-100">
          <div className="flex-1 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Frequency</p>
            <p className="text-[12.5px] font-medium text-foreground leading-snug">{med.frequency}</p>
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Start Date</p>
            <p className="text-[12.5px] font-medium text-foreground leading-snug">{med.startDate}</p>
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex divide-x divide-slate-100">
          <div className="flex-1 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">End Date</p>
            <p className="text-[12.5px] font-medium text-foreground leading-snug">{med.endDate ?? 'Ongoing'}</p>
          </div>
          <div className="flex-1 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">
              Prescribed By
            </p>
            <p className="text-[12.5px] font-medium text-foreground leading-snug">{med.prescribedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CarePlanTab(): React.JSX.Element {
  const plan = CARE_PLAN;
  const tmpl = TEMPLATE_STYLE[plan.template];

  const activeGoals = plan.goals.filter((g) => g.status === 'active').length;
  const completedGoals = plan.goals.filter((g) => g.status === 'completed').length;
  const activeActivities = plan.activities.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-5">
      {/* ── Plan Header ──────────────────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground truncate leading-tight">{plan.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                  tmpl.bg,
                  tmpl.text,
                  tmpl.border
                )}
              >
                {plan.template}
              </span>
              <span className="text-[11.5px] text-muted-foreground">
                {plan.startDate} → {plan.endDate}
              </span>
              <span className="text-slate-300 text-[11px]">·</span>
              <span className="text-[11.5px] text-muted-foreground flex items-center gap-1">
                <RefreshCw size={10} />
                {plan.touchpointFrequency}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        {/* Description */}
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {[
            { label: 'Active Goals', value: activeGoals, accent: 'text-emerald-600' },
            { label: 'Completed Goals', value: completedGoals, accent: 'text-slate-500' },
            { label: 'Active Activities', value: activeActivities, accent: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-5 py-3.5">
              <span className={cn('text-[26px] font-bold leading-none tabular-nums', stat.accent)}>{stat.value}</span>
              <span className="text-[11.5px] text-muted-foreground leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Goals ────────────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Target size={14} />}
          label="Goals"
          count={plan.goals.length}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <div className="grid grid-cols-2 gap-3">
          {plan.goals.map((goal) => (
            <ItemCard
              key={goal.id}
              title={goal.name}
              status={goal.status}
              startDate={goal.startDate}
              endDate={goal.endDate}
              description={goal.description}
              progress={goal.progress}
              accentIcon={
                goal.status === 'completed' ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <Target size={15} className="text-violet-500" />
                )
              }
            />
          ))}
        </div>
      </div>

      {/* ── Activities ───────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Activity size={14} />}
          label="Activities"
          count={plan.activities.length}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <div className="grid grid-cols-2 gap-3">
          {plan.activities.map((activity) => (
            <ItemCard
              key={activity.id}
              title={activity.name}
              status={activity.status}
              startDate={activity.startDate}
              endDate={activity.endDate}
              description={activity.description}
              progress={activity.progress}
              accentIcon={
                activity.status === 'completed' ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <Activity size={15} className="text-sky-500" />
                )
              }
            />
          ))}
        </div>
      </div>

      {/* ── Medications ──────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Pill size={14} />}
          label="Medications"
          count={plan.medications.length}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
        <div className="grid grid-cols-3 gap-3">
          {plan.medications.map((med) => (
            <MedicationCard key={med.id} med={med} />
          ))}
        </div>
      </div>

      {/* ── Clinical Notes ───────────────────────────────────────────────────── */}
      {plan.notes && (
        <div>
          <SectionHeader
            icon={<FileText size={14} />}
            label="Clinical Notes"
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-1 self-stretch rounded-full bg-slate-200 shrink-0" />
              <p className="text-[13px] text-foreground leading-relaxed">{plan.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
