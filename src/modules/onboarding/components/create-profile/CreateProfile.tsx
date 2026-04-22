import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight, Camera, UserCircle2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH } from '../../constants';

const TEAL = '#0D9488';
const FF = 'Inter, system-ui, sans-serif';

/* ── Stepper config ── */
const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: null },
  { label: 'Review EHR Details', path: null },
];

const createProfileSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+\d\s\-().]+$/, 'Enter a valid phone number'),
});

type CreateProfileFormValues = z.infer<typeof createProfileSchema>;

/* Mocked pre-filled admin data (would come from Redux / route state in production) */
const MOCK_ADMIN = {
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@greenvalleyclinic.com',
};

export function CreateProfile(): React.JSX.Element {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: { phone: '' },
    mode: 'onChange',
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  }

  async function onSubmit(values: CreateProfileFormValues): Promise<void> {
    console.log(values); // temporary (or API call later)

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    toast.success('Profile saved!');
    navigate(REVIEW_USERS_PATH);
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

      {/* ── Right Panel ── */}
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
          {/* ── Stepper ── */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 0;
              const isCompleted = false;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                    {/* Circle */}
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        background: isCompleted ? TEAL : isActive ? TEAL : '#E2E8F0',
                        border: isActive
                          ? `2px solid ${TEAL}`
                          : isCompleted
                            ? `2px solid ${TEAL}`
                            : '2px solid #CBD5E1',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isCompleted ? (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      ) : (
                        <span
                          className="text-xs font-bold"
                          style={{ color: isActive || isCompleted ? '#fff' : '#94A3B8' }}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className="text-xs font-medium mt-1.5 text-center"
                      style={{
                        color: isActive ? TEAL : isCompleted ? TEAL : '#94A3B8',
                        maxWidth: 90,
                        lineHeight: '1.3',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div
                      className="flex-1 mx-2"
                      style={{
                        height: 2,
                        background: '#E2E8F0',
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
          <div className="mb-7">
            <div
              className="inline-flex items-center justify-center rounded-2xl mb-4"
              style={{ width: 52, height: 52, background: '#F0FDFA', border: '1px solid #99f6e4' }}
            >
              <UserCircle2 size={24} style={{ color: TEAL }} />
            </div>
            <h2 className="font-bold text-[#0F172A] mb-1.5" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
              Create your profile
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              Review your account details and add the finishing touches to complete your admin profile.
            </p>
          </div>

          {/* ── Form ── */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Avatar upload */}
              <div
                className="flex flex-col items-center gap-3 py-5 rounded-2xl"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <div className="relative">
                  <div
                    className="rounded-full overflow-hidden flex items-center justify-center"
                    style={{ width: 88, height: 88, background: '#E2E8F0', border: `3px solid ${TEAL}` }}
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 size={52} color="#94A3B8" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 28,
                      height: 28,
                      background: TEAL,
                      border: '2px solid #FAFAF9',
                      cursor: 'pointer',
                    }}
                    aria-label="Upload profile picture"
                  >
                    <Camera size={13} color="#fff" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: '#374151' }}>
                    Profile Photo
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    JPG, PNG or GIF · Max 5 MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  style={{ color: TEAL, background: '#F0FDFA', border: `1px solid #99f6e4` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#ccfbf1')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F0FDFA')}
                >
                  {avatarSrc ? 'Change Photo' : 'Upload Photo'}
                </button>
              </div>

              {/* Admin Name — disabled */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Admin Name
                </label>
                <div className="relative">
                  <Input
                    value={MOCK_ADMIN.name}
                    disabled
                    className="h-11 text-sm"
                    style={{
                      borderColor: '#E2E8F0',
                      borderRadius: 9,
                      background: '#F1F5F9',
                      color: '#64748B',
                      cursor: 'not-allowed',
                    }}
                    readOnly
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  Name is pre-filled from your invitation and cannot be changed.
                </p>
              </div>

              {/* Email — disabled */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
                  Email Address
                </label>
                <Input
                  value={MOCK_ADMIN.email}
                  disabled
                  className="h-11 text-sm"
                  style={{
                    borderColor: '#E2E8F0',
                    borderRadius: 9,
                    background: '#F1F5F9',
                    color: '#64748B',
                    cursor: 'not-allowed',
                  }}
                  readOnly
                />
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  Email is linked to your invitation and cannot be changed.
                </p>
              </div>

              {/* Phone — editable */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold" style={{ color: '#374151' }}>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        className="h-11 text-sm"
                        style={{ borderColor: '#E2E8F0', borderRadius: 9, color: '#0F172A' }}
                        {...field}
                      />
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
                      Saving profile…
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
