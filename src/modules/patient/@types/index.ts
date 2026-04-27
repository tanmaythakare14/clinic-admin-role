export type ProgramType = 'APCM' | 'RPM';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'vitals' | 'device' | 'ai';
export type DiagnosisSeverity = 'Mild' | 'Moderate' | 'Severe';
export type CareTeamRole = 'PCP' | 'Nurse' | 'DHN';

export interface PatientDTO {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
  primaryCarePhysician?: { fullName: string };
  programs: ProgramType[];
}

export interface PatientListItem {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  pcpName: string;
  programs: ProgramType[];
}

export interface PatientAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
}

export interface Diagnosis {
  conditionName: string;
  icdCode: string;
  severity: DiagnosisSeverity;
}

export interface InsuranceInfo {
  planName: string;
  planType: string;
  memberId: string;
  groupNumber: string;
  secondaryInsurance?: string;
  secondaryMemberId?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CareTeamMember {
  role: CareTeamRole;
  name: string;
  email: string;
}

export interface PatientDetailData {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  pcpName: string;
  programs: ProgramType[];
  insurance: InsuranceInfo;
  diagnoses: Diagnosis[];
  emergencyContact: EmergencyContact;
  careTeam: CareTeamMember[];
  alerts: PatientAlert[];
}
