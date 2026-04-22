# Variation 4 — UI Design Reference

> **What is Variation 4?**
> Variation 4 is the "Teal / Sidebar" design theme of the Health Telematix platform.
> It is also labelled **"Variation 3"** in the on-screen DemoSwitcher (the switcher uses
> `id: 4` internally but displays the label "Variation 3").
> All V4 source files live in `src/pages/dashboard/` and are suffixed `V4`.

---

## 1. Design Identity

| Attribute | Value |
|-----------|-------|
| Theme name | Teal / Sidebar |
| Primary colour | `#0D9488` (Teal-600) |
| Primary light | `#F0FDFA` (Teal-50) |
| Page background | `#FAFAF9` (warm off-white) |
| Surface (cards) | `#FFFFFF` |
| Border | `#E2E8F0` / `#E8EDF2` |
| Text — primary | `#0F172A` |
| Text — secondary | `#374151` |
| Text — muted | `#64748B` |
| Text — placeholder | `#94A3B8` |
| Text — disabled | `#CBD5E1` |
| Danger | `#EF4444` |
| Success | `#059669` |
| Font family | `Inter, system-ui, sans-serif` |
| Border radius — cards | `14px` |
| Border radius — buttons | `9px` |
| Border radius — pills/tags | `999px` |
| Border radius — icon boxes | `9–10px` |

### Design tokens (copy these at the top of every V4 file)

```js
const TEAL      = '#0D9488'
const TEAL_LT   = '#F0FDFA'
const PAGE_BG   = '#FAFAF9'
const NAV_W     = 240          // expanded sidebar width
const COLLAPSED_W = 60         // collapsed sidebar width
const FF        = 'Inter, system-ui, sans-serif'
```

---

## 2. Layout System

### Overall page shell

```
┌────────────────────────────────────────────────┐
│  LeftNav (position:fixed, 240px or 60px wide)  │
│  ┌─────────────────────────────────────────┐   │
│  │  TopBar (position:sticky, height 80px)  │   │
│  ├─────────────────────────────────────────┤   │
│  │  Main scrollable content area           │   │
│  │  padding: 28px 28px 48px                │   │
│  └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

```jsx
<div style={{ display: 'flex', minHeight: '100vh', background: PAGE_BG, fontFamily: FF }}>
  <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed(o => !o)} />
  <div style={{
    marginLeft: navCollapsed ? COLLAPSED_W : NAV_W,
    transition: 'margin-left 0.22s ease',
    flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
  }}>
    <TopBar />
    <div style={{ padding: '28px 28px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* page content */}
    </div>
  </div>
</div>
```

**Rules:**
- `LeftNav` is always `position: fixed`, `top: 0`, `left: 0`, `zIndex: 40`
- `TopBar` is always `position: sticky`, `top: 0`, `zIndex: 30`
- Content div uses `marginLeft` that animates with the nav collapse
- Every new V4 page **must** include `navCollapsed` state + `onToggle` handler

---

## 3. Left Navigation

### Constants

| Prop | Expanded | Collapsed |
|------|----------|-----------|
| Width | `240px` | `60px` |
| Logo area | Full wordmark + subtitle | Logo icon only, centered |
| Nav items | Icon + label + badge | Icon only, centered |
| "Main Menu" label | Visible | Hidden |
| Profile row | Avatar + name + role + chevron | Avatar only, centered |
| Toggle button | `<ChevronLeft>` (left-pointing) | `<ChevronRight>` (right-pointing) |

### LeftNav component signature

```jsx
function LeftNav({ active: activeItem, collapsed, onToggle }) { ... }
// active = nav item id string, e.g. 'dashboard'
```

### Nav items list (same on every V4 page)

```js
const mainNav = [
  { id: 'dashboard',           label: 'Dashboard',           icon: <LayoutDashboard size={17} /> },
  { id: 'clinic-management',   label: 'Clinic Management',   icon: <Building2 size={17} /> },
  { id: 'resource-management', label: 'Resource Management', icon: <Boxes size={17} /> },
  { id: 'messages',            label: 'Messages',            icon: <MessageSquare size={17} />, badge: 3 },
]
```

### Navigation click handlers

```js
onClick={() => {
  if (item.id === 'dashboard')         navigate('/dashboard')
  if (item.id === 'clinic-management') navigate('/clinic-management')
  if (item.id === 'messages')          navigate('/messages')
}}
```

### Collapse toggle button

```jsx
<button
  onClick={onToggle}
  style={{
    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
    width: 24, height: 24, borderRadius: '50%',
    background: '#ffffff', border: '1.5px solid #E8EDF2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    zIndex: 50, color: '#94A3B8', flexShrink: 0,
  }}
  onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = TEAL }}
  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E8EDF2' }}
