import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronDown,
  ClipboardList,
  Bot,
  Filter,
  User,
  Clock,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Timer,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
type TaskSource = 'auto' | 'manual';
type TaskFilter = 'current' | 'completed';
type StatusFilter = 'all' | 'Pending' | 'In Progress' | 'Overdue';

interface Task {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string; // display string
  assignedTo: string;
  assignedRole: string;
  source: TaskSource;
  status: TaskStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_TASKS: Task[] = [
  {
    id: 't-001',
    name: 'Blood Pressure Monitoring Review',
    description:
      "Review patient's blood pressure readings from the past 7 days and assess if the current medication dosage needs adjustment.",
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Apr 29, 2026 · 9:14 AM',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'auto',
    status: 'In Progress',
  },
  {
    id: 't-002',
    name: 'Diabetes Education Session',
    description:
      'Schedule and conduct a diabetes self-management education session covering dietary guidelines, glucose monitoring, and lifestyle modifications.',
    createdBy: 'Sarah Mitchell',
    createdAt: 'Apr 28, 2026 · 2:30 PM',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'manual',
    status: 'Pending',
  },
  {
    id: 't-003',
    name: 'Medication Adherence Follow-Up',
    description:
      'Contact patient to verify adherence to the new Metformin regimen and document any reported side effects or concerns.',
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Apr 27, 2026 · 11:00 AM',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'manual',
    status: 'Overdue',
  },
  {
    id: 't-004',
    name: 'Monthly Weight & BMI Tracking',
    description:
      'Record monthly weight and BMI measurements and compare against baseline. Flag if BMI change exceeds 2 points.',
    createdBy: 'System',
    createdAt: 'Apr 26, 2026 · 6:00 AM',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'auto',
    status: 'Pending',
  },
  {
    id: 't-005',
    name: 'Care Plan Update — Q2 2026',
    description:
      "Review and update the patient's quarterly care plan goals, including cardiovascular risk targets and CKD management milestones.",
    createdBy: 'Sarah Mitchell',
    createdAt: 'Apr 25, 2026 · 3:45 PM',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    source: 'manual',
    status: 'In Progress',
  },
];

const COMPLETED_TASKS: Task[] = [
  {
    id: 't-101',
    name: 'Initial Device Setup — BP Cuff',
    description:
      'Assist patient with setting up and pairing the blood pressure cuff device for remote monitoring. Verify first successful sync.',
    createdBy: 'System',
    createdAt: 'Mar 15, 2026 · 10:00 AM',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'auto',
    status: 'Completed',
  },
  {
    id: 't-102',
    name: 'Consent Form Collection',
    description:
      'Collect signed RPM consent forms from patient and upload to the patient record. Verify legal compliance before device activation.',
    createdBy: 'Sarah Mitchell',
    createdAt: 'Mar 12, 2026 · 1:15 PM',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'manual',
    status: 'Completed',
  },
  {
    id: 't-103',
    name: 'Lab Results Review — HbA1c',
    description:
      'Review the latest HbA1c lab results and update clinical notes. Coordinate with the physician if levels exceed the target threshold of 7.5%.',
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Mar 8, 2026 · 9:30 AM',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    source: 'manual',
    status: 'Completed',
  },
  {
    id: 't-104',
    name: 'Q1 2026 Care Plan Review',
    description:
      'Conduct the quarterly care plan review. Document progress against Q1 goals and set measurable targets for Q2.',
    createdBy: 'System',
    createdAt: 'Feb 28, 2026 · 6:00 AM',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    source: 'auto',
    status: 'Completed',
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; Icon: React.ElementType }> = {
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: CircleDot,
  },
  Completed: {
    label: 'Completed',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    Icon: CheckCircle2,
  },
  Overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    Icon: AlertCircle,
  },
};

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: TaskSource }): React.JSX.Element {
  if (source === 'auto') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
        <Bot size={10} />
        Auto-Generated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <User size={10} />
      Manually Created
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }): React.JSX.Element {
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border',
        cfg.className
      )}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

