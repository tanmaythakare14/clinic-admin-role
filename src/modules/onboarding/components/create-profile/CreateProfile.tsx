import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight, Camera, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH } from '../../constants';

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

  async function onSubmit(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    toast.success('Profile saved!');
    navigate(REVIEW_USERS_PATH);
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-12 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[530px]">
          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 0;
              const isCompleted = false;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center min-w-0">
                    <div
                      className={`flex items-center justify-center rounded-full flex-shrink-0 w-8 h-8 border-2 transition-all ${
                        isCompleted || isActive ? 'bg-primary border-primary' : 'bg-muted border-border'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                      ) : (
                        <span
                          className={`text-xs font-bold ${isActive || isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-1.5 text-center max-w-[90px] leading-snug ${
                        isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && <div className="flex-1 mx-2 h-0.5 mb-[22px] rounded-sm bg-border" />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mb-7">
            <h2 className="font-bold text-foreground text-2xl tracking-tight mb-1.5">Create your profile</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Review your account details and add the finishing touches to complete your admin profile.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Avatar upload */}
              <div className="space-y-1.5">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden w-[72px] h-[72px] border-2 transition-colors hover:border-primary ${
                      avatarSrc ? 'border-primary' : 'border-dashed border-border bg-muted'
                    }`}
                    aria-label="Upload profile picture"
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-muted-foreground leading-none">+</span>
                    )}
                  </button>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">Upload Profile Picture</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Camera size={12} />
                      {avatarSrc ? 'Change' : 'Upload'}
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Admin Name — disabled */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-name">Admin Name</Label>
                <Input
                  id="admin-name"
                  value={MOCK_ADMIN.name}
                  disabled
                  className="h-11 text-sm bg-muted cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Name is pre-filled from your invitation and cannot be changed.
                </p>
              </div>

              {/* Email — disabled */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  value={MOCK_ADMIN.email}
                  disabled
                  className="h-11 text-sm bg-muted cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Email is linked to your invitation and cannot be changed.
                </p>
              </div>

              {/* Phone — editable */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        className="h-11 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-1">
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-semibold">
                  {isSubmitting ? (
                    <>
                      <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
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