>
  {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
</button>
```

**CRITICAL:** Always import both `ChevronLeft` AND `ChevronRight` from `lucide-react`.
Missing `ChevronLeft` causes a runtime crash when the nav is expanded.

### Tooltip (collapsed state only)

When collapsed, hovering a nav item shows a dark floating label:

```jsx
// Wrap each NavItem in a div with hover handlers:
<div
  onMouseEnter={() => collapsed && setTooltip(item.id)}
  onMouseLeave={() => setTooltip(null)}
>
  <NavItem ... showTooltip={tooltip === item.id} />
</div>
```

Tooltip renders inside `NavItem` when `collapsed && showTooltip`:
```jsx
<div style={{
  position: 'absolute', left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)',
  background: '#1E293B', color: '#fff', fontSize: 12.5, fontWeight: 500,
  padding: '6px 12px', borderRadius: 7, whiteSpace: 'nowrap',
  pointerEvents: 'none', zIndex: 200, boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
}}>
  {/* Left-pointing triangle pointer */}
  <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
    width: 0, height: 0, borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent', borderRight: '5px solid #1E293B' }} />
  {label}
</div>
```

### NavItem component

```jsx
function NavItem({ icon, label, active, onClick, badge, collapsed, showTooltip }) {
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onClick} style={{
        width: '100%', display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 11,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 9,
        background: active ? TEAL : 'transparent',
        border: 'none', cursor: 'pointer',
        color: active ? '#ffffff' : '#64748B',
        fontSize: 13.5, fontWeight: active ? 600 : 400,
        fontFamily: FF, transition: 'background 0.15s, color 0.15s', textAlign: 'left',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F1F5F9' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: active ? 1 : 0.65 }}>{icon}</span>
        {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!collapsed && badge !== undefined && (
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
            background: active ? 'rgba(255,255,255,0.25)' : TEAL, color: '#fff', lineHeight: 1.4 }}>
            {badge}
          </span>
        )}
      </button>
      {/* tooltip rendered here when collapsed + showTooltip */}
    </div>
  )
}
```

### Active state rules

| Page | `active` prop value |
|------|---------------------|
| DashboardV4 | `'dashboard'` |
| ClinicManagementV4 | `'clinic-management'` |
| ClinicDetailV4 | `'clinic-management'` |
| MessagesV4 | `'messages'` |

### Profile dropdown (bottom of nav)

- Trigger: click the profile row button
- State: `profileOpen` boolean
- Backdrop: `position: fixed, inset: 0, zIndex: 90` closes the dropdown on outside click
- Dropdown: `position: absolute, bottom: calc(100% + 6px)`, opens **upward**
- When collapsed: dropdown is `width: 200px` with `right: auto`, `left: 0`
- When expanded: `left: 0, right: 0` (full width of nav)
- Only one action item: **Log Out** (red, navigates to `/`)

---

## 4. Top Bar

```jsx
function TopBar({ title, subtitle }) {
  return (
    <div style={{
      height: 80, background: '#ffffff',
      borderBottom: '1px solid #E8EDF2',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: FF, letterSpacing: '-0.01em' }}>{title}</h1>
        <p  style={{ fontSize: 12.5, color: '#94A3B8', margin: 0, fontFamily: FF }}>{subtitle}</p>
      </div>
      {/* right side: Bell + profile */}
    </div>
  )
}
```

**Right side always contains:**
1. Bell icon button — 38×38px, border `1px solid #E2E8F0`, red dot indicator at top-right
2. Profile pill — avatar gradient `linear-gradient(135deg, #14B8A6, #0D9488)`, initials "SM", name + email, ChevronDown

---

## 5. Pages Built

### 5.1 DashboardV4 — `/dashboard`

**File:** `src/pages/dashboard/DashboardV4.jsx`
**Route:** variant 4 only via `DashboardRoute` in `App.jsx`

