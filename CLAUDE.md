# Health Telematix Clinic Portal — Claude Code Guide

## Project Overview

HIPAA-compliant healthcare portal for Clinic Admins, Physicians, Registered Nurses, and Digital Health Navigators. ~74 screens across 7 modules.

**Stack:** React 19 · TypeScript · Vite · shadcn/ui · Tailwind CSS · Redux Toolkit · React Router v6

---

## Commands

```bash
npm run dev            # start dev server
npm run build          # tsc -b && vite build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint --fix
npm run lint:check     # eslint (no fix)
npm run format         # prettier --write
npm run format:check   # prettier --check
npm run test           # vitest
npm run test:coverage  # vitest run --coverage
npm run commit         # commitizen (conventional commits)
```

---

## Tech Stack — Approved Libraries Only

| Purpose         | Library                           | Notes                                                 |
| --------------- | --------------------------------- | ----------------------------------------------------- |
| UI components   | **shadcn/ui**                     | ONLY UI library — no MUI, Ant Design, Chakra, Mantine |
| Styling         | **Tailwind CSS v4**               | Utility classes only, no inline styles                |
| Forms           | **React Hook Form + Zod**         | shadcn/ui `<Form>` depends on these                   |
| Data tables     | **TanStack Table**                | Paired with shadcn/ui `<Table>` primitives            |
| Charts          | **shadcn/ui Charts**              | Wraps Recharts — do not use Recharts directly         |
| Routing         | **React Router v6**               | Already installed                                     |
| State           | **Redux Toolkit**                 | Auth + UI state only (not server data)                |
| Icons           | **Lucide React**                  | Already used by shadcn/ui                             |
| Toasts          | **Sonner**                        | Via shadcn/ui `<Sonner>` component                    |
| Dates           | **date-fns + shadcn/ui Calendar** | Never use moment.js                                   |
| Class utilities | **clsx + tailwind-merge + cva**   | Required by shadcn/ui internals                       |

Adding any library not in this table requires team approval first.

---

## Modules

All feature code lives inside `src/modules/`. Never add business logic to `src/` root or `src/components/`.

| Module            | Screens | Description                                                                                                                                                          |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding`      | 9       | Invitation flow, email verify, set password, create profile, EHR setup, sign in, forgot password                                                                     |
| `dashboard`       | 2       | KPI cards, revenue graphs, enrollment trends, billing stats                                                                                                          |
| `patient`         | 15      | Patient list, detail view with 8 tabs (vitals, medications, care plan, billing, tasks, appointments, activity log, programs/devices), enrollment (5-step multi-form) |
| `user-management` | 3       | Physician/RN/DHN list, add user, view detail                                                                                                                         |
| `billing`         | 3       | Billing table, monthly summary, CPT code generation, billing history                                                                                                 |
| `messages`        | 2       | Read-only conversation list, patient context panel                                                                                                                   |
| `settings`        | 8       | User profile, clinic profile, EHR/EMR settings, notifications, change password, ToS, FAQs, help & support                                                            |

---

## Source Layout

```
src/
├── modules/           # All feature modules (see rules/modules.md)
├── components/
│   └── ui/            # shadcn/ui generated files — NEVER hand-edit
├── store/
│   ├── index.ts       # Redux store with encrypted persistence
│   ├── hooks.ts       # useAppDispatch, useAppSelector
│   └── slices/        # One slice per domain
├── hooks/             # Shared custom hooks (non-module-specific)
├── router/
│   └── index.tsx      # All React Router v6 route definitions
├── config/
│   └── environment.ts # All Vite env var access (NEVER import.meta.env elsewhere)
└── utils/
    ├── encryption.ts  # CryptoJS AES — do not modify
    ├── secureStorage.ts
    └── logger.ts      # PHI-aware logger — always use this, never console.log
```

---

## HIPAA Rules (enforced at all times)

- PHI fields in JSX must carry a `data-phi` attribute: MRN, DOB, SSN, insurance IDs, phone, email
- Never log PHI — use `src/utils/logger.ts` which auto-redacts PHI patterns
- Never store raw PHI in Redux — encrypted persistence via `secureStorage` adapter
- Never hardcode API base URLs — read from `src/config/environment.ts`
- Never expose raw API error messages to the UI — map to user-friendly strings

---

## Path Aliases

Use `@/` for `src/` in all imports. Never use relative `../../` paths that cross module boundaries.

```ts
// correct
import { patientApi } from '@/modules/patient/service/api';
import { Button } from '@/components/ui/button';

