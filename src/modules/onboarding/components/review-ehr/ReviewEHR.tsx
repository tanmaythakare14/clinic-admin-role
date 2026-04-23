import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, ArrowRight, Check, Plug, PlugZap, Trash2, AlertCircle, Plus, ServerCrash } from 'lucide-react';
import { OnboardingLeftPanel } from '../onboarding-left-panel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { CREATE_PROFILE_PATH, REVIEW_USERS_PATH, REVIEW_EHR_PATH, DASHBOARD_PATH } from '../../constants';

const STEPS = [
  { label: 'Create Profile', path: CREATE_PROFILE_PATH },
  { label: 'Review Assigned Users', path: REVIEW_USERS_PATH },
  { label: 'Review EHR Details', path: REVIEW_EHR_PATH },
];

const EHR_SYSTEM_BADGE_CLASS: Record<string, string> = {
  Epic: 'bg-blue-50 text-blue-700 border-0',
  Cerner: 'bg-orange-50 text-orange-700 border-0',
  Athena: 'bg-teal-50 text-teal-700 border-0',
  Meditech: 'bg-violet-50 text-violet-700 border-0',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  Active: 'bg-teal-50 text-teal-700 border-0',
  Inactive: 'bg-red-50 text-red-600 border-0',
  Pending: 'bg-amber-50 text-amber-600 border-0',
};

const STATUS_DOT_CLASS: Record<string, string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-rose-500',
  Pending: 'bg-amber-500',
};

interface EHRDetails {
  system: 'Epic' | 'Cerner' | 'Athena' | 'Meditech';
  environment: string;
  smartAppEnabled: boolean;
  integrationStatus: 'Active' | 'Inactive' | 'Pending';
  connectedOn: string;
}

const MOCK_EHR: EHRDetails = {
  system: 'Epic',
  environment: 'Production · v10.2',
  smartAppEnabled: true,
  integrationStatus: 'Active',
  connectedOn: 'Mar 14, 2025',
};

function EHRSetupView(): React.JSX.Element {
  const navigate = useNavigate();
  const [ehr] = useState<EHRDetails>(MOCK_EHR);
  const [smartOn, setSmartOn] = useState(ehr.smartAppEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleToggleSmart(checked: boolean): void {
    setSmartOn(checked);
    toast.success(`SMART App ${checked ? 'enabled' : 'disabled'}`);
  }

  function handleRemove(): void {
    toast.error('Connection removed. Contact Super Admin to reconnect.');
  }

  async function handleContinue(): Promise<void> {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    navigate(DASHBOARD_PATH);
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center rounded-xl w-[42px] h-[42px] ${EHR_SYSTEM_BADGE_CLASS[ehr.system]}`}
              >
                <PlugZap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground">{ehr.system}</p>
                  <Badge variant="outline" className={EHR_SYSTEM_BADGE_CLASS[ehr.system]}>
                    {ehr.system}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ehr.environment}</p>
              </div>
            </div>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[ehr.integrationStatus]}>
              <span
                className={`inline-block rounded-full w-1.5 h-1.5 mr-1.5 ${STATUS_DOT_CLASS[ehr.integrationStatus]}`}
              />
              {ehr.integrationStatus}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border px-0">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Connected On</span>
            <span className="text-xs font-medium text-foreground">{ehr.connectedOn}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground" htmlFor="smart-toggle">
                SMART App Integration
              </Label>
              <p className="text-[11px] mt-0.5 text-muted-foreground">Enables secure third-party app access</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="smart-toggle" checked={smartOn} onCheckedChange={handleToggleSmart} />
              <span className={`text-xs font-semibold ${smartOn ? 'text-primary' : 'text-muted-foreground'}`}>
                {smartOn ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold text-muted-foreground">Integration Status</span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_BADGE_CLASS[ehr.integrationStatus]}`}
            >
              <span className={`inline-block rounded-full w-1.5 h-1.5 ${STATUS_DOT_CLASS[ehr.integrationStatus]}`} />
              {ehr.integrationStatus}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 size={13} />
            Remove Connection
          </Button>
        </CardFooter>
      </Card>

      <Alert className="mt-4 bg-sky-50 border-sky-200">
        <AlertCircle size={14} className="text-sky-600" />
        <AlertDescription className="text-sky-700 text-xs leading-relaxed">
          <span className="font-semibold">Set up by Super Admin.</span> Contact Super Admin Support to modify EHR system
          or credentials.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
        >
          ← Back
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleContinue}
          className="h-11 px-6 text-sm font-semibold"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin w-4 h-4" />
              Saving…
            </>
          ) : (
            <>
              Continue <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </>
  );
}

function EHREmptyView(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <>
      <Card className="rounded-2xl border-dashed border-2 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-14 px-8 text-center">
          <div className="relative mb-6">
            <div className="flex items-center justify-center rounded-full w-20 h-20 bg-muted border border-border">
              <ServerCrash size={36} className="text-muted-foreground/50" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full w-[26px] h-[26px] bg-amber-50 border-2 border-card">
              <Plug size={13} className="text-amber-500" />
            </div>
          </div>

          <h3 className="font-bold text-foreground text-base mb-2">No EHR System Connected</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[320px]">
            Your Super Admin hasn't set up an EHR integration yet. You can add EHR details now or continue and set it up
            later.
          </p>

          <Button
            type="button"
            onClick={() => toast.info('EHR setup flow coming soon!')}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold"
          >
            <Plus size={15} />
            Add EHR Details
          </Button>
        </CardContent>
      </Card>

      <Alert className="mt-4 bg-amber-50 border-amber-200">
        <AlertCircle size={14} className="text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs leading-relaxed">
          <span className="font-semibold">EHR not required to proceed.</span> You can complete onboarding and connect
          EHR from the dashboard later.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(REVIEW_USERS_PATH)}
          className="h-11 px-5 text-sm font-semibold"
        >
          ← Back
        </Button>
        <Button type="button" onClick={() => navigate(DASHBOARD_PATH)} className="h-11 px-6 text-sm font-semibold">
          Skip for Now <ArrowRight size={15} />
        </Button>
      </div>
    </>
  );
}

export function ReviewEHR(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const hasEHR = searchParams.get('scenario') !== 'empty';

  return (
    <div className="min-h-screen flex">
      <OnboardingLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center rounded-xl bg-primary w-9 h-9">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-base">Health Telematix</span>
        </div>

        <div className="w-full max-w-[640px]">
          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = idx === 2;
              const isCompleted = idx < 2;
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
                      className={`flex-1 mx-2 h-0.5 mb-[22px] rounded-sm ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-foreground text-[22px] tracking-tight mb-1">Review EHR Details</h2>
            <p className="text-sm text-muted-foreground">
              {hasEHR
                ? 'Your EHR system has been connected by the Super Admin. Review the details below.'
                : 'No EHR system has been set up yet. You can add it now or skip and configure it later.'}
            </p>
          </div>

          {hasEHR ? <EHRSetupView /> : <EHREmptyView />}
        </div>
      </div>
    </div>
  );
}
