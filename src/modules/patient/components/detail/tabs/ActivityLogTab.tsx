import React, { useState } from 'react';
import {
  HeartPulse,
  UserRound,
  Bot,
  ShieldCheck,
  MonitorSmartphone,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = 'vital' | 'staff' | 'ai' | 'message' | 'device' | 'system';
type ProgramTag = 'RPM' | 'APCM';
type AlertLevel = 'elevated' | 'critical' | null;

interface VitalDetail {
  reading: string;
  vitalType: string;
  reviewedBy?: string;
  actionTaken?: string;
}

interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  time: string;
  program?: ProgramTag;
  alert?: AlertLevel;
  categoryLabel: string;
  actor: string;
  detail?: VitalDetail;
}

type FilterRange = 'week' | '15days' | '30days' | 'all';

interface DayGroup {
  label: string;
  date: string;
  daysAgo: number;
  events: ActivityEvent[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TIMELINE: DayGroup[] = [
  {
    label: 'Today',
    date: 'April 8, 2026',
    daysAgo: 0,
    events: [
      {
        id: 'e-001',
        type: 'staff',
        title: 'Nurse Reviewed BP Reading',
        description: 'RN Jessica Park reviewed the morning blood pressure reading and noted elevated systolic value.',
        time: '8:45 AM',
        program: 'RPM',
        alert: null,
        categoryLabel: 'Staff Actions',
        actor: 'RN Jessica Park',
        detail: {
          reading: '148 / 92 mmHg',
          vitalType: 'Blood Pressure',
          reviewedBy: 'RN Jessica Park',
          actionTaken: 'Patient messaged to confirm medication adherence. Follow-up scheduled for tomorrow.',
        },
      },
      {
        id: 'e-002',
        type: 'vital',
        title: 'Blood Pressure Reading Received',
        description: 'Automated reading from Omron HEM-9200T: 148/92 mmHg',
        time: '8:32 AM',
        program: 'RPM',
        alert: 'elevated',
        categoryLabel: 'Vitals & RPM',
        actor: 'Omron BP Monitor',
        detail: {
          reading: '148 / 92 mmHg',
          vitalType: 'Blood Pressure',
        },
      },
      {
        id: 'e-003',
        type: 'vital',
        title: 'Glucose Reading Received',
        description: 'Fasting glucose reading from OneTouch Verio Flex: 138 mg/dL',
        time: '7:00 AM',
        program: 'RPM',
        alert: 'elevated',
        categoryLabel: 'Vitals & RPM',
        actor: 'OneTouch Glucose Meter',
        detail: {
          reading: '138 mg/dL',
          vitalType: 'Blood Glucose',
        },
      },
      {
        id: 'e-004',
        type: 'system',
        title: 'RPM Compliance Update',
        description: 'Patient has 12 of 16 required reading days this month. 4 more days needed.',
        time: '6:00 AM',
        program: 'RPM',
        alert: null,
        categoryLabel: 'System',
        actor: 'System',
      },
    ],
  },
  {
    label: 'Yesterday',
    date: 'April 7, 2026',
    daysAgo: 1,
    events: [
      {
        id: 'e-005',
        type: 'vital',
        title: 'Blood Pressure Reading Received',
        description: 'Evening reading from Omron HEM-9200T: 132/84 mmHg',
        time: '6:20 PM',
        program: 'RPM',
        alert: null,
        categoryLabel: 'Vitals & RPM',
        actor: 'Omron BP Monitor',
        detail: {
          reading: '132 / 84 mmHg',
          vitalType: 'Blood Pressure',
        },
      },
      {
        id: 'e-006',
        type: 'message',
        title: 'Staff Replied to Patient Message',
        description: "RN Jessica Park responded to the patient's question about medication timing adjustments.",
        time: '4:30 PM',
        program: undefined,
        alert: null,
        categoryLabel: 'Messages',
        actor: 'RN Jessica Park',
      },
      {
        id: 'e-007',
        type: 'ai',
        title: 'AI Alert Generated',
        description: 'Automated alert created for elevated morning glucose trend over 3 consecutive days.',
        time: '9:05 AM',
        program: 'RPM',
        alert: 'elevated',
        categoryLabel: 'AI Insights',
        actor: 'AI Engine',
      },
      {
        id: 'e-008',
        type: 'vital',
        title: 'Glucose Reading Received',
        description: 'Morning fasting glucose from Dexcom CGM: 141 mg/dL',
        time: '7:02 AM',
        program: 'RPM',
        alert: 'elevated',
        categoryLabel: 'Vitals & RPM',
        actor: 'Dexcom CGM',
        detail: {
          reading: '141 mg/dL',
          vitalType: 'Blood Glucose',
        },
      },
    ],
  },
  {
    label: 'April 5, 2026',
    date: 'April 5, 2026',
    daysAgo: 3,
    events: [
      {
        id: 'e-009',
        type: 'staff',
        title: 'Care Plan Updated',
        description: 'Dr. Michael Torres updated the Diabetes Management Plan with revised HbA1c targets.',
        time: '3:15 PM',
        program: undefined,
        alert: null,
        categoryLabel: 'Staff Actions',
        actor: 'Dr. Michael Torres',
      },
      {
        id: 'e-010',
        type: 'device',
        title: 'Device Sync Completed',
        description: 'Omron HEM-9200T synced 14 readings successfully. All data transmitted to RPM platform.',
        time: '11:00 AM',
        program: 'RPM',
        alert: null,
        categoryLabel: 'Devices',
        actor: 'Omron BP Monitor',
      },
      {
        id: 'e-011',
        type: 'message',
        title: 'Patient Sent a Message',
        description: 'Patient asked about adjusting Metformin timing to reduce stomach discomfort after meals.',
        time: '9:30 AM',
        program: undefined,
        alert: null,
        categoryLabel: 'Messages',
        actor: 'Robert Johnson',
      },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const EVENT_ICON: Record<EventType, { icon: React.ReactNode; bg: string; color: string }> = {
  vital: { icon: <HeartPulse size={15} />, bg: 'bg-rose-50', color: 'text-rose-500' },
  staff: { icon: <UserRound size={15} />, bg: 'bg-violet-50', color: 'text-violet-500' },
  ai: { icon: <Bot size={15} />, bg: 'bg-sky-50', color: 'text-sky-500' },
  message: { icon: <MessageSquare size={15} />, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  device: { icon: <MonitorSmartphone size={15} />, bg: 'bg-slate-100', color: 'text-slate-500' },
  system: { icon: <ShieldCheck size={15} />, bg: 'bg-slate-100', color: 'text-slate-500' },
};

const PROGRAM_STYLE: Record<ProgramTag, string> = {
  RPM: 'bg-primary/10 text-primary border-primary/20',
  APCM: 'bg-teal-50 text-teal-700 border-teal-100',
};

const ALERT_STYLE: Record<'elevated' | 'critical', { badge: string; border: string }> = {
  elevated: { badge: 'bg-amber-50 text-amber-700 border-amber-100', border: 'border-l-amber-400' },
  critical: { badge: 'bg-rose-50 text-rose-700 border-rose-100', border: 'border-l-rose-500' },
};

const CATEGORY_STYLE: Record<string, string> = {
  'Staff Actions': 'bg-violet-50 text-violet-600 border-violet-100',
  'Vitals & RPM': 'bg-rose-50 text-rose-600 border-rose-100',
  'AI Insights': 'bg-sky-50 text-sky-600 border-sky-100',
  Messages: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Devices: 'bg-slate-100 text-slate-600 border-slate-200',
  System: 'bg-slate-100 text-slate-500 border-slate-200',
};

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_ICON[event.type];
  const hasDetail = !!event.detail;
  const alertStyle = event.alert ? ALERT_STYLE[event.alert] : null;

  return (
    <div
      className={cn(
        'border-b border-slate-100 last:border-0',
        alertStyle && 'border-l-[3px] pl-4 -ml-4',
        alertStyle ? alertStyle.border : 'border-l-transparent'
      )}
    >
      {/* Main row */}
      <div
        className={cn('flex items-start justify-between gap-4 px-5 py-4', hasDetail && 'cursor-pointer')}
        onClick={() => hasDetail && setExpanded((o) => !o)}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon */}
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.color)}>
            {cfg.icon}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[13.5px] font-bold text-foreground leading-tight">{event.title}</span>
              {event.alert && (
                <span
                  className={cn(
                    'inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full border',
                    ALERT_STYLE[event.alert].badge
                  )}
                >
                  {event.alert.charAt(0).toUpperCase() + event.alert.slice(1)}
                </span>
              )}
              {event.program && (
                <span
                  className={cn(
                    'inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-full border',
                    PROGRAM_STYLE[event.program]
                  )}
                >
                  {event.program}
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{event.description}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full border',
                  CATEGORY_STYLE[event.categoryLabel] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                )}
              >
                {event.categoryLabel}
              </span>
              <span className="text-[10.5px] text-muted-foreground">{event.actor}</span>
            </div>
          </div>
        </div>

        {/* Time + chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[12px] text-muted-foreground font-medium">{event.time}</span>
          {hasDetail && (
            <span className="text-muted-foreground/50">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {hasDetail && expanded && event.detail && (
        <div className="mx-5 mb-4 rounded-xl border border-slate-100 bg-slate-50/60 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
            <DetailField label="Reading" value={event.detail.reading} />
            <DetailField label="Vital" value={event.detail.vitalType} />
            {event.detail.reviewedBy && <DetailField label="Reviewed By" value={event.detail.reviewedBy} />}
            {event.detail.actionTaken && <DetailField label="Action Taken" value={event.detail.actionTaken} wide />}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, wide }: { label: string; value: string; wide?: boolean }): React.JSX.Element {
  return (
    <div className={cn(wide && 'col-span-2')}>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}

// ─── Filter Config ────────────────────────────────────────────────────────────

const FILTERS: { key: FilterRange; label: string; maxDays: number | null }[] = [
  { key: 'week', label: 'Last Week', maxDays: 7 },
  { key: '15days', label: 'Last 15 Days', maxDays: 15 },
  { key: '30days', label: 'Last 30 Days', maxDays: 30 },
  { key: 'all', label: 'All Time', maxDays: null },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityLogTab(): React.JSX.Element {
  const [filter, setFilter] = useState<FilterRange>('all');

  const activeCfg = FILTERS.find((f) => f.key === filter)!;
  const filteredTimeline = TIMELINE.filter((g) => (activeCfg.maxDays === null ? true : g.daysAgo <= activeCfg.maxDays));
  const totalEvents = filteredTimeline.reduce((sum, g) => sum + g.events.length, 0);

  return (
    <div className="space-y-5">
      {/* Header — inline with filters */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <Activity size={14} className="text-slate-500" />
        </div>
        <h3 className="text-[13.5px] font-bold text-foreground">Patient Activity Timeline</h3>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {totalEvents} events
        </span>

        {/* Filter pill buttons — pushed to right */}
        <div className="ml-auto flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1 rounded-md text-[11.5px] font-semibold transition-all',
                filter === f.key
                  ? 'bg-white text-foreground shadow-sm border border-slate-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredTimeline.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <Activity size={28} className="text-slate-200" />
          <p className="text-[13px] text-muted-foreground">No activity found for this period.</p>
        </div>
      )}

      {/* Timeline groups */}
      {filteredTimeline.map((group) => (
        <div key={group.date}>
          {/* Day divider */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-[11.5px] font-bold text-muted-foreground">
                {group.label === 'Today' || group.label === 'Yesterday' ? `${group.label} — ${group.date}` : group.date}
              </span>
              <div className="h-px flex-1 w-24 bg-slate-100" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">{group.events.length} events</span>
          </div>

          {/* Events card */}
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            {group.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
