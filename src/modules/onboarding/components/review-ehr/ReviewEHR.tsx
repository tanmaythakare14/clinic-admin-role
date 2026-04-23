import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Users,
  Activity,
  ArrowRight,
  Check,
  Plug,
  PlugZap,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Plus,
  ServerCrash,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH, DASHBOARD_PATH } from '../../constants';

const TEAL = '#0D9488';
const FF = 'Inter, system-ui, sans-serif';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: REVIEW_USERS_PATH },
  { label: 'Review EHR Details', path: REVIEW_EHR_PATH },
];

const EHR_SYSTEM_COLORS: Record<string, { bg: string; color: string }> = {
  Epic: { bg: '#EFF6FF', color: '#1D4ED8' },
  Cerner: { bg: '#FFF7ED', color: '#C2410C' },
  Athena: { bg: '#F0FDFA', color: '#0D9488' },
  Meditech: { bg: '#F5F3FF', color: '#7C3AED' },
};

interface EHRDetails {
  system: 'Epic' | 'Cerner' | 'Athena' | 'Meditech';
  environment: string;
  smartAppEnabled: boolean;
  integrationStatus: 'Active' | 'Inactive' | 'Pending';
  connectedOn: string;
}

const MOCK_EHR: EHRDetails = {
  system: 'Epic',
  environment: 'Production · v10.2',
  smartAppEnabled: true,
  integrationStatus: 'Active',
  connectedOn: 'Mar 14, 2025',
};

const STATUS_STYLES: Record<EHRDetails['integrationStatus'], { bg: string; color: string; dot: string }> = {
  Active: { bg: '#F0FDFA', color: '#0D9488', dot: '#10B981' },
  Inactive: { bg: '#FFF1F2', color: '#E11D48', dot: '#F43F5E' },
  Pending: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
};

/* ── EHR Set Up — card view ── */
function EHRSetupView(): React.JSX.Element {
  const navigate = useNavigate();
  const [ehr] = useState<EHRDetails>(MOCK_EHR);
  const [smartOn, setSmartOn] = useState(ehr.smartAppEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const systemStyle = EHR_SYSTEM_COLORS[ehr.system];
  const statusStyle = STATUS_STYLES[ehr.integrationStatus];

  function handleToggleSmart(): void {
    setSmartOn((v) => {
      toast.success(`SMART App ${!v ? 'enabled' : 'disabled'}`);
      return !v;
    });
  }

  function handleRemove(): void {
    toast.error('Connection removed. Contact Super Admin to reconnect.');
  }

  async function handleContinue(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    navigate(DASHBOARD_PATH);
  }

  return (
    <>
      {/* EHR Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 6px rgba(15,23,42,0.06)', background: '#fff' }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 42, height: 42, background: systemStyle.bg }}
            >
              <PlugZap size={20} style={{ color: systemStyle.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm" style={{ color: '#0F172A' }}>
                  {ehr.system}
                </p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: systemStyle.bg, color: systemStyle.color }}
                >
                  {ehr.system}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                {ehr.environment}
              </p>
            </div>
          </div>
          {/* Integration Status badge */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: statusStyle.dot }} />
            {ehr.integrationStatus}
          </span>
        </div>

        {/* Card body — detail rows */}
        <div className="divide-y" style={{ borderColor: '#F8FAFC' }}>
          {/* Connected on */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
              Connected On
            </span>
            <span className="text-xs font-medium" style={{ color: '#0F172A' }}>
              {ehr.connectedOn}
            </span>
          </div>

          {/* SMART App Integration */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>
                SMART App Integration
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                Enables secure third-party app access
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleSmart}
              className="flex items-center gap-2 text-xs font-semibold transition-colors"
              style={{ color: smartOn ? TEAL : '#94A3B8' }}
              aria-label="Toggle SMART App"
            >
              {smartOn ? (
                <ToggleRight size={28} style={{ color: TEAL }} />
              ) : (
                <ToggleLeft size={28} style={{ color: '#CBD5E1' }} />
              )}
              <span style={{ color: smartOn ? TEAL : '#94A3B8' }}>{smartOn ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Integration Status row */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
              Integration Status
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: statusStyle.color }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: 6, height: 6, background: statusStyle.dot }}
              />
              {ehr.integrationStatus}
            </span>
          </div>
        </div>

        {/* Card footer — remove */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid #F8FAFC', background: '#FAFBFC' }}>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E11D48')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <Trash2 size={13} />
            Remove Connection
          </button>
        </div>
      </div>

      {/* Info notice */}
      <div
        className="flex items-start gap-3 mt-4 px-4 py-3 rounded-xl"
        style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
      >
        <AlertCircle size={14} style={{ color: '#0284C7', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#0369A1' }}>
          <span className="font-semibold">Set up by Super Admin.</span> Contact Super Admin Support to modify EHR system
          or credentials.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
          style={{ borderRadius: 9 }}
        >
          ← Back
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleContinue}
          className="flex-1 h-11 text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{
            background: isSubmitting ? '#5eead4' : TEAL,
            borderRadius: 9,
            boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(13,148,136,0.25)',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.currentTarget.style.background = '#0f766e';
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.currentTarget.style.background = TEAL;
          }}
        >
          {isSubmitting ? (
            <>
              <span
                className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                style={{ width: 16, height: 16 }}
              />
              Saving…
            </>
          ) : (
            <>
              Continue <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </>
  );
}

/* ── EHR Not Set Up — empty state ── */
function EHREmptyView(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <>
      {/* Empty state card */}
      <div
        className="flex flex-col items-center justify-center py-14 px-8 rounded-2xl text-center"
        style={{ border: '1.5px dashed #CBD5E1', background: '#fff' }}
      >
        {/* Illustration */}
        <div className="relative mb-6">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 80, height: 80, background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <ServerCrash size={36} style={{ color: '#CBD5E1' }} />
          </div>
          <div
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, background: '#FFF7ED', border: '2px solid #fff' }}
          >
            <Plug size={13} style={{ color: '#F59E0B' }} />
          </div>
        </div>

        <h3 className="font-bold mb-2" style={{ fontSize: 16, color: '#0F172A' }}>
          No EHR System Connected
        </h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748B', maxWidth: 320 }}>
          Your Super Admin hasn't set up an EHR integration yet. You can add EHR details now or continue and set it up
          later.
        </p>

        <Button
          type="button"
          onClick={() => toast.info('EHR setup flow coming soon!')}
          className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white"
          style={{ background: TEAL, border: 'none', borderRadius: 9, boxShadow: '0 4px 14px rgba(13,148,136,0.22)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#0f766e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = TEAL)}
        >
          <Plus size={15} />
          Add EHR Details
        </Button>
      </div>

      {/* Skip notice */}
      <div
        className="flex items-start gap-3 mt-4 px-4 py-3 rounded-xl"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
      >
        <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
          <span className="font-semibold">EHR not required to proceed.</span> You can complete onboarding and connect
          EHR from the dashboard later.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
          style={{ borderRadius: 9 }}
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={() => navigate(DASHBOARD_PATH)}
          className="flex-1 h-11 text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: TEAL, borderRadius: 9, boxShadow: '0 4px 14px rgba(13,148,136,0.25)', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#0f766e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = TEAL)}
        >
          Skip for Now <ArrowRight size={15} />
        </Button>
      </div>
    </>
  );
}

