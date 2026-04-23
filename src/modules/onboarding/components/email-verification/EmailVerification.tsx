import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { SET_PASSWORD_PATH } from '../../constants';

const OTP_LENGTH = 6;
const TIMER_SECONDS = 120;

export function EmailVerification(): React.JSX.Element {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);

  const isComplete = otp.length === OTP_LENGTH;
  const canResend = timeLeft === 0;

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

  const handleResend = useCallback(() => {
    setOtp('');
    setTimeLeft(TIMER_SECONDS);
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
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900">
        <div className="absolute -top-24 -right-24 rounded-full opacity-10 w-80 h-80 bg-white" />
        <div className="absolute -bottom-16 -left-16 rounded-full opacity-10 w-72 h-72 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 bg-white w-[500px] h-[500px]" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-white/20 shadow-md w-11 h-11">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Health Telematix</p>
              <p className="text-white/60 text-xs font-medium">Clinic Admin Portal</p>
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-center">
            <div className="pb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold bg-white/15 text-white">
                <span className="inline-block rounded-full w-1.5 h-1.5 bg-emerald-400" />
                HIPAA Compliant Platform
              </div>
              <h1 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-snug mb-4">
                Intelligent Care Management for
                <br />
                <span className="text-teal-200">Modern Clinics</span>
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
                  <div className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 w-8 h-8 bg-white/15 text-white">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-2xl p-5 bg-white/10 border border-white/15">
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

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[530px]">
          <div className="inline-flex items-center justify-center rounded-2xl mb-6 w-14 h-14 bg-primary/10 border border-primary/20">
            <Mail size={24} className="text-primary" />
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-foreground text-2xl tracking-tight mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a 6-digit verification code to{' '}
              <span className="font-semibold text-foreground" data-phi>
                sarah.mitchell@sunrisecare.com
              </span>
              . Enter the code below to verify your email address.
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground mb-3">Verification Code</p>
            <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp} containerClassName="gap-3">
              <InputOTPGroup className="gap-3">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-16 w-full rounded-xl text-xl font-bold border-2 first:rounded-xl first:border-l-2 last:rounded-xl"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex items-center gap-1.5 mb-8 min-h-6">
            {canResend ? (
              <>
                <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary p-0 h-auto"
                >
                  <RotateCcw size={13} />
                  Resend code
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Resend code in</p>
                <span className="text-sm font-semibold tabular-nums text-primary">{formatTime(timeLeft)}</span>
              </>
            )}
          </div>

          <Button
            type="button"
            disabled={!isComplete || isVerifying}
            onClick={handleVerify}
            className="w-full h-11 text-sm font-semibold"
          >
            {isVerifying ? (
              <>
                <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
                Validating…
              </>
            ) : (
              <>
                Validate &amp; Set Password
                <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