function nameToColor(name: string): string {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: Task }): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition-all duration-150">
      {/* Card header row */}
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-foreground leading-snug">{task.name}</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">{task.description}</p>
        </div>
        {/* Status badge — top-right */}
        <div className="shrink-0 mt-0.5">
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-slate-100" />

      {/* Meta grid — 2×2 */}
      <div className="px-5 py-3 grid grid-cols-2 gap-x-6 gap-y-3.5">
        {/* Created By */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1.5">Created By</p>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                nameToColor(task.createdBy)
              )}
            >
              {task.createdBy === 'System' ? <Bot size={10} /> : initials(task.createdBy)}
            </div>
            <p className="text-[12px] font-medium text-foreground truncate">{task.createdBy}</p>
          </div>
        </div>

        {/* Created Date & Time */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1.5">
            Created Date & Time
          </p>
          <div className="flex items-center gap-1.5">
            <Timer size={11} className="text-muted-foreground shrink-0" />
            <p className="text-[12px] font-medium text-foreground">{task.createdAt}</p>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1.5">Assigned To</p>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                nameToColor(task.assignedTo)
              )}
            >
              {initials(task.assignedTo)}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{task.assignedTo}</p>
              <p className="text-[10.5px] text-muted-foreground truncate">{task.assignedRole}</p>
            </div>
          </div>
        </div>

        {/* Source */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1.5">Source</p>
          <SourceBadge source={task.source} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ label, filtered }: { label: string; filtered?: boolean }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <ClipboardList size={20} className="text-muted-foreground" />
      </div>
      <p className="text-[13px] font-semibold text-foreground mb-1">No {label}</p>
      <p className="text-[12.5px] text-muted-foreground">
        {filtered
          ? 'No tasks match the selected filter.'
          : label === 'current tasks'
            ? 'All tasks for this patient have been completed.'
            : 'No completed tasks yet for this patient.'}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Overdue', label: 'Overdue' },
];

export function TasksTab(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('current');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const baseTasks = activeFilter === 'current' ? CURRENT_TASKS : COMPLETED_TASKS;
  const tasks =
    activeFilter === 'current' && statusFilter !== 'all'
      ? baseTasks.filter((t) => t.status === statusFilter)
      : baseTasks;
  const emptyLabel = activeFilter === 'current' ? 'current tasks' : 'completed tasks';
  const activeStatusLabel = STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? 'Status';

  return (
    <div className="space-y-4">
      {/* Header row — title + count + filters + sub-tab toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[14px] font-bold text-foreground">Patient Tasks</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
            {tasks.length} {activeFilter === 'current' ? 'active' : 'completed'}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Status filter dropdown — only for Current Tasks */}
          {activeFilter === 'current' && (
            <div ref={statusDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((o) => !o)}
                className={cn(
                  'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-[13px] font-medium transition-colors',
                  statusFilter !== 'all'
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                )}
              >
                <Filter size={13} />
                {statusFilter === 'all' ? 'Status' : activeStatusLabel}
                <ChevronDown
                  size={13}
                  className={cn(
                    'text-muted-foreground transition-transform duration-150',
                    statusDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-1.5 overflow-hidden">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(f.id);
                        setStatusDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                        statusFilter === f.id ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                      )}
                    >
                      {f.label}
                      {statusFilter === f.id && <Check size={13} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab pill toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {(
              [
                { id: 'current', label: 'Current Tasks' },
                { id: 'completed', label: 'Completed' },
              ] as { id: TaskFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                  setStatusFilter('all');
                  setStatusDropdownOpen(false);
                }}
                className={cn(
                  'px-4 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150',
                  activeFilter === tab.id
                    ? 'bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.10)] font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <EmptyState label={emptyLabel} filtered={activeFilter === 'current' && statusFilter !== 'all'} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
