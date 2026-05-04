import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight } from 'lucide-react';
// Activity is kept for the empty-state icon
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = 'vital' | 'staff' | 'ai' | 'message' | 'device' | 'system';
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
        alert: null,
        categoryLabel: 'Messages',
        actor: 'Robert Johnson',
      },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ALERT_STYLE: Record<'elevated' | 'critical', { badge: string; leftBar: string }> = {
  elevated: { badge: 'bg-amber-50 text-amber-700 border-amber-200', leftBar: 'border-l-amber-400' },
  critical: { badge: 'bg-rose-50 text-rose-600 border-rose-200', leftBar: 'border-l-rose-500' },
};

// Dot color per category
const CATEGORY_DOT: Record<string, string> = {
  'Staff Actions': 'bg-violet-400',
  'Vitals & RPM': 'bg-rose-400',
  'AI Insights': 'bg-sky-400',
  Messages: 'bg-emerald-400',
  Devices: 'bg-slate-400',
  System: 'bg-slate-300',
};

// ─── Category Tag ─────────────────────────────────────────────────────────────

function CategoryTag({ label }: { label: string }): React.JSX.Element {
  const dot = CATEGORY_DOT[label] ?? 'bg-slate-300';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {label}
    </span>
  );
}

// ─── Detail Field ─────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!event.detail;
  const alertStyle = event.alert ? ALERT_STYLE[event.alert] : null;

  return (
    <div
      className={cn('border-b border-slate-100 last:border-0', alertStyle && `border-l-[3px] ${alertStyle.leftBar}`)}
    >
      {/* Main row */}
      <div
        className={cn(
          'flex items-start justify-between gap-4 px-5 py-3.5',
          hasDetail && 'cursor-pointer hover:bg-slate-50/60 transition-colors'
        )}
        onClick={() => hasDetail && setExpanded((o) => !o)}
      >
        <div className="min-w-0 flex-1">
          {/* Title + alert badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[13px] font-semibold text-foreground leading-tight">{event.title}</span>
            {event.alert && (
              <span
                className={cn(
                  'inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full border',
                  ALERT_STYLE[event.alert].badge
                )}
              >
                {event.alert.charAt(0).toUpperCase() + event.alert.slice(1)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-1.5">{event.description}</p>

          {/* Category tag + actor */}
          <div className="flex items-center gap-2">
            <CategoryTag label={event.categoryLabel} />
            <span className="text-slate-300 text-[10px]">·</span>
            <span className="text-[11px] text-muted-foreground">{event.actor}</span>
          </div>
        </div>

        {/* Time + chevron */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <span className="text-[11.5px] text-muted-foreground font-medium tabular-nums">{event.time}</span>
          {hasDetail && (
            <span className="text-slate-300 ml-0.5">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {hasDetail && expanded && event.detail && (
        <div className="mx-5 mb-3.5 rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
            <DetailField label="Reading" value={event.detail.reading} />
            <DetailField label="Vital" value={event.detail.vitalType} />
            {event.detail.reviewedBy && <DetailField label="Reviewed By" value={event.detail.reviewedBy} />}
            {event.detail.actionTaken && <DetailField label="Action Taken" value={event.detail.actionTaken} />}
          </div>
        </div>
      )}
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
  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Filter pills */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
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

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {filteredTimeline.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <Activity size={28} className="text-slate-200" />
          <p className="text-[13px] text-muted-foreground">No activity found for this period.</p>
        </div>
      )}

      {/* ── Timeline groups ───────────────────────────────────────────────────── */}
      {filteredTimeline.map((group) => (
        <div key={group.date}>
          {/* Day divider */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold text-muted-foreground">
                {group.label === 'Today' || group.label === 'Yesterday' ? `${group.label} — ${group.date}` : group.date}
              </span>
              <div className="h-px w-20 bg-slate-100" />
            </div>
            <span className="text-[11px] text-muted-foreground">{group.events.length} events</span>
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
