import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ChevronDown, ChevronUp, Send, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AddUserFormValues, UserType } from '../../@types';

// ─── Constants ────────────────────────────────────────────────────────────────

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

const addUserSchema = z.object({
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
  type: z.enum(['PHYSICIAN', 'NURSE', 'DHN']),
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<AddUserFormValues>;
  mode?: 'add' | 'edit';
  onSubmit: (values: AddUserFormValues, sendInvite: boolean) => void;
}

// ─── Searchable Select ────────────────────────────────────────────────────────

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
  /** When true the search input is hidden — good for short lists */
  searchable?: boolean;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  searchable = true,
}: SearchableSelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
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

  // Keep dropdown position in sync while open
  useEffect(() => {
    if (!open) return;
    function update() {
      if (containerRef.current) setTriggerRect(containerRef.current.getBoundingClientRect());
    }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const filtered = searchable ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase())) : options;

  function handleOpen() {
    if (disabled) return;
    if (!open && containerRef.current) {
      setTriggerRect(containerRef.current.getBoundingClientRect());
    }
    setOpen((prev) => !prev);
    if (!open) setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(opt: string) {
    onChange(opt);
    setOpen(false);
    setQuery('');
  }

  const dropdownPanel =
    open && !disabled && triggerRect
      ? ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: triggerRect.bottom + 6,
              left: triggerRect.left,
              width: triggerRect.width,
              zIndex: 9999,
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
          >
            <ul
              className={cn(
                'py-1.5',
                options.length > 6 && 'max-h-[220px] overflow-y-auto',
                '[&::-webkit-scrollbar]:w-[5px]',
                '[&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-thumb]:bg-slate-200',
                'hover:[&::-webkit-scrollbar-thumb]:bg-slate-300'
              )}
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-[13px] text-muted-foreground text-center">No matches found</li>
              ) : (
                filtered.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt)}
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
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        onClick={handleOpen}
        className={cn(
          'flex items-center h-9 rounded-md border border-input bg-background pl-3 pr-9 cursor-pointer select-none',
          disabled && 'bg-muted cursor-not-allowed opacity-60',
          open && 'ring-2 ring-ring ring-offset-1 border-ring'
        )}
      >
        {searchable ? (
          <input
            ref={inputRef}
            value={open ? query : value}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder={value ? '' : placeholder}
            disabled={disabled}
            readOnly={disabled}
            className={cn(
              'flex-1 bg-transparent outline-none text-[13px] min-w-0',
              !value && !open && 'text-muted-foreground',
              disabled && 'cursor-not-allowed'
            )}
            onClick={(e) => {
              if (!disabled) {
                e.stopPropagation();
                if (!open && containerRef.current) {
                  setTriggerRect(containerRef.current.getBoundingClientRect());
                }
                setOpen(true);
              }
            }}
          />
        ) : (
          <span className={cn('flex-1 text-[13px] truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
        )}
        <span className="absolute right-3 pointer-events-none text-muted-foreground">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {dropdownPanel}
    </div>
  );
}

// ─── Prefix inline dropdown ───────────────────────────────────────────────────

function PrefixDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Keep dropdown position in sync while open
  useEffect(() => {
    if (!open) return;
    function update() {
      if (containerRef.current) setTriggerRect(containerRef.current.getBoundingClientRect());
    }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  function handleToggle() {
    if (!open && containerRef.current) {
      setTriggerRect(containerRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  }

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
  }

  const dropdownPanel =
    open && triggerRect
      ? ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: triggerRect.bottom + 6,
              left: triggerRect.left,
              width: 60,
              zIndex: 9999,
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.10)] py-1.5"
          >
            {PREFIX_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full text-center px-2 py-2 text-[12.5px] transition-colors duration-100',
                  value === item ? 'bg-primary/5 text-primary font-semibold' : 'text-foreground hover:bg-slate-50'
                )}
              >
                {item}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center shrink-0 w-[60px] self-stretch border-r border-border bg-muted rounded-l-md"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1 pl-2 pr-1 h-full w-full text-[12.5px] font-medium text-foreground hover:bg-slate-100 rounded-l-md transition-colors"
      >
        <span className="flex-1 text-center">{value}</span>
        <ChevronDown
          size={10}
          className={cn('text-muted-foreground transition-transform duration-150 shrink-0', open && 'rotate-180')}
        />
      </button>

      {dropdownPanel}
    </div>
  );
}

// ─── NPI status badge ─────────────────────────────────────────────────────────

function NpiStatusBadge({ status }: { status: NpiStatus }): React.JSX.Element | null {
  if (status === 'idle') return null;
  if (status === 'verifying')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Loader2 size={11} className="animate-spin" /> Verifying…
      </span>
    );
  if (status === 'verified')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
        <CheckCircle2 size={12} /> NPI Verified
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
      <XCircle size={12} /> NPI Not Found
    </span>
  );
}

// ─── Success view ─────────────────────────────────────────────────────────────

function SuccessView({ email }: { email: string }): React.JSX.Element {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function AddUserDialog({
  open,
  onOpenChange,
  defaultValues,
  mode = 'add',
  onSubmit,
}: AddUserDialogProps): React.JSX.Element {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      prefix: 'MD',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      npiNumber: '',
      type: 'PHYSICIAN' as UserType,
      ...defaultValues,
    },
  });

  const [invitedEmail, setInvitedEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
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

  useEffect(() => {
    if (!open) {
      setShowSuccess(false);
      setInvitedEmail('');
      setNpiStatus('idle');
      form.reset();
    }
  }, [open, form]);

  function handleSubmit(values: AddUserFormValues): void {
    onSubmit(values, true);
    if (mode === 'add') {
      setInvitedEmail(values.email);
      setShowSuccess(true);
      setNpiStatus('idle');
      form.reset();
    } else {
      onOpenChange(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
        {showSuccess ? (
          <SuccessView email={invitedEmail} />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
              <DialogTitle className="text-[14px] font-bold">
                {isEdit ? 'Edit Physician Details' : 'Add New Physician'}
              </DialogTitle>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {isEdit
                  ? "Update the physician's profile information below."
                  : 'Fill in the details below to invite a new physician to the portal.'}
              </p>
            </DialogHeader>

            {/* Body */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="px-6 py-5 space-y-4">
                  {/* Name row — [Prefix + First Name compound] | [Last Name] */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Prefix + First Name compound field */}
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

                    {/* Last Name */}
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
                              placeholder="e.g. sarah.mitchell@clinic.com"
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
                              <div className="inline-flex items-center justify-center gap-1 px-3 bg-muted border-r border-border select-none shrink-0 h-full">
                                <span className="text-[13px] leading-none">🇺🇸</span>
                                <span className="text-[12px] font-medium text-muted-foreground leading-none">+1</span>
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
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-6 text-[13px]"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-6 text-[13px] gap-2 shadow-[0_4px_14px_rgba(13,148,136,0.22)]"
                  >
                    {isEdit ? (
                      'Save Changes'
                    ) : (
                      <>
                        <Send size={13} /> Send Invite
                      </>
                    )}
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
