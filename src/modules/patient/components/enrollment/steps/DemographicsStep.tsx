import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { EnrollmentStep1Values } from '../../../@types';

// ─── Phone formatter ─────────────────────────────────────────────────────────

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mrn: z.string().min(1, 'MRN is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Enter a valid 10-digit phone number'),
  pcpName: z.string().min(1, 'Select a physician'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional().default(''),
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhysicianOption {
  id: string;
  fullName: string;
  npiNumber: string;
  specialty: string;
}

interface DemographicsStepProps {
  defaultValues?: Partial<EnrollmentStep1Values>;
  onNext: (data: EnrollmentStep1Values) => void;
  physicians: PhysicianOption[];
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// ─── Address Data ─────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Brazil',
  'Mexico',
  'Japan',
  'South Korea',
  'China',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'South Africa',
  'Nigeria',
  'Philippines',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'New Zealand',
  'Pakistan',
  'Bangladesh',
];

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const CITIES_BY_STATE: Record<string, string[]> = {
  Alabama: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa'],
  Alaska: ['Anchorage', 'Juneau', 'Fairbanks', 'Sitka', 'Ketchikan'],
  Arizona: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Tempe'],
  Arkansas: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
  California: [
    'Los Angeles',
    'San Francisco',
    'San Diego',
    'San Jose',
    'Sacramento',
    'Fresno',
    'Oakland',
    'Long Beach',
  ],
  Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'],
  Connecticut: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
  Delaware: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  'District of Columbia': ['Washington'],
  Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee', 'Naples'],
  Georgia: ['Atlanta', 'Augusta', 'Savannah', 'Athens', 'Columbus', 'Macon'],
  Hawaii: ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kaneohe'],
  Idaho: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
  Illinois: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield'],
  Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
  Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
  Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe'],
  Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
  Maine: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  Maryland: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Annapolis'],
  Massachusetts: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Quincy'],
  Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'],
  Minnesota: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'],
  Mississippi: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
  Missouri: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'],
  Montana: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
  Nebraska: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  Nevada: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
  'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover'],
  'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Camden'],
  'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
  'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'],
  'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'],
  Oregon: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Bend'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Harrisburg'],
  'Rhode Island': ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence'],
  'South Carolina': ['Columbia', 'Charleston', 'North Charleston', 'Greenville', 'Rock Hill'],
  'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington'],
  Utah: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Ogden'],
  Vermont: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
  Virginia: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington', 'Alexandria'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Olympia'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton'],
  Wyoming: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
};

// ─── Date Picker ──────────────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const today = new Date();

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !calendarRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleOpen() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors select-none',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1',
          !value && 'text-muted-foreground'
        )}
      >
        <span>{value ? format(new Date(value + 'T00:00:00'), 'MMM d, yyyy') : 'Select date of birth'}</span>
        <CalendarDays size={14} className="text-muted-foreground shrink-0" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={calendarRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
            className="rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  onChange(format(date, 'yyyy-MM-dd'));
                  setOpen(false);
                }
              }}
              disabled={{ after: today }}
              defaultMonth={selected ?? new Date(1990, 0)}
              captionLayout="dropdown"
              startMonth={new Date(1920, 0)}
              endMonth={today}
            />
          </div>,
          document.body
        )}
    </>
  );
}

// ─── Physician Select ─────────────────────────────────────────────────────────

