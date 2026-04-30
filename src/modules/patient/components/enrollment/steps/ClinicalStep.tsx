import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Pencil, Search, ChevronDown, X } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PortalSelect } from '../PortalSelect';
import type { DiagnosisFormItem, DiagnosisSeverity, EnrollmentStep3Values } from '../../../@types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  careTeamPhysician: z.string().min(1, 'Select a physician'),
  careTeamNurse: z.string().min(1, 'Select a registered nurse'),
  careTeamDHN: z.string().min(1, 'Select a DHN'),
});

type ClinicalFormValues = z.infer<typeof schema>;

// ─── ICD Condition Catalog ────────────────────────────────────────────────────

interface IcdEntry {
  conditionName: string;
  icdCode: string;
}

const ICD_CATALOG: IcdEntry[] = [
  { conditionName: 'Essential Hypertension', icdCode: 'I10' },
  { conditionName: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9' },
  { conditionName: 'Type 1 Diabetes Mellitus', icdCode: 'E10.9' },
  { conditionName: 'Hyperlipidemia', icdCode: 'E78.5' },
  { conditionName: 'Hypothyroidism', icdCode: 'E03.9' },
  { conditionName: 'Obesity', icdCode: 'E66.9' },
  { conditionName: 'Chronic Kidney Disease Stage 3', icdCode: 'N18.3' },
  { conditionName: 'Chronic Kidney Disease Stage 4', icdCode: 'N18.4' },
  { conditionName: 'Heart Failure', icdCode: 'I50.9' },
  { conditionName: 'Atrial Fibrillation', icdCode: 'I48.91' },
  { conditionName: 'Coronary Artery Disease', icdCode: 'I25.10' },
  { conditionName: 'Peripheral Artery Disease', icdCode: 'I73.9' },
  { conditionName: 'Stroke', icdCode: 'I63.9' },
  { conditionName: 'COPD', icdCode: 'J44.1' },
  { conditionName: 'Asthma', icdCode: 'J45.909' },
  { conditionName: 'Sleep Apnea', icdCode: 'G47.33' },
  { conditionName: 'GERD', icdCode: 'K21.9' },
  { conditionName: 'Depression', icdCode: 'F32.9' },
  { conditionName: 'Anxiety Disorder', icdCode: 'F41.9' },
  { conditionName: 'Chronic Pain', icdCode: 'G89.29' },
  { conditionName: 'Chronic Migraine', icdCode: 'G43.709' },
  { conditionName: 'Osteoarthritis', icdCode: 'M19.90' },
  { conditionName: 'Osteoporosis', icdCode: 'M81.0' },
  { conditionName: 'Rheumatoid Arthritis', icdCode: 'M06.9' },
  { conditionName: 'Anemia', icdCode: 'D64.9' },
  { conditionName: 'Chronic Liver Disease', icdCode: 'K76.9' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StaffOption {
  id: string;
  fullName: string;
  specialty: string;
}

interface ClinicalStepProps {
  defaultValues?: Partial<ClinicalFormValues>;
  defaultDiagnoses?: DiagnosisFormItem[];
  defaultProgramRPM?: boolean;
  defaultProgramACPM?: boolean;
  isEdit?: boolean;
  onBack: () => void;
  onSubmit: (data: EnrollmentStep3Values) => void;
  physicians: StaffOption[];
  nurses: StaffOption[];
  dhns: StaffOption[];
}

// ─── Severity ─────────────────────────────────────────────────────────────────

const SEVERITY_OPTIONS: DiagnosisSeverity[] = ['Mild', 'Moderate', 'Severe'];

const SEVERITY_CLASS: Record<DiagnosisSeverity, string> = {
  Mild: 'bg-teal-50 text-teal-700 border-teal-100',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
  Severe: 'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Staff Searchable Select ──────────────────────────────────────────────────

function StaffSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: StaffOption[];
  placeholder: string;
  error?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) => !query || o.fullName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center h-10 rounded-md border bg-background pl-3 pr-3 cursor-pointer relative gap-2',
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
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm min-w-0 placeholder:text-muted-foreground cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="shrink-0 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          <ul className="max-h-[160px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[12.5px] text-muted-foreground text-center">
                {options.length === 0 ? 'None available' : 'No matches'}
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.fullName);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors',
                      value === o.fullName && 'bg-primary/5'
                    )}
                  >
                    <p className="text-[13px] font-medium text-foreground">{o.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{o.specialty}</p>
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

// ─── Condition Searchable Dropdown ────────────────────────────────────────────

function ConditionSearch({
  value,
  onChange,
  onIcdChange,
  error,
}: {
  value: string;
  onChange: (name: string) => void;
  onIcdChange: (code: string) => void;
  error?: boolean;
}): React.JSX.Element {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.trim()
    ? ICD_CATALOG.filter((e) => e.conditionName.toLowerCase().includes(query.toLowerCase()))
    : ICD_CATALOG;

  function select(entry: IcdEntry) {
    setQuery(entry.conditionName);
    onChange(entry.conditionName);
    onIcdChange(entry.icdCode);
    setOpen(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    // If user types and doesn't match catalog, clear ICD
    const match = ICD_CATALOG.find((c) => c.conditionName.toLowerCase() === val.toLowerCase());
    onIcdChange(match?.icdCode ?? '');
    setOpen(true);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    onIcdChange('');
  }

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex items-center h-10 rounded-md border bg-background text-sm transition-colors',
          error ? 'border-destructive' : 'border-input',
          open && !error && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <Search size={13} className="ml-3 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onClick={() => setOpen(true)}
          placeholder="Search condition name…"
          className="flex-1 px-2.5 h-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
        {query ? (
          <button type="button" onClick={handleClear} className="mr-2 text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="mr-3 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-[300] mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground">
              No match — you can still type a custom name
            </div>
          ) : (
            <ul className="max-h-[200px] overflow-y-auto py-1">
              {filtered.map((entry) => (
                <li key={entry.icdCode}>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      select(entry);
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between gap-3',
                      value === entry.conditionName
                        ? 'bg-primary/[0.06] text-primary'
                        : 'hover:bg-slate-50 text-foreground'
                    )}
                  >
                    <span className="text-[13px] font-medium">{entry.conditionName}</span>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">{entry.icdCode}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Diagnosis Dialog ──────────────────────────────────────────────

interface DiagnosisDialogProps {
  open: boolean;
  initial?: DiagnosisFormItem;
  onSave: (d: DiagnosisFormItem) => void;
  onClose: () => void;
}

function DiagnosisDialog({ open, initial, onSave, onClose }: DiagnosisDialogProps): React.JSX.Element {
  const [conditionName, setConditionName] = useState(initial?.conditionName ?? '');
  const [icdCode, setIcdCode] = useState(initial?.icdCode ?? '');
  const [severity, setSeverity] = useState<DiagnosisSeverity | ''>(initial?.severity ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when re-opened
  useEffect(() => {
    if (open) {
      setConditionName(initial?.conditionName ?? '');
      setIcdCode(initial?.icdCode ?? '');
      setSeverity(initial?.severity ?? '');
      setErrors({});
    }
  }, [open, initial]);

  function handleSave() {
    const e: Record<string, string> = {};
    if (!conditionName.trim()) e.conditionName = 'Condition name is required';
    if (!icdCode.trim()) e.icdCode = 'ICD code is required';
    if (!severity) e.severity = 'Severity level is required';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ conditionName: conditionName.trim(), icdCode: icdCode.trim(), severity: severity as DiagnosisSeverity });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[480px] sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-7 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-[16px] font-bold">
            {initial ? 'Edit Medical Condition' : 'Add Medical Condition'}
          </DialogTitle>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            {initial
              ? 'Update the condition details below. ICD-10 code will auto-populate when a known condition is selected.'
              : 'Search for a condition by name. The ICD-10 code will auto-populate, and you can adjust the severity level.'}
          </p>
        </DialogHeader>

        <div className="px-7 py-6 space-y-5">
          {/* Condition Name — searchable */}
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">Condition Name</label>
            <ConditionSearch
              value={conditionName}
              onChange={setConditionName}
              onIcdChange={setIcdCode}
              error={!!errors.conditionName}
            />
            {errors.conditionName && <p className="text-[11px] text-destructive mt-1">{errors.conditionName}</p>}
          </div>

          {/* ICD Code — auto-populated, still editable */}
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">ICD-10 Code</label>
            <Input
              value={icdCode}
              onChange={(e) => setIcdCode(e.target.value)}
              placeholder="e.g. E11.9"
              className={cn('h-10 text-sm font-mono', errors.icdCode && 'border-destructive')}
            />
            {errors.icdCode && <p className="text-[11px] text-destructive mt-1">{errors.icdCode}</p>}
          </div>

          {/* Severity */}
          <div>
            <label className="text-[12px] font-semibold text-foreground block mb-1.5">Severity Level</label>
            <PortalSelect
              value={severity}
              onChange={(v) => setSeverity(v as DiagnosisSeverity)}
              options={SEVERITY_OPTIONS}
              placeholder="Select severity"
              error={!!errors.severity}
            />
            {errors.severity && <p className="text-[11px] text-destructive mt-1">{errors.severity}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" className="h-9 px-6 text-[13px]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 px-6 text-[13px] shadow-[0_4px_14px_rgba(13,148,136,0.22)]"
            onClick={handleSave}
          >
            {initial ? 'Save Changes' : 'Add Condition'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Diagnosis Card ───────────────────────────────────────────────────────────

function DiagnosisCard({
  diagnosis,
  index,
  onEdit,
  onDelete,
}: {
  diagnosis: DiagnosisFormItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Index badge */}
      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground">{index + 1}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{diagnosis.conditionName}</p>
        <p className="text-[11.5px] font-mono text-muted-foreground mt-0.5">{diagnosis.icdCode}</p>
      </div>

      {/* Severity badge */}
      <span
        className={cn(
          'text-[10.5px] font-semibold px-2.5 py-1 rounded-full border shrink-0',
          SEVERITY_CLASS[diagnosis.severity]
        )}
      >
        {diagnosis.severity}
      </span>

      {/* Actions — always visible */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/[0.07] transition-colors"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Program option ───────────────────────────────────────────────────────────

type SelectedProgram = 'RPM' | 'APCM' | null;

// ─── Component ────────────────────────────────────────────────────────────────

export function ClinicalStep({
  defaultValues,
  defaultDiagnoses = [],
  defaultProgramRPM = false,
  defaultProgramACPM = false,
  isEdit = false,
  onBack,
  onSubmit,
  physicians,
  nurses,
  dhns,
}: ClinicalStepProps): React.JSX.Element {
  const [diagnoses, setDiagnoses] = useState<DiagnosisFormItem[]>(defaultDiagnoses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [selectedProgram, setSelectedProgram] = useState<SelectedProgram>(
    defaultProgramRPM ? 'RPM' : defaultProgramACPM ? 'APCM' : null
  );

  const form = useForm<ClinicalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      careTeamPhysician: '',
      careTeamNurse: '',
      careTeamDHN: '',
      ...defaultValues,
    },
  });

  function handleSubmit(values: ClinicalFormValues) {
    onSubmit({
      careTeamPhysician: values.careTeamPhysician,
      careTeamNurse: values.careTeamNurse ?? '',
      careTeamDHN: values.careTeamDHN ?? '',
      diagnoses,
      programRPM: selectedProgram === 'RPM',
      programACPM: selectedProgram === 'APCM',
    });
  }

  function openAdd() {
    setEditingIndex(null);
    setDialogOpen(true);
  }

  function openEdit(idx: number) {
    setEditingIndex(idx);
    setDialogOpen(true);
  }

  function handleSave(d: DiagnosisFormItem) {
    if (editingIndex !== null) {
      setDiagnoses((prev) => prev.map((item, i) => (i === editingIndex ? d : item)));
    } else {
      setDiagnoses((prev) => [...prev, d]);
    }
    setDialogOpen(false);
    setEditingIndex(null);
  }

  function handleDelete(idx: number) {
    setDiagnoses((prev) => prev.filter((_, i) => i !== idx));
  }

  const PROGRAMS: { key: SelectedProgram & string; label: string; description: string }[] = [
    { key: 'RPM', label: 'RPM', description: 'Remote Patient Monitoring' },
    { key: 'APCM', label: 'APCM', description: 'Advanced Primary Care Mgmt' },
  ];

  return (
    <>
      {/* ── Diagnosis Dialog ───────────────────────────────────────────────── */}
      <DiagnosisDialog
        open={dialogOpen}
        initial={editingIndex !== null ? diagnoses[editingIndex] : undefined}
        onSave={handleSave}
        onClose={() => {
          setDialogOpen(false);
          setEditingIndex(null);
        }}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* ── Care Team Assignment ─────────────────────────────────────── */}
          <div>
            <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
              Care Team Assignment
            </p>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="careTeamPhysician"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Physician</FormLabel>
                    <FormControl>
                      <StaffSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={physicians}
                        placeholder="Select a physician"
                        error={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careTeamNurse"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Registered Nurse</FormLabel>
                    <FormControl>
                      <StaffSelect
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={nurses}
                        placeholder="Select an RN"
                        error={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careTeamDHN"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Medical Assistant / DHN</FormLabel>
                    <FormControl>
                      <StaffSelect
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={dhns}
                        placeholder="Select a DHN"
                        error={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* ── Diagnoses / Medical Conditions ──────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em]">
                  Diagnoses / Medical Conditions
                </p>
                {diagnoses.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {diagnoses.length} condition{diagnoses.length !== 1 ? 's' : ''} added
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/[0.06]"
              >
                <Plus size={13} />
                Add Condition
              </button>
            </div>

            {diagnoses.length > 0 ? (
              <div className="space-y-2">
                {diagnoses.map((d, idx) => (
                  <DiagnosisCard
                    key={idx}
                    diagnosis={d}
                    index={idx}
                    onEdit={() => openEdit(idx)}
                    onDelete={() => handleDelete(idx)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-[12.5px] text-muted-foreground font-medium">No conditions added yet</p>
                <button
                  type="button"
                  onClick={openAdd}
                  className="mt-2 text-[12px] font-semibold text-primary hover:underline"
                >
                  + Add first condition
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* ── Programs Enrolled (single-select) ────────────────────────── */}
          <div>
            <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
              Program Enrolled
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PROGRAMS.map(({ key, label, description }) => {
                const active = selectedProgram === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedProgram(active ? null : key)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all',
                      active ? 'border-primary bg-primary/[0.05]' : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                        active ? 'border-primary bg-primary' : 'border-slate-300'
                      )}
                    >
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={cn('text-[13px] font-bold', active ? 'text-primary' : 'text-foreground')}>
                        {label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-slate-100 flex justify-between mt-6">
            <Button type="button" variant="outline" className="px-7 h-10 gap-2" onClick={onBack}>
              <ArrowLeft size={14} />
              Back
            </Button>
            <Button type="submit" className="px-7 h-10 shadow-[0_4px_14px_rgba(13,148,136,0.22)]">
              {isEdit ? 'Save Changes' : 'Enroll Patient'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