#### State
```js
const [navCollapsed, setNavCollapsed] = useState(false)
const [period,       setPeriod]       = useState('Monthly')   // 'Monthly' | 'Quarterly' | 'Yearly'
const [selection,    setSelection]    = useState('Apr')        // context selector value
```

#### Sections (top → bottom)

1. **KPI Cards** — 3-column grid, 6 cards
2. **Charts Row** — `1fr 340px` grid
   - Left: Revenue Over Time (Recharts `LineChart`)
   - Right: Revenue by Program (Recharts `PieChart` donut)
3. **Billing Stats** — full width
   - CPT Code Cards — 4-column grid with teal left-border accent
   - Patient Billing Table — sortable columns

#### Chart data architecture

```
MONTHLY_DATA   { Jan: [{label:'1', apcm, rpm}, ...30 days], Feb: [...], ... }
QUARTERLY_DATA { Q1: [{label:'Jan', apcm, rpm}, Feb, Mar], Q2: [...], Q3, Q4 }
YEARLY_DATA    { 2024: [{label:'Jan'...Dec}], 2025: [...], 2026: [...] }

SECONDARY_OPTIONS = { Monthly: months[], Quarterly: quarters[], Yearly: years[] }
SECONDARY_DEFAULTS = { Monthly: 'Apr', Quarterly: 'Q2', Yearly: '2026' }
```

Daily data is generated deterministically via `genDays(count, baseApcm, baseRpm)` using sin-based variation.

#### Filter UI (inside chart card header)

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  {/* Context dropdown — changes options based on period */}
  <SelectFilter options={SECONDARY_OPTIONS[period]} value={selection} onChange={setSelection} />
  {/* Period pills */}
  <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 999, padding: 3, gap: 1 }}>
    {['Monthly','Quarterly','Yearly'].map(p => (
      <Pill key={p} label={p} active={period === p} onClick={() => handlePeriodChange(p)} />
    ))}
  </div>
</div>
```

X-axis tick interval: `period === 'Monthly' ? 4 : 0` (every 5th day for 30-day view)

#### KPI Card component

```jsx
function KpiCard({ icon, label, subLabel, value, trendUp, trendText }) { ... }
// icon: 36×36 box, background TEAL_LT, color TEAL
// value: fontSize 30, fontWeight 800
// trend badge: green bg + TrendingUp icon, or red bg + TrendingDown icon
// "vs last year" muted label
```

#### CPT Code cards

4 cards: G0557, G0556, 99454, 99457
- White background, `border-left: 4px solid TEAL`
- Shows: CPT code (large teal), description, patients billed count, revenue

---

### 5.2 ClinicManagementV4 — `/clinic-management`

**File:** `src/pages/dashboard/ClinicManagementV4.jsx`

#### Sections

1. Page header: title + "Add New Clinic" button (TEAL background, box shadow)
2. Controls row: Active/Deactivated pill switcher + search input
3. Data table (shadcn `Table`)
4. Pagination

#### Pill switcher (tab bar)

```jsx
// Outer container
<div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: 10, padding: 4, gap: 3 }}>
  {tabs.map(t => (
    <button style={{
      padding: '7px 16px', borderRadius: 7,
      background: isActive ? '#ffffff' : 'transparent',
      color: isActive ? TEAL : '#64748B',
      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.10)...' : 'none',
    }}>
      {t.label}
      {/* count badge */}
      <span style={{ background: isActive ? TEAL : 'rgba(100,116,139,0.12)', color: isActive ? '#fff' : '#64748B' }}>
        {count}
      </span>
    </button>
  ))}
</div>
```

#### Table card

- White background, `borderRadius: 16`, `border: 1px solid #E2E8F0`
- Header row: `background: PAGE_BG`, 11px uppercase labels, `#64748B`
- Rows: `cursor: pointer`, click navigates to `/clinic-management/:id`
- Hover: `background: '#slate-50/60'`
- DropdownMenu actions: Edit, Change Admin Email, Manage Users, Manage EHR Settings, Deactivate / Reactivate

#### Add Clinic Modal

- shadcn `Dialog`, `sm:max-w-[560px]`, `rounded-2xl`
- 2-column form grid
- Fields: Clinic Name, Admin Email, NPI, TIN, Logo (upload), EHR (select)
- Footer: Cancel (outline) + "Add Clinic & Invite Admin" (TEAL)
- Hover on EHR/logo inputs: border changes to TEAL

