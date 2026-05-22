import type { StageTiming } from '@/lib/queries/analytics';

interface TimingProps {
  data: StageTiming[];
}

export function Timing({ data }: TimingProps) {
  const get = (stage: StageTiming['stage']) =>
    data.find((d) => d.stage === stage)?.avg_days ?? null;

  const appliedToInterviewing = get('applied_to_interviewing');
  const interviewingToOffer = get('interviewing_to_offer');

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-muted-foreground mb-1">
          Applied &rarr; Interviewing
        </div>
        <div className="font-mono text-2xl">
          {appliedToInterviewing !== null ? (
            `avg ${appliedToInterviewing} days`
          ) : (
            <span className="text-muted-foreground text-base">no data yet</span>
          )}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">
          Interviewing &rarr; Offer
        </div>
        <div className="font-mono text-2xl">
          {interviewingToOffer !== null ? (
            `avg ${interviewingToOffer} days`
          ) : (
            <span className="text-muted-foreground text-base">no data yet</span>
          )}
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground border-t border-border pt-3 mt-4">
        Approximated from last status change. Stage history coming in v2.
      </div>
    </div>
  );
}
