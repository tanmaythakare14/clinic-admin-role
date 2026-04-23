import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
              <p className="text-white/70 text-base leading-relaxed max-w-xl">
                Streamline patient care, manage your team, and monitor health outcomes all in one secure platform.
              </p>
            </div>

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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[530px]">
          <div className="mb-7">
            <h2 className="font-bold text-foreground text-[22px] tracking-tight mb-2">
              You've Been Invited to Join a Clinic on Health Telematix
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account has been created by the Super Admin. Please review the details below and verify your email
              address to activate your access.
            </p>
          </div>

          {/* Clinic Details Card */}
          <Card className="mb-4 rounded-xl shadow-none">
            <CardHeader className="border-b py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Clinic Details</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg flex-shrink-0 text-sm font-bold w-9 h-9 bg-primary/10 text-primary border border-primary/20">
                    SC
                  </div>
                  <span className="text-sm font-semibold text-foreground">Sunrise Care Clinic</span>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  SCC-NE-01
                </span>
              </div>

              <div className="divide-y divide-border">
                {[
                  { label: 'Clinic Email Address', value: 'admin@sunrisecare.com', phi: true },
                  { label: 'Clinic Phone Number', value: '+1 (312) 555-0192', phi: true },
                  { label: 'Address', value: '4820 W Fullerton Ave, Suite 210, Chicago, IL 60639' },
                  { label: 'NPI Number', value: '1234567890' },
                  { label: 'TIN Number', value: '98-7654321' },
                ].map((row) => (
                  <div key={row.label} className="px-4 py-2.5 flex items-start justify-between gap-4">
                    <span className="text-xs flex-shrink-0 text-muted-foreground min-w-[130px]">{row.label}</span>
                    <span
                      className="text-xs font-medium text-right text-foreground"
                      {...(row.phi ? { 'data-phi': true } : {})}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Account Card */}
          <Card className="mb-6 rounded-xl shadow-none">
            <CardHeader className="border-b py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your Account Information
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="px-4 py-3">
                  <p className="text-xs mb-1 text-muted-foreground">Full Name</p>
                  <p className="text-sm font-semibold text-foreground" data-phi>
                    Sarah Mitchell
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs mb-1 text-muted-foreground">Assigned Role</p>
                  <p className="text-sm font-semibold text-foreground">Clinic Admin</p>
                </div>
                <div className="px-4 py-3 col-span-2 border-t border-border">
                  <p className="text-xs mb-1 text-muted-foreground">Email Address</p>
                  <p className="text-sm font-medium text-foreground" data-phi>
                    sarah.mitchell@sunrisecare.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 cursor-pointer mb-5">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer font-normal">
              I agree to the{' '}
              <Button
                type="button"
                variant="link"
                className="font-medium text-primary p-0 h-auto underline underline-offset-2"
              >
                Terms &amp; Privacy Policy
              </Button>
            </Label>
          </div>

          <Button
            type="button"
            disabled={!agreedToTerms || isLoading}
            onClick={onVerifyEmail}
            className="w-full h-11 text-sm font-semibold"
          >
            {isLoading ? (
              <>
                <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
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
