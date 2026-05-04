import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Zap, FileText, CircleCheck, Clock, XCircle } from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { BillingRecord, GeneratedCode, CodeStatus, ProgramType } from '../@types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BILLING_RECORDS: BillingRecord[] = [
  {
    id: 'b-001',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0041',
    billingMonth: 'Apr 2026',
    program: 'RPM',
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
  },
  {
    id: 'b-002',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0042',
    billingMonth: 'Apr 2026',
    program: 'RPM',
    cptCode: '99458',
    cptDescription: 'RPM — Additional 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
  },
  {
    id: 'b-003',
    patientFirstName: 'Robert',
    patientLastName: 'Johnson',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0039',
    billingMonth: 'Apr 2026',
    program: 'APCM',
    cptCode: '99490',
    cptDescription: 'APCM — Chronic care management, 20 min',
    generationDate: 'Apr 30, 2026',
  },
  {
    id: 'b-004',
    patientFirstName: 'Maria',
    patientLastName: 'Gonzalez',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0038',
    billingMonth: 'Apr 2026',
    program: 'RPM',
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
  },
  {
    id: 'b-005',
    patientFirstName: 'James',
    patientLastName: 'Whitfield',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0036',
    billingMonth: 'Apr 2026',
    program: 'APCM',
    cptCode: '99491',
    cptDescription: 'APCM — Care mgmt, physician directed, 30 min',
    generationDate: 'Apr 29, 2026',
  },
  {
    id: 'b-006',
    patientFirstName: 'Linda',
    patientLastName: 'Patel',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0033',
    billingMonth: 'Apr 2026',
    program: 'RPM',
    cptCode: '99091',
    cptDescription: 'RPM — Collection & interpretation of data',
    generationDate: 'Apr 28, 2026',
  },
  {
    id: 'b-007',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0028',
    billingMonth: 'Mar 2026',
    program: 'RPM',
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Mar 31, 2026',
  },
  {
    id: 'b-008',
    patientFirstName: 'Robert',
    patientLastName: 'Johnson',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0027',
    billingMonth: 'Mar 2026',
    program: 'APCM',
    cptCode: '99490',
    cptDescription: 'APCM — Chronic care management, 20 min',
    generationDate: 'Mar 31, 2026',
  },
  {
    id: 'b-009',
    patientFirstName: 'Maria',
    patientLastName: 'Gonzalez',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0025',
    billingMonth: 'Mar 2026',
    program: 'RPM',
    cptCode: '99458',
    cptDescription: 'RPM — Additional 20 min clinical staff time',
    generationDate: 'Mar 31, 2026',
  },
  {
    id: 'b-010',
    patientFirstName: 'James',
    patientLastName: 'Whitfield',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0022',
    billingMonth: 'Mar 2026',
    program: 'APCM',
    cptCode: '99487',
    cptDescription: 'APCM — Complex chronic care management, 60 min',
    generationDate: 'Mar 30, 2026',
  },
  {
    id: 'b-011',
    patientFirstName: 'Linda',
    patientLastName: 'Patel',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0019',
    billingMonth: 'Feb 2026',
    program: 'RPM',
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Feb 28, 2026',
  },
  {
    id: 'b-012',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0015',
    billingMonth: 'Feb 2026',
    program: 'RPM',
    cptCode: '99091',
    cptDescription: 'RPM — Collection & interpretation of data',
    generationDate: 'Feb 28, 2026',
  },
];

const STAFF_INTERACTIONS: Record<string, string> = {
  'b-001': '32 min — RN Jessica Park',
  'b-002': '51 min — RN Jessica Park',
  'b-003': '27 min — RN David Chen',
  'b-004': '44 min — RN Jessica Park',
  'b-005': '39 min — RN David Chen',
  'b-006': '22 min — RN Jessica Park',
  'b-007': '35 min — RN Jessica Park',
  'b-008': '29 min — RN David Chen',
  'b-009': '46 min — RN Jessica Park',
  'b-010': '63 min — RN David Chen',
  'b-011': '30 min — RN Jessica Park',
  'b-012': '25 min — RN Jessica Park',
};

