import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FlaskConical, ChevronDown, ChevronUp, RotateCcw, ClipboardList, Eraser, Info } from 'lucide-react';
import { toast } from 'sonner';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import type {
  EnrollmentStep1Values,
  EnrollmentStep2Values,
  EmergencyContactStepValues,
  EnrollmentStep3Values,
  PatientListItem,
  PatientDetailData,
  ProgramType,
  CareTeamRole,
} from '../../@types';
import { PATIENT_BASE_PATH, PATIENT_LIST_STORAGE_KEY, PATIENT_DETAIL_STORAGE_KEY } from '../../constants';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';
import { DemographicsStep } from './steps/DemographicsStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { EmergencyContactStep } from './steps/EmergencyContactStep';
import { ClinicalStep } from './steps/ClinicalStep';
import type { EHRPrefillData } from './EHRSelector';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateOfBirth(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = () => chars[Math.floor(Math.random() * chars.length)];
  return `INV-${r()}${r()}${r()}${r()}-${r()}${r()}${r()}${r()}`;
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    label: 'Demographics',
    description: 'Personal info, contact & address',
  },
  {
    label: 'Insurance',
    description: 'Coverage plan & secondary insurance',
  },
  {
    label: 'Emergency Contacts',
    description: 'Emergency contacts & relationships',
  },
  {
    label: 'Clinical Details',
    description: 'Care team, diagnoses & program',
  },
];

// ─── Vertical Stepper ────────────────────────────────────────────────────────

