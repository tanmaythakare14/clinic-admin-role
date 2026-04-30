import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { generateRevenueData, formatCurrency } from '../../utils';
import type { TimePeriod, ProgramFilter } from '../../@types';

// ─── Filter Pills ─────────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-white text-primary shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Custom Y Axis Tick ───────────────────────────────────────────────────────

function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }): React.JSX.Element {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#94a3b8" fontSize={11}>
      {formatCurrency(payload?.value ?? 0)}
    </text>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const PROGRAM_OPTIONS: { value: ProgramFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'RPM', label: 'RPM' },
  { value: 'APCM', label: 'APCM' },
  { value: 'CCM', label: 'CCM' },
];

const COLORS = {
  total: '#0d9488',
  apcm: '#0d9488',
  rpm: '#8b5cf6',
  ccm: '#f59e0b',
} as const;

const LINE_CHART_CONFIG = {
  total: { label: 'Total Revenue', color: COLORS.total },
};

const BAR_CHART_CONFIG = {
  apcm: { label: 'APCM', color: COLORS.apcm },
  rpm: { label: 'RPM', color: COLORS.rpm },
  ccm: { label: 'CCM', color: COLORS.ccm },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueGraph(): React.JSX.Element {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [program, setProgram] = useState<ProgramFilter>('all');

  const data = generateRevenueData(period, program);

  return (
    <div className="space-y-4">
      {/* Shared header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Revenue trends by time period and program type</p>
        </div>
        <div className="flex items-center gap-2">
          <PillGroup options={TIME_OPTIONS} value={period} onChange={setPeriod} />
          <PillGroup options={PROGRAM_OPTIONS} value={program} onChange={setProgram} />
        </div>
      </div>

      {/* Two separate graph cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left — Line Chart: Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[13px] font-semibold text-foreground mb-0.5">Total Revenue</p>
          <p className="text-[11.5px] text-muted-foreground mb-5">Cumulative revenue across all programs</p>
          <ChartContainer config={LINE_CHART_CONFIG} className="h-[220px] w-full aspect-auto">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => formatCurrency(v)}
                  />
                )}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: COLORS.total, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Right — Bar Chart: Revenue by Program */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[13px] font-semibold text-foreground mb-0.5">Revenue by Program</p>
          <p className="text-[11.5px] text-muted-foreground mb-5">APCM · RPM · CCM breakdown</p>
          <ChartContainer config={BAR_CHART_CONFIG} className="h-[220px] w-full aspect-auto">
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              barSize={program === 'all' ? 10 : 18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => formatCurrency(v)}
                  />
                )}
              />
              {(program === 'all' || program === 'APCM') && (
                <Bar dataKey="apcm" fill={COLORS.apcm} radius={[3, 3, 0, 0]} />
              )}
              {(program === 'all' || program === 'RPM') && (
                <Bar dataKey="rpm" fill={COLORS.rpm} radius={[3, 3, 0, 0]} />
              )}
              {(program === 'all' || program === 'CCM') && (
                <Bar dataKey="ccm" fill={COLORS.ccm} radius={[3, 3, 0, 0]} />
              )}
            </BarChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[
              { key: 'apcm', label: 'APCM', color: COLORS.apcm },
              { key: 'rpm', label: 'RPM', color: COLORS.rpm },
              { key: 'ccm', label: 'CCM', color: COLORS.ccm },
            ]
              .filter((l) => program === 'all' || program === l.key.toUpperCase())
              .map((l) => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
