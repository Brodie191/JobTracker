import type { ApplicationStats } from '@/lib/queries/analytics';

interface FunnelProps {
  stats: ApplicationStats;
}

export function Funnel({ stats }: FunnelProps) {
  const stages = [
    { label: 'Applied', count: stats.applied },
    { label: 'Interviewing', count: stats.interviewing },
    { label: 'Offer', count: stats.offers },
    { label: 'Rejected', count: stats.rejected },
  ];

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const widthPct = (stage.count / max) * 100;
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-28 text-xs">{stage.label}</div>
            <div className="flex-1 h-5 bg-muted relative">
              <div
                className="absolute inset-y-0 left-0 bg-foreground"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <div className="font-mono text-sm w-8 text-right">
              {stage.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
