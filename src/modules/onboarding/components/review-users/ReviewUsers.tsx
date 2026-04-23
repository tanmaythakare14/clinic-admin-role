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
  X,
  Stethoscope,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH } from '../../constants';

const TEAL = '#0D9488';
const FF = 'Inter, system-ui, sans-serif';

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

const ROLE_STYLES: Record<UserRole, { bg: string; color: string }> = {
  Physician: { bg: '#F0FDFA', color: '#0D9488' },
  Nurse: { bg: '#F5F3FF', color: '#7C3AED' },
  'Digital Health Navigator': { bg: '#FFF7ED', color: '#C2410C' },
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

/* ── Shared modal shell ── */
function ModalShell({
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ maxWidth: 480, background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, background: '#F0FDFA' }}
            >
              {icon}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#0F172A' }}>
                {title}
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 32, height: 32, color: '#94A3B8' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Shared form fields ── */
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
        {(
          [
            ['firstName', 'First Name', 'John'],
            ['lastName', 'Last Name', 'Doe'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              {label}
            </label>
            <input
              required
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg outline-none"
              style={{ border: '1px solid #E2E8F0', color: '#0F172A', background: '#fff' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
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
        <div key={key}>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
            {label}
          </label>
          <input
            type={type}
            placeholder={placeholder}
            required={required}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-lg outline-none"
            style={{ border: '1px solid #E2E8F0', color: '#0F172A', background: '#fff' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
          />
        </div>
      ))}
    </>
  );
}

/* ── Add Physician Modal ── */
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
    <ModalShell
      title="Add New Physician"
      subtitle="Physician will be added to your clinic"
      icon={<UserPlus size={18} style={{ color: TEAL }} />}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <PhysicianFormFields form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1 h-10 text-sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-10 text-sm font-semibold text-white"
            style={{ background: TEAL, border: 'none', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0f766e')}
            onMouseLeave={(e) => (e.currentTarget.style.background = TEAL)}
          >
            Add Physician
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ── Edit Physician Modal ── */
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
    onSave({
      ...user,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      specialty: form.specialty || undefined,
      npi: form.npi,
    });
    toast.success('Physician updated successfully!');
    onClose();
  }

  return (
    <ModalShell
      title="Edit Physician"
      subtitle="Update physician details for your clinic"
      icon={<Pencil size={16} style={{ color: TEAL }} />}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <PhysicianFormFields form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1 h-10 text-sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-10 text-sm font-semibold text-white"
            style={{ background: TEAL, border: 'none', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0f766e')}
            onMouseLeave={(e) => (e.currentTarget.style.background = TEAL)}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ── Main Screen ── */
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

  const COL = '2.2fr 2.2fr 1.3fr 1.6fr 1.2fr 80px';

  return (
    <div className="min-h-screen flex" style={{ fontFamily: FF }}>
      {/* ── Left Panel ── */}
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
                Intelligent Care Management for
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
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-10 overflow-y-auto"
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

        <div className="w-full max-w-3xl">
          {/* ── Stepper ── */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 1;
              const isCompleted = idx === 0;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        background: isCompleted || isActive ? TEAL : '#E2E8F0',
                        border: `2px solid ${isCompleted || isActive ? TEAL : '#CBD5E1'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isCompleted ? (
                        <Check size={14} color="#fff" strokeWidth={3} />
                      ) : (
                        <span className="text-xs font-bold" style={{ color: isActive ? '#fff' : '#94A3B8' }}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium mt-1.5 text-center"
                      style={{ color: isActive || isCompleted ? TEAL : '#94A3B8', maxWidth: 90, lineHeight: '1.3' }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="flex-1 mx-2"
                      style={{ height: 2, background: idx === 0 ? TEAL : '#E2E8F0', marginBottom: 22, borderRadius: 2 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Header row ── */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-bold text-[#0F172A] mb-1" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
                Review Assigned Users
              </h2>
              <p className="text-sm" style={{ color: '#64748B' }}>
                Users below were assigned to your clinic by the Super Admin.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 flex items-center gap-2 h-10 px-4 text-sm font-semibold"
              style={{ borderRadius: 9, whiteSpace: 'nowrap' }}
            >
              <Plus size={15} />
              Add New Physician
            </Button>
          </div>

          {/* ── Table ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8EDF2', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
          >
            {/* Header */}
            <div
              className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3.5"
              style={{
                gridTemplateColumns: COL,
                background: '#F8FAFC',
                borderBottom: '1px solid #E8EDF2',
                color: '#94A3B8',
              }}
            >
              <span>User</span>
              <span>Contact</span>
              <span>Role</span>
              <span>Specialty / NPI</span>
              <span>Added By</span>
              <span></span>
            </div>

            {/* Rows */}
            {users.map((user, idx) => {
              const isLast = idx === users.length - 1;
              const roleStyle = ROLE_STYLES[user.role];
              const isClinicAdminUser = user.addedBy === 'Clinic Admin';
              return (
                <div
                  key={user.id}
                  className="grid items-center px-5 py-4 transition-colors"
                  style={{
                    gridTemplateColumns: COL,
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                    background: '#ffffff',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFBFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  {/* User */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs truncate" style={{ color: '#475569', maxWidth: 140 }}>
                      {user.email}
                    </p>
                    <p className="text-xs" style={{ color: '#475569' }}>
                      {user.phone}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <span
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: roleStyle.bg, color: roleStyle.color }}
                    >
                      {user.role === 'Physician' && <Stethoscope size={10} className="mr-1" />}
                      {user.role === 'Physician' ? 'Physician' : user.role === 'Nurse' ? 'Nurse' : 'DHN'}
                    </span>
                  </div>

                  {/* Specialty / NPI */}
                  <div className="min-w-0 space-y-0.5">
                    {user.specialty ? (
                      <p className="text-xs font-medium truncate" style={{ color: '#374151' }}>
                        {user.specialty}
                      </p>
                    ) : (
                      <span className="text-xs" style={{ color: '#CBD5E1' }}>
                        —
                      </span>
                    )}
                    {user.npi && (
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        NPI: {user.npi}
                      </p>
                    )}
                  </div>

                  {/* Added By */}
                  <div>
                    <span className="text-xs font-medium" style={{ color: isClinicAdminUser ? TEAL : '#475569' }}>
                      {user.addedBy}
                    </span>
                  </div>

                  {/* Actions — only for clinic-admin-added users */}
                  <div className="flex items-center justify-end gap-1">
                    {isClinicAdminUser && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          className="flex items-center justify-center rounded-lg transition-colors"
                          style={{ width: 30, height: 30, color: '#64748B' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F0FDFA';
                            e.currentTarget.style.color = TEAL;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#64748B';
                          }}
                          aria-label="Edit physician"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(user.id)}
                          className="flex items-center justify-center rounded-lg transition-colors"
                          style={{ width: 30, height: 30, color: '#64748B' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FFF1F2';
                            e.currentTarget.style.color = '#E11D48';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#64748B';
                          }}
                          aria-label="Remove physician"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Support notice ── */}
          <div
            className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl"
            style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
          >
            <AlertCircle size={15} style={{ color: '#0284C7', flexShrink: 0 }} />
            <p className="text-xs leading-relaxed flex-1" style={{ color: '#0369A1' }}>
              <span className="font-semibold">Need to make changes?</span> Contact Super Admin Support for any
              modification requests to assigned users.
            </p>
            <button
              type="button"
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: '#0284C7', color: '#fff', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0369A1')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0284C7')}
            >
              Contact Super Admin
            </button>
          </div>

          {/* ── Navigation CTAs ── */}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(CREATE_PROFILE_PATH)}
              className="h-11 px-5 text-sm font-semibold"
              style={{ borderRadius: 9 }}
            >
              ← Back
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleContinue}
              className="flex-1 h-11 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
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

      {/* Modals */}
      {showAdd && <AddPhysicianModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editUser && <EditPhysicianModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />}
    </div>
  );
}
