import React, { useRef, useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCheck,
  ClipboardList,
  MessageSquare,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SenderRole = 'patient' | 'ai' | 'nurse' | 'dhn' | 'physician';
type SessionStatus = 'active' | 'resolved' | 'escalated';
type PointType = 'clinical' | 'action' | 'flag' | 'info';

interface Message {
  id: string;
  role: SenderRole;
  senderName: string;
  content: string;
  time: string;
}

interface Session {
  id: string;
  dateLabel: string;
  timeRange: string;
  preview: string;
  messageCount: number;
  participants: SenderRole[];
  status: SessionStatus;
  hasAlert: boolean;
}

interface KeyPoint {
  id: string;
  type: PointType;
  text: string;
}

interface SummaryParticipant {
  role: SenderRole;
  name: string;
  initials: string;
  messages: number;
}

interface SessionSummary {
  sessionId: string;
  generatedAt: string;
  overview: string;
  keyPoints: KeyPoint[];
  participants: SummaryParticipant[];
  actionItems: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SESSIONS: Session[] = [
  {
    id: 's-001',
    dateLabel: 'Apr 8, 2026',
    timeRange: '9:30 AM – 11:25 AM',
    preview: 'BP reading of 148/92 flagged. Physician scheduled telehealth at 3 PM.',
    messageCount: 10,
    participants: ['patient', 'ai', 'nurse', 'physician', 'dhn'],
    status: 'escalated',
    hasAlert: true,
  },
  {
    id: 's-002',
    dateLabel: 'Apr 7, 2026',
    timeRange: '7:12 AM – 7:45 AM',
    preview: 'Daily weight check completed. Weight stable at 172 lbs.',
    messageCount: 6,
    participants: ['patient', 'ai', 'nurse'],
    status: 'resolved',
    hasAlert: false,
  },
  {
    id: 's-003',
    dateLabel: 'Apr 28, 2026',
    timeRange: '3:00 PM – 3:38 PM',
    preview: 'Medication adherence review. Lisinopril refill requested.',
    messageCount: 8,
    participants: ['patient', 'ai', 'nurse', 'dhn'],
    status: 'resolved',
    hasAlert: false,
  },
  {
    id: 's-004',
    dateLabel: 'Apr 26, 2026',
    timeRange: '10:05 AM – 10:20 AM',
    preview: 'Patient reported mild dizziness. Nurse advised rest and hydration.',
    messageCount: 5,
    participants: ['patient', 'ai', 'nurse'],
    status: 'resolved',
    hasAlert: false,
  },
];

const MESSAGES: Record<string, Message[]> = {
  's-001': [
    {
      id: 'm-001',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Good morning. My blood pressure reading this morning was 148/92. Should I be concerned?',
      time: '9:30 AM',
    },
    {
      id: 'm-002',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Good morning, Robert. A reading of 148/92 is elevated above your target range of 130/80. I have noted this in your record and alerted your care team. Can you confirm you have taken your morning medications?',
      time: '9:31 AM',
    },
    {
      id: 'm-003',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Yes, I took my Lisinopril at 8 AM as scheduled.',
      time: '9:32 AM',
    },
    {
      id: 'm-004',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Thank you. I have escalated this to your nurse for review. Please avoid strenuous activity until you hear back from your care team.',
      time: '9:33 AM',
    },
    {
      id: 'm-005',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Hi Robert, I reviewed your reading. Since you have taken your medication, let us monitor for the next hour. If your systolic stays above 150 mmHg, please call us immediately.',
      time: '9:45 AM',
    },
    {
      id: 'm-006',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Okay, I will check again at 10:30. Should I also reduce my salt intake today?',
      time: '9:50 AM',
    },
    {
      id: 'm-007',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Absolutely. Keep sodium under 1,500 mg today and stay well hydrated. I will follow up after your 10:30 reading.',
      time: '9:52 AM',
    },
    {
      id: 'm-008',
      role: 'physician',
      senderName: 'Dr. Michael Torres',
      content:
        "Robert, I've reviewed your readings from this morning. Your BP trend this week is concerning. I'd like to schedule a telehealth call this afternoon. Are you available at 3 PM?",
      time: '11:10 AM',
    },
    {
      id: 'm-009',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Yes, 3 PM works for me. Thank you, doctor.',
      time: '11:14 AM',
    },
    {
      id: 'm-010',
      role: 'dhn',
      senderName: 'Ethan Brooks',
      content:
        "Hi Robert! I've sent you a calendar invite for the 3 PM call. I've also shared a resource on low-sodium meal planning in your patient portal. Let me know if you have any questions before the call.",
      time: '11:25 AM',
    },
  ],
  's-002': [
    {
      id: 'm-201',
      role: 'ai',
      senderName: 'AI Health Agent',
      content: 'Good morning, Robert! Time for your daily weight check. Please log your weight when you get a moment.',
      time: '7:12 AM',
    },
    {
      id: 'm-202',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Just weighed in — 172 lbs.',
      time: '7:18 AM',
    },
    {
      id: 'm-203',
      role: 'ai',
      senderName: 'AI Health Agent',
      content:
        'Weight logged: 172 lbs. That is stable compared to yesterday (171 lbs). No significant change. Keep up the good work!',
      time: '7:18 AM',
    },
    {
      id: 'm-204',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content:
        'Good morning, Robert. Weight looks stable — nice work staying consistent. How are you feeling overall today?',
      time: '7:30 AM',
    },
    {
      id: 'm-205',
      role: 'patient',
      senderName: 'Eleanor Vance',
      content: 'Feeling good today, thank you. No symptoms to report.',
      time: '7:40 AM',
    },
    {
      id: 'm-206',
      role: 'nurse',
      senderName: 'RN Jessica Park',
      content: "Great to hear. Stay hydrated and I'll check in again tomorrow. Have a great day!",
      time: '7:45 AM',
    },
  ],
};

const SUMMARIES: Record<string, SessionSummary> = {
  's-001': {
    sessionId: 's-001',
    generatedAt: 'Today at 11:30 AM',
    overview:
      'Eleanor Vance reported an elevated BP reading of 148/92 mmHg. The AI Health Agent escalated the alert to the care team after confirming medication adherence. RN Jessica Park advised monitoring and restricted sodium intake to under 1,500 mg. Dr. Michael Torres reviewed the weekly BP trend and scheduled a telehealth call at 3 PM, with Ethan Brooks (DHN) sending the calendar invite.',
    keyPoints: [
      { id: 'kp-1', type: 'flag', text: 'BP 148/92 mmHg — above target (130/80 mmHg)' },
      { id: 'kp-2', type: 'clinical', text: 'Lisinopril 10 mg confirmed taken at 8:00 AM' },
      { id: 'kp-3', type: 'clinical', text: 'Physician noted concerning BP trend this week' },
      { id: 'kp-4', type: 'action', text: 'Sodium intake restricted to < 1,500 mg today' },
      { id: 'kp-5', type: 'action', text: 'Telehealth call scheduled at 3:00 PM today' },
      { id: 'kp-6', type: 'info', text: 'Low-sodium meal plan resource shared with patient' },
    ],
    participants: [
      { role: 'patient', name: 'Eleanor Vance', initials: 'SM', messages: 4 },
      { role: 'ai', name: 'AI Health Agent', initials: 'AI', messages: 3 },
      { role: 'nurse', name: 'RN Jessica Park', initials: 'JP', messages: 2 },
      { role: 'physician', name: 'Dr. Michael Torres', initials: 'MT', messages: 1 },
    ],
    actionItems: [
      'Monitor BP at 10:30 AM — nurse to follow up',
      'Telehealth call at 3:00 PM (calendar invite sent)',
      'Review weekly BP trend before telehealth call',
    ],
  },
  's-002': {
    sessionId: 's-002',
    generatedAt: 'Yesterday at 7:50 AM',
    overview:
      'The AI Health Agent prompted the daily weight check. Eleanor Vance logged 172 lbs — stable from the previous day. RN Jessica Park reviewed the result, confirmed no symptoms, and advised continuing the daily monitoring routine.',
    keyPoints: [
      { id: 'kp-1', type: 'clinical', text: 'Weight: 172 lbs — stable (±1 lb from yesterday)' },
      { id: 'kp-2', type: 'info', text: 'Patient reports no symptoms today' },
      { id: 'kp-3', type: 'action', text: 'Continue daily weight monitoring' },
    ],
    participants: [
      { role: 'patient', name: 'Eleanor Vance', initials: 'SM', messages: 2 },
      { role: 'ai', name: 'AI Health Agent', initials: 'AI', messages: 2 },
      { role: 'nurse', name: 'RN Jessica Park', initials: 'JP', messages: 2 },
    ],
    actionItems: ['Continue daily weight check at same time each morning'],
  },
};

// ─── Role Config ──────────────────────────────────────────────────────────────

type RoleConfig = {
  label: string;
  avatarBg: string;
  bubbleBg: string;
  bubbleBorder: string;
  dot: string;
};

const ROLE_CONFIG: Record<SenderRole, RoleConfig> = {
  patient: {
    label: 'Patient',
    avatarBg: 'bg-teal-500',
    bubbleBg: 'bg-teal-50',
    bubbleBorder: 'border-l-2 border-teal-300',
    dot: 'bg-teal-400',
  },
  ai: {
    label: 'AI Agent',
    avatarBg: 'bg-violet-500',
    bubbleBg: 'bg-violet-50',
    bubbleBorder: 'border-l-2 border-violet-300',
    dot: 'bg-violet-400',
  },
  nurse: {
    label: 'Nurse',
    avatarBg: 'bg-emerald-500',
    bubbleBg: 'bg-white',
    bubbleBorder: 'border border-slate-200',
    dot: 'bg-emerald-400',
  },
  dhn: {
    label: 'DHN',
    avatarBg: 'bg-sky-500',
    bubbleBg: 'bg-sky-50',
    bubbleBorder: 'border-l-2 border-sky-300',
    dot: 'bg-sky-400',
  },
  physician: {
    label: 'Physician',
    avatarBg: 'bg-primary',
    bubbleBg: 'bg-primary/5',
    bubbleBorder: 'border-l-2 border-primary/40',
    dot: 'bg-primary',
  },
};

const STATUS_CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  resolved: { label: 'Resolved', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  escalated: { label: 'Escalated', className: 'bg-rose-50 text-rose-600 border border-rose-200' },
};

const POINT_CONFIG: Record<PointType, { icon: React.ReactNode; className: string; dotColor: string }> = {
  flag: {
    icon: <AlertCircle size={11} />,
    className: 'text-rose-600 bg-rose-50 border border-rose-200',
    dotColor: 'bg-rose-500',
  },
  clinical: {
    icon: <ClipboardList size={11} />,
    className: 'text-teal-700 bg-teal-50 border border-teal-200',
    dotColor: 'bg-teal-500',
  },
  action: {
    icon: <CheckCheck size={11} />,
    className: 'text-violet-700 bg-violet-50 border border-violet-200',
    dotColor: 'bg-violet-500',
  },
  info: {
    icon: <AlertCircle size={11} />,
    className: 'text-slate-600 bg-slate-50 border border-slate-200',
    dotColor: 'bg-slate-400',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, showSender }: { msg: Message; showSender: boolean }): React.JSX.Element {
  const cfg = ROLE_CONFIG[msg.role];
  const isPatient = msg.role === 'patient';

  // Patient: no avatar, no name — bubble only, right-aligned feel
  // Care team: avatar + name on first of consecutive group
  const showHeader = showSender && !isPatient;

  return (
    <div className={cn('flex items-start gap-3', !showHeader && 'mt-1')}>
      {/* Avatar — care team only, first of group */}
      {!isPatient ? (
        showHeader ? (
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-white',
              cfg.avatarBg
            )}
          >
            {msg.role === 'ai' ? <Bot size={13} /> : getInitials(msg.senderName)}
          </div>
        ) : (
          <div className="w-7 shrink-0" />
        )
      ) : null}

      <div className="flex-1 min-w-0">
        {/* Name + time — care team only, first of group */}
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[12px] font-semibold text-foreground">{msg.senderName}</span>
            <span className="text-[10.5px] text-muted-foreground">{msg.time}</span>
          </div>
        )}

        {/* Time only for patient (no name) */}
        {isPatient && showSender && <span className="text-[10.5px] text-muted-foreground mb-1">{msg.time}</span>}

        <div
          className={cn(
            'px-3.5 py-2.5 rounded-xl text-[12.5px] text-foreground leading-relaxed w-full',
            showHeader && !isPatient ? 'rounded-tl-sm' : '',
            cfg.bubbleBg,
            cfg.bubbleBorder
          )}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessagesTab(): React.JSX.Element {
  const [activeSessionId, setActiveSessionId] = useState<string>('s-001');
  const chatRef = useRef<HTMLDivElement>(null);

  const activeMessages = MESSAGES[activeSessionId] ?? [];
  const activeSummary = SUMMARIES[activeSessionId];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [activeSessionId]);

  return (
    <div className="flex gap-3.5 overflow-hidden" style={{ height: 'calc(100vh - 306px)', minHeight: '520px' }}>
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Session list                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-[20%] shrink-0 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-muted-foreground" />
              <h3 className="text-[12.5px] font-bold text-foreground">Sessions</h3>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
              {SESSIONS.length}
            </span>
          </div>
        </div>

        {/* Session list — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
          {SESSIONS.map((session) => {
            const isActive = session.id === activeSessionId;
            const statusCfg = STATUS_CONFIG[session.status];
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setActiveSessionId(session.id)}
                className={cn(
                  'relative w-full text-left px-3.5 py-3 transition-colors group',
                  isActive ? 'bg-primary/5' : 'hover:bg-slate-50'
                )}
              >
                {/* Date + status */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-[11px] font-bold', isActive ? 'text-primary' : 'text-foreground')}>
                    {session.dateLabel}
                  </span>
                  <span className={cn('text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full', statusCfg.className)}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Time range */}
                <p className="text-[10px] text-muted-foreground mb-1.5">{session.timeRange}</p>

                {/* Preview */}
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-2">{session.preview}</p>

                {/* Active indicator */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MIDDLE PANEL — Conversation history                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden min-w-0">
        {/* Read-only notice */}
        <div className="flex items-center gap-2 px-5 py-1.5 bg-slate-50 border-b border-slate-100 shrink-0">
          <UserRound size={10} className="text-muted-foreground shrink-0" />
          <p className="text-[10.5px] text-muted-foreground">
            View-only — Clinic Admin cannot send messages in this conversation.
          </p>
        </div>

        {/* Messages — scrollable */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <MessageSquare size={28} className="text-slate-200" />
              <p className="text-[12px] text-muted-foreground">No messages in this session.</p>
            </div>
          ) : (
            activeMessages.map((msg, i) => (
              <MessageBubble key={msg.id} msg={msg} showSender={i === 0 || activeMessages[i - 1].role !== msg.role} />
            ))
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — AI Conversation Summary                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-[20%] shrink-0 flex flex-col rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
              <Sparkles size={12} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-[12.5px] font-bold text-foreground leading-tight">AI Summary</h3>
              {activeSummary && (
                <p className="text-[10px] text-muted-foreground">Generated {activeSummary.generatedAt}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {!activeSummary ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-5">
              <Bot size={28} className="text-slate-200" />
              <p className="text-[11.5px] text-muted-foreground">No summary available for this session.</p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-5">
              {/* Overview */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1.5">
                  Overview
                </p>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">{activeSummary.overview}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Key Points */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-2">
                  Key Points
                </p>
                <div className="space-y-1.5">
                  {activeSummary.keyPoints.map((pt) => {
                    const ptCfg = POINT_CONFIG[pt.type];
                    return (
                      <div
                        key={pt.id}
                        className={cn(
                          'flex items-start gap-2 px-2.5 py-2 rounded-lg text-[11.5px] leading-snug',
                          ptCfg.className
                        )}
                      >
                        <span className="shrink-0 mt-0.5">{ptCfg.icon}</span>
                        <span>{pt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom padding */}
              <div className="h-1" />
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={10} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              AI-generated summary — verify critical points before acting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
