import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectAuthLoading } from '@/store/slices/authSlice';
import { EMAIL_VERIFICATION_PATH } from '../../constants';

export function SignIn(): React.JSX.Element {
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectAuthLoading);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  function onVerifyEmail(): void {
    navigate(EMAIL_VERIFICATION_PATH);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D9488 0%, #0f766e 40%, #134e4a 100%)' }}
      >
        {/* Background decorative circles */}
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
          {/* Logo */}
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

          {/* Vertically centered content */}
          <div className="flex flex-col flex-1 justify-center">
            {/* Hero text */}
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
              <p className="text-white/70 text-base leading-relaxed max-w-xl">
                Streamline patient care, manage your team, and monitor health outcomes all in one secure platform.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-8 mb-14">
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
                    style={{
                      width: 32,
                      height: 32,
                      background: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                    }}
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

            {/* Bottom stats */}
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
          {/* end vertically centered content */}
        </div>
      </div>

      {/* Right Panel — Invitation Review */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto"
        style={{ background: '#FAFAF9' }}
      >
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: '#0D9488' }}
          >
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-[#0F172A]" style={{ fontSize: 16 }}>
            Health Telematix
          </span>
        </div>

        <div className="w-full" style={{ maxWidth: 530 }}>
          {/* Header */}
          <div className="mb-7">
            <h2 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
              You've Been Invited to Join a Clinic on Health Telematix
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              Your account has been created by the Super Admin. Please review the details below and verify your email
              address to activate your access.
            </p>
          </div>

          {/* Clinic Details Card */}
          <div
            className="rounded-xl mb-4 overflow-hidden"
            style={{ border: '1px solid #E2E8F0', background: '#ffffff' }}
          >
            {/* Card header */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#64748B', letterSpacing: '0.06em' }}
              >
                Clinic Details
              </p>
            </div>

            {/* Clinic identity row */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0 text-sm font-bold"
                  style={{
                    width: 36,
                    height: 36,
                    background: '#F0FDFA',
                    color: '#0D9488',
                    border: '1px solid #99f6e4',
                  }}
                >
                  SC
                </div>
                <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                  Sunrise Care Clinic
                </span>
              </div>
              <span
                className="text-xs font-mono font-medium px-2 py-1 rounded-md"
                style={{ background: '#F1F5F9', color: '#64748B' }}
              >
                SCC-NE-01
              </span>
            </div>

            {/* Clinic fields grid */}
            <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
              {[
                { label: 'Clinic Email Address', value: 'admin@sunrisecare.com', phi: true },
                { label: 'Clinic Phone Number', value: '+1 (312) 555-0192', phi: true },
                { label: 'Address', value: '4820 W Fullerton Ave, Suite 210, Chicago, IL 60639' },
                { label: 'NPI Number', value: '1234567890' },
                { label: 'TIN Number', value: '98-7654321' },
              ].map((row) => (
                <div key={row.label} className="px-4 py-2.5 flex items-start justify-between gap-4">
                  <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8', minWidth: 130 }}>
                    {row.label}
                  </span>
                  <span
                    className="text-xs font-medium text-right"
                    style={{ color: '#374151' }}
                    {...(row.phi ? { 'data-phi': true } : {})}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Account Card */}
          <div
            className="rounded-xl mb-6 overflow-hidden"
            style={{ border: '1px solid #E2E8F0', background: '#ffffff' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#64748B', letterSpacing: '0.06em' }}
              >
                Your Account Information
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x" style={{ borderColor: '#F1F5F9' }}>
              <div className="px-4 py-3">
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>
                  Full Name
                </p>
                <p className="text-sm font-semibold" style={{ color: '#0F172A' }} data-phi>
                  Sarah Mitchell
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>
                  Assigned Role
                </p>
                <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                  Clinic Admin
                </p>
              </div>
              <div className="px-4 py-3 col-span-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>
                  Email Address
                </p>
                <p className="text-sm font-medium" style={{ color: '#374151' }} data-phi>
                  sarah.mitchell@sunrisecare.com
                </p>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ width: 15, height: 15, accentColor: '#0D9488' }}
            />
            <span className="text-sm" style={{ color: '#374151' }}>
              I agree to the{' '}
              <button type="button" className="font-medium underline underline-offset-2" style={{ color: '#0D9488' }}>
                Terms &amp; Privacy Policy
              </button>
            </span>
          </label>

          {/* CTA */}
          <Button
            type="button"
            disabled={!agreedToTerms || isLoading}
            onClick={onVerifyEmail}
            className="w-full h-11 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: agreedToTerms ? '#0D9488' : '#99f6e4',
              borderRadius: 9,
              boxShadow: agreedToTerms ? '0 4px 14px rgba(13,148,136,0.25)' : 'none',
              border: 'none',
              cursor: agreedToTerms ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (agreedToTerms) e.currentTarget.style.background = '#0f766e';
            }}
            onMouseLeave={(e) => {
              if (agreedToTerms) e.currentTarget.style.background = '#0D9488';
            }}
          >
            {isLoading ? (
              <>
                <span
                  className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                  style={{ width: 16, height: 16 }}
                />
                Verifying…
              </>
            ) : (
              <>
                Verify Email Address
                <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
