import React from 'react';
import { ClipboardList, Target, Activity, Pill, FileText, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
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
}

interface CarePlanActivity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ItemStatus;
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
    },
    {
      id: 'g-002',
      name: 'Blood Pressure Control',
      description: 'Maintain systolic blood pressure below 130 mmHg and diastolic below 80 mmHg.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
    },
    {
      id: 'g-003',
      name: 'Weight Reduction',
      description: 'Achieve a 5–10% reduction in body weight over 12 months through supervised diet and exercise.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
    },
    {
      id: 'g-004',
      name: 'Improve Lipid Profile',
      description: 'Reduce LDL cholesterol to below 100 mg/dL and increase HDL to above 40 mg/dL.',
      startDate: 'Mar 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'pending',
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
    },
    {
      id: 'a-002',
      name: 'Diabetic Diet Counseling',
      description:
        'Monthly 30-minute sessions with the registered dietitian to review carbohydrate intake and meal planning.',
      startDate: 'Jan 15, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
    },
    {
      id: 'a-003',
      name: 'Aerobic Exercise Program',
      description: '150 minutes of moderate-intensity walking or cycling per week, tracked via wearable device.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
    },
    {
      id: 'a-004',
      name: 'Foot Care Education',
      description: 'Completed one-time education session on diabetic foot care and ulcer prevention.',
      startDate: 'Jan 20, 2024',
      endDate: 'Jan 20, 2024',
      status: 'completed',
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
  Diabetes: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  Hypertension: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  Obesity: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  'Heart Failure': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  Custom: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_STYLE: Record<ItemStatus, { bg: string; text: string; border: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-400' },
};

// ─── Shared Sub-components ────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">{icon}</div>
      <h3 className="text-[13px] font-bold text-foreground">{title}</h3>
      <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{count}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }): React.JSX.Element {
  const s = STATUS_STYLE[status];
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
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

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

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: CarePlanGoal }): React.JSX.Element {
  const isCompleted = goal.status === 'completed';
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {isCompleted ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <Circle size={16} className="text-slate-300" />
            )}
          </div>
          <h4
            className={cn(
              'text-[13.5px] font-bold leading-tight',
              isCompleted ? 'text-muted-foreground line-through decoration-slate-300' : 'text-foreground'
            )}
          >
            {goal.name}
          </h4>
        </div>
        <StatusBadge status={goal.status} />
      </div>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-4 pl-[26px]">{goal.description}</p>
      <div className="flex items-stretch divide-x divide-slate-100 pl-[26px]">
        <div className="flex-1 pr-4">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Start Date</p>
          <p className="text-[12.5px] font-medium text-foreground mt-0.5">{goal.startDate}</p>
        </div>
        <div className="flex-1 pl-4">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">End Date</p>
          <p className="text-[12.5px] font-medium text-foreground mt-0.5">{goal.endDate}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: CarePlanActivity }): React.JSX.Element {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Activity size={14} className="text-slate-500" />
          </div>
          <h4 className="text-[13.5px] font-bold text-foreground leading-tight">{activity.name}</h4>
        </div>
        <StatusBadge status={activity.status} />
      </div>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-4">{activity.description}</p>
      <div className="flex items-stretch divide-x divide-slate-100">
        <div className="flex-1 pr-4">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Start Date</p>
          <p className="text-[12.5px] font-medium text-foreground mt-0.5">{activity.startDate}</p>
        </div>
        <div className="flex-1 pl-4">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">End Date</p>
          <p className="text-[12.5px] font-medium text-foreground mt-0.5">{activity.endDate}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Medication Card (mirrors MedicationTab style) ────────────────────────────

function MedCard({ med }: { med: CarePlanMedication }): React.JSX.Element {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4">
      {/* Header */}
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
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
            {med.mealTime}
          </span>
        </div>
      </div>

      {/* Details row */}
      <div className="flex items-stretch divide-x divide-slate-100">
        <InfoChip label="Frequency" value={med.frequency} className="flex-1 pr-4" />
        <InfoChip label="Start Date" value={med.startDate} className="flex-1 px-4" />
        <InfoChip label="End Date" value={med.endDate ?? 'Ongoing'} className="flex-1 pl-4" />
      </div>

      {/* Notes */}
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

export function CarePlanTab(): React.JSX.Element {
  const plan = CARE_PLAN;
  const tmpl = TEMPLATE_STYLE[plan.template];

  return (
    <div className="space-y-6">
      {/* ── Plan Overview ── */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-slate-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground leading-tight mb-1">{plan.name}</h3>
              <span
                className={cn(
                  'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                  tmpl.bg,
                  tmpl.text,
                  tmpl.border
                )}
              >
                {plan.template}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">{plan.description}</p>
        <div className="flex items-stretch divide-x divide-slate-100 pt-4 border-t border-slate-100">
          <div className="flex-1 pr-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Touchpoint Frequency
            </p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{plan.touchpointFrequency}</p>
          </div>
          <div className="flex-1 px-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Start Date</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{plan.startDate}</p>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">End Date</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{plan.endDate}</p>
          </div>
        </div>
      </div>

      {/* ── Goals ── */}
      <div>
        <SectionHeader icon={<Target size={14} className="text-slate-500" />} title="Goals" count={plan.goals.length} />
        <div className="grid grid-cols-2 gap-4">
          {plan.goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* ── Activities ── */}
      <div>
        <SectionHeader
          icon={<Activity size={14} className="text-slate-500" />}
          title="Activities"
          count={plan.activities.length}
        />
        <div className="grid grid-cols-2 gap-4">
          {plan.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* ── Medications ── */}
      <div>
        <SectionHeader
          icon={<Pill size={14} className="text-slate-500" />}
          title="Medications"
          count={plan.medications.length}
        />
        <div className="grid grid-cols-3 gap-4">
          {plan.medications.map((med) => (
            <MedCard key={med.id} med={med} />
          ))}
        </div>
      </div>

      {/* ── Notes ── */}
      {plan.notes && (
        <div>
          <SectionHeader icon={<FileText size={14} className="text-slate-500" />} title="Notes" count={1} />
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">{plan.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
