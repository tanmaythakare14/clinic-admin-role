import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Check, Plus, UserPlus, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH } from '../../constants';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: REVIEW_USERS_PATH },
  { label: 'Review EHR Details', path: null },
];

type UserRole = 'Physician' | 'Nurse' | 'Digital Health Navigator';

interface ClinicUser {
  id: string;
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

type PhysicianForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  npi: string;
};
const EMPTY_FORM: PhysicianForm = { firstName: '', lastName: '', email: '', phone: '', specialty: '', npi: '' };

function PhysicianFormFields({
  form,
  onChange,
}: {
  form: PhysicianForm;
  onChange: (key: keyof PhysicianForm, value: string) => void;
}): React.JSX.Element {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        {(['firstName', 'lastName'] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{key === 'firstName' ? 'First Name' : 'Last Name'}</Label>
            <Input
              id={key}
              required
              placeholder={key === 'firstName' ? 'John' : 'Doe'}
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
            />
          </div>
        ))}
        {(
          [
            ['email', 'Email Address', 'email', 'physician@clinic.com', true],
            ['phone', 'Phone Number', 'tel', '+1 (555) 000-0000', true],
            ['specialty', 'Specialty', 'text', 'e.g. Cardiology (optional)', false],
            ['npi', 'NPI Number', 'text', '10-digit NPI', true],
          ] as const
        ).map(([key, label, type, placeholder, required]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type={type}
              placeholder={placeholder}
              required={required}
              value={form[key]}
              onChange={(e) => onChange(key as keyof PhysicianForm, e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function AddPhysicianModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (user: ClinicUser) => void;
}): React.JSX.Element {
  const [form, setForm] = useState<PhysicianForm>(EMPTY_FORM);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const newUser: ClinicUser = {
      id: `ca-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      role: 'Physician',
      addedBy: 'Clinic Admin',
      specialty: form.specialty || undefined,
      npi: form.npi,
    };
    onAdd(newUser);
    toast.success(`${form.firstName} ${form.lastName} added successfully!`);
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-[680px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 w-10 h-10 flex-shrink-0">
              <UserPlus size={18} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Add New Physician</DialogTitle>
              <DialogDescription>Physician will be added to your clinic</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <PhysicianFormFields form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Physician</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPhysicianModal({
  user,
  onClose,
  onSave,
}: {
  user: ClinicUser;
  onClose: () => void;
  onSave: (updated: ClinicUser) => void;
}): React.JSX.Element {
  const [form, setForm] = useState<PhysicianForm>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    specialty: user.specialty ?? '',
    npi: user.npi ?? '',
  });

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    onSave({ ...user, ...form, specialty: form.specialty || undefined });
    toast.success('Physician updated successfully!');
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-[680px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 w-10 h-10 flex-shrink-0">
              <Pencil size={16} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>Edit Physician</DialogTitle>
              <DialogDescription>Update physician details for your clinic</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <PhysicianFormFields form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
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