// wrong
import { patientApi } from '../../modules/patient/service/api';
```

---

## Path-Scoped Rules (auto-loaded by Claude Code)

- @rules/modules.md — folder structure, layer separation, barrel exports
- @rules/components.md — shadcn/ui usage, form patterns, table patterns, chart patterns
- @rules/api.md — HTTP client, response typing, error handling, PHI logging
- @rules/typescript.md — type safety, interfaces, Zod schema conventions
- @rules/testing.md — Vitest + @testing-library/react conventions
- @rules/state.md — Redux Toolkit slice and thunk patterns
- @rules/styling.md — Tailwind utility rules, shadcn/ui CSS variable conventions

---

## APCM Billing Requirements (Domain Knowledge)

Advanced Primary Care Management (APCM) is a Medicare billing program. The following requirements govern when and how APCM services can be billed. All APCM-related UI, validations, eligibility checks, and CPT code generation logic must respect these rules.

### Key Principle

Not all elements must be provided every month — only those that are **clinically appropriate** for the individual patient. However, the elements below define the full scope of billable APCM services.

---

### 1. Patient Consent

- Obtain **written or verbal consent** before starting APCM services (one-time only).
- Consent must be documented in the patient's medical record.
- Consent must inform the patient of:
  - Only **1 provider** can furnish and be paid for APCM services per calendar month.
  - The patient has the **right to stop services at any time**.
  - **Cost sharing** may apply.

---

### 2. Initiating Visit

- Required for **new patients** — billed separately.
- **Not required** if the provider or another provider in the same practice has:
  - Seen the patient **within the past 3 years**, or
  - Provided another care management service (APCM, CCM, or PCM) **within the past year**.
- The **Medicare Annual Wellness Visit (AWV)** may qualify as the initiating visit if the AWV is performed by the provider responsible for APCM care.

---

### 3. 24/7 Access & Continuity of Care

- Patients or caregivers must have **24/7 access** for urgent needs to contact the care team.
- **Real-time access** to the patient's medical information must be available.
- Patients must be able to schedule **successive routine appointments** with a designated care team member.
- Care must be deliverable in **alternative formats** (e.g., home visits, expanded hours).

---

### 4. Comprehensive Care Management

- Perform **systemic needs assessments** — both medical and psychosocial.
- Use **system-based approaches** to ensure receipt of preventive services.
- Provide **medication reconciliation**, management, and oversight of self-management.

---

### 5. Care Plan (Electronic, Patient-Centered)

- Must be **developed, implemented, revised, and maintained** electronically.
- Must be **available within and outside** the billing practice to all individuals involved in the patient's care.
- Care team members must be able to **routinely access and update** the care plan.
- A copy must be **given to the patient or caregiver**.

---

### 6. Care Transitions Coordination

Covers transitions between and among health care providers and settings. Includes:

- **Referrals** to other providers.
- **Follow-up after emergency department visits**.
- **Follow-up after discharge** from a hospital, SNF, or other health care facility.

Coordination must include:

- **Timely exchange of electronic health information** with other providers.
- **Timely follow-up communication** (direct contact, phone, or electronic) with the patient or caregiver **within 7 days** of discharge from an ED visit, hospital, SNF, or other facility — as clinically indicated.

---

### 7. Practitioner, Home- & Community-Based Care Coordination

- Ongoing coordinating communication and documentation on the patient's:
  - Psychosocial strengths
  - Functional deficits
  - Goals, preferences, and desired outcomes
- Coordination spans: practitioners, home- and community-based service providers, community-based social service providers, hospitals, SNFs, and others.

---

### 8. Enhanced Communication Opportunities

The practice must offer:

- **Asynchronous, non-face-to-face** consultation methods other than phone (secure messaging, email, internet, patient portal).
- **Remote evaluation** of pre-recorded patient information.
- **Interprofessional phone, internet, or EHR referral services**.
- Support for **patient-initiated digital communications** requiring clinical decisions:
  - Virtual check-ins
  - Digital online assessment and management
  - E/M visits (e-visits)

---

### 9. Patient Population-Level Management

The practice must:

- **Analyze population data** to identify gaps in care.
- **Risk-stratify** the practice population based on diagnoses, claims, or other electronic data.
- Target services to patients based on stratification.

---

### 10. Performance Measurement & Reporting

The practice must measure and report performance including:

- Primary care quality
- Total cost of care
- Meaningful use of **Certified EHR Technology (CEHRT)**

Reporting options:

- Report the **Value in Primary Care MIPS Value Pathway (MVP)** — reporting starts in 2026 for CY 2025.
- Participate in a **Medicare Shared Savings Program ACO**, **REACH ACO**, **Making Care Primary model**, or **Primary Care First model**.

---

### APCM CPT Codes Reference

| CPT Code | Description                                         | Time / Level      |
| -------- | --------------------------------------------------- | ----------------- |
| `99424`  | APCM — First 30 min/month, low complexity           | 30 min, low       |
| `99425`  | APCM — Each additional 30 min/month, low complexity | +30 min, low      |
| `99426`  | APCM — First 30 min/month, moderate/high complexity | 30 min, mod/high  |
| `99427`  | APCM — Each additional 30 min/month, moderate/high  | +30 min, mod/high |
| `99490`  | CCM/APCM — Chronic care management, 20 min          | 20 min            |
| `99491`  | CCM/APCM — Care mgmt, physician directed, 30 min    | 30 min, physician |
| `99487`  | CCM/APCM — Complex chronic care management, 60 min  | 60 min, complex   |

### Billing Rules for UI/Logic

- **Only 1 provider** may bill APCM for a patient per calendar month — enforce single-provider lock in enrollment and billing flows.
- **Consent must be recorded** before any APCM CPT code can be generated for a patient.
- **Initiating visit** eligibility must be checked before flagging a new patient's first APCM bill (3-year visit history, 1-year care management history).
- **7-day follow-up window** after discharge/ED visit should be surfaced as a task or alert in the care coordination UI.
- **Staff interaction time** logged against a patient in a billing month feeds into CPT code eligibility (minimum thresholds per code).
- Care plan must show **last updated date** and warn if not updated within the billing period.
