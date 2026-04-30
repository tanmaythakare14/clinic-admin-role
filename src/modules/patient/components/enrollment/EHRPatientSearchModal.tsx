import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { EHRPrefillData } from './EHRSelector';

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface EHRInfo {
  id: string;
  name: string;
  color: string;
  initials: string;
}

interface EHRPatientSearchModalProps {
  open: boolean;
  onClose: () => void;
  ehr: EHRInfo | null;
  onFetch: (prefill: EHRPrefillData) => void;
}

// ─── Patient Record Shape ─────────────────────────────────────────────────────

interface EHRPatientRecord {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  gender: string;
  initials: string;
  prefill: EHRPrefillData;
}

// ─── Dummy Patient Data ───────────────────────────────────────────────────────

const EHR_PATIENTS: Record<string, EHRPatientRecord[]> = {
  epic: [
    {
      id: 'epic-1',
      name: 'Michael Thompson',
      mrn: 'EHR-28491',
      dob: 'Mar 15, 1975',
      gender: 'Male',
      initials: 'MT',
      prefill: {
        ehrName: 'Epic',
        step1: {
          firstName: 'Michael',
          lastName: 'Thompson',
          mrn: 'EHR-28491',
          dateOfBirth: '1975-03-15',
          gender: 'Male',
          email: 'michael.thompson@gmail.com',
          phone: '(555) 847-2931',
          pcpName: '',
          address: '1247 Oak Street, Chicago, IL 60601',
        },
        step2: {
          insurancePlanName: 'BlueCross BlueShield',
          planType: 'PPO',
          memberId: 'BCB-849271',
          groupNumber: 'GRP-0042',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'epic-2',
      name: 'Emily Watson',
      mrn: 'EHR-38821',
      dob: 'Jul 22, 1988',
      gender: 'Female',
      initials: 'EW',
      prefill: {
        ehrName: 'Epic',
        step1: {
          firstName: 'Emily',
          lastName: 'Watson',
          mrn: 'EHR-38821',
          dateOfBirth: '1988-07-22',
          gender: 'Female',
          email: 'emily.watson@gmail.com',
          phone: '(555) 293-4410',
          pcpName: '',
          address: '348 Lakeview Dr, Chicago, IL 60614',
        },
        step2: {
          insurancePlanName: 'Aetna Health',
          planType: 'HMO',
          memberId: 'AET-293847',
          groupNumber: 'GRP-1192',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'epic-3',
      name: "James O'Brien",
      mrn: 'EHR-49102',
      dob: 'Nov 04, 1961',
      gender: 'Male',
      initials: 'JO',
      prefill: {
        ehrName: 'Epic',
        step1: {
          firstName: 'James',
          lastName: "O'Brien",
          mrn: 'EHR-49102',
          dateOfBirth: '1961-11-04',
          gender: 'Male',
          email: 'james.obrien@yahoo.com',
          phone: '(555) 481-7720',
          pcpName: '',
          address: '92 Harbor Blvd, Evanston, IL 60201',
        },
        step2: {
          insurancePlanName: 'Cigna Health',
          planType: 'PPO',
          memberId: 'CIG-481920',
          groupNumber: 'GRP-4410',
          secondaryInsurance: 'Medicare Part B',
          secondaryMemberId: 'MED-61102B',
        },
      },
    },
    {
      id: 'epic-4',
      name: 'Sofia Martinez',
      mrn: 'EHR-51294',
      dob: 'Feb 18, 1995',
      gender: 'Female',
      initials: 'SM',
      prefill: {
        ehrName: 'Epic',
        step1: {
          firstName: 'Sofia',
          lastName: 'Martinez',
          mrn: 'EHR-51294',
          dateOfBirth: '1995-02-18',
          gender: 'Female',
          email: 'sofia.martinez@icloud.com',
          phone: '(555) 617-3308',
          pcpName: '',
          address: '711 Oak Park Ave, Chicago, IL 60302',
        },
        step2: {
          insurancePlanName: 'UnitedHealthcare',
          planType: 'EPO',
          memberId: 'UHC-617295',
          groupNumber: 'GRP-8831',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
  ],

  cerner: [
    {
      id: 'cerner-1',
      name: 'Jennifer Rodriguez',
      mrn: 'CER-19472',
      dob: 'Jul 22, 1968',
      gender: 'Female',
      initials: 'JR',
      prefill: {
        ehrName: 'Cerner',
        step1: {
          firstName: 'Jennifer',
          lastName: 'Rodriguez',
          mrn: 'CER-19472',
          dateOfBirth: '1968-07-22',
          gender: 'Female',
          email: 'jennifer.rodriguez@outlook.com',
          phone: '(555) 312-6745',
          pcpName: '',
          address: '540 Maple Avenue, Austin, TX 78701',
        },
        step2: {
          insurancePlanName: 'Aetna Health',
          planType: 'HMO',
          memberId: 'AET-562831',
          groupNumber: 'GRP-7714',
          secondaryInsurance: 'Medicare Part B',
          secondaryMemberId: 'MED-44029X',
        },
      },
    },
    {
      id: 'cerner-2',
      name: 'Daniel Park',
      mrn: 'CER-27831',
      dob: 'Apr 11, 1979',
      gender: 'Male',
      initials: 'DP',
      prefill: {
        ehrName: 'Cerner',
        step1: {
          firstName: 'Daniel',
          lastName: 'Park',
          mrn: 'CER-27831',
          dateOfBirth: '1979-04-11',
          gender: 'Male',
          email: 'daniel.park@gmail.com',
          phone: '(555) 448-9102',
          pcpName: '',
          address: '1820 River Walk, Austin, TX 78746',
        },
        step2: {
          insurancePlanName: 'Cigna Health',
          planType: 'POS',
          memberId: 'CIG-448112',
          groupNumber: 'GRP-2201',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'cerner-3',
      name: 'Olivia Bennett',
      mrn: 'CER-33094',
      dob: 'Sep 29, 1992',
      gender: 'Female',
      initials: 'OB',
      prefill: {
        ehrName: 'Cerner',
        step1: {
          firstName: 'Olivia',
          lastName: 'Bennett',
          mrn: 'CER-33094',
          dateOfBirth: '1992-09-29',
          gender: 'Female',
          email: 'olivia.bennett@hotmail.com',
          phone: '(555) 729-4403',
          pcpName: '',
          address: '455 Congress Ave, Austin, TX 78701',
        },
        step2: {
          insurancePlanName: 'Humana',
          planType: 'HDHP',
          memberId: 'HUM-729044',
          groupNumber: 'GRP-5503',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'cerner-4',
      name: 'Marcus Johnson',
      mrn: 'CER-41785',
      dob: 'Jan 05, 1956',
      gender: 'Male',
      initials: 'MJ',
      prefill: {
        ehrName: 'Cerner',
        step1: {
          firstName: 'Marcus',
          lastName: 'Johnson',
          mrn: 'CER-41785',
          dateOfBirth: '1956-01-05',
          gender: 'Male',
          email: 'marcus.johnson@gmail.com',
          phone: '(555) 830-2217',
          pcpName: '',
          address: '3012 Lamar Blvd, Austin, TX 78705',
        },
        step2: {
          insurancePlanName: 'Medicare',
          planType: 'Medicare',
          memberId: 'MED-560105M',
          groupNumber: 'GRP-0001',
          secondaryInsurance: 'AARP Supplement',
          secondaryMemberId: 'AARP-82041',
        },
      },
    },
  ],

  athena: [
    {
      id: 'athena-1',
      name: 'Robert Kim',
      mrn: 'ATH-56382',
      dob: 'Nov 09, 1982',
      gender: 'Male',
      initials: 'RK',
      prefill: {
        ehrName: 'Athenahealth',
        step1: {
          firstName: 'Robert',
          lastName: 'Kim',
          mrn: 'ATH-56382',
          dateOfBirth: '1982-11-09',
          gender: 'Male',
          email: 'robert.kim@yahoo.com',
          phone: '(555) 204-9371',
          pcpName: '',
          address: '88 Elm Court, Seattle, WA 98101',
        },
        step2: {
          insurancePlanName: 'UnitedHealthcare',
          planType: 'EPO',
          memberId: 'UHC-301928',
          groupNumber: 'GRP-5521',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'athena-2',
      name: 'Priya Sharma',
      mrn: 'ATH-62749',
      dob: 'Mar 17, 1986',
      gender: 'Female',
      initials: 'PS',
      prefill: {
        ehrName: 'Athenahealth',
        step1: {
          firstName: 'Priya',
          lastName: 'Sharma',
          mrn: 'ATH-62749',
          dateOfBirth: '1986-03-17',
          gender: 'Female',
          email: 'priya.sharma@gmail.com',
          phone: '(555) 376-8821',
          pcpName: '',
          address: '220 Pine St, Seattle, WA 98121',
        },
        step2: {
          insurancePlanName: 'BlueCross BlueShield',
          planType: 'PPO',
          memberId: 'BCB-376498',
          groupNumber: 'GRP-3302',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'athena-3',
      name: 'Thomas Walker',
      mrn: 'ATH-71038',
      dob: 'Aug 30, 1970',
      gender: 'Male',
      initials: 'TW',
      prefill: {
        ehrName: 'Athenahealth',
        step1: {
          firstName: 'Thomas',
          lastName: 'Walker',
          mrn: 'ATH-71038',
          dateOfBirth: '1970-08-30',
          gender: 'Male',
          email: 'thomas.walker@outlook.com',
          phone: '(555) 512-3304',
          pcpName: '',
          address: '1490 Capitol Hill, Seattle, WA 98102',
        },
        step2: {
          insurancePlanName: 'Cigna Health',
          planType: 'HMO',
          memberId: 'CIG-512710',
          groupNumber: 'GRP-7720',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'athena-4',
      name: 'Hannah Chen',
      mrn: 'ATH-83526',
      dob: 'Dec 12, 1994',
      gender: 'Female',
      initials: 'HC',
      prefill: {
        ehrName: 'Athenahealth',
        step1: {
          firstName: 'Hannah',
          lastName: 'Chen',
          mrn: 'ATH-83526',
          dateOfBirth: '1994-12-12',
          gender: 'Female',
          email: 'hannah.chen@icloud.com',
          phone: '(555) 608-4419',
          pcpName: '',
          address: '77 Beacon Hill Rd, Seattle, WA 98109',
        },
        step2: {
          insurancePlanName: 'Aetna Health',
          planType: 'EPO',
          memberId: 'AET-608352',
          groupNumber: 'GRP-9910',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
  ],

  ecw: [
    {
      id: 'ecw-1',
      name: 'Amanda Patel',
      mrn: 'ECW-73291',
      dob: 'Apr 30, 1990',
      gender: 'Female',
      initials: 'AP',
      prefill: {
        ehrName: 'eClinicalWorks',
        step1: {
          firstName: 'Amanda',
          lastName: 'Patel',
          mrn: 'ECW-73291',
          dateOfBirth: '1990-04-30',
          gender: 'Female',
          email: 'amanda.patel@icloud.com',
          phone: '(555) 768-4421',
          pcpName: '',
          address: '2310 Birch Road, Miami, FL 33101',
        },
        step2: {
          insurancePlanName: 'Humana',
          planType: 'HDHP',
          memberId: 'HUM-847123',
          groupNumber: 'GRP-3309',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'ecw-2',
      name: "Kevin O'Sullivan",
      mrn: 'ECW-81042',
      dob: 'Jun 14, 1977',
      gender: 'Male',
      initials: 'KO',
      prefill: {
        ehrName: 'eClinicalWorks',
        step1: {
          firstName: 'Kevin',
          lastName: "O'Sullivan",
          mrn: 'ECW-81042',
          dateOfBirth: '1977-06-14',
          gender: 'Male',
          email: 'kevin.osullivan@gmail.com',
          phone: '(555) 891-6630',
          pcpName: '',
          address: '830 Brickell Ave, Miami, FL 33131',
        },
        step2: {
          insurancePlanName: 'UnitedHealthcare',
          planType: 'PPO',
          memberId: 'UHC-891042',
          groupNumber: 'GRP-4418',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'ecw-3',
      name: 'Grace Liu',
      mrn: 'ECW-94827',
      dob: 'Oct 08, 1984',
      gender: 'Female',
      initials: 'GL',
      prefill: {
        ehrName: 'eClinicalWorks',
        step1: {
          firstName: 'Grace',
          lastName: 'Liu',
          mrn: 'ECW-94827',
          dateOfBirth: '1984-10-08',
          gender: 'Female',
          email: 'grace.liu@yahoo.com',
          phone: '(555) 943-7712',
          pcpName: '',
          address: '1575 NW 107th Ave, Miami, FL 33172',
        },
        step2: {
          insurancePlanName: 'Aetna Health',
          planType: 'HMO',
          memberId: 'AET-943827',
          groupNumber: 'GRP-6610',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'ecw-4',
      name: 'Brandon Davis',
      mrn: 'ECW-10293',
      dob: 'Feb 25, 1999',
      gender: 'Male',
      initials: 'BD',
      prefill: {
        ehrName: 'eClinicalWorks',
        step1: {
          firstName: 'Brandon',
          lastName: 'Davis',
          mrn: 'ECW-10293',
          dateOfBirth: '1999-02-25',
          gender: 'Male',
          email: 'brandon.davis@gmail.com',
          phone: '(555) 102-9338',
          pcpName: '',
          address: '450 NE 8th St, Miami, FL 33132',
        },
        step2: {
          insurancePlanName: 'Cigna Health',
          planType: 'HDHP',
          memberId: 'CIG-102930',
          groupNumber: 'GRP-7701',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
  ],

  nextgen: [
    {
      id: 'nextgen-1',
      name: 'David Williams',
      mrn: 'NXG-44821',
      dob: 'Sep 14, 1963',
      gender: 'Male',
      initials: 'DW',
      prefill: {
        ehrName: 'NextGen',
        step1: {
          firstName: 'David',
          lastName: 'Williams',
          mrn: 'NXG-44821',
          dateOfBirth: '1963-09-14',
          gender: 'Male',
          email: 'david.williams@gmail.com',
          phone: '(555) 539-1204',
          pcpName: '',
          address: '675 Pine Lane, Denver, CO 80201',
        },
        step2: {
          insurancePlanName: 'Cigna Health',
          planType: 'POS',
          memberId: 'CIG-920314',
          groupNumber: 'GRP-1187',
          secondaryInsurance: 'Medicare Part A',
          secondaryMemberId: 'MED-77031A',
        },
      },
    },
    {
      id: 'nextgen-2',
      name: 'Natalie Cooper',
      mrn: 'NXG-52930',
      dob: 'Jan 28, 1991',
      gender: 'Female',
      initials: 'NC',
      prefill: {
        ehrName: 'NextGen',
        step1: {
          firstName: 'Natalie',
          lastName: 'Cooper',
          mrn: 'NXG-52930',
          dateOfBirth: '1991-01-28',
          gender: 'Female',
          email: 'natalie.cooper@outlook.com',
          phone: '(555) 629-8801',
          pcpName: '',
          address: '2201 Blake St, Denver, CO 80205',
        },
        step2: {
          insurancePlanName: 'BlueCross BlueShield',
          planType: 'PPO',
          memberId: 'BCB-629293',
          groupNumber: 'GRP-2209',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'nextgen-3',
      name: 'Ryan Mitchell',
      mrn: 'NXG-63847',
      dob: 'May 19, 1974',
      gender: 'Male',
      initials: 'RM',
      prefill: {
        ehrName: 'NextGen',
        step1: {
          firstName: 'Ryan',
          lastName: 'Mitchell',
          mrn: 'NXG-63847',
          dateOfBirth: '1974-05-19',
          gender: 'Male',
          email: 'ryan.mitchell@gmail.com',
          phone: '(555) 738-5503',
          pcpName: '',
          address: '888 Logan St, Denver, CO 80203',
        },
        step2: {
          insurancePlanName: 'Humana',
          planType: 'HMO',
          memberId: 'HUM-738638',
          groupNumber: 'GRP-5511',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
    {
      id: 'nextgen-4',
      name: 'Isabella Torres',
      mrn: 'NXG-74102',
      dob: 'Aug 07, 1987',
      gender: 'Female',
      initials: 'IT',
      prefill: {
        ehrName: 'NextGen',
        step1: {
          firstName: 'Isabella',
          lastName: 'Torres',
          mrn: 'NXG-74102',
          dateOfBirth: '1987-08-07',
          gender: 'Female',
          email: 'isabella.torres@icloud.com',
          phone: '(555) 841-2204',
          pcpName: '',
          address: '390 Speer Blvd, Denver, CO 80203',
        },
        step2: {
          insurancePlanName: 'Aetna Health',
          planType: 'EPO',
          memberId: 'AET-841741',
          groupNumber: 'GRP-8819',
          secondaryInsurance: '',
          secondaryMemberId: '',
        },
      },
    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyStateIllustration({ ehrName }: { ehrName: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Background circle */}
        <circle cx="44" cy="44" r="38" fill="#f0fdfa" />
        {/* Outer ring */}
        <circle cx="44" cy="44" r="38" stroke="#99f6e4" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Search magnifier body */}
        <circle cx="40" cy="38" r="14" fill="white" stroke="#0d9488" strokeWidth="2" />
        {/* Search magnifier cross pattern inside */}
        <line x1="40" y1="31" x2="40" y2="45" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="38" x2="47" y2="38" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
        {/* Patient silhouette inside glass */}
        <circle cx="40" cy="34.5" r="3.5" fill="#99f6e4" />
        <path
          d="M33 43.5 C33 40 36.5 38 40 38 C43.5 38 47 40 47 43.5"
          stroke="#99f6e4"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Magnifier handle */}
        <line x1="50" y1="48" x2="57" y2="55" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
        {/* Small decorative dots */}
        <circle cx="22" cy="28" r="2.5" fill="#ccfbf1" />
        <circle cx="64" cy="32" r="2" fill="#99f6e4" />
        <circle cx="26" cy="58" r="1.5" fill="#5eead4" />
        <circle cx="62" cy="60" r="3" fill="#ccfbf1" />
      </svg>

      <div className="text-center">
        <p className="text-[13px] font-medium text-foreground">Search for a patient</p>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-[220px] mx-auto leading-relaxed">
          Type a name or MRN to find records in {ehrName}
        </p>
      </div>
    </div>
  );
}

interface PatientCardProps {
  patient: EHRPatientRecord;
  selected: boolean;
  onSelect: () => void;
}

function PatientCard({ patient, selected, onSelect }: PatientCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left border border-slate-200 rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all duration-100',
        'hover:border-primary/40 hover:bg-primary/[0.02]',
        selected && 'border-primary/50 bg-primary/[0.04] ring-1 ring-primary/20'
      )}
    >
      {/* Radio button */}
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
          selected ? 'border-primary' : 'border-slate-300'
        )}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-[12px] flex items-center justify-center shrink-0">
        {patient.initials}
      </div>

      {/* Name + MRN */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground leading-tight truncate">{patient.name}</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">{patient.mrn}</p>
      </div>

      {/* DOB + Gender */}
      <div className="ml-auto text-right shrink-0">
        <p className="text-[11.5px] text-foreground">{patient.dob}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{patient.gender}</p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EHRPatientSearchModal({
  open,
  onClose,
  ehr,
  onFetch,
}: EHRPatientSearchModalProps): React.JSX.Element | null {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedId(null);
      setLoading(false);
    }
  }, [open]);

  if (!open || !ehr) return null;

  const patients: EHRPatientRecord[] = EHR_PATIENTS[ehr.id] ?? [];

  const filtered =
    query.trim() === ''
      ? []
      : patients.filter(
          (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase())
        );

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null;

  function handleFetch(): void {
    if (!selectedPatient) return;
    setLoading(true);
    setTimeout(() => {
      onFetch(selectedPatient.prefill);
    }, 3500);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (loading) return; // prevent closing during loading
    if (!nextOpen) onClose();
  }

  const showEmptyState = query.trim() === '';
  const showNoResults = query.trim() !== '' && filtered.length === 0;
  const showResults = filtered.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden gap-0 [&>button]:hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 rounded-[inherit] bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
            <div
              className="w-14 h-14 rounded-full border-4 border-slate-200 animate-spin"
              style={{ borderTopColor: ehr.color }}
            />
            <div className="text-center">
              <p className="text-[15px] font-semibold text-foreground">Fetching patient data...</p>
              <p className="text-[12px] text-muted-foreground mt-1">Importing records from {ehr.name}</p>
            </div>
          </div>
        )}

        <div className="px-5 pt-5 pb-4">
          {/* Header */}
          <DialogHeader className="mb-4">
            <DialogTitle className="text-[15px] font-semibold text-foreground">Enroll New Patient</DialogTitle>
            <p className="text-[13px] text-muted-foreground mt-0.5">Search and select a patient from {ehr.name}</p>
          </DialogHeader>

          {/* Search input */}
          <div className="relative">
            {/* Left side: EHR logo + divider + search icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                style={{ backgroundColor: ehr.color }}
              >
                {ehr.initials.length > 2 ? ehr.initials.slice(0, 2) : ehr.initials}
              </div>
              <div className="w-px h-3.5 bg-slate-200" />
              <Search size={14} className="text-muted-foreground" />
            </div>

            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              disabled={loading}
              className={cn(
                'w-full rounded-xl border border-slate-200 bg-slate-50',
                'pl-[52px] pr-4 py-2.5 text-[13px]',
                'outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40',
                'placeholder:text-muted-foreground disabled:opacity-50'
              )}
            />
          </div>

          {/* Patient list area */}
          <div className="h-[300px] overflow-y-auto mt-3">
            {showEmptyState && <EmptyStateIllustration ehrName={ehr.name} />}

            {showNoResults && (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <p className="text-[13px] font-medium text-foreground">No patients found</p>
                <p className="text-[12px] text-muted-foreground">Try a different name or MRN</p>
              </div>
            )}

            {showResults && (
              <div className="space-y-2 pr-1">
                {filtered.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    selected={selectedId === patient.id}
                    onSelect={() => setSelectedId(patient.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3.5 border-t border-slate-100 flex flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-[13px]">
            Cancel
          </Button>
          <Button type="button" onClick={handleFetch} disabled={!selectedPatient || loading} className="text-[13px]">
            Fetch User Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