---

### 5.3 ClinicDetailV4 — `/clinic-management/:id`

**File:** `src/pages/dashboard/ClinicDetailV4.jsx`

#### Layout

Two-panel content area side by side:
- **Left (65%):** Clinic info cards + Users table
- **Right (35%):** Stats cards + Program breakdown + EHR status

#### Back button

```jsx
<button onClick={() => navigate('/clinic-management')} style={{
  display: 'flex', alignItems: 'center', gap: 7,
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: 500, color: '#64748B', padding: '6px 0',
}}>
  <ArrowLeft size={15} /> Back to Clinic Management
</button>
```

#### Info cards

White surface, `borderRadius: 12`, `border: 1px solid #E2E8F0`, `padding: 20px 22px`

Section headers inside cards: `fontSize: 11`, uppercase, `letterSpacing: 0.08em`, `color: #94A3B8`

#### Stats values

```jsx
// Large stat number
<p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>{value}</p>

// Trend badge (same pattern as KPI card)
<span style={{ background: up ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
               color: up ? '#059669' : '#DC2626', padding: '3px 8px', borderRadius: 999 }}>
  ↑ 12.3%
</span>
```

#### EHR status badge

```jsx
// Connected
<span style={{ background: '#F0FDFA', color: TEAL, border: '1px solid #99F6E4', padding: '3px 10px', borderRadius: 999 }}>
  ● Connected
</span>
// Not connected
<span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', ... }}>
  ○ Not Connected
</span>
```

#### Not-found state

When `clinic === undefined`, renders a full-page message with LeftNav still mounted:
```jsx
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: 16, color: '#94A3B8' }}>
  <Building2 size={40} strokeWidth={1.2} />
  <p>Clinic not found</p>
  <button onClick={() => navigate('/clinic-management')}>← Back</button>
</div>
```

---

### 5.4 MessagesV4 — `/messages`

**File:** `src/pages/dashboard/MessagesV4.jsx`

#### Three-panel layout

```
┌─────────────────────────────────────────────────────────┐
│  LeftNav (fixed, collapsible)                           │
│  ┌────────┬──────────────────────────┬────────────────┐ │
│  │  20%   │          55%             │      25%       │ │
│  │ Patient│   Chat / Conversation    │ Patient Detail │ │
│  │  List  │       History            │ Panel          │ │
│  └────────┴──────────────────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

Full height: `calc(100vh - 64px)` (subtracts TopBar height)

#### Panel widths
| Panel | Width |
|-------|-------|
| Left (patient list) | 20% |
| Middle (chat) | 55% |
| Right (patient detail) | 25% |

#### Sender colour map

```js
const SENDER = {
  patient:   { bg: '#F0FDFA', border: '#99F6E4', text: '#0F172A', label: 'Patient',       dot: TEAL      },
  ai:        { bg: '#F5F3FF', border: '#DDD6FE', text: '#0F172A', label: 'AI Agent',      dot: '#7C3AED' },
  nurse:     { bg: '#EFF6FF', border: '#BFDBFE', text: '#0F172A', label: 'Virtual Nurse', dot: '#2563EB' },
  physician: { bg: '#F0FDF4', border: '#BBF7D0', text: '#0F172A', label: 'Physician',     dot: '#059669' },
}
```

#### Left panel

- Header: "Messages" title + unread count badge + compose button
- Search input
- Session list: each row has avatar (initials, coloured), patient name, time, preview snippet, condition pill, unread dot

#### Middle panel (chat)

- Header: patient name, participant count, legend dots per sender type
- Date separator: centered text `fontSize 11`, `color #94A3B8`, `background #E2E8F0` divider lines either side
- Message bubbles: all left-aligned, each bubble shows sender avatar + coloured background from `SENDER` map
- Read-only lock bar at bottom: lock icon + "Read-only — This conversation is in review" + gold pill badge

#### Right panel (patient detail)

Sections (top → bottom):
1. **Patient header** — avatar, name, age/DOB/gender row, program pills (APCM, RPM), EHR ID
2. **Latest Vitals** — list with value + unit + timestamp + red alert dot for abnormal
3. **Active Alerts** — high (red) / medium (amber) severity rows with coloured left border
4. **Active Medications** — name + dose + frequency rows
5. **On Call** — single card with nurse avatar, name, role, online dot
6. **Active Programs** — APCM + RPM pill tags
7. **Conversation Flow** — horizontal flow diagram: Patient → AI → Nurse → Physician, coloured dots + connecting gradient lines

