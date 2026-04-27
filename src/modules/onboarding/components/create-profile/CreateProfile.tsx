import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Camera, Check } from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
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
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
});

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

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
      <OnboardingLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[768px]">
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
                      className={`text-xs font-medium mt-1.5 text-center whitespace-nowrap leading-snug ${
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

              {/* Admin Name + Email — disabled, side by side */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Phone — editable */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex h-11 rounded-lg border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                        <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm text-foreground font-medium select-none shrink-0">
                          🇺🇸 <span className="text-muted-foreground">+1</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          autoComplete="tel"
                          className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                          value={field.value}
                          onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-1 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="h-11 px-6 text-sm font-semibold">
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