/* ── Main Screen ── */
export function ReviewEHR(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const hasEHR = searchParams.get('scenario') !== 'empty';

  return (
    <div className="min-h-screen flex" style={{ fontFamily: FF }}>
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D9488 0%, #0f766e 40%, #134e4a 100%)' }}
      >
        <div
          className="absolute -top-24 -right-24 rounded-full opacity-10"
          style={{ width: 320, height: 320, background: '#ffffff' }}
        />
        <div
          className="absolute -bottom-16 -left-16 rounded-full opacity-10"
          style={{ width: 280, height: 280, background: '#ffffff' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{ width: 500, height: 500, background: '#ffffff' }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 44,
                height: 44,
                background: 'rgba(255,255,255,0.18)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              }}
            >
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Health Telematix</p>
              <p className="text-white/60 text-xs font-medium">Clinic Admin Portal</p>
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-center">
            <div className="pb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: '#34d399' }} />
                HIPAA Compliant Platform
              </div>
              <h1 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-snug mb-4">
                Intelligent Care Management for
                <br />
                <span style={{ color: '#99f6e4' }}>Modern Clinics</span>
              </h1>
              <p className="text-white/70 text-base leading-relaxed max-w-xs">
                Streamline patient care, manage your team, and monitor health outcomes — all in one secure platform.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {[
                {
                  icon: <Shield size={16} />,
                  title: 'HIPAA Compliant & Secure',
                  desc: 'End-to-end encryption for all patient data',
                },
                {
                  icon: <Users size={16} />,
                  title: 'Multi-Role Care Teams',
                  desc: 'Physicians, Nurses & Digital Health Navigators',
                },
                {
                  icon: <Activity size={16} />,
                  title: 'Real-Time Patient Monitoring',
                  desc: 'RPM & APCM program tracking with live vitals',
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                    style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="grid grid-cols-3 gap-4 rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {[
                { value: '2,400+', label: 'Active Patients' },
                { value: '98.5%', label: 'Uptime SLA' },
                { value: 'SOC 2', label: 'Certified' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-white font-bold text-xl">{s.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-12 overflow-y-auto"
        style={{ background: '#FAFAF9' }}
      >
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: TEAL }}
          >
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-[#0F172A]" style={{ fontSize: 16 }}>
            Health Telematix
          </span>
        </div>

        <div className="w-full" style={{ maxWidth: 530 }}>
          {/* ── Stepper ── */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 2;
              const isCompleted = idx < 2;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        background: isCompleted || isActive ? TEAL : '#E2E8F0',
                        border: `2px solid ${isCompleted || isActive ? TEAL : '#CBD5E1'}`,
                      }}
                    >
                      {isCompleted ? (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      ) : (
                        <span className="text-xs font-bold" style={{ color: isActive ? '#fff' : '#94A3B8' }}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium mt-1.5 text-center"
                      style={{ color: isActive || isCompleted ? TEAL : '#94A3B8', maxWidth: 90, lineHeight: '1.3' }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="flex-1 mx-2"
                      style={{
                        height: 2,
                        background: isCompleted ? TEAL : '#E2E8F0',
                        marginBottom: 22,
                        borderRadius: 2,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Heading ── */}
          <div className="mb-6">
            <h2 className="font-bold text-[#0F172A] mb-1" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
              Review EHR Details
            </h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {hasEHR
                ? 'Your EHR system has been connected by the Super Admin. Review the details below.'
                : 'No EHR system has been set up yet. You can add it now or skip and configure it later.'}
            </p>
          </div>

          {/* ── Scenario views ── */}
          {hasEHR ? <EHRSetupView /> : <EHREmptyView />}
        </div>
      </div>
    </div>
  );
}