const GENERATED_CODES: Record<string, GeneratedCode[]> = {
  'b-001': [
    {
      id: 'gc-b001-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b001-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b001-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-002': [
    {
      id: 'gc-b002-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b002-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b002-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-003': [
    {
      id: 'gc-b003-1',
      cptCode: '99490',
      description: 'APCM — Chronic care management, 20 min',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b003-2',
      cptCode: '99491',
      description: 'APCM — Care mgmt, physician directed, 30 min',
      status: 'Pending',
      generatedDate: '—',
    },
    {
      id: 'gc-b003-3',
      cptCode: '99487',
      description: 'APCM — Complex chronic care management, 60 min',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-004': [
    {
      id: 'gc-b004-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b004-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 30, 2026',
    },
    {
      id: 'gc-b004-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Failed',
      generatedDate: '—',
    },
  ],
  'b-005': [
    {
      id: 'gc-b005-1',
      cptCode: '99490',
      description: 'APCM — Chronic care management, 20 min',
      status: 'Generated',
      generatedDate: 'Apr 29, 2026',
    },
    {
      id: 'gc-b005-2',
      cptCode: '99491',
      description: 'APCM — Care mgmt, physician directed, 30 min',
      status: 'Generated',
      generatedDate: 'Apr 29, 2026',
    },
    {
      id: 'gc-b005-3',
      cptCode: '99487',
      description: 'APCM — Complex chronic care management, 60 min',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-006': [
    {
      id: 'gc-b006-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Apr 28, 2026',
    },
    {
      id: 'gc-b006-2',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Generated',
      generatedDate: 'Apr 28, 2026',
    },
    {
      id: 'gc-b006-3',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Failed',
      generatedDate: '—',
    },
  ],
  'b-007': [
    {
      id: 'gc-b007-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b007-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b007-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-008': [
    {
      id: 'gc-b008-1',
      cptCode: '99490',
      description: 'APCM — Chronic care management, 20 min',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b008-2',
      cptCode: '99491',
      description: 'APCM — Care mgmt, physician directed, 30 min',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b008-3',
      cptCode: '99487',
      description: 'APCM — Complex chronic care management, 60 min',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-009': [
    {
      id: 'gc-b009-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b009-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Mar 31, 2026',
    },
    {
      id: 'gc-b009-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-010': [
    {
      id: 'gc-b010-1',
      cptCode: '99490',
      description: 'APCM — Chronic care management, 20 min',
      status: 'Generated',
      generatedDate: 'Mar 30, 2026',
    },
    {
      id: 'gc-b010-2',
      cptCode: '99487',
      description: 'APCM — Complex chronic care management, 60 min',
      status: 'Generated',
      generatedDate: 'Mar 30, 2026',
    },
    {
      id: 'gc-b010-3',
      cptCode: '99491',
      description: 'APCM — Care mgmt, physician directed, 30 min',
      status: 'Failed',
      generatedDate: '—',
    },
  ],
  'b-011': [
    {
      id: 'gc-b011-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Feb 28, 2026',
    },
    {
      id: 'gc-b011-2',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Feb 28, 2026',
    },
    {
      id: 'gc-b011-3',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
  'b-012': [
    {
      id: 'gc-b012-1',
      cptCode: '99457',
      description: 'RPM — First 20 min clinical staff time',
      status: 'Generated',
      generatedDate: 'Feb 28, 2026',
    },
    {
      id: 'gc-b012-2',
      cptCode: '99091',
      description: 'RPM — Collection & interpretation of data',
      status: 'Generated',
      generatedDate: 'Feb 28, 2026',
    },
    {
      id: 'gc-b012-3',
      cptCode: '99458',
      description: 'RPM — Additional 20 min clinical staff time',
      status: 'Pending',
      generatedDate: '—',
    },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_STYLE: Record<ProgramType, string> = {
  RPM: 'bg-blue-50 text-blue-700 border-blue-100',
  APCM: 'bg-teal-50 text-teal-700 border-teal-200',
};

const STATUS_CONFIG: Record<CodeStatus, { label: string; icon: React.ElementType; className: string }> = {
  Generated: { label: 'Generated', icon: CircleCheck, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50  text-amber-600  border-amber-200' },
  Failed: { label: 'Failed', icon: XCircle, className: 'bg-red-50    text-red-600    border-red-200' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgramBadge({ program }: { program: ProgramType }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
        PROGRAM_STYLE[program]
      )}
    >
      {program}
    </span>
  );
}

function StatusBadge({ status }: { status: CodeStatus }): React.JSX.Element {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
        cfg.className
      )}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function InfoField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">{label}</span>
      <div className="text-[13px] text-foreground">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const record = BILLING_RECORDS.find((r) => r.id === id);
  const staffInteraction = id ? (STAFF_INTERACTIONS[id] ?? '—') : '—';
  const generatedCodes = id ? (GENERATED_CODES[id] ?? []) : [];
  const billingHistory = record
    ? BILLING_RECORDS.filter(
        (r) => r.patientFirstName === record.patientFirstName && r.patientLastName === record.patientLastName
      )
    : [];

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!record) {
    return (
      <div className="min-h-screen flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <TopBar title="Billing" subtitle="Billing detail" />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <FileText size={32} className="text-slate-300" />
              <p className="text-[14px] font-medium text-foreground">Billing record not found</p>
              <button
                type="button"
                onClick={() => navigate('/billing')}
                className="text-[12.5px] text-primary hover:underline"
              >
                ← Back to Billing
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const patientName = `${record.patientFirstName} ${record.patientLastName}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Billing" subtitle={patientName} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* ── Page nav row ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => navigate('/billing')}
              className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Billing
            </button>

            <button
              type="button"
              onClick={() => toast.success(`Invoice ${record.invoiceNumber} downloaded.`)}
              className="h-8 px-4 flex items-center gap-2 bg-primary text-primary-foreground text-[12.5px] font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={13} />
              Download Invoice
            </button>
          </div>

          <div className="space-y-4">
            {/* ── 1. Monthly Billing Summary ──────────────────────────────── */}
            <SectionCard title="Monthly Billing Summary">
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <InfoField label="Patient Name">
                    <span className="font-semibold">{patientName}</span>
                  </InfoField>

                  <InfoField label="PCP Name & NPI">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{record.pcpName}</span>
                      <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {record.npiNumber}
                      </span>
                    </div>
                  </InfoField>

                  <InfoField label="Invoice Number">
                    <span className="font-mono font-medium">{record.invoiceNumber}</span>
                  </InfoField>

                  <InfoField label="Billing Month">
                    <span className="font-medium">{record.billingMonth}</span>
                  </InfoField>

                  <InfoField label="Program">
                    <ProgramBadge program={record.program} />
                  </InfoField>

                  <InfoField label="CPT Code">
                    <span className="font-semibold">{record.cptCode}</span>
                  </InfoField>

                  <InfoField label="Code Description">
                    <span className="text-muted-foreground">{record.cptDescription}</span>
                  </InfoField>

                  <InfoField label="Generation Date">
                    <span className="font-medium">{record.generationDate}</span>
                  </InfoField>

                  <InfoField label="Staff Interaction">
                    <span className="font-medium">{staffInteraction}</span>
                  </InfoField>
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Generate Billing Code ─────────────────────────────────── */}
            <SectionCard
              title="Generate Billing Code"
              action={
                <button
                  type="button"
                  onClick={() => toast.success(`Billing code generation initiated for ${record.invoiceNumber}.`)}
                  className="h-7 px-3 flex items-center gap-1.5 bg-primary/8 text-primary text-[12px] font-medium rounded-lg border border-primary/20 hover:bg-primary/12 transition-colors"
                >
                  <Zap size={11} />
                  Generate Code
                </button>
              }
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAFAF9]">
                    {['CPT Code', 'Description', 'Status', 'Generated Date'].map((h, i) => (
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
                  {generatedCodes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                        No codes generated yet.
                      </td>
                    </tr>
                  ) : (
                    generatedCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-semibold font-mono text-foreground">{code.cptCode}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[12.5px] text-muted-foreground">{code.description}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={code.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[12.5px] text-foreground">{code.generatedDate}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-slate-100">
                <span className="text-[12px] text-muted-foreground">
                  {generatedCodes.filter((c) => c.status === 'Generated').length} of {generatedCodes.length} codes
                  generated
                </span>
              </div>
            </SectionCard>

            {/* ── 3. Billing History ───────────────────────────────────────── */}
            <SectionCard title="Billing History">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAFAF9]">
                    {[
                      'PCP Name & NPI',
                      'Invoice Number',
                      'Billing Month',
                      'Program',
                      'CPT Code',
                      'Generation Date',
                    ].map((h, i) => (
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
                  {billingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={24} className="text-slate-300" />
                          <p className="text-[13px] text-muted-foreground">No billing history found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    billingHistory.map((r) => (
                      <tr key={r.id} className={cn('transition-colors', r.id === id ? 'bg-primary/4' : '')}>
                        <td className="px-5 py-3.5">
                          <p className="text-[12.5px] font-medium text-foreground">{r.pcpName}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">NPI: {r.npiNumber}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'text-[12.5px] font-mono font-medium',
                              r.id === id ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {r.invoiceNumber}
                          </span>
                          {r.id === id && (
                            <span className="ml-2 text-[10px] font-semibold text-primary bg-primary/8 border border-primary/20 px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[12.5px] text-foreground">{r.billingMonth}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <ProgramBadge program={r.program} />
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-[12.5px] font-semibold text-foreground">{r.cptCode}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[180px] leading-snug">
                            {r.cptDescription}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[12.5px] text-foreground">{r.generationDate}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-slate-100">
                <span className="text-[12px] text-muted-foreground">
                  {billingHistory.length} record{billingHistory.length !== 1 ? 's' : ''} in history
                </span>
              </div>
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}