function VerticalStepper({ current }: { current: number }): React.JSX.Element {
  return (
    <nav className="flex flex-col">
      {STEPS.map((s, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={s.label} className="flex gap-4">
            {/* Circle + connector */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border-2',
                  done
                    ? 'bg-primary border-primary text-white'
                    : active
                      ? 'bg-primary border-primary text-white shadow-[0_0_0_5px_rgba(13,148,136,0.12)]'
                      : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                {done ? (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path
                      d="M1.5 5.5L5.5 9.5L12.5 1.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className={cn('text-[13px] font-bold', active ? 'text-white' : 'text-slate-400')}>{num}</span>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-[2px] flex-1 my-2 rounded-full min-h-[44px] transition-colors duration-300',
                    done ? 'bg-primary' : 'bg-slate-100'
                  )}
                />
              )}
            </div>

            {/* Label + description */}
            <div className={cn('pb-10', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-[13px] font-bold leading-snug transition-colors duration-200 mt-2',
                  active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </p>
              <p
                className={cn(
                  'text-[11.5px] leading-relaxed mt-1 transition-colors duration-200',
                  active ? 'text-primary/70' : 'text-muted-foreground/70'
                )}
              >
                {s.description}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  patientName,
  email,
  inviteCode,
  onDone,
}: {
  open: boolean;
  patientName: string;
  email: string;
  inviteCode: string;
  onDone: () => void;
}): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[440px] sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* ── Animated illustration header ── */}
        <div className="bg-gradient-to-b from-emerald-50/80 to-white pt-10 pb-6 flex flex-col items-center px-6">
          {/* Keyframe styles */}
          <style>{`
            @keyframes enroll-ring-1 {
              0%   { transform: scale(0.6); opacity: 0.6; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes enroll-ring-2 {
              0%   { transform: scale(0.6); opacity: 0.4; }
              100% { transform: scale(1.9); opacity: 0; }
            }
            @keyframes enroll-circle-in {
              0%   { transform: scale(0); opacity: 0; }
              60%  { transform: scale(1.12); opacity: 1; }
              80%  { transform: scale(0.96); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes enroll-check {
              from { stroke-dashoffset: 64; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes enroll-sparkle {
              0%   { opacity: 0; transform: scale(0) rotate(0deg); }
              50%  { opacity: 1; }
              100% { opacity: 0; transform: scale(1.4) rotate(25deg); }
            }
            .enroll-ring-1 {
              animation: enroll-ring-1 1.2s cubic-bezier(0,0,0.2,1) 0.15s forwards;
            }
            .enroll-ring-2 {
              animation: enroll-ring-2 1.4s cubic-bezier(0,0,0.2,1) 0.05s forwards;
            }
            .enroll-circle {
              animation: enroll-circle-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
            }
            .enroll-check {
              stroke-dasharray: 64;
              stroke-dashoffset: 64;
              animation: enroll-check 0.45s cubic-bezier(0.65,0,0.35,1) 0.5s forwards;
            }
            .enroll-sparkle-1 { animation: enroll-sparkle 0.7s ease-out 0.55s both; }
            .enroll-sparkle-2 { animation: enroll-sparkle 0.7s ease-out 0.65s both; }
            .enroll-sparkle-3 { animation: enroll-sparkle 0.7s ease-out 0.60s both; }
            .enroll-sparkle-4 { animation: enroll-sparkle 0.7s ease-out 0.70s both; }
          `}</style>

          {/* Illustration */}
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Ripple rings */}
            <div className="enroll-ring-2 absolute w-20 h-20 rounded-full bg-emerald-400/20" />
            <div className="enroll-ring-1 absolute w-20 h-20 rounded-full bg-emerald-400/30" />

            {/* Sparkle dots */}
            <div className="enroll-sparkle-1 absolute top-1 right-3 w-2.5 h-2.5 rounded-full bg-emerald-300" />
            <div className="enroll-sparkle-2 absolute bottom-2 right-1 w-2 h-2 rounded-full bg-teal-400" />
            <div className="enroll-sparkle-3 absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400" />
            <div className="enroll-sparkle-4 absolute bottom-1 left-4 w-1.5 h-1.5 rounded-full bg-teal-300" />

            {/* Main circle + checkmark */}
            <div className="enroll-circle w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.45)]">
              <svg width="34" height="27" viewBox="0 0 34 27" fill="none">
                <path
                  className="enroll-check"
                  d="M3 13.5L12.5 23L31 3"
                  stroke="white"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-[18px] font-bold text-foreground mt-5 text-center">Patient Enrolled Successfully!</h3>
          <p className="text-[13px] text-muted-foreground mt-2 text-center max-w-[320px] leading-relaxed">
            <span className="font-semibold text-foreground" data-phi="true">
              {patientName}
            </span>{' '}
            has been enrolled. An invitation email has been sent to{' '}
            <span className="font-semibold text-foreground" data-phi="true">
              {email}
            </span>
            .
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6 space-y-3.5">
          {/* Invite Code */}
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-5 py-4 text-center space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Patient Invite Code
            </p>
            <p className="text-[24px] font-mono font-bold text-primary tracking-widest">{inviteCode}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Share this code with the patient to join the app.
            </p>
          </div>

          {/* Consent banner */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12.5px] font-semibold text-amber-800">Consent — Waiting for Patient Approval</p>
              <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">
                Consent will be recorded once the patient joins the app and accepts the terms of service.
              </p>
            </div>
          </div>

          <Button className="w-full h-10 shadow-[0_4px_14px_rgba(13,148,136,0.22)]" onClick={onDone}>
            Back to Patients
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Enrollment Demo Guide ────────────────────────────────────────────────────

interface EnrollmentDemoGuideProps {
  demoFilled: boolean;
  onFillSample: () => void;
  onReset: () => void;
}

function EnrollmentDemoGuide({ demoFilled, onFillSample, onReset }: EnrollmentDemoGuideProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end gap-2">
      {open && (
        <div className="rounded-2xl overflow-hidden bg-slate-800 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.35)] min-w-[230px]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
            <FlaskConical size={14} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wide text-slate-100">Enrollment Demo</span>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">
              Prototype
            </span>
          </div>

          {/* Actions */}
          <div className="px-3 py-3 space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 px-3 mb-2">Form Presets</p>

            {/* Fill sample */}
            <button
              type="button"
              onClick={() => {
                onFillSample();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors text-slate-100 hover:bg-white/[0.07]"
            >
              <span className="flex items-center justify-center rounded-lg w-7 h-7 bg-emerald-400/15 shrink-0">
                <ClipboardList size={13} className="text-emerald-400" />
              </span>
              <div>
                <p className="text-xs font-semibold">Fill Sample Patient</p>
                <p className="text-[10px] mt-0.5 text-slate-500">Auto-fill all fields with demo data</p>
              </div>
            </button>

            {/* Reset to empty */}
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors text-slate-100 hover:bg-white/[0.07]"
            >
              <span className="flex items-center justify-center rounded-lg w-7 h-7 bg-slate-400/15 shrink-0">
                <Eraser size={13} className="text-slate-400" />
              </span>
              <div>
                <p className="text-xs font-semibold">Empty Form</p>
                <p className="text-[10px] mt-0.5 text-slate-500">Reset all fields to blank</p>
              </div>
            </button>
          </div>

          {/* Active indicator */}
          {demoFilled && (
            <div className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-[10.5px] text-emerald-400 font-semibold">Sample data active</p>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="ml-auto"
              >
                <RotateCcw size={10} className="text-emerald-400/70 hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] text-slate-100 hover:bg-[#273449] transition-all"
      >
        <FlaskConical size={13} className="text-emerald-400" />
        <span className="text-xs font-semibold">Demo</span>
        {demoFilled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        {open ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronUp size={12} className="text-slate-500" />
        )}
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EnrollPatientPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const ehrPrefill = (location.state as { ehrPrefill?: EHRPrefillData } | null)?.ehrPrefill;

  const [navCollapsed, setNavCollapsed] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'success'>(1);
  const [step1Data, setStep1Data] = useState<EnrollmentStep1Values | null>(null);
  const [step2Data, setStep2Data] = useState<EnrollmentStep2Values | null>(null);
  const [step3Data, setStep3Data] = useState<EmergencyContactStepValues | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [enrolledName, setEnrolledName] = useState('');
  const [enrolledEmail, setEnrolledEmail] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [demoFilled, setDemoFilled] = useState(false);

  const allUsers: UserListItem[] = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
  const physicians = allUsers
    .filter((u) => u.type === 'PHYSICIAN' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, npiNumber: u.npiNumber, specialty: u.specialty }));
  const nurses = allUsers
    .filter((u) => u.type === 'NURSE' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, specialty: u.specialty }));
  const dhns = allUsers
    .filter((u) => u.type === 'DHN' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, specialty: u.specialty }));

  // ── Demo sample data ──────────────────────────────────────────────────────
  const SAMPLE_STEP1: EnrollmentStep1Values = {
    firstName: 'Sarah',
    lastName: 'Mitchell',
    mrn: 'MRN-20481',
    dateOfBirth: '1985-03-14',
    gender: 'Female',
    email: 'sarah.mitchell@email.com',
    phone: '(312) 555-0192',
    pcpName: physicians[0]?.fullName ?? '',
    zipCode: '60601',
    country: 'USA',
    state: 'IL',
    city: 'Chicago',
    addressLine1: '1247 Oak Street',
    addressLine2: 'Apt 3B',
  };

  const SAMPLE_STEP2: EnrollmentStep2Values = {
    insurancePlanName: 'BlueCross BlueShield',
    planType: 'PPO',
    memberId: 'BCB-4421-9087',
    groupNumber: 'GRP-20031',
    hasSecondaryInsurance: true,
    secondaryInsurance: 'Medicare Part B',
    secondaryMemberId: 'MCR-8811-00214',
  };

  const SAMPLE_STEP3: EmergencyContactStepValues = {
    contacts: [{ name: 'Patricia Mitchell', phone: '(312) 555-0182', relationship: 'Spouse' }],
  };

  function fillSampleDemo(): void {
    setDemoFilled(true);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setFormKey((k) => k + 1);
    setStep(1);
  }

  function resetForm(): void {
    setDemoFilled(false);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setFormKey((k) => k + 1);
    setStep(1);
  }

  function goUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStep1(data: EnrollmentStep1Values) {
    setStep1Data(data);
    setStep(2);
    goUp();
  }
  function handleStep2(data: EnrollmentStep2Values) {
    setStep2Data(data);
    setStep(3);
    goUp();
  }
  function handleStep3(data: EmergencyContactStepValues) {
    setStep3Data(data);
    setStep(4);
    goUp();
  }

  function handleStep4(data: EnrollmentStep3Values) {
    if (!step1Data || !step2Data || !step3Data) return;

    const id = `p-${Date.now()}`;
    const fullName = `${step1Data.firstName} ${step1Data.lastName}`;
    const programs: ProgramType[] = [
      ...(data.programACPM ? (['APCM'] as ProgramType[]) : []),
      ...(data.programRPM ? (['RPM'] as ProgramType[]) : []),
    ];
    const composedAddress = [
      step1Data.addressLine1,
      step1Data.addressLine2,
      step1Data.city,
      step1Data.state,
      step1Data.zipCode,
      step1Data.country,
    ]
      .filter(Boolean)
      .join(', ');

    const listItem: PatientListItem = {
      id,
      mrn: step1Data.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(step1Data.dateOfBirth),
      gender: step1Data.gender,
      email: step1Data.email,
      phone: step1Data.phone,
      pcpName: step1Data.pcpName,
      programs,
      status: 'Active',
    };

    const detailData: PatientDetailData = {
      id,
      mrn: step1Data.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(step1Data.dateOfBirth),
      gender: step1Data.gender,
      email: step1Data.email,
      phone: step1Data.phone,
      address: composedAddress,
      pcpName: step1Data.pcpName,
      programs,
      insurance: {
        planName: step2Data.insurancePlanName,
        planType: step2Data.planType,
        memberId: step2Data.memberId,
        groupNumber: step2Data.groupNumber,
        secondaryInsurance: step2Data.hasSecondaryInsurance ? step2Data.secondaryInsurance || undefined : undefined,
        secondaryMemberId: step2Data.hasSecondaryInsurance ? step2Data.secondaryMemberId || undefined : undefined,
      },
      diagnoses: data.diagnoses,
      emergencyContacts: step3Data.contacts,
      careTeam: [
        ...(data.careTeamPhysician ? [{ role: 'PCP' as CareTeamRole, name: data.careTeamPhysician, email: '' }] : []),
        ...(data.careTeamNurse ? [{ role: 'Nurse' as CareTeamRole, name: data.careTeamNurse, email: '' }] : []),
        ...(data.careTeamDHN ? [{ role: 'DHN' as CareTeamRole, name: data.careTeamDHN, email: '' }] : []),
      ],
      alerts: [],
    };

    try {
      const existingList = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
      secureLocalStorage.setItemObject(PATIENT_LIST_STORAGE_KEY, [listItem, ...existingList]);
      const existingDetail =
        secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
      secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, { ...existingDetail, [id]: detailData });
    } catch {
      toast.error('Failed to save patient data.');
      return;
    }

    setInviteCode(generateInviteCode());
    setEnrolledName(fullName);
    setEnrolledEmail(step1Data.email);
    setStep('success');
  }

  const pageTitle = ehrPrefill ? `EHR Import — ${ehrPrefill.ehrName}` : 'Enroll New Patient';

  return (
    <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle={pageTitle} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* ── Success popup — overlays the form ── */}
          <SuccessDialog
            open={step === 'success'}
            patientName={enrolledName}
            email={enrolledEmail}
            inviteCode={inviteCode}
            onDone={() => navigate(PATIENT_BASE_PATH)}
          />

          {/* ── Always-visible form panels ── */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col px-8 py-8 gap-5">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate(PATIENT_BASE_PATH)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                Back to Patients
              </button>

              {/* Two-panel card — fills remaining height */}
              <div className="flex-1 overflow-hidden bg-white rounded-[14px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex">
                {/* ── Left: Vertical Stepper — fixed, never scrolls ── */}
                <div className="w-[22%] min-w-[180px] shrink-0 bg-slate-50/60 border-r border-slate-100 px-6 py-8 flex flex-col overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-[13.5px] font-bold text-foreground leading-snug">{pageTitle}</h2>
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-relaxed">
                      Complete all steps to enroll the patient.
                    </p>
                  </div>
                  <VerticalStepper current={step === 'success' ? 4 : (step as number)} />
                </div>

                {/* ── Right: Form — scrolls independently ── */}
                <div className="flex-1 min-w-0 overflow-y-auto px-8 pt-8 pb-0">
                  <div className="mb-7">
                    <h3 className="text-[15px] font-bold text-foreground">
                      {STEPS[(step === 'success' ? 4 : (step as number)) - 1].label}
                    </h3>
                    <p className="text-[12.5px] text-muted-foreground mt-1">
                      {STEPS[(step === 'success' ? 4 : (step as number)) - 1].description}
                    </p>
                  </div>

                  {step === 1 && (
                    <DemographicsStep
                      key={`step1-${formKey}`}
                      defaultValues={demoFilled ? SAMPLE_STEP1 : ehrPrefill?.step1}
                      onNext={handleStep1}
                      physicians={physicians}
                    />
                  )}
                  {step === 2 && (
                    <InsuranceStep
                      key={`step2-${formKey}`}
                      defaultValues={demoFilled ? SAMPLE_STEP2 : ehrPrefill?.step2}
                      onBack={() => setStep(1)}
                      onNext={handleStep2}
                    />
                  )}
                  {step === 3 && (
                    <EmergencyContactStep
                      key={`step3-${formKey}`}
                      defaultValues={step3Data ?? (demoFilled ? SAMPLE_STEP3 : undefined)}
                      onBack={() => setStep(2)}
                      onNext={handleStep3}
                    />
                  )}
                  {step === 4 && (
                    <ClinicalStep
                      key={`step4-${formKey}`}
                      isEdit={false}
                      onBack={() => setStep(3)}
                      onSubmit={handleStep4}
                      physicians={physicians}
                      nurses={nurses}
                      dhns={dhns}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDemoGuide demoFilled={demoFilled} onFillSample={fillSampleDemo} onReset={resetForm} />
    </div>
  );
}
