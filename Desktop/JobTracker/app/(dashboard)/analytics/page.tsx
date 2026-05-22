export const dynamic = 'force-dynamic';

import { getStats, getWeekly, getStageTiming } from '@/lib/queries/analytics';
import { StatCard } from './stat-card';
import { Funnel } from './funnel';
import { Timing } from './timing';
import { WeeklyChart } from './weekly-chart';
import { EmptyState } from './empty-state';

export default async function AnalyticsPage() {
  const [stats, weekly, timing] = await Promise.all([
    getStats(),
    getWeekly(),
    getStageTiming(),
  ]);

  if (!stats || stats.total === 0) {
    return <EmptyState />;
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">03</p>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="border-t border-border mt-4" />
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <StatCard value={stats.total} label="applications" caption="TOTAL" />
        <StatCard value={stats.active} label="in pipeline" caption="ACTIVE" />
        <StatCard value={stats.offers} label="received" caption="OFFERS" />
        <StatCard value={`${stats.response_rate}%`} label="rate" caption="RESPONSE" />
      </section>

      <div className="border-t border-border mb-12" />

      <section className="mb-12">
        <h2 className="font-mono text-xs tracking-wider mb-6">APPLICATIONS OVER TIME</h2>
        <WeeklyChart data={weekly} />
      </section>

      <div className="border-t border-border mb-12" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-mono text-xs tracking-wider mb-6">PIPELINE FUNNEL</h2>
          <Funnel stats={stats} />
        </div>
        <div>
          <h2 className="font-mono text-xs tracking-wider mb-6">TIMING</h2>
          <Timing data={timing} />
        </div>
      </section>
    </div>
  );
}
