import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SET_PASSWORD_PATH, SIGN_IN_PATH } from '../../constants';

const TEAL = '#0D9488';
const FF = 'Inter, system-ui, sans-serif';
const OTP_LENGTH = 6;
const TIMER_SECONDS = 120;

export function EmailVerification(): React.JSX.Element {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((d) => d !== '');
  const canResend = timeLeft === 0;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleResend = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimeLeft(TIMER_SECONDS);
    focusInput(0);
    toast.success('A new verification code has been sent to your email.');
  }, []);

  async function handleVerify(): Promise<void> {
    if (!isComplete) return;
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsVerifying(false);
    toast.success('Email verified successfully!');
    navigate(SET_PASSWORD_PATH);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: FF }}>
      {/* ── Left Panel — Branding (same as SignIn) ── */}
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
            <div className="pb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: '#34d399' }} />
                HIPAA Compliant Platform
              </div>
              <h1 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-snug mb-4">
                Intelligent Care
                <br />
                Management for
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

      {/* ── Right Panel — Email Verification ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12"
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
          {/* Email icon */}
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-6"
            style={{ width: 56, height: 56, background: '#F0FDFA', border: '1px solid #99f6e4' }}
          >
            <Mail size={24} style={{ color: TEAL }} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
              Check your email
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              We've sent a 6-digit verification code to{' '}
              <span className="font-semibold" style={{ color: '#0F172A' }} data-phi>
                sarah.mitchell@sunrisecare.com
              </span>
              . Enter the code below to verify your email address.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-3">
            <p className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>
              Verification Code
            </p>
            <div className="flex gap-3" onPaste={handlePaste} style={{ width: '100%' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className="text-center font-bold text-xl rounded-xl outline-none transition-all"
                  style={{
                    width: 'calc((530px - 5 * 12px) / 6)',
                    flexShrink: 0,
                    height: 64,
                    border: digit ? `2px solid ${TEAL}` : '2px solid #E2E8F0',
                    background: digit ? '#F0FDFA' : '#ffffff',
                    color: '#0F172A',
                    boxShadow: digit ? `0 0 0 3px rgba(13,148,136,0.10)` : 'none',
                    caretColor: TEAL,
                    fontFamily: FF,
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.border = `2px solid ${TEAL}`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(13,148,136,0.12)`;
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.style.border = '2px solid #E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Timer + Resend */}
          <div className="flex items-center gap-1.5 mb-8" style={{ minHeight: 24 }}>
            {canResend ? (
              <>
                <p className="text-sm" style={{ color: '#64748B' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: TEAL }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0f766e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = TEAL)}
                >
                  <RotateCcw size={13} />
                  Resend code
                </button>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Resend code in
                </p>
                <span className="text-sm font-semibold tabular-nums" style={{ color: TEAL }}>
                  {formatTime(timeLeft)}
                </span>
              </>
            )}
          </div>

          {/* CTA */}
          <Button
            type="button"
            disabled={!isComplete || isVerifying}
            onClick={handleVerify}
            className="w-full h-11 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: isComplete ? TEAL : '#99f6e4',
              borderRadius: 9,
              boxShadow: isComplete ? '0 4px 14px rgba(13,148,136,0.25)' : 'none',
              border: 'none',
              cursor: isComplete ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (isComplete) e.currentTarget.style.background = '#0f766e';
            }}
            onMouseLeave={(e) => {
              if (isComplete) e.currentTarget.style.background = TEAL;
            }}
          >
            {isVerifying ? (
              <>
                <span
                  className="inline-block rounded-full border-2 border-white/30 border-t-white animate-spin"
                  style={{ width: 16, height: 16 }}
                />
                Validating…
              </>
            ) : (
              <>
                Validate &amp; Set Password
                <ArrowRight size={15} />
              </>
            )}
          </Button>

          {/* Back to sign in */}
          <p className="text-sm text-center mt-5" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate(SIGN_IN_PATH)}
              className="font-semibold"
              style={{ color: TEAL }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f766e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEAL)}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
