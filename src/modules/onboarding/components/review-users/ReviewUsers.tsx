import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Activity,
  ArrowRight,
  Check,
  Plus,
  UserPlus,
  AlertCircle,
  Stethoscope,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertAction } from '@/components/ui/alert';
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

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  Physician: 'bg-teal-50 text-teal-700 border-0 h-auto py-0.5',
  Nurse: 'bg-violet-50 text-violet-700 border-0 h-auto py-0.5',
  'Digital Health Navigator': 'bg-orange-50 text-orange-700 border-0 h-auto py-0.5',
};

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
      <div className="grid grid-cols-2 gap-3">
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
      </div>
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
      <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 w-10 h-10 flex-shrink-0">
              <UserPlus size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle>Add New Physician</DialogTitle>
              <DialogDescription>Physician will be added to your clinic</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
      <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 w-10 h-10 flex-shrink-0">
              <Pencil size={16} className="text-primary" />
            </div>
            <div>
              <DialogTitle>Edit Physician</DialogTitle>
              <DialogDescription>Update physician details for your clinic</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
    setUsers((prev) => [...prev, user]);
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-10 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-3xl">
          {/* Stepper */}
          <div className="flex items-center mb-8">
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
                      className={`text-xs font-medium mt-1.5 text-center max-w-[90px] leading-snug ${
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
              <h2 className="font-bold text-foreground text-[22px] tracking-tight mb-1">Review Assigned Users</h2>
              <p className="text-sm text-muted-foreground">
                Users below were assigned to your clinic by the Super Admin.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 flex items-center gap-2 h-10 px-4 text-sm font-semibold whitespace-nowrap"
            >
              <Plus size={15} />
              Add New Physician
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    User
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Role
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Specialty / NPI
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Added By
                  </TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isClinicAdminUser = user.addedBy === 'Clinic Admin';
                  return (
                    <TableRow key={user.id} className="bg-card">
                      <TableCell>
                        <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                          {user.firstName} {user.lastName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]" data-phi>
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground" data-phi>
                          {user.phone}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROLE_BADGE_CLASS[user.role]}>
                          {user.role === 'Physician' && <Stethoscope size={10} className="mr-1" />}
                          {user.role === 'Physician' ? 'Physician' : user.role === 'Nurse' ? 'Nurse' : 'DHN'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.specialty ? (
                          <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{user.specialty}</p>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {user.npi && <p className="text-xs text-muted-foreground">NPI: {user.npi}</p>}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium ${isClinicAdminUser ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {user.addedBy}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isClinicAdminUser && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditUser(user)}
                              aria-label="Edit physician"
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemove(user.id)}
                              aria-label="Remove physician"
                              className="hover:text-destructive hover:bg-destructive/10"
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

          {/* Support notice */}
          <Alert className="mt-4 bg-sky-50 border-sky-200">
            <AlertCircle size={15} className="text-sky-600" />
            <AlertDescription className="text-sky-700 text-xs leading-relaxed">
              <span className="font-semibold">Need to make changes?</span> Contact Super Admin Support for any
              modification requests to assigned users.
            </AlertDescription>
            <AlertAction>
              <Button type="button" size="xs" className="bg-sky-600 hover:bg-sky-700 text-white border-0 text-xs">
                Contact Super Admin
              </Button>
            </AlertAction>
          </Alert>

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
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
              className="flex-1 h-11 text-sm font-semibold"
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