function PhysicianSelect({
  value,
  onChange,
  physicians,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  physicians: PhysicianOption[];
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

  const filtered = physicians.filter((p) => !query || p.fullName.toLowerCase().includes(query.toLowerCase()));
  const selected = physicians.find((p) => p.fullName === value);

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center h-10 rounded-md border bg-background pl-3 pr-9 cursor-pointer relative',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1'
        )}
      >
        <input
          ref={inputRef}
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder="Select a physician"
          className="flex-1 bg-transparent outline-none text-sm min-w-0 placeholder:text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
        {selected && !open && (
          <span className="text-[10px] text-teal-600 font-mono bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded mr-8 shrink-0">
            NPI: {selected.npiNumber}
          </span>
        )}
        <span className="absolute right-3 text-muted-foreground pointer-events-none">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[12.5px] text-muted-foreground text-center">
                {physicians.length === 0 ? 'No physicians in the system yet.' : 'No matches found'}
              </li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p.fullName);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors',
                      value === p.fullName && 'bg-primary/5'
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium text-foreground">{p.fullName}</span>
                      <span className="text-[11px] text-muted-foreground">{p.specialty}</span>
                    </div>
                    <span className="text-[10px] text-teal-600 font-mono bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded shrink-0">
                      NPI: {p.npiNumber}
                    </span>
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

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 pt-3">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DemographicsStep({ defaultValues, onNext, physicians }: DemographicsStepProps): React.JSX.Element {
  const form = useForm<EnrollmentStep1Values>({
    resolver: zodResolver(schema) as Resolver<EnrollmentStep1Values>,
    defaultValues: {
      firstName: '',
      lastName: '',
      mrn: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      pcpName: '',
      zipCode: '',
      country: '',
      state: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
        <SectionLabel label="Personal Information" />

        {/* First + Last */}
        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Emma" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Rodriguez" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* MRN + DOB */}
        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="mrn"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">MRN Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. MRN-10042" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="dateOfBirth"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Date of Birth</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} error={!!fieldState.error} />
                </FormControl>
                {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />
        </div>

        {/* Gender + Email */}
        <div className="grid grid-cols-2 gap-5">
          <Controller
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Gender</FormLabel>
                <FormControl>
                  <PortalSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                    error={!!fieldState.error}
                  />
                </FormControl>
                {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g. emma@email.com" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Phone + PCP */}
        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Phone Number</FormLabel>
                <FormControl>
                  <div className="flex h-10 rounded-lg border border-input bg-background overflow-hidden transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                    <div className="flex items-center gap-1.5 px-3 bg-muted border-r border-border text-sm text-foreground font-medium select-none shrink-0">
                      🇺🇸 <span className="text-muted-foreground">+1</span>
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
          <Controller
            control={form.control}
            name="pcpName"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Primary Care Physician</FormLabel>
                <FormControl>
                  <PhysicianSelect
                    value={field.value}
                    onChange={field.onChange}
                    physicians={physicians}
                    error={!!fieldState.error}
                  />
                </FormControl>
                {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />
        </div>

        <SectionLabel label="Address" />

        {/* ZIP + Country */}
        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 60601" className="h-10 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[12.5px] font-medium">Country</FormLabel>
                <FormControl>
                  <PortalSelect
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      form.setValue('state', '', { shouldValidate: false });
                      form.setValue('city', '', { shouldValidate: false });
                    }}
                    options={COUNTRY_OPTIONS}
                    placeholder="Select country"
                    error={!!fieldState.error}
                  />
                </FormControl>
                {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />
        </div>

        {/* State + City */}
        {(() => {
          const country = form.watch('country');
          const state = form.watch('state');
          const isUSA = country === 'United States';
          const cityOptions = isUSA ? (CITIES_BY_STATE[state] ?? []) : [];

          return (
            <div className="grid grid-cols-2 gap-5">
              <Controller
                control={form.control}
                name="state"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[12.5px] font-medium">State</FormLabel>
                    <FormControl>
                      {isUSA ? (
                        <PortalSelect
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            form.setValue('city', '', { shouldValidate: false });
                          }}
                          options={US_STATES}
                          placeholder="Select state"
                          error={!!fieldState.error}
                        />
                      ) : (
                        <Input placeholder="e.g. Ontario" className="h-10 text-sm" {...field} />
                      )}
                    </FormControl>
                    {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                  </FormItem>
                )}
              />
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[12.5px] font-medium">City</FormLabel>
                    <FormControl>
                      {isUSA && cityOptions.length > 0 ? (
                        <PortalSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={cityOptions}
                          placeholder="Select city"
                          error={!!fieldState.error}
                        />
                      ) : (
                        <Input
                          placeholder={isUSA ? 'Select a state first' : 'e.g. Toronto'}
                          className="h-10 text-sm"
                          disabled={isUSA && !state}
                          {...field}
                        />
                      )}
                    </FormControl>
                    {fieldState.error && <p className="text-[11px] text-destructive">{fieldState.error.message}</p>}
                  </FormItem>
                )}
              />
            </div>
          );
        })()}

        {/* Address Line 1 */}
        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[12.5px] font-medium">Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Street address, building, suite" className="h-10 text-sm" {...field} />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* Address Line 2 */}
        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[12.5px] font-medium">
                Address Line 2<span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Apt, floor, unit, etc." className="h-10 text-sm" {...field} />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-end mt-6">
          <Button type="submit" className="px-8 h-10 gap-2 shadow-[0_4px_14px_rgba(13,148,136,0.22)]">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
