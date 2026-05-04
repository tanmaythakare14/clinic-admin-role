import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  CircleDot,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  User,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
type TaskSource = 'auto' | 'manual';
type TaskFilter = 'current' | 'completed';
type StatusFilter = 'all' | 'Pending' | 'In Progress' | 'Overdue';

interface Task {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
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
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Apr 29, 2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'auto',
    status: 'In Progress',
  },
  {
    id: 't-002',
    name: 'Diabetes Education Session',
    createdBy: 'Eleanor Vance',
    createdAt: 'Apr 28, 2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'manual',
    status: 'Pending',
  },
  {
    id: 't-003',
    name: 'Medication Adherence Follow-Up',
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Apr 27, 2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'manual',
    status: 'Overdue',
  },
  {
    id: 't-004',
    name: 'Monthly Weight & BMI Tracking',
    createdBy: 'System',
    createdAt: 'Apr 26, 2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'auto',
    status: 'Pending',
  },
  {
    id: 't-005',
    name: 'Care Plan Update — Q2 2026',
    createdBy: 'Eleanor Vance',
    createdAt: 'Apr 25, 2026',
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
    createdBy: 'System',
    createdAt: 'Mar 15, 2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    source: 'auto',
    status: 'Completed',
  },
  {
    id: 't-102',
    name: 'Consent Form Collection',
    createdBy: 'Eleanor Vance',
    createdAt: 'Mar 12, 2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    source: 'manual',
    status: 'Completed',
  },
  {
    id: 't-103',
    name: 'Lab Results Review — HbA1c',
    createdBy: 'Dr. Michael Torres',
    createdAt: 'Mar 8, 2026',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    source: 'manual',
    status: 'Completed',
  },
  {
    id: 't-104',
    name: 'Q1 2026 Care Plan Review',
    createdBy: 'System',
    createdAt: 'Feb 28, 2026',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    source: 'auto',
    status: 'Completed',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; Icon: React.ElementType }> = {
  Pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200', Icon: CircleDot },
  Completed: { label: 'Completed', className: 'bg-teal-50 text-teal-700 border-teal-200', Icon: CheckCircle2 },
  Overdue: { label: 'Overdue', className: 'bg-rose-50 text-rose-700 border-rose-200', Icon: AlertCircle },
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Overdue', label: 'Overdue' },
];

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

// ─── Cells ────────────────────────────────────────────────────────────────────

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

function SourceBadge({ source }: { source: TaskSource }): React.JSX.Element {
  if (source === 'auto') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
        <Bot size={10} />
        Auto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <User size={10} />
      Manual
    </span>
  );
}

function PersonCell({ name, sub }: { name: string; sub?: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
          nameToColor(name)
        )}
      >
        {name === 'System' ? <Bot size={10} /> : initials(name)}
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-foreground truncate">{name}</p>
        {sub && <p className="text-[10.5px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TasksTab(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('current');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const baseTasks = activeFilter === 'current' ? CURRENT_TASKS : COMPLETED_TASKS;
  const tasks =
    activeFilter === 'current' && statusFilter !== 'all'
      ? baseTasks.filter((t) => t.status === statusFilter)
      : baseTasks;

  const activeStatusLabel = STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? 'Status';

  const TABLE_HEADERS = ['Task Name', 'Created By', 'Created On', 'Assigned To', 'Source', 'Status'];

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
        {/* Tab toggle — left */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
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
                setActiveFilter(tab.id as TaskFilter);
                setStatusFilter('all');
                setDropdownOpen(false);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150',
                activeFilter === tab.id
                  ? 'bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.10)] font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter dropdown — right, only for Current */}
        {activeFilter === 'current' && (
          <div ref={dropdownRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={cn(
                'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
                statusFilter !== 'all'
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
              )}
            >
              <Filter size={12} />
              {statusFilter === 'all' ? 'Status' : activeStatusLabel}
              <ChevronDown
                size={12}
                className={cn('text-muted-foreground transition-transform duration-150', dropdownOpen && 'rotate-180')}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-1.5 overflow-hidden">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(f.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                      statusFilter === f.id ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                    )}
                  >
                    {f.label}
                    {statusFilter === f.id && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Count — right side for completed tab */}
        {activeFilter === 'completed' && (
          <span className="ml-auto text-[12px] text-muted-foreground">{tasks.length} tasks</span>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-[#FAFAF9]">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-14 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ClipboardList size={22} className="text-slate-300" />
                  <p className="text-[13px] text-muted-foreground">No tasks found.</p>
                </div>
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Task Name */}
                <td className="px-5 py-3.5 max-w-[220px]">
                  <p className="text-[13px] font-semibold text-foreground leading-snug">{task.name}</p>
                </td>

                {/* Created By */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <PersonCell name={task.createdBy} />
                </td>

                {/* Created On */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[12.5px] text-foreground">{task.createdAt}</span>
                </td>

                {/* Assigned To */}
                <td className="px-5 py-3.5">
                  <PersonCell name={task.assignedTo} sub={task.assignedRole} />
                </td>

                {/* Source */}
                <td className="px-5 py-3.5">
                  <SourceBadge source={task.source} />
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={task.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">
          {tasks.length} {activeFilter === 'current' ? 'active' : 'completed'} tasks
        </span>
      </div>
    </div>
  );
}
