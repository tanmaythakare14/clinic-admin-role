import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, FileText, Stethoscope, Video, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentType = 'In-Person' | 'Telemedicine' | 'Phone Call';
type AppointmentStatus = 'upcoming' | 'completed';

interface AppointmentTemplate {
  id: string;
  physicianIndex: number; // index into the physicians array (cycled if fewer physicians)
  date: string;
  time: string;
  type: AppointmentType;
  note: string;
  status: AppointmentStatus;
}

// ─── Dummy physician fallback ─────────────────────────────────────────────────

const DUMMY_PHYSICIANS = [
  { name: 'Dr. Michael Torres', specialty: 'Internal Medicine' },
  { name: 'Dr. Sarah Collins', specialty: 'Cardiology' },
  { name: 'Dr. James Patel', specialty: 'Endocrinology' },
];

// ─── Static appointment templates (physician resolved at runtime) ──────────────

const APPOINTMENT_TEMPLATES: AppointmentTemplate[] = [
  {
    id: 'appt-001',
    physicianIndex: 0,
    date: 'May 5, 2026',
    time: '10:00 AM',
    type: 'In-Person',
    note: 'Routine follow-up for blood pressure management and medication review.',
    status: 'upcoming',
  },
  {
    id: 'appt-002',
    physicianIndex: 1,
    date: 'May 14, 2026',
    time: '2:30 PM',
    type: 'Telemedicine',
    note: 'Cardiology consult — review recent ECG results and adjust treatment plan.',
    status: 'upcoming',
  },
  {
    id: 'appt-003',
    physicianIndex: 0,
    date: 'Jun 2, 2026',
    time: '9:00 AM',
    type: 'Phone Call',
    note: 'Lab results discussion — HbA1c and lipid panel follow-up.',
    status: 'upcoming',
  },
  {
    id: 'appt-004',
    physicianIndex: 0,
    date: 'Mar 18, 2026',
    time: '11:00 AM',
    type: 'In-Person',
    note: 'Annual physical exam. Reviewed vitals, updated prescriptions for metformin.',
    status: 'completed',
  },
  {
    id: 'appt-005',
    physicianIndex: 2,
    date: 'Feb 7, 2026',
    time: '3:00 PM',
    type: 'Telemedicine',
    note: 'Diabetes management consultation. HbA1c at 7.4%, adjusted insulin dosage.',
    status: 'completed',
  },
  {
    id: 'appt-006',
    physicianIndex: 1,
    date: 'Jan 22, 2026',
    time: '1:15 PM',
    type: 'In-Person',
    note: 'Post-hypertension episode check. BP stabilised at 132/84. Continue current medication.',
    status: 'completed',
  },
  {
    id: 'appt-007',
    physicianIndex: 0,
    date: 'Dec 10, 2025',
    time: '10:30 AM',
    type: 'Phone Call',
    note: 'Flu symptoms check-in. Recommended rest and fluids. No medication change.',
    status: 'completed',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AppointmentType, { icon: React.JSX.Element; bg: string; text: string; border: string }> = {
  'In-Person': {
    icon: <Stethoscope size={11} />,
    bg: 'bg-primary/8',
    text: 'text-primary',
    border: 'border-primary/20',
  },
  Telemedicine: {
    icon: <Video size={11} />,
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-100',
  },
  'Phone Call': {
    icon: <Phone size={11} />,
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-100',
  },
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

interface ResolvedAppointment extends AppointmentTemplate {
  physicianName: string;
  physicianSpecialty: string;
}

function AppointmentCard({ appt }: { appt: ResolvedAppointment }): React.JSX.Element {
  const typeCfg = TYPE_CONFIG[appt.type];

  return (
    <div className="rounded-[14px] border bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 transition-all flex flex-col gap-4">
      {/* Row 1 — Physician + type badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
            <User size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold leading-tight text-foreground">{appt.physicianName}</p>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{appt.physicianSpecialty}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0',
            typeCfg.bg,
            typeCfg.text,
            typeCfg.border
          )}
        >
          {typeCfg.icon}
          {appt.type}
        </span>
      </div>

      {/* Row 2 — Date & Time in label+value format */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-0.5 flex items-center gap-1">
            <Calendar size={9} /> Date
          </p>
          <p className="text-[13.5px] font-medium text-foreground">{appt.date}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-0.5 flex items-center gap-1">
            <Clock size={9} /> Time
          </p>
          <p className="text-[13.5px] font-medium text-foreground">{appt.time}</p>
        </div>
      </div>

      {/* Row 3 — Note */}
      <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 min-h-[52px]">
        <FileText size={13} className="text-muted-foreground shrink-0" />
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{appt.note}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type SubTab = 'upcoming' | 'completed';

export function AppointmentsTab(): React.JSX.Element {
  const [subTab, setSubTab] = useState<SubTab>('upcoming');

  const appointments = useMemo<ResolvedAppointment[]>(() => {
    const physicians = (secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? []).filter(
      (u) => u.type === 'PHYSICIAN' && u.status === 'Active'
    );

    return APPOINTMENT_TEMPLATES.map((tmpl) => {
      const physician = physicians.length > 0 ? physicians[tmpl.physicianIndex % physicians.length] : null;

      const dummy = DUMMY_PHYSICIANS[tmpl.physicianIndex % DUMMY_PHYSICIANS.length];
      return {
        ...tmpl,
        physicianName: physician ? physician.fullName : dummy.name,
        physicianSpecialty: physician?.specialty || dummy.specialty,
      };
    });
  }, []);

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const completed = appointments.filter((a) => a.status === 'completed');
  const list = subTab === 'upcoming' ? upcoming : completed;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 w-fit">
        {(['upcoming', 'completed'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSubTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 capitalize',
              subTab === tab
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'upcoming' ? 'Upcoming' : 'Completed'}
            <span
              className={cn(
                'ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
                subTab === tab ? 'bg-primary text-white' : 'bg-slate-300 text-slate-600'
              )}
            >
              {tab === 'upcoming' ? upcoming.length : completed.length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-muted-foreground" />
          </div>
          <p className="text-[13.5px] font-semibold text-foreground mb-1">No {subTab} appointments</p>
          <p className="text-sm text-muted-foreground">
            {subTab === 'upcoming'
              ? 'No appointments scheduled yet.'
              : 'No completed appointments in the last 12 months.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {list.map((appt) => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </div>
  );
}
