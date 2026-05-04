export type ProgramType = 'RPM' | 'APCM';
export type CodeStatus = 'Generated' | 'Pending' | 'Failed';

export interface BillingRecord {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  pcpName: string;
  npiNumber: string;
  invoiceNumber: string;
  billingMonth: string;
  program: ProgramType;
  cptCode: string;
  cptDescription: string;
  generationDate: string;
}

export interface GeneratedCode {
  id: string;
  cptCode: string;
  description: string;
  status: CodeStatus;
  generatedDate: string;
}
