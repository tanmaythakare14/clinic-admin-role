import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH } from '../../constants';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: REVIEW_USERS_PATH },
  { label: 'Review EHR Details', path: null },
];

type UserRole = 'Physician' | 'Nurse' | 'Digital Health Navigator';

interface ClinicUser {
  id: string;
  prefix?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  addedBy: 'Super Admin' | 'Clinic Admin';
  specialty?: string;
  npi?: string;
}

const INITIAL_USERS: ClinicUser[] = [
  {
    id: '1',
    firstName: 'Dr. James',
    lastName: 'Hartwell',
    email: 'j.hartwell@greenvalley.com',
    phone: '+1 (555) 201-4433',
    role: 'Physician',
    addedBy: 'Super Admin',
    specialty: 'Cardiology',
    npi: '1234567890',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Chen',
    email: 'm.chen@greenvalley.com',
    phone: '+1 (555) 308-7712',
    role: 'Nurse',
    addedBy: 'Super Admin',
  },
  {
    id: '3',
    firstName: 'Dr. Priya',
    lastName: 'Nair',
    email: 'p.nair@greenvalley.com',
    phone: '+1 (555) 412-9900',
    role: 'Physician',
    addedBy: 'Super Admin',
    specialty: 'Internal Medicine',
    npi: '9876543210',
  },
  {
    id: '4',
    firstName: 'Ethan',
    lastName: 'Brooks',
    email: 'e.brooks@greenvalley.com',
    phone: '+1 (555) 519-0045',
    role: 'Digital Health Navigator',
    addedBy: 'Super Admin',
  },
];

// ─── Prefix options ───────────────────────────────────────────────────────────

const PREFIX_OPTIONS = ['MD', 'MBBS', 'DO', 'DDS', 'PhD', 'NP', 'PA', 'RN'] as const;

// ─── Phone formatter ──────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Mock NPI registry ────────────────────────────────────────────────────────

const VERIFIED_NPIS = new Set([
  '1234567890',
  '2345678901',
  '3456789012',
  '4567890123',
  '5678901234',
  '6789012345',
  '7890123456',
  '8901234567',
  '9012345678',
  '0123456789',
]);

type NpiStatus = 'idle' | 'verifying' | 'verified' | 'not-found';

// ─── Specialty options ────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Geriatrics',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const physicianSchema = z.object({
  prefix: z.enum(['MD', 'MBBS', 'DO', 'DDS', 'PhD', 'NP', 'PA', 'RN']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
  specialty: z.string().min(1, 'Select a specialty'),
  npiNumber: z
    .string()
    .min(10, 'NPI must be 10 digits')
    .max(10, 'NPI must be 10 digits')
    .regex(/^\d+$/, 'NPI must contain only digits'),
});
type PhysicianFormValues = z.infer<typeof physicianSchema>;

// ─── Searchable Select ────────────────────────────────────────────────────────

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder: string;
  error?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => {
          setOpen((p) => !p);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center h-9 rounded-md border bg-background pl-3 pr-9 cursor-pointer select-none',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1 border-ring'
        )}
      >
        <input
          ref={inputRef}
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={value ? '' : placeholder}
          className={cn(
            'flex-1 bg-transparent outline-none text-[13px] min-w-0',
            !value && !open && 'text-muted-foreground'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
        <span className="absolute right-3 pointer-events-none text-muted-foreground">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.10)]">
          <ul className="py-1.5 max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-muted-foreground text-center">No matches found</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-[13px] transition-colors duration-100',
                      value === opt ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground hover:bg-slate-50'
                    )}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Prefix Dropdown ──────────────────────────────────────────────────────────

function PrefixDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center shrink-0 w-[60px] self-stretch border-r border-border bg-muted rounded-l-md"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 pl-2 pr-1 h-full w-full text-[12.5px] font-medium text-foreground hover:bg-slate-100 rounded-l-md transition-colors"
      >
        <span className="flex-1 text-center">{value}</span>
        <ChevronDown
          size={10}
          className={cn('text-muted-foreground transition-transform duration-150 shrink-0', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-[60px] bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.10)] py-1.5">
          {PREFIX_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className={cn(
                'w-full text-center px-2 py-2 text-[12.5px] transition-colors duration-100',
                value === item ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground hover:bg-slate-50'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NPI status badge ─────────────────────────────────────────────────────────

function NpiStatusBadge({ status }: { status: NpiStatus }): React.JSX.Element | null {
  if (status === 'idle') return null;
  if (status === 'verifying')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Loader2 size={11} className="animate-spin" />
        Verifying…
      </span>
    );
  if (status === 'verified')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
        <CheckCircle2 size={12} />
        NPI Verified
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
      <XCircle size={12} />
      NPI Not Found
    </span>
  );
}

// ─── Success view ─────────────────────────────────────────────────────────────

function AddSuccessView({ email }: { email: string }): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-8 px-6 gap-4">
      <div className="relative flex items-center justify-center w-20 h-20">
        <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
        <span
          className="absolute inset-[-6px] rounded-full border-2 border-emerald-200 transition-opacity duration-700"
          style={{ opacity: mounted ? 0.5 : 0 }}
        />
        <div
          className="relative w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          style={{ transform: mounted ? 'scale(1)' : 'scale(0.4)', opacity: mounted ? 1 : 0 }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M9 18.5l6.5 6.5 11.5-13"
              stroke="#10b981"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="36"
              strokeDashoffset={mounted ? 0 : 36}
              style={{ transition: 'stroke-dashoffset 0.45s ease 0.25s' }}
            />
          </svg>
        </div>
      </div>
      <div
        className="space-y-1.5 transition-[transform,opacity] duration-500"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transitionDelay: '0.2s',
        }}
      >
        <h3 className="text-[17px] font-bold text-foreground">Invite Sent Successfully!</h3>
        <p className="text-[13px] text-muted-foreground max-w-[340px] leading-relaxed">
          An invitation email has been sent to{' '}
          <span className="font-semibold text-foreground" data-phi="true">
            {email}
          </span>
          . They can use the link to set up their account.
        </p>
      </div>
    </div>
  );
}

// ─── Add Physician Modal ──────────────────────────────────────────────────────

function AddPhysicianModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (user: ClinicUser) => void;
}): React.JSX.Element {
  const form = useForm<PhysicianFormValues>({
    resolver: zodResolver(physicianSchema),
    defaultValues: { prefix: 'MD', firstName: '', lastName: '', email: '', phone: '', specialty: '', npiNumber: '' },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [npiStatus, setNpiStatus] = useState<NpiStatus>('idle');
  const npiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const npiValue = useWatch({ control: form.control, name: 'npiNumber' });

  useEffect(() => {
    if (npiTimerRef.current) clearTimeout(npiTimerRef.current);
    const digits = npiValue?.replace(/\D/g, '') ?? '';
    if (digits.length !== 10) {
      setNpiStatus('idle');
      return;
    }
    setNpiStatus('verifying');
    npiTimerRef.current = setTimeout(() => {
      setNpiStatus(VERIFIED_NPIS.has(digits) ? 'verified' : 'not-found');
    }, 1400);
    return () => {
      if (npiTimerRef.current) clearTimeout(npiTimerRef.current);
    };
  }, [npiValue]);

  function handleSubmit(values: PhysicianFormValues): void {
    const newUser: ClinicUser = {
      id: `ca-${Date.now()}`,
      prefix: values.prefix,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      role: 'Physician',
      addedBy: 'Clinic Admin',
      specialty: values.specialty,
      npi: values.npiNumber,
    };
    onAdd(newUser);
    setInvitedEmail(values.email);
    setShowSuccess(true);
    toast.success(`Invite sent to ${values.email}`);
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-0 gap-0">
        {showSuccess ? (
          <AddSuccessView email={invitedEmail} />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
              <DialogTitle className="text-[14px] font-bold">Add New Physician</DialogTitle>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Fill in the details below to invite a new physician to the portal.
              </p>
            </DialogHeader>

            {/* Body */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="px-6 py-5 space-y-4">
                  {/* Name row — Prefix + First Name | Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field: firstField }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">First Name</FormLabel>
                          <FormControl>
                            <div className="flex h-9 rounded-md border border-input bg-background overflow-visible transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                              <Controller
                                control={form.control}
                                name="prefix"
                                render={({ field: prefixField }) => (
                                  <PrefixDropdown value={prefixField.value} onChange={prefixField.onChange} />
                                )}
                              />
                              <input
                                type="text"
                                placeholder="First name"
                                autoComplete="given-name"
                                className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
                                value={firstField.value}
                                onChange={firstField.onChange}
                                onBlur={firstField.onBlur}
                                name={firstField.name}
                                ref={firstField.ref}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="e.g. james.hartwell@clinic.com"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Phone Number</FormLabel>
                          <FormControl>
                            <div className="flex h-9 rounded-md border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                              <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm font-medium select-none shrink-0">
                                🇺🇸 <span className="text-muted-foreground text-[12px]">+1</span>
                              </div>
                              <input
                                type="tel"
                                placeholder="(555) 000-0000"
                                autoComplete="tel"
                                data-phi="true"
                                className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                                value={field.value}
                                onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* NPI + Specialty */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="npiNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[12px]">NPI Number</FormLabel>
                            <NpiStatusBadge status={npiStatus} />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="10-digit NPI"
                              maxLength={10}
                              className={cn(
                                'h-9 text-sm',
                                npiStatus === 'verified' && 'border-emerald-400 focus-visible:ring-emerald-300',
                                npiStatus === 'not-found' && 'border-rose-400 focus-visible:ring-rose-300'
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="specialty"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Specialty</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={SPECIALTY_OPTIONS}
                              placeholder="Select a specialty"
                              error={!!fieldState.error}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-[11px] text-destructive">{fieldState.error.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
                  <Button type="button" variant="outline" className="h-9 px-6 text-[13px]" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-6 text-[13px] gap-2 shadow-[0_4px_14px_rgba(13,148,136,0.22)]"
                  >
                    <Send size={13} /> Send Invite
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Physician Modal ─────────────────────────────────────────────────────

function EditPhysicianModal({
  user,
  onClose,
  onSave,
}: {
  user: ClinicUser;
  onClose: () => void;
  onSave: (updated: ClinicUser) => void;
}): React.JSX.Element {
  const form = useForm<PhysicianFormValues>({
    resolver: zodResolver(physicianSchema),
    defaultValues: {
      prefix: (user.prefix as PhysicianFormValues['prefix']) ?? 'MD',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      specialty: user.specialty ?? '',
      npiNumber: user.npi ?? '',
    },
  });

  const [npiStatus, setNpiStatus] = useState<NpiStatus>('idle');
  const npiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const npiValue = useWatch({ control: form.control, name: 'npiNumber' });

  useEffect(() => {
    if (npiTimerRef.current) clearTimeout(npiTimerRef.current);
    const digits = npiValue?.replace(/\D/g, '') ?? '';
    if (digits.length !== 10) {
      setNpiStatus('idle');
      return;
    }
    setNpiStatus('verifying');
    npiTimerRef.current = setTimeout(() => {
      setNpiStatus(VERIFIED_NPIS.has(digits) ? 'verified' : 'not-found');
    }, 1400);
    return () => {
      if (npiTimerRef.current) clearTimeout(npiTimerRef.current);
    };
  }, [npiValue]);

  function handleSubmit(values: PhysicianFormValues): void {
    onSave({
      ...user,
      prefix: values.prefix,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      specialty: values.specialty,
      npi: values.npiNumber,
    });
    toast.success('Physician updated successfully!');
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-[14px] font-bold">Edit Physician Details</DialogTitle>
          <p className="text-[12px] text-muted-foreground mt-0.5">Update the physician's profile information below.</p>
        </DialogHeader>

        {/* Body */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field: firstField }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">First Name</FormLabel>
                      <FormControl>
                        <div className="flex h-9 rounded-md border border-input bg-background overflow-visible transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                          <Controller
                            control={form.control}
                            name="prefix"
                            render={({ field: prefixField }) => (
                              <PrefixDropdown value={prefixField.value} onChange={prefixField.onChange} />
                            )}
                          />
                          <input
                            type="text"
                            placeholder="First name"
                            className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
                            value={firstField.value}
                            onChange={firstField.onChange}
                            onBlur={firstField.onBlur}
                            name={firstField.name}
                            ref={firstField.ref}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" className="h-9 text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" className="h-9 text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex h-9 rounded-md border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
                          <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm font-medium select-none shrink-0">
                            🇺🇸 <span className="text-muted-foreground text-[12px]">+1</span>
                          </div>
                          <input
                            type="tel"
                            placeholder="(555) 000-0000"
                            autoComplete="tel"
                            data-phi="true"
                            className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            value={field.value}
                            onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* NPI + Specialty */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="npiNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[12px]">NPI Number</FormLabel>
                        <NpiStatusBadge status={npiStatus} />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="10-digit NPI"
                          maxLength={10}
                          className={cn(
                            'h-9 text-sm',
                            npiStatus === 'verified' && 'border-emerald-400 focus-visible:ring-emerald-300',
                            npiStatus === 'not-found' && 'border-rose-400 focus-visible:ring-rose-300'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="specialty"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Specialty</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={SPECIALTY_OPTIONS}
                          placeholder="Select a specialty"
                          error={!!fieldState.error}
                        />
                      </FormControl>
                      {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <Button type="button" variant="outline" className="h-9 px-6 text-[13px]" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="h-9 px-6 text-[13px] shadow-[0_4px_14px_rgba(13,148,136,0.22)]">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewUsers(): React.JSX.Element {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ClinicUser[]>(INITIAL_USERS);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<ClinicUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAdd(user: ClinicUser): void {
    setUsers((prev) => [user, ...prev]);
  }

  function handleSave(updated: ClinicUser): void {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleRemove(id: string): void {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('Physician removed.');
  }

  async function handleContinue(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    navigate(REVIEW_EHR_PATH);
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

        <div className="w-full max-w-5xl">
          {/* Stepper */}
          <div className="flex items-center mb-10">
            {STEPS.map((step, idx) => {
              const isActive = idx === 1;
              const isCompleted = idx === 0;
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
                          className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-1.5 text-center whitespace-nowrap leading-snug ${
                        isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 mx-2 h-0.5 mb-[22px] rounded-sm ${idx === 0 ? 'bg-primary' : 'bg-border'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="font-bold text-foreground text-[22px] tracking-tight">Review Assigned Users</h2>
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5">
                  {users.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Users below were assigned to your clinic by the Super Admin.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 gap-1.5 h-10 px-4 text-sm font-semibold whitespace-nowrap"
            >
              <Plus size={15} />
              Add Physician
            </Button>
          </div>

          {/* Table — scrollable after ~6 rows */}
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
            <div className="overflow-y-auto max-h-[420px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      User
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email Address
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Phone Number
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Specialty / NPI
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Added By
                    </TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => {
                    const isClinicAdminUser = user.addedBy === 'Clinic Admin';
                    return (
                      <TableRow
                        key={user.id}
                        className={`border-border transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center rounded-full flex-shrink-0 w-8 h-8 bg-primary/10 text-primary text-xs font-bold">
                              {user.firstName.charAt(user.firstName.lastIndexOf(' ') + 1)}
                              {user.lastName.charAt(0)}
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]" data-phi>
                            {user.email}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs text-muted-foreground" data-phi>
                            {user.phone}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-foreground">{user.role}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          {user.specialty ? (
                            <>
                              <p className="text-xs font-medium text-foreground">{user.specialty}</p>
                              {user.npi && <p className="text-xs text-muted-foreground mt-0.5">NPI: {user.npi}</p>}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            className={`text-xs font-medium ${isClinicAdminUser ? 'text-primary' : 'text-muted-foreground'}`}
                          >
                            {user.addedBy}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          {isClinicAdminUser && (
                            <div className="flex items-center justify-end gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEditUser(user)}
                                aria-label="Edit physician"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                              >
                                <Pencil size={13} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemove(user.id)}
                                aria-label="Remove physician"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Table footer — user count */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {users.length} {users.length === 1 ? 'user' : 'users'} assigned to your clinic
              </p>
            </div>
          </div>

          {/* Support notice */}
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
            <AlertCircle size={15} className="text-primary shrink-0" />
            <p className="flex-1 text-xs text-foreground leading-relaxed">
              <span className="font-semibold">Need to make changes?</span> Contact Super Admin Support for any
              modification requests to assigned users.
            </p>
            <Button type="button" variant="outline" size="xs" className="shrink-0 text-xs whitespace-nowrap">
              Contact Super Admin
            </Button>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(CREATE_PROFILE_PATH)}
              className="h-11 px-5 text-sm font-semibold"
            >
              ← Back
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleContinue}
              className="h-11 px-6 text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
                  Loading…
                </>
              ) : (
                <>
                  Continue & Proceed
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showAdd && <AddPhysicianModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editUser && <EditPhysicianModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />}
    </div>
  );
}
