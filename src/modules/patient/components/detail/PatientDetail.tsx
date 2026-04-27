import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  WifiOff,
  Bot,
  Phone,
  Shield,
  Users,
  HeartPulse,
  Activity,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import type { PatientAlert, PatientDetailData, ProgramType, CareTeamRole } from '@/modules/patient/@types';
import { PATIENT_BASE_PATH } from '@/modules/patient/constants';
import { VitalsTab, type DeviceScenario } from './tabs/VitalsTab';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'vitals' | 'medication' | 'programs' | 'devices' | 'activity' | 'billing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Patient Overview' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'medication', label: 'Medication' },
  { id: 'programs', label: 'Program Enrolled' },
  { id: 'devices', label: 'List of Devices' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'billing', label: 'Billing' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface PatientBasic {
  fullName: string;
  mrn: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  pcpName: string;
  programs: ProgramType[];
}

const PATIENT_BASICS: Record<string, PatientBasic> = {
  'p-001': {
    fullName: 'Emma Rodriguez',
    mrn: 'MRN-10042',
    dob: 'Jan 12, 1968',
    gender: 'Female',
    phone: '+1 (312) 555-0198',
    email: 'emma.rodriguez@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['APCM', 'RPM'],
  },
  'p-002': {
    fullName: 'Michael Chen',
    mrn: 'MRN-10043',
    dob: 'Mar 05, 1975',
    gender: 'Male',
    phone: '+1 (415) 555-0122',
    email: 'michael.chen@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: ['RPM'],
  },
  'p-003': {
    fullName: 'Linda Foster',
    mrn: 'MRN-10044',
    dob: 'Sep 28, 1960',
    gender: 'Female',
    phone: '+1 (718) 555-0077',
    email: 'linda.foster@sunrisecare.com',
    pcpName: 'Dr. James Patel',
    programs: ['APCM'],
  },
  'p-004': {
    fullName: 'David Kim',
    mrn: 'MRN-10045',
    dob: 'Jul 14, 1982',
    gender: 'Male',
    phone: '+1 (213) 555-0155',
    email: 'david.kim@sunrisecare.com',
    pcpName: 'Dr. Laura Chen',
    programs: ['RPM'],
  },
  'p-005': {
    fullName: 'Patricia Lee',
    mrn: 'MRN-10046',
    dob: 'Feb 03, 1955',
    gender: 'Female',
    phone: '+1 (602) 555-0199',
    email: 'patricia.lee@sunrisecare.com',
    pcpName: 'Dr. Robert Singh',
    programs: ['APCM', 'RPM'],
  },
  'p-006': {
    fullName: 'James Wilson',
    mrn: 'MRN-10047',
    dob: 'Nov 19, 1970',
    gender: 'Male',
    phone: '+1 (512) 555-0133',
    email: 'james.wilson@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['APCM'],
  },
  'p-007': {
    fullName: 'Susan Martinez',
    mrn: 'MRN-10048',
    dob: 'Apr 08, 1965',
    gender: 'Female',
    phone: '+1 (404) 555-0166',
    email: 'susan.martinez@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: [],
  },
  'p-008': {
    fullName: 'Robert Thompson',
    mrn: 'MRN-10049',
    dob: 'Dec 22, 1958',
    gender: 'Male',
    phone: '+1 (206) 555-0177',
    email: 'robert.thompson@sunrisecare.com',
    pcpName: 'Dr. James Patel',
    programs: ['RPM'],
  },
  'p-009': {
    fullName: 'Jennifer Davis',
    mrn: 'MRN-10050',
    dob: 'Aug 30, 1979',
    gender: 'Female',
    phone: '+1 (303) 555-0144',
    email: 'jennifer.davis@sunrisecare.com',
    pcpName: 'Dr. Laura Chen',
    programs: ['APCM'],
  },
  'p-010': {
    fullName: 'William Johnson',
    mrn: 'MRN-10051',
    dob: 'May 17, 1963',
    gender: 'Male',
    phone: '+1 (215) 555-0188',
    email: 'william.johnson@sunrisecare.com',
    pcpName: 'Dr. Robert Singh',
    programs: ['APCM', 'RPM'],
  },
  'p-011': {
    fullName: 'Mary Anderson',
    mrn: 'MRN-10052',
    dob: 'Jan 09, 1971',
    gender: 'Female',
    phone: '+1 (713) 555-0111',
    email: 'mary.anderson@sunrisecare.com',
    pcpName: 'Dr. Michael Torres',
    programs: ['RPM'],
  },
  'p-012': {
    fullName: 'Christopher Brown',
    mrn: 'MRN-10053',
    dob: 'Oct 25, 1967',
    gender: 'Male',
    phone: '+1 (702) 555-0122',
    email: 'christopher.brown@sunrisecare.com',
    pcpName: 'Dr. Sarah Kim',
    programs: ['APCM'],
  },
};

function buildMockDetail(id: string): PatientDetailData {
  const basic = PATIENT_BASICS[id] ?? PATIENT_BASICS['p-001'];
  return {
    id,
    mrn: basic.mrn,
    fullName: basic.fullName,
    dateOfBirth: basic.dob,
    gender: basic.gender,
    email: basic.email,
    phone: basic.phone,
    address: '4821 N Harlem Ave, Chicago, IL 60656',
    pcpName: basic.pcpName,
    programs: basic.programs,
    insurance: {
      planName: 'Blue Cross Blue Shield',
      planType: 'PPO',
      memberId: 'BCB-2024-88432',
      groupNumber: 'GRP-55901',
      secondaryInsurance: 'Medicare Part B',
      secondaryMemberId: 'MCR-1A2B3C4D5E',
    },
    diagnoses: [
      { conditionName: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', severity: 'Moderate' },
      { conditionName: 'Essential Hypertension', icdCode: 'I10', severity: 'Mild' },
      { conditionName: 'Chronic Kidney Disease, Stage 3', icdCode: 'N18.3', severity: 'Moderate' },
    ],
    emergencyContact: {
      name: 'Carlos Rodriguez',
      phone: '+1 (312) 555-0210',
      relationship: 'Spouse',
    },
    careTeam: [
      { role: 'PCP', name: basic.pcpName, email: 'm.torres@healthtelematix.com' },
      { role: 'Nurse', name: 'Jessica Park, RN', email: 'j.park@healthtelematix.com' },
      { role: 'DHN', name: 'Aiden Brooks', email: 'a.brooks@healthtelematix.com' },
    ],
    alerts: [
      {
        id: 'a-001',
        type: 'vitals',
        severity: 'critical',
        title: 'High Blood Pressure Detected',
        description: 'Systolic reading of 168 mmHg recorded on Apr 23 via BP monitor.',
        timestamp: 'Apr 23, 2026 · 8:42 AM',
      },
      {
        id: 'a-002',
        type: 'device',
        severity: 'warning',
        title: 'Glucometer Not Synced',
        description: 'Device last synced 3 days ago. Data may be out of date.',
        timestamp: 'Apr 21, 2026 · 6:15 PM',
      },
      {
        id: 'a-003',
        type: 'ai',
        severity: 'warning',
        title: 'AI Flag: Medication Adherence Risk',
        description: 'Session analysis indicates patient may be skipping evening doses.',
        timestamp: 'Apr 22, 2026 · 2:30 PM',
      },
    ],
  };
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

const ALERT_CONFIG = {
  vitals: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    titleClass: 'text-rose-800',
    bodyClass: 'text-rose-700',
    timeClass: 'text-rose-500',
    iconBg: 'bg-rose-100',
    Icon: AlertTriangle,
    iconClass: 'text-rose-500',
  },
  device: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    titleClass: 'text-amber-800',
    bodyClass: 'text-amber-700',
    timeClass: 'text-amber-500',
    iconBg: 'bg-amber-100',
    Icon: WifiOff,
    iconClass: 'text-amber-500',
  },
  ai: {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    titleClass: 'text-violet-800',
    bodyClass: 'text-violet-700',
    timeClass: 'text-violet-500',
    iconBg: 'bg-violet-100',
    Icon: Bot,
    iconClass: 'text-violet-500',
  },
} as const;

function AlertCard({ alert }: { alert: PatientAlert }): React.JSX.Element {
  const cfg = ALERT_CONFIG[alert.type];
  const { Icon } = cfg;
  return (
    <div className={cn('rounded-xl border p-4', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.iconBg)}>
          <Icon size={14} className={cfg.iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[12.5px] font-bold mb-1', cfg.titleClass)}>{alert.title}</p>
          <p className={cn('text-[11.5px] leading-relaxed', cfg.bodyClass)}>{alert.description}</p>
          <p className={cn('text-[10.5px] mt-2 font-medium', cfg.timeClass)}>{alert.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
        <h3 className="text-[12.5px] font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, phi }: { label: string; value: string; phi?: boolean }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{label}</p>
      <p className="text-[13.5px] text-foreground font-medium" {...(phi ? { 'data-phi': 'true' } : {})}>
        {value || '—'}
      </p>
    </div>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_CLASS: Record<string, string> = {
  Mild: 'bg-teal-50 text-teal-700 border-teal-100',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
  Severe: 'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Coming Soon Tab ──────────────────────────────────────────────────────────

function ComingSoonTab({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Activity size={22} className="text-muted-foreground" />
      </div>
      <p className="text-[13.5px] font-semibold text-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}

// ─── Care Team Role Label ─────────────────────────────────────────────────────

const ROLE_LABEL: Record<CareTeamRole, string> = {
  PCP: 'Primary Care Physician',
  Nurse: 'Registered Nurse',
  DHN: 'Digital Health Navigator',
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ patient }: { patient: PatientDetailData }): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Patient Details */}
      <SectionCard icon={<Users size={15} className="text-primary" />} title="Patient Details">
        <div className="px-6 py-5 grid grid-cols-2 gap-x-10 gap-y-5">
          <Field label="Full Name" value={patient.fullName} phi />
          <Field label="MRN Number" value={patient.mrn} phi />
          <Field label="Date of Birth" value={patient.dateOfBirth} phi />
          <Field label="Gender" value={patient.gender} />
          <Field label="Email Address" value={patient.email} phi />
          <Field label="Phone Number" value={patient.phone} phi />
          <Field label="Primary Care Physician" value={patient.pcpName} />
          <Field label="Address" value={patient.address} phi />
        </div>
      </SectionCard>

      {/* Insurance Details */}
      <SectionCard icon={<Shield size={15} className="text-primary" />} title="Insurance Details">
        <div className="px-6 py-5 grid grid-cols-2 gap-x-10 gap-y-5">
          <Field label="Insurance Plan Name" value={patient.insurance.planName} />
          <Field label="Plan Type" value={patient.insurance.planType} />
          <Field label="Member ID" value={patient.insurance.memberId} phi />
          <Field label="Group Number" value={patient.insurance.groupNumber} phi />
          <Field label="Secondary Insurance" value={patient.insurance.secondaryInsurance ?? '—'} />
          <Field label="Secondary Member ID" value={patient.insurance.secondaryMemberId ?? '—'} phi />
        </div>
      </SectionCard>

      {/* Clinical Data */}
      <SectionCard
        icon={<Stethoscope size={15} className="text-primary" />}
        title="Clinical Data — Diagnoses & Medical Conditions"
      >
        <div className="px-6 pt-3.5 pb-1">
          <div className="grid grid-cols-3 text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground pb-2">
            <span>Condition</span>
            <span>ICD Code</span>
            <span>Severity</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {patient.diagnoses.map((d) => (
            <div key={d.icdCode} className="px-6 py-3.5 grid grid-cols-3 items-center">
              <p className="text-[13px] font-semibold text-foreground">{d.conditionName}</p>
              <p className="text-[12.5px] text-muted-foreground">{d.icdCode}</p>
              <span
                className={cn(
                  'inline-flex w-fit text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                  SEVERITY_CLASS[d.severity]
                )}
              >
                {d.severity}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Emergency Contact + Assigned Care Team — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard icon={<Phone size={15} className="text-primary" />} title="Emergency Contact">
          <div className="px-6 py-5 space-y-5">
            <Field label="Contact Name" value={patient.emergencyContact.name} />
            <Field label="Phone Number" value={patient.emergencyContact.phone} phi />
            <Field label="Relationship" value={patient.emergencyContact.relationship} />
          </div>
        </SectionCard>

        <SectionCard icon={<Users size={15} className="text-primary" />} title="Assigned Care Team">
          <div className="px-5 py-4 space-y-3">
            {patient.careTeam.map((member) => (
              <div
                key={member.role}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 bg-primary/10 border border-primary/20">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground">{ROLE_LABEL[member.role]}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Programs Enrolled */}
      {patient.programs.length > 0 && (
        <SectionCard icon={<HeartPulse size={15} className="text-primary" />} title="Programs Enrolled">
          <div className="px-6 py-5 flex gap-4">
            {patient.programs.includes('APCM') && (
              <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <Activity size={16} className="text-teal-700" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-teal-700">APCM</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Advanced Primary Care Management</p>
                </div>
              </div>
            )}
            {patient.programs.includes('RPM') && (
              <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <HeartPulse size={16} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-blue-700">RPM</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Remote Patient Monitoring</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PatientDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const deviceScenario = (searchParams.get('devices') ?? 'all') as DeviceScenario;
  const patient = buildMockDetail(id ?? 'p-001');
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle="Patient Details" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(PATIENT_BASE_PATH)}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to Patient List
          </button>

          {/* Patient header card */}
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                  getAvatarColor(patient.fullName)
                )}
              >
                {getInitials(patient.fullName)}
              </div>
              <div className="min-w-0">
                <h1 className="text-[16px] font-bold text-foreground tracking-tight leading-snug mb-1">
                  {patient.fullName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] text-muted-foreground" data-phi="true">
                    {patient.mrn}
                  </span>
                  <span className="text-slate-300 text-[11px]">·</span>
                  <span className="text-[12px] text-muted-foreground" data-phi="true">
                    {patient.dateOfBirth}
                  </span>
                  <span className="text-slate-300 text-[11px]">·</span>
                  <span className="text-[12px] text-muted-foreground">{patient.gender}</span>
                  {patient.programs.length > 0 && (
                    <>
                      <span className="text-slate-300 text-[11px]">·</span>
                      {patient.programs.includes('APCM') && (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          APCM
                        </span>
                      )}
                      {patient.programs.includes('RPM') && (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          RPM
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Flags — collapsible */}
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <button
              type="button"
              onClick={() => setAlertsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                <span className="text-[13px] font-semibold text-foreground">Alerts & Flags</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white leading-[1.5]">
                  {patient.alerts.length}
                </span>
              </div>
              {alertsOpen ? (
                <ChevronUp size={14} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
              )}
            </button>

            {alertsOpen && (
              <div className="px-5 py-4 border-t border-slate-100 grid grid-cols-3 gap-3">
                {patient.alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {/* Line tabs */}
          <div className="border-b border-slate-200 -mb-1">
            <nav className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="pt-1">
            {activeTab === 'overview' && <OverviewTab patient={patient} />}
            {activeTab === 'vitals' && <VitalsTab scenario={deviceScenario} />}
            {activeTab !== 'overview' && activeTab !== 'vitals' && (
              <ComingSoonTab label={TABS.find((t) => t.id === activeTab)?.label ?? ''} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
