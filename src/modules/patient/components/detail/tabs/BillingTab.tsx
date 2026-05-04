import React from 'react';
import {
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Info,
  Smartphone,
  BarChart2,
  Timer,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type CodeStatus = 'Generated' | 'Pending' | 'Failed';

interface GeneratedCode {
  id: string;
  cptCode: string;
  description: string;
  status: CodeStatus;
  generatedDate: string;
  pcpName: string;
  pcpNpi: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BILLING_MONTH = 'April 2026';
const PCP_NAME = 'Dr. Michael Torres';
const PCP_NPI = '1234567890';
const READING_DAYS = { current: 12, required: 16 };
const STAFF_MIN = { first: { current: 18, max: 20 }, additional: { current: 0, max: 20 } };
const CODES_GENERATED = 1;
const CODES_TOTAL = 4;
const DAYS_REMAINING = 8;

const GENERATED_CODES: GeneratedCode[] = [
  {
    id: 'gc-1',
    cptCode: '99453',
    description: 'RPM Device Setup & Patient Education (one-time)',
    status: 'Generated',
    generatedDate: 'Jan 15, 2025',
    pcpName: PCP_NAME,
    pcpNpi: PCP_NPI,
  },
  {
    id: 'gc-2',
    cptCode: '99454',
    description: 'RPM Device Supply with Daily Monitoring (per 30 days)',
    status: 'Pending',
    generatedDate: '—',
    pcpName: PCP_NAME,
    pcpNpi: PCP_NPI,
  },
  {
    id: 'gc-3',
    cptCode: '99457',
    description: 'RPM Care Management — First 20 minutes',
    status: 'Pending',
    generatedDate: '—',
    pcpName: PCP_NAME,
    pcpNpi: PCP_NPI,
  },
  {
    id: 'gc-4',
    cptCode: '99458',
    description: 'RPM Care Management — Additional 20 minutes',
    status: 'Pending',
    generatedDate: '—',
    pcpName: PCP_NAME,
    pcpNpi: PCP_NPI,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular SVG progress ring */
function RingProgress({
  pct,
  size = 52,
  strokeWidth = 4,
}: {
  pct: number;
  size?: number;
  strokeWidth?: number;
}): React.JSX.Element {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} stroke="#e2e8f0" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="hsl(var(--primary))"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-foreground">{pct}%</span>
      </div>
    </div>
  );
}

/** Thin horizontal progress bar */
function LinearBar({ current, max, warning }: { current: number; max: number; warning?: boolean }): React.JSX.Element {
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', warning ? 'bg-amber-400' : 'bg-primary')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Status badge for the table */
function StatusBadge({ status }: { status: CodeStatus }): React.JSX.Element {
  const cfg: Record<CodeStatus, { label: string; icon: React.ElementType; className: string }> = {
    Generated: {
      label: 'Generated',
      icon: CheckCircle2,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    Pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50  text-amber-600  border-amber-200' },
    Failed: { label: 'Failed', icon: AlertCircle, className: 'bg-red-50    text-red-600    border-red-200' },
  };
  const { label, icon: Icon, className } = cfg[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
        className
      )}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

/** CPT code chip */
function CptChip({ code }: { code: string }): React.JSX.Element {
  return (
    <span className="inline-flex items-center text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
      {code}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingTab(): React.JSX.Element {
  const readingPct = Math.round((READING_DAYS.current / READING_DAYS.required) * 100);
  const staffFirstPct = Math.round((STAFF_MIN.first.current / STAFF_MIN.first.max) * 100);

  // ── Reading Days short —————————————————————————————————————
  const readingShort = READING_DAYS.required - READING_DAYS.current;
  const staffFirstShort = STAFF_MIN.first.max - STAFF_MIN.first.current;

  return (
    <div className="space-y-4">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-primary" />
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-bold text-foreground tracking-tight">Monthly Billing Summary</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] text-muted-foreground">{BILLING_MONTH}</span>
              <span className="text-slate-300 text-[11px]">·</span>
              <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                RPM
              </span>
              <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {/* Eligibility Status */}
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-amber-600 mb-2">Eligibility Status</p>
          <p className="text-[15px] font-bold text-amber-700 leading-snug">Pending Requirements</p>
          <p className="text-[11.5px] text-amber-600 mt-1">2 codes pending criteria</p>
        </div>

        {/* Billing Codes */}
        <div className="bg-white border border-slate-200 rounded-[14px] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-2">Billing Codes</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-bold text-foreground leading-none">{CODES_GENERATED}</span>
            <span className="text-[14px] font-medium text-muted-foreground">/ {CODES_TOTAL}</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1.5">
            {CODES_GENERATED} generated · {CODES_TOTAL - CODES_GENERATED - 1} pending
          </p>
        </div>

        {/* Reading Days */}
        <div className="bg-white border border-slate-200 rounded-[14px] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-2">Reading Days</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-bold text-foreground leading-none">{READING_DAYS.current}</span>
            <span className="text-[14px] font-medium text-muted-foreground">/ {READING_DAYS.required} days</span>
          </div>
          <div className="mt-2.5">
            <LinearBar current={READING_DAYS.current} max={READING_DAYS.required} warning={readingShort > 0} />
          </div>
        </div>

        {/* Staff Interaction */}
        <div className="bg-white border border-slate-200 rounded-[14px] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-2">
            Staff Interaction
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-bold text-foreground leading-none">{STAFF_MIN.first.current}</span>
            <span className="text-[14px] font-medium text-muted-foreground">/ {STAFF_MIN.first.max} min</span>
          </div>
          <div className="mt-2.5">
            <LinearBar current={STAFF_MIN.first.current} max={STAFF_MIN.first.max} />
          </div>
        </div>
      </div>

      {/* ── RPM Billing Criteria ──────────────────────────────────────────── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground">
              RPM Billing Criteria
              <span className="ml-2 text-muted-foreground font-normal">— {BILLING_MONTH}</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Info size={11} />
            <span>{DAYS_REMAINING} days remaining in billing period</span>
          </div>
        </div>

        {/* 3 criteria cards */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 p-4 gap-0">
          {/* ── Card 1: Device Setup (Completed) ─────────────────────────── */}
          <div className="pr-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Smartphone size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-foreground leading-snug">Device Setup</p>
                    <p className="text-[11px] text-muted-foreground">One-time setup</p>
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              </div>

              {/* Completion */}
              <p className="text-[11.5px] font-semibold text-emerald-600 mb-auto">Completed Jan 12, 2025</p>

              {/* CPT code */}
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                  CPT Code
                </span>
                <CptChip code="99453" />
              </div>
            </div>
          </div>

          {/* ── Card 2: Reading Compliance ────────────────────────────────── */}
          <div className="px-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BarChart2 size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-foreground leading-snug">Reading Compliance</p>
                    <p className="text-[11px] text-muted-foreground">≥ {READING_DAYS.required} days / 30-day period</p>
                  </div>
                </div>
                <RingProgress pct={readingPct} />
              </div>

              {/* Stat + bar */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[18px] font-bold text-foreground leading-none">{READING_DAYS.current}</span>
                <span className="text-[13px] text-muted-foreground">/ {READING_DAYS.required} days</span>
              </div>
              <LinearBar current={READING_DAYS.current} max={READING_DAYS.required} warning />

              {/* Warning */}
              {readingShort > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={11} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-600 font-medium">
                    {readingShort} more reading day{readingShort !== 1 ? 's' : ''} required this month
                  </p>
                </div>
              )}

              {/* CPT code */}
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                  CPT Code
                </span>
                <CptChip code="99454" />
              </div>
            </div>
          </div>

          {/* ── Card 3: Staff Interaction Time ───────────────────────────── */}
          <div className="pl-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Timer size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-foreground leading-snug">Staff Interaction Time</p>
                    <p className="text-[11px] text-muted-foreground">Clinical staff review time</p>
                  </div>
                </div>
                <RingProgress pct={staffFirstPct} />
              </div>

              {/* First 20 min */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">First 20 min (99457)</span>
                  <span className="text-[11.5px] font-semibold text-foreground">
                    {STAFF_MIN.first.current} / {STAFF_MIN.first.max} min
                  </span>
                </div>
                <LinearBar current={STAFF_MIN.first.current} max={STAFF_MIN.first.max} />
              </div>

              {/* Add'l 20 min */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Add'l 20 min (99458)</span>
                  <span className="text-[11.5px] font-semibold text-foreground">
                    {STAFF_MIN.additional.current} / {STAFF_MIN.additional.max} min
                  </span>
                </div>
                <LinearBar current={STAFF_MIN.additional.current} max={STAFF_MIN.additional.max} />
              </div>

              {/* Warning */}
              {staffFirstShort > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertCircle size={11} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-600 font-medium">
                    {staffFirstShort} more minute{staffFirstShort !== 1 ? 's' : ''} needed for 99457
                  </p>
                </div>
              )}

              {/* CPT codes */}
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                  CPT Codes
                </span>
                <div className="flex items-center gap-1.5">
                  <CptChip code="99457" />
                  <CptChip code="99458" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Generated Billing Codes Table ────────────────────────────────── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[13px] font-semibold text-foreground">Generated Billing Codes</h3>
            <span className="text-[11px] font-medium text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
              {BILLING_MONTH}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Billing codes exported.')}
            className="h-7 px-3 flex items-center gap-1.5 text-[12px] font-medium text-foreground border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={12} />
            Export
          </button>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAF9]">
              {['CPT Code', 'Description', 'Status', 'Generated Date', 'PCP Name', 'NPI Number'].map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {GENERATED_CODES.map((code) => (
              <tr key={code.id} className="hover:bg-slate-50/60 transition-colors">
                {/* CPT Code */}
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-bold font-mono text-foreground">{code.cptCode}</span>
                </td>

                {/* Description */}
                <td className="px-5 py-3.5 max-w-[260px]">
                  <span className="text-[12.5px] text-muted-foreground leading-snug">{code.description}</span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={code.status} />
                </td>

                {/* Generated Date */}
                <td className="px-5 py-3.5">
                  <span className="text-[12.5px] text-foreground">{code.generatedDate}</span>
                </td>

                {/* PCP Name */}
                <td className="px-5 py-3.5">
                  <span className="text-[12.5px] font-medium text-foreground">{code.pcpName}</span>
                </td>

                {/* NPI Number */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                    {code.pcpNpi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">
            {GENERATED_CODES.filter((c) => c.status === 'Generated').length} of {GENERATED_CODES.length} codes generated
          </span>
        </div>
      </div>
    </div>
  );
}
