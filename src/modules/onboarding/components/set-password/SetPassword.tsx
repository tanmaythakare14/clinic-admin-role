import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CREATE_PROFILE_PATH, SIGN_IN_PATH } from '../../constants';

const TEAL = '#0D9488';
const FF = 'Inter, system-ui, sans-serif';

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

function getStrength(password: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
  if (passed <= 3) return { score: 2, label: 'Fair', color: '#F59E0B' };
  if (passed === 4) return { score: 3, label: 'Good', color: '#0D9488' };
  return { score: 4, label: 'Strong', color: '#059669' };
}

export function SetPassword(): React.JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const watchedPassword = form.watch('password');
  const strength = watchedPassword ? getStrength(watchedPassword) : null;

  async function onSubmit(values: SetPasswordFormValues): Promise<void> {
    console.log(values); // or send to API

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    toast.success('Password set successfully!');
    navigate(CREATE_PROFILE_PATH);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: FF }}>
      {/* ── Left Panel — Branding ── */}
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

      {/* ── Right Panel — Set Password ── */}
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
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-6"
            style={{ width: 56, height: 56, background: '#F0FDFA', border: '1px solid #99f6e4' }}
          >
            <KeyRound size={24} style={{ color: TEAL }} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
              Set your password
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              Create a strong password to secure your Clinic Admin account. You'll use this to sign in going forward.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold" style={{ color: '#374151' }}>
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          autoComplete="new-password"
                          className="h-11 text-sm pr-10"
                          style={{ borderColor: '#E2E8F0', borderRadius: 9, color: '#0F172A' }}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: '#94A3B8' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>

                    {/* Strength bar — always visible */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          Password strength
                        </span>
                        {strength && (
                          <span className="text-xs font-semibold" style={{ color: strength.color }}>
                            {strength.label}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className="flex-1 rounded-full"
                            style={{
                              height: 5,
                              background: strength && level <= strength.score ? strength.color : '#E2E8F0',
                              transition: 'background 0.25s ease',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold" style={{ color: '#374151' }}>
                      Re-Enter New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                          className="h-11 text-sm pr-10"
                          style={{ borderColor: '#E2E8F0', borderRadius: 9, color: '#0F172A' }}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: '#94A3B8' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CTA */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
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
                      Setting password…
                    </>
                  ) : (
                    <>
                      Set Password
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Back link */}
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
