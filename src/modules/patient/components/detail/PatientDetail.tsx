import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  WifiOff,
  Bot,
  Pencil,
  Phone,
  Shield,
  Trash2,
  Users,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PatientAlert, PatientDetailData, PatientListItem, CareTeamRole } from '@/modules/patient/@types';
import { toast } from 'sonner';
import {
  PATIENT_BASE_PATH,
  PATIENT_LIST_STORAGE_KEY,
  PATIENT_DETAIL_STORAGE_KEY,
  PATIENT_EDIT_PATH,
} from '@/modules/patient/constants';
import { secureLocalStorage } from '@/utils/secureStorage';
import { VitalsTab, type DeviceScenario } from './tabs/VitalsTab';
import { MedicationTab } from './tabs/MedicationTab';
import { ProgramsDevicesTab } from './tabs/ProgramsDevicesTab';
import { CarePlanTab } from './tabs/CarePlanTab';
import { ActivityLogTab } from './tabs/ActivityLogTab';
import { MessagesTab } from './tabs/MessagesTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { TasksTab } from './tabs/TasksTab';
import { BillingTab } from './tabs/BillingTab';

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

type Tab =
  | 'overview'
  | 'vitals'
  | 'medication'
  | 'programs-devices'
  | 'care-plan'
  | 'activity'
  | 'billing'
  | 'messages'
  | 'appointments'
  | 'tasks';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Patient Overview' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'medication', label: 'Medication' },
  { id: 'programs-devices', label: 'Program & Devices' },
  { id: 'care-plan', label: 'Care Plan' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'billing', label: 'Billing' },
  { id: 'messages', label: 'Messages' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'tasks', label: 'Tasks' },
];

// ─── Demo Alerts (injected for 2nd patient in the list) ──────────────────────

const DEMO_ALERTS: PatientAlert[] = [
  {
    id: 'demo-a1',
    type: 'vitals',
    severity: 'critical',
    title: 'High Blood Pressure Detected',
    description:
      'Systolic reading of 178 mmHg — significantly above the 140 mmHg threshold. Immediate clinical review recommended.',
    timestamp: 'Today, 9:14 AM',
  },
  {
    id: 'demo-a2',
    type: 'device',
    severity: 'warning',
    title: 'Device Offline — BP Cuff',
    description: 'Blood Pressure Cuff has not synced in over 26 hours. Check device power and connectivity.',
    timestamp: 'Yesterday, 7:30 AM',
  },
  {
    id: 'demo-a3',
    type: 'ai',
    severity: 'info',
    title: 'AI Risk Flag — Cardiovascular',
    description:
      'Elevated cardiovascular risk pattern detected over the past 7 days based on vitals trend. Clinical review advised.',
    timestamp: 'Today, 6:00 AM',
  },
];

// ─── Build Detail from Stored PatientListItem ─────────────────────────────────
// Fields collected at enrollment (from PatientListItem) are used directly.
// Clinical/administrative fields not yet collected via a form use placeholder data.

