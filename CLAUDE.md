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
| `onboarding`      | 12      | Invitation flow, email verify, set password, create profile, EHR setup, sign in, **login (post-logout)**, **forgot password**, **reset password**                    |
| `dashboard`       | 2       | KPI cards, revenue graphs (APCM · RPM · **BHI**), enrollment trends, billing stats                                                                                   |
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

---

## Onboarding Flow — Implemented Screens & Routes

The onboarding module has two distinct entry-point flows. Do not confuse them:

| Flow                  | Path               | Purpose                                                |
| --------------------- | ------------------ | ------------------------------------------------------ |
| First-time invitation | `/sign-in`         | Admin arriving via invitation email for the first time |
| Return / post-logout  | `/login`           | Admin signing back in after logging out                |
| Forgot password       | `/forgot-password` | Sends reset link to email                              |
| Reset password        | `/reset-password`  | Arrived via email link; sets new password              |

### Route order in `src/router/index.tsx`

```
/                   → <Navigate to="/login" replace />
/sign-in            → <SignIn />          (invitation onboarding entry)
/login              → <Login />           (post-logout sign-in)
/forgot-password    → <ForgotPassword />
/reset-password     → <ResetPassword />
/verify-email       → <EmailVerification />
/set-password       → <SetPassword />
/create-profile     → <CreateProfile />
/review-users       → <ReviewUsers />
/review-ehr         → <ReviewEHR />
```

### Logout behaviour

`LeftNav.tsx` logout button navigates to `/login` — never to `/` or `/sign-in`.

### Constants (all in `src/modules/onboarding/constants/index.ts`)

```ts
SIGN_IN_PATH = '/sign-in';
LOGIN_PATH = '/login';
FORGOT_PASSWORD_PATH = '/forgot-password';
RESET_PASSWORD_PATH = '/reset-password';
EMAIL_VERIFICATION_PATH = '/verify-email';
SET_PASSWORD_PATH = '/set-password';
CREATE_PROFILE_PATH = '/create-profile';
REVIEW_USERS_PATH = '/review-users';
REVIEW_EHR_PATH = '/review-ehr';
DASHBOARD_PATH = '/dashboard';
```

---

## Onboarding Screen Patterns

### Two-panel layout (all onboarding screens)

Every onboarding screen uses the same split layout — no exceptions:

```tsx
<div className="min-h-screen flex">
  <OnboardingLeftPanel />
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
    {/* Mobile logo — lg:hidden */}
    {/* Content */}
    <p className="mt-10 text-[12px] text-muted-foreground">© 2026 Health Telematix. All rights reserved.</p>
  </div>
</div>
```

- `OnboardingLeftPanel` is at `src/modules/onboarding/components/onboarding-left-panel/OnboardingLeftPanel.tsx`
- It is `hidden lg:flex` — only shows on large screens
- The mobile logo block inside the right panel must be `lg:hidden`
- Footer goes **inside** the right panel (not `absolute`), using `mt-10`

### Read-only account details card pattern (`CreateProfile`)

When showing pre-filled, non-editable data from an invitation, use a card with a header badge — never disabled `<Input>` fields:

```tsx
<div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6">
  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
    <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Account Details</p>
    <span className="inline-flex items-center gap-1 text-[11px] ... rounded-full px-2.5 py-0.5">
      <Lock size={9} /> From invitation
    </span>
  </div>
  <div className="grid grid-cols-2 divide-x divide-slate-100">{/* icon + label + value per column */}</div>
</div>
```

### Password strength bar pattern (`ResetPassword`)

Shown live as the user types into the new password field (`mode: 'onChange'`):

```tsx
const STRENGTH_RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];
// Score 0–4 → maps to Weak/Fair/Good/Strong
// 4-segment bar + 2×2 checklist grid rendered below the input
```

### Success popup pattern (post-action dialogs)

Used for: physician invite sent, password reset successfully.

```tsx
<Dialog open={isSuccess}>
  <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
    <div className="overflow-hidden rounded-[inherit]">
      {/* Gradient header: from-emerald-50/90 to-white */}
      {/* Large icon circle with animate-ping outer ring */}
      {/* Heading + subtitle */}
      {/* Steps card: border border-slate-100 divide-y, each row has Check icon + label + step pill */}
      {/* Full-width CTA button */}
    </div>
  </DialogContent>
</Dialog>
```

Key details:

- `showCloseButton={false}` — user must act on the CTA
- Step pill style: `text-[11px] font-semibold text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full`
- Animated icon: wrap in `<div className="relative">`, add `<span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />` behind the icon circle

### Demo guide banner pattern

Used on "Check your inbox" to allow devs to navigate to the reset password screen without a real email:

```tsx
<div className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 mb-4 flex items-start gap-3">
  <FlaskConical size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
  <div>
    <p className="text-[12px] font-semibold text-amber-700 mb-0.5">Demo only</p>
    <p className="text-[12px] text-amber-600">...</p>
  </div>
</div>
```

---

## Dialog Component Notes (`@base-ui/react/dialog`)

This project uses `@base-ui/react/dialog` — **not** Radix UI. Key differences:

| Feature                     | Radix UI               | base-ui                                     |
| --------------------------- | ---------------------- | ------------------------------------------- |
| Hide close button           | `hideCloseButton`      | `showCloseButton={false}`                   |
| Prevent dismiss on backdrop | `onPointerDownOutside` | Not supported via prop — omit `dismissible` |
| Prevent dismiss on Escape   | `onEscapeKeyDown`      | Not supported via prop                      |

The `DialogContent` component in this project accepts a custom `showCloseButton?: boolean` prop (default `true`). Do not pass `dismissible`, `onPointerDownOutside`, or `onEscapeKeyDown` — they will cause TypeScript errors.

---

## Dashboard — Program Types

The revenue dashboard tracks three programs: **APCM**, **RPM**, **BHI**.  
`CCM` was replaced with `BHI` on 2026-05-06. All three files were updated together:

- `src/modules/dashboard/@types/index.ts` — `ProgramFilter` union + `RevenueDataPoint` field key
- `src/modules/dashboard/utils/index.ts` — data arrays and filter logic
- `src/modules/dashboard/components/revenue/RevenueGraph.tsx` — filter pill, chart config, bar, legend, subtitle

When adding or renaming a program type, always update all three files atomically.

---

## Activity Log — Category System

The patient Activity Log tab uses 6 fixed categories (not free-form types):

| Category                    | Dot / Background / Text                                 |
| --------------------------- | ------------------------------------------------------- |
| Vitals & Device Data        | `bg-rose-400` / `bg-rose-50` / `text-rose-600`          |
| Clinical Review & Decisions | `bg-violet-400` / `bg-violet-50` / `text-violet-600`    |
| Patient Communication       | `bg-emerald-400` / `bg-emerald-50` / `text-emerald-600` |
| Care Coordination           | `bg-sky-400` / `bg-sky-50` / `text-sky-600`             |
| Program/Billing Events      | `bg-amber-400` / `bg-amber-50` / `text-amber-600`       |
| Alerts & System Events      | `bg-slate-400` / `bg-slate-100` / `text-slate-500`      |

Each `ActivityEvent` has `category: Category` (not a free-form `type` string). Filter pills above the timeline let the user narrow by category.

---

## User Management — Specialty Dropdown Fix

The Specialty `SearchableSelect` inside the Add Physician `Dialog` was clipped because `DialogContent` has `overflow: hidden`. Fix: use `ReactDOM.createPortal` to render the dropdown panel on `document.body` with `position: fixed` coordinates from `getBoundingClientRect()`.

Outside-click handler must check **both** the trigger container ref AND the portal panel ref — `mousedown` fires on `document.body` before `click`, which would otherwise close the dropdown before a selection registers.

```tsx
// Pattern
const triggerRef = useRef<HTMLDivElement>(null);
const dropdownRef = useRef<HTMLDivElement>(null); // on the portal panel

useEffect(() => {
  function handleMouseDown(e: MouseEvent) {
    if (containerRef.current?.contains(e.target as Node) || dropdownRef.current?.contains(e.target as Node)) return;
    setOpen(false);
  }
  document.addEventListener('mousedown', handleMouseDown);
  return () => document.removeEventListener('mousedown', handleMouseDown);
}, [open]);
```

---

## Patient Data — Business Rules

- **One program per patient** — a patient can only be enrolled in one program at a time (RPM or APCM, not both). The `programs` field on `PatientSeed` is `ProgramType[]` typed but must always contain exactly one element. Enforce at the data/form level.
- **Seed key versioning** — when mock patient seed data changes structurally, bump `PATIENT_SEED_KEY` in `src/modules/patient/constants/index.ts` (e.g. `_v2`, `_v3`) to force a fresh localStorage re-seed on next load.