#### Mock sessions (5 patients)

| # | Patient | Condition |
|---|---------|-----------|
| 1 | Emma Rodriguez | Hypertension |
| 2 | Michael Chen | Type II Diabetes |
| 3 | Linda Foster | Heart Failure |
| 4 | David Kim | Obesity |
| 5 | Patricia Lee | Atrial Fibrillation |

---

## 6. Reusable Component Patterns

### Status Badge (Active / Deactivated)

```jsx
// Active
<span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', marginRight: 6 }} />
  Active
</span>

// Deactivated
<span style={{ background: '#F8FAFC', color: '#94A3B8', border: '1px solid #E2E8F0', ... }}>
  Deactivated
</span>
```

Or use shadcn `<Badge>` with Tailwind classes (ClinicManagementV4 uses this pattern).

### Pill / Toggle Button

```jsx
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
      background: active ? TEAL : 'transparent',
      color: active ? '#fff' : '#64748B',
      fontSize: 12, fontWeight: active ? 600 : 500,
      fontFamily: FF, transition: 'all 0.15s ease',
    }}>{label}</button>
  )
}
```

Wrap pills in `<div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 999, padding: 3, gap: 1 }}>`.

### Context Selector Dropdown (SelectFilter)

Used in DashboardV4 chart header. Custom dropdown built with inline styles.

```jsx
function SelectFilter({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  // trigger: border TEAL 44% opacity, background white, hover TEAL_LT
  // dropdown: position absolute, top calc(100% + 6px), right 0
  //           backdrop: position fixed, inset 0, zIndex 90
  //           options: active item gets TEAL_LT background + TEAL text + fontWeight 600
}
```

### Trend Badge

```jsx
<span style={{
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
  background: trendUp ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
  color: trendUp ? '#059669' : '#DC2626',
}}>
  {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
  {trendText}
</span>
```

### Section divider (inside card)

```jsx
<div style={{ height: 1, background: '#F1F5F9', margin: '0 0 16px' }} />
```

### Card container

```jsx
<div style={{
  background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 14,
  padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}}>
```

### Icon box (KPI / feature)

```jsx
<div style={{
  width: 36, height: 36, borderRadius: 9,
  background: TEAL_LT,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: TEAL, flexShrink: 0,
}}>
  <SomeIcon size={16} />
</div>
```

---

## 7. Typography Scale

| Use | fontSize | fontWeight | color |
|-----|----------|------------|-------|
| Page title (TopBar) | 17 | 700 | `#0F172A` |
| Section heading | 15–16 | 700 | `#0F172A` |
| Card title | 14–15 | 700 | `#0F172A` |
| Body / label | 13–13.5 | 500–600 | `#374151` |
| Sub-label / helper | 11.5–12.5 | 400–500 | `#94A3B8` |
| Table header | 11 | 700 | `#64748B` (uppercase) |
| Table cell | 13–13.5 | 400–600 | `#0F172A` / `#64748B` |
| KPI value | 30 | 800 | `#0F172A` |
| Section meta label | 10–11 | 700 | `#CBD5E1` (uppercase) |
| Badge / pill text | 10.5–12 | 600–700 | varies |

---

## 8. Routing & Context

### App.jsx route wiring (V4 only)

```jsx
// Route components that serve V4
function DashboardRoute()        { variant === 4 → <DashboardV4 />        }
function ClinicManagementRoute() { variant === 4 → <ClinicManagementV4 /> }
function ClinicDetailRoute()     { variant === 4 → <ClinicDetailV4 />     }
function MessagesRoute()         { variant === 4 → <MessagesV4 />         }
```

Variant is stored in `localStorage` under key `ht_demo_variant` via `VariantContext`.

### DemoSwitcher

- Located bottom-right, `position: fixed`, `zIndex: 9999`
- "Variation 3" button = `id: 4` (maps to teal theme)
- Clicking "Variation 3" calls `setVariant(4)` AND `navigate('/dashboard')`

---

## 9. Charts (Recharts — DashboardV4)

V4 uses **Recharts** (already in dependencies). Do NOT use Chart.js for V4.