function buildDetailFromStored(item: PatientListItem): PatientDetailData {
  return {
    id: item.id,
    mrn: item.mrn,
    fullName: item.fullName,
    dateOfBirth: item.dateOfBirth,
    gender: item.gender,
    email: item.email,
    phone: item.phone,
    address: '1247 Oak Street, Apt 3B, Chicago, IL 60601, USA',
    pcpName: item.pcpName,
    programs: item.programs,
    insurance: {
      planName: 'BlueCross BlueShield PPO',
      planType: 'PPO',
      memberId: 'BCB-4421-9087',
      groupNumber: 'GRP-20031',
      secondaryInsurance: 'Medicare Part B',
      secondaryMemberId: 'MCR-8811-00214',
    },
    diagnoses: [
      { conditionName: 'Essential Hypertension', icdCode: 'I10', severity: 'Moderate' },
      { conditionName: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', severity: 'Mild' },
      { conditionName: 'Chronic Kidney Disease Stage 3', icdCode: 'N18.3', severity: 'Severe' },
    ],
    emergencyContacts: [{ name: 'Patricia Johnson', phone: '(312) 555-0182', relationship: 'Spouse' }],
    careTeam: [
      { role: 'PCP', name: item.pcpName, email: 'pcp@greenvalley.com' },
      { role: 'Nurse', name: 'Maria Chen', email: 'm.chen@greenvalley.com' },
      { role: 'DHN', name: 'Ethan Brooks', email: 'e.brooks@greenvalley.com' },
    ],
    alerts: [],
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
  // Backward-compat: old stored data may have singular emergencyContact
  const contacts: typeof patient.emergencyContacts =
    patient.emergencyContacts?.length > 0
      ? patient.emergencyContacts
      : (patient as unknown as { emergencyContact?: { name: string; phone: string; relationship: string } })
            .emergencyContact?.name
        ? [
            (patient as unknown as { emergencyContact: { name: string; phone: string; relationship: string } })
              .emergencyContact,
          ]
        : [];

  return (
    <div className="space-y-4">
      {/* ── Row 1: Patient Details | Insurance Details ────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Patient Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Patient Details</h3>
          </div>
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Full Name" value={patient.fullName} phi />
            <Field label="MRN Number" value={patient.mrn} phi />
            <Field label="Date of Birth" value={patient.dateOfBirth} phi />
            <Field label="Gender" value={patient.gender} />
            <Field label="Email Address" value={patient.email} phi />
            <Field label="Phone Number" value={patient.phone} phi />
            <Field label="Primary Care Physician" value={patient.pcpName} />
            <Field label="Address" value={patient.address} phi />
          </div>
        </div>

        {/* Insurance Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Insurance Details</h3>
          </div>
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Insurance Plan Name" value={patient.insurance.planName} />
            <Field label="Plan Type" value={patient.insurance.planType} />
            <Field label="Member ID" value={patient.insurance.memberId} phi />
            <Field label="Group Number" value={patient.insurance.groupNumber} phi />
            {patient.insurance.secondaryInsurance ? (
              <>
                <Field label="Secondary Insurance" value={patient.insurance.secondaryInsurance} />
                <Field label="Secondary Member ID" value={patient.insurance.secondaryMemberId ?? '—'} phi />
              </>
            ) : (
              <div className="col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Shield size={12} className="text-muted-foreground shrink-0" />
                <p className="text-[12px] text-muted-foreground">No secondary insurance on file</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Diagnoses & Medical Conditions ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Stethoscope size={14} className="text-primary" />
          </div>
          <h3 className="text-[12.5px] font-bold text-foreground">Diagnoses & Medical Conditions</h3>
          {patient.diagnoses.length > 0 && (
            <span className="ml-auto text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
              {patient.diagnoses.length} condition{patient.diagnoses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {/* Column headers */}
        <div className="px-5 pt-3.5 pb-2">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground border-b border-slate-100 pb-2">
            <span className="col-span-5">Condition Name</span>
            <span className="col-span-3">ICD-10 Code</span>
            <span className="col-span-2">Severity</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50 px-2 pb-2">
          {patient.diagnoses.length === 0 ? (
            <p className="px-3 py-5 text-[13px] text-muted-foreground text-center">No diagnoses recorded yet.</p>
          ) : (
            patient.diagnoses.map((d, idx) => (
              <div
                key={d.icdCode}
                className="grid grid-cols-12 items-center px-3 py-3 rounded-xl hover:bg-slate-50/70 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug">{d.conditionName}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-[12px] font-mono text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                    {d.icdCode}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      'inline-flex text-[10.5px] font-semibold px-2.5 py-1 rounded-full border',
                      SEVERITY_CLASS[d.severity]
                    )}
                  >
                    {d.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Row 3: Emergency Contacts | Assigned Care Team ────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Emergency Contacts</h3>
          </div>
          {contacts.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-muted-foreground">No emergency contacts recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {contacts.map((contact, idx) => (
                <div key={idx} className="px-5 py-4">
                  {contacts.length > 1 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
                      {idx === 0 ? 'Primary Contact' : `Contact ${idx + 1}`}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                    <Field label="Contact Name" value={contact.name} />
                    <Field label="Phone Number" value={contact.phone} phi />
                    <Field label="Relationship" value={contact.relationship} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Care Team */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Assigned Care Team</h3>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {patient.careTeam.map((member) => (
              <div
                key={member.role}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-colors"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border',
                    getAvatarColor(member.name),
                    'border-current/20'
                  )}
                >
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ROLE_LABEL[member.role]}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15 shrink-0">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deviceScenario = (searchParams.get('devices') ?? 'all') as DeviceScenario;

  // Load full detail (written at enrollment) first; fall back to list-item summary
  const allDetail =
    secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
  const allPatients = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
  const found = allPatients.find((p) => p.id === id);
  const patientRaw: PatientDetailData | null = allDetail[id!] ?? (found ? buildDetailFromStored(found) : null);

  // Demo: inject mock alerts for the 2nd patient in the stored list (index 1)
  const patientIndex = allPatients.findIndex((p) => p.id === id);
  const patient: PatientDetailData | null = patientRaw
    ? {
        ...patientRaw,
        alerts: patientRaw.alerts.length > 0 ? patientRaw.alerts : patientIndex === 1 ? DEMO_ALERTS : [],
      }
    : null;

  // Not-found guard
  if (!patient) {
    return (
      <div className="min-h-screen flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
        <div
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-3 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <p className="text-sm font-medium text-muted-foreground">Patient not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(PATIENT_BASE_PATH)}>
            Back to Patient List
          </Button>
        </div>
      </div>
    );
  }

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
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to Patient List
          </button>

          {/* ── Alerts & Flags — always visible, prominent ─────────────── */}
          {patient.alerts.length > 0 && (
            <div className="rounded-[14px] border-2 border-rose-200 bg-white shadow-[0_2px_12px_rgba(244,63,94,0.10)] overflow-hidden">
              {/* Header strip */}
              <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border-b border-rose-100">
                <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-white" />
                </div>
                <span className="text-[13px] font-bold text-rose-800 tracking-tight">Alerts & Flags</span>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                  {patient.alerts.length}
                </span>
              </div>
              {/* Alert cards — always expanded */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {patient.alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

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
              <div className="flex-1 min-w-0">
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
                      {patient.programs.includes('RPM') && (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          Remote Patient Monitoring
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Outlined action CTAs */}
              <div className="flex items-center gap-2 shrink-0 pl-4 self-stretch my-[-2px]">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center"
                    onClick={() => navigate(PATIENT_EDIT_PATH.replace(':id', patient.id))}
                  >
                    <Pencil size={13} className="shrink-0" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/60"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={13} className="shrink-0" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
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
            {activeTab === 'medication' && <MedicationTab />}
            {activeTab === 'programs-devices' && <ProgramsDevicesTab programs={patient.programs} />}
            {activeTab === 'care-plan' && <CarePlanTab />}
            {activeTab === 'activity' && <ActivityLogTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'billing' && <BillingTab />}
            {activeTab !== 'overview' &&
              activeTab !== 'vitals' &&
              activeTab !== 'medication' &&
              activeTab !== 'programs-devices' &&
              activeTab !== 'care-plan' &&
              activeTab !== 'activity' &&
              activeTab !== 'messages' &&
              activeTab !== 'appointments' &&
              activeTab !== 'tasks' &&
              activeTab !== 'billing' && <ComingSoonTab label={TABS.find((t) => t.id === activeTab)?.label ?? ''} />}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-destructive" />
              </div>
              <DialogTitle className="text-[15px] font-bold">Delete Patient</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground" data-phi="true">
              {patient.fullName}
            </span>
            ? This action cannot be undone and all patient data will be permanently removed.
          </p>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" size="sm" className="h-9 px-4" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const list = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
                secureLocalStorage.setItemObject(
                  PATIENT_LIST_STORAGE_KEY,
                  list.filter((p) => p.id !== patient.id)
                );
                const detail =
                  secureLocalStorage.getItemObject<Record<string, unknown>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
                delete detail[patient.id];
                secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, detail);
                setShowDeleteConfirm(false);
                toast.success('Patient removed successfully.');
                navigate(PATIENT_BASE_PATH);
              }}
            >
              Delete Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
