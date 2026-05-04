import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Check, ChevronDown, Download, FileText, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { BillingRecord, ProgramType } from '../@types';

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

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_STYLE: Record<ProgramType, string> = {
  RPM: 'bg-blue-50 text-blue-700 border-blue-100',
  APCM: 'bg-teal-50 text-teal-700 border-teal-200',
};

type ProgramFilter = 'All' | ProgramType;

const PROGRAM_FILTERS: { id: ProgramFilter; label: string }[] = [
  { id: 'All', label: 'All Programs' },
  { id: 'RPM', label: 'RPM' },
  { id: 'APCM', label: 'APCM' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const filtered = useMemo(() => {
    return BILLING_RECORDS.filter((r) => {
      if (programFilter !== 'All' && r.program !== programFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.invoiceNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, programFilter]);

  function handleDownload(record: BillingRecord): void {
    toast.success(`Invoice ${record.invoiceNumber} downloaded.`);
  }

  const TABLE_HEADERS = [
    'Patient Name',
    'PCP Name & NPI',
    'Invoice Number',
    'Billing Month',
    'Program',
    'CPT Code',
    'Generation Date',
    '',
  ];

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Billing" subtitle="Manage patient invoices and CPT codes" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
              {/* Search */}
              <div className="relative w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[12.5px]"
                />
              </div>

              {/* Program filter dropdown */}
              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  className={cn(
                    'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
                    programFilter !== 'All'
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={12} />
                  {programFilter === 'All' ? 'Program' : programFilter}
                  <ChevronDown
                    size={12}
                    className={cn(
                      'text-muted-foreground transition-transform duration-150',
                      filterOpen && 'rotate-180'
                    )}
                  />
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-1.5 overflow-hidden">
                    {PROGRAM_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setProgramFilter(f.id);
                          setFilterOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                          programFilter === f.id ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                        )}
                      >
                        {f.label}
                        {programFilter === f.id && <Check size={12} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Record count — right */}
              <span className="ml-auto text-[12px] text-muted-foreground">{filtered.length} records</span>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAFAF9]">
                  {TABLE_HEADERS.map((h, i) => (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-slate-300" />
                        <p className="text-[13px] text-muted-foreground">No billing records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => navigate(`/billing/${record.id}`)}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      {/* Patient Name */}
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-foreground">
                          {record.patientFirstName} {record.patientLastName}
                        </p>
                      </td>

                      {/* PCP Name & NPI */}
                      <td className="px-5 py-3.5">
                        <p className="text-[12.5px] font-medium text-foreground">{record.pcpName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">NPI: {record.npiNumber}</p>
                      </td>

                      {/* Invoice Number */}
                      <td className="px-5 py-3.5">
                        <span className="text-[12.5px] font-mono font-medium text-foreground">
                          {record.invoiceNumber}
                        </span>
                      </td>

                      {/* Billing Month */}
                      <td className="px-5 py-3.5">
                        <span className="text-[12.5px] text-foreground">{record.billingMonth}</span>
                      </td>

                      {/* Program */}
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                            PROGRAM_STYLE[record.program]
                          )}
                        >
                          {record.program}
                        </span>
                      </td>

                      {/* CPT Code */}
                      <td className="px-5 py-3.5">
                        <p className="text-[12.5px] font-semibold text-foreground">{record.cptCode}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] leading-snug">
                          {record.cptDescription}
                        </p>
                      </td>

                      {/* Generation Date */}
                      <td className="px-5 py-3.5">
                        <span className="text-[12.5px] text-foreground">{record.generationDate}</span>
                      </td>

                      {/* Download action */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title={`Download ${record.invoiceNumber}`}
                          onClick={() => handleDownload(record)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/8 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-150"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">
                Showing {filtered.length} of {BILLING_RECORDS.length} records
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