### Line Chart config

```jsx
<LineChart data={chartData} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
    interval={period === 'Monthly' ? 4 : 0} />
  <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94A3B8' }}
    axisLine={false} tickLine={false} width={44} />
  <Tooltip content={<CustomTooltip />} />
  <Legend iconType="circle" iconSize={8} />
  <Line type="monotone" dataKey="apcm" name="APCM Revenue" stroke={TEAL} strokeWidth={2.5}
    dot={{ r: 3.5, fill: TEAL, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5 }} />
  <Line type="monotone" dataKey="rpm" name="RPM Revenue" stroke="#64748B" strokeWidth={2}
    strokeDasharray="6 3" dot={{ r: 3, fill: '#64748B', stroke: 'white', strokeWidth: 2 }} />
</LineChart>
```

### Custom Tooltip (dark)

```jsx
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.20)', fontFamily: FF }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', margin: '0 0 6px',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: entry.color, margin: '2px 0' }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}
```

### Pie (Donut) Chart config

```jsx
<PieChart>
  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85}
    paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
  </Pie>
  <Tooltip content={<PieTooltip />} />
</PieChart>
```

Pie data colours: APCM = `TEAL`, RPM = `#64748B`, Other = `#CBD5E1`

---

## 10. Required Imports for Every V4 Page

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Boxes, MessageSquare, Settings,
  Bell, LogOut, ChevronDown, ChevronLeft, ChevronRight,
  /* page-specific icons */
} from 'lucide-react'
```

Always import **both** `ChevronLeft` and `ChevronRight` — the collapse toggle needs both regardless of initial state.

---

## 11. Shadow & Elevation System

| Level | Box Shadow |
|-------|-----------|
| Cards (default) | `0 1px 3px rgba(0,0,0,0.05)` |
| LeftNav | `2px 0 12px rgba(0,0,0,0.04)` |
| TopBar | `0 1px 4px rgba(0,0,0,0.04)` |
| Modals / dropdowns | `0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)` |
| Teal CTA button | `0 4px 14px rgba(13,148,136,0.22)` |
| Toggle button | `0 2px 6px rgba(0,0,0,0.08)` |
| Logo icon | `0 4px 10px rgba(13,148,136,0.27)` |
| Tooltip | `0 4px 14px rgba(0,0,0,0.22)` |

---

## 12. Checklist for a New V4 Page

When building any new page in Variation 4, follow this checklist:

- [ ] Copy the design tokens block (`TEAL`, `TEAL_LT`, `PAGE_BG`, `NAV_W`, `COLLAPSED_W`, `FF`)
- [ ] Import `ChevronLeft` AND `ChevronRight` from lucide-react
- [ ] Copy the `NavItem` component verbatim
- [ ] Copy the `LeftNav` component with `{ active, collapsed, onToggle }` props
- [ ] Copy the `TopBar` component (update `title` and `subtitle`)
- [ ] Add `const [navCollapsed, setNavCollapsed] = useState(false)` to the main component
- [ ] Render `<LeftNav active="your-page-id" collapsed={navCollapsed} onToggle={() => setNavCollapsed(o => !o)} />`
- [ ] Set content div `marginLeft: navCollapsed ? COLLAPSED_W : NAV_W` with `transition: 'margin-left 0.22s ease'`
- [ ] Set the correct `active` prop value (matches the nav item `id` string)
- [ ] Add the page's navigate target to `App.jsx` MessagesRoute / new route wrapper

---

## 13. File Map

| File | Route | Description |
|------|-------|-------------|
| `src/pages/dashboard/DashboardV4.jsx` | `/dashboard` | Admin dashboard with KPI cards, revenue charts, billing stats |
| `src/pages/dashboard/ClinicManagementV4.jsx` | `/clinic-management` | Clinic list table with add/manage actions |
| `src/pages/dashboard/ClinicDetailV4.jsx` | `/clinic-management/:id` | Individual clinic detail, users, EHR status |
| `src/pages/dashboard/MessagesV4.jsx` | `/messages` | 3-panel messaging (20/55/25) |
| `src/components/demo/DemoSwitcher.jsx` | — | Floating variant switcher (Variation 3 = id 4) |
| `src/context/VariantContext.jsx` | — | React context + localStorage for active variant |
| `src/App.jsx` | — | Route definitions with variant-aware wrappers |
