import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import type { PatientListItem, ProgramType } from '@/modules/patient/@types';
import { PATIENT_BASE_PATH } from '@/modules/patient/constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

function getAvatarColor(name: string): string {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PATIENTS: PatientListItem[] = [
  {
    id: 'p-001',
    mrn: 'MRN-10042',
    fullName: 'Emma Rodriguez',
    dateOfBirth: 'Jan 12, 1968',
    gender: 'Female',
    phone: '+1 (312) 555-0198',
    email: 'emma.rodriguez@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['APCM', 'RPM'],
  },
  {
    id: 'p-002',
    mrn: 'MRN-10043',
    fullName: 'Michael Chen',
    dateOfBirth: 'Mar 05, 1975',
    gender: 'Male',
    phone: '+1 (415) 555-0122',
    email: 'michael.chen@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: ['RPM'],
  },
  {
    id: 'p-003',
    mrn: 'MRN-10044',
    fullName: 'Linda Foster',
    dateOfBirth: 'Sep 28, 1960',
    gender: 'Female',
    phone: '+1 (718) 555-0077',
    email: 'linda.foster@sunrisecare.com',
    pcpName: 'Dr. James Patel',
    programs: ['APCM'],
  },
  {
    id: 'p-004',
    mrn: 'MRN-10045',
    fullName: 'David Kim',
    dateOfBirth: 'Jul 14, 1982',
    gender: 'Male',
    phone: '+1 (213) 555-0155',
    email: 'david.kim@sunrisecare.com',
    pcpName: 'Dr. Laura Chen',
    programs: ['RPM'],
  },
  {
    id: 'p-005',
    mrn: 'MRN-10046',
    fullName: 'Patricia Lee',
    dateOfBirth: 'Feb 03, 1955',
    gender: 'Female',
    phone: '+1 (602) 555-0199',
    email: 'patricia.lee@sunrisecare.com',
    pcpName: 'Dr. Robert Singh',
    programs: ['APCM', 'RPM'],
  },
  {
    id: 'p-006',
    mrn: 'MRN-10047',
    fullName: 'James Wilson',
    dateOfBirth: 'Nov 19, 1970',
    gender: 'Male',
    phone: '+1 (512) 555-0133',
    email: 'james.wilson@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['APCM'],
  },
  {
    id: 'p-007',
    mrn: 'MRN-10048',
    fullName: 'Susan Martinez',
    dateOfBirth: 'Apr 08, 1965',
    gender: 'Female',
    phone: '+1 (404) 555-0166',
    email: 'susan.martinez@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: [],
  },
  {
    id: 'p-008',
    mrn: 'MRN-10049',
    fullName: 'Robert Thompson',
    dateOfBirth: 'Dec 22, 1958',
    gender: 'Male',
    phone: '+1 (206) 555-0177',
    email: 'robert.thompson@sunrisecare.com',
    pcpName: 'Dr. James Patel',
    programs: ['RPM'],
  },
  {
    id: 'p-009',
    mrn: 'MRN-10050',
    fullName: 'Jennifer Davis',
    dateOfBirth: 'Aug 30, 1979',
    gender: 'Female',
    phone: '+1 (303) 555-0144',
    email: 'jennifer.davis@sunrisecare.com',
    pcpName: 'Dr. Laura Chen',
    programs: ['APCM'],
  },
  {
    id: 'p-010',
    mrn: 'MRN-10051',
    fullName: 'William Johnson',
    dateOfBirth: 'May 17, 1963',
    gender: 'Male',
    phone: '+1 (215) 555-0188',
    email: 'william.johnson@sunrisecare.com',
    pcpName: 'Dr. Robert Singh',
    programs: ['APCM', 'RPM'],
  },
  {
    id: 'p-011',
    mrn: 'MRN-10052',
    fullName: 'Mary Anderson',
    dateOfBirth: 'Jan 09, 1971',
    gender: 'Female',
    phone: '+1 (713) 555-0111',
    email: 'mary.anderson@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['RPM'],
  },
  {
    id: 'p-012',
    mrn: 'MRN-10053',
    fullName: 'Christopher Brown',
    dateOfBirth: 'Oct 25, 1967',
    gender: 'Male',
    phone: '+1 (702) 555-0122',
    email: 'christopher.brown@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: ['APCM'],
  },
];

// ─── Empty State ─────────────────────────────────────────────────────────────

function PatientEmptyState(): React.JSX.Element {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
      <img src="/no-data.svg" alt="No patients enrolled" className="w-64 h-64 mb-8 select-none" draggable={false} />
      <h2 className="text-[20px] font-bold text-foreground tracking-tight mb-2">No Patients Enrolled Yet</h2>
      <p className="text-sm text-muted-foreground max-w-[360px] leading-relaxed mb-7">
        Your patient list is empty. Start by enrolling your first patient to begin tracking their care programs, vitals,
        and health records.
      </p>
      <Button className="h-10 px-6 text-sm font-semibold gap-2 shadow-[0_4px_14px_rgba(13,148,136,0.22)]">
        <UserPlus size={15} />
        Enroll New Patient
      </Button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PatientList(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const isEmpty = searchParams.get('scenario') === 'empty';
  const navigate = useNavigate();

  const [navCollapsed, setNavCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<'All' | ProgramType>('All');

  const columns = useMemo<ColumnDef<PatientListItem>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Patient Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                getAvatarColor(row.original.fullName)
              )}
            >
              {getInitials(row.original.fullName)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13.5px] font-semibold text-foreground leading-tight">{row.original.fullName}</span>
              <span className="text-[11.5px] text-muted-foreground leading-tight" data-phi="true">
                {row.original.mrn}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground" data-phi="true">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'dateOfBirth',
        header: 'Date of Birth',
        cell: ({ row }) => (
          <span className="text-[13px] text-foreground" data-phi="true">
            {row.original.dateOfBirth}
          </span>
        ),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.gender}</span>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-[13px] text-foreground" data-phi="true">
            {row.original.phone}
          </span>
        ),
      },
      {
        id: 'programs',
        header: 'Programs',
        cell: ({ row }) => {
          const { programs } = row.original;
          const visiblePrograms = programFilter === 'All' ? programs : programs.filter((p) => p === programFilter);
          if (!visiblePrograms.length) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5">
              {visiblePrograms.includes('APCM') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  APCM
                </span>
              )}
              {visiblePrograms.includes('RPM') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  RPM
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'pcpName',
        header: 'PCP Name',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.pcpName}</span>,
      },
    ],
    [programFilter]
  );

  const filteredData = useMemo(
    () =>
      MOCK_PATIENTS.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch = !q || p.fullName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (programFilter === 'All') return true;
        return p.programs.includes(programFilter);
      }),
    [search, programFilter]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle="Manage and monitor all enrolled patients" />

        {isEmpty ? (
          <main className="flex-1 flex flex-col">
            <PatientEmptyState />
          </main>
        ) : (
          <main className="flex-1 p-7 flex flex-col gap-5">
            {/* Controls row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {/* Program filter pills */}
                <div className="flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
                  {(['All', 'APCM', 'RPM'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProgramFilter(type)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                        programFilter === type
                          ? 'bg-white text-primary shadow-sm font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {type === 'All' ? 'All Patients' : type}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    placeholder="Search by name or MRN..."
                    className="pl-8 h-9 w-64 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Button className="h-9 px-4 text-sm font-semibold gap-2 shadow-[0_4px_14px_rgba(13,148,136,0.22)]">
                <UserPlus size={15} />
                Enroll New Patient
              </Button>
            </div>

            {/* Table card */}
            <div className="bg-white border border-slate-200 rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-[#FAFAF9] hover:bg-[#FAFAF9] border-b border-slate-200"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground py-3.5 first:pl-5"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-16 text-muted-foreground text-sm">
                        No patients match your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => navigate(`${PATIENT_BASE_PATH}/${row.original.id}`)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3.5 first:pl-5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {total > 0 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                  <p className="text-xs text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                      {from}–{to}
                    </span>{' '}
                    of <span className="font-semibold text-foreground">{total}</span> patients
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft size={14} />
                    </Button>

                    {Array.from({ length: table.getPageCount() }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => table.setPageIndex(i)}
                        className={cn(
                          'w-8 h-8 rounded-md text-xs font-medium transition-colors',
                          pageIndex === i
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-slate-100'
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
