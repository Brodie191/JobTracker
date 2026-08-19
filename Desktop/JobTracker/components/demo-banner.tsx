'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { resetDemoData } from '@/lib/actions/demo';

export function DemoBanner() {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetDemoData();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Demo reset — ${result.count} applications restored`);
      router.refresh();
    });
  };

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="flex items-center gap-3 px-6 py-2 text-[11px]">
        <span className="font-mono tracking-widest text-foreground">DEMO</span>

        <span className="hidden text-muted-foreground sm:inline">
          Shared sandbox — everything is editable and nothing here is real data.
        </span>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-mono tracking-wider text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {expanded ? 'LESS' : 'WHAT CAN I TRY?'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded border border-border px-2 py-1 font-mono tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'RESETTING' : 'RESET DEMO DATA'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/60 px-6 py-3">
          <ul className="grid gap-1.5 text-[11px] text-muted-foreground sm:grid-cols-2">
            <li>
              <span className="font-mono text-foreground">BOARD</span> — drag a card between
              columns; the move persists to Postgres.
            </li>
            <li>
              <span className="font-mono text-foreground">N</span> or{' '}
              <span className="font-mono text-foreground">⌘K</span> — add an application from any
              page.
            </li>
            <li>
              <span className="font-mono text-foreground">PASTE A JOB URL</span> — a Greenhouse or
              Lever link auto-fills the form via the scraper, falling back to the trained
              extraction model.
            </li>
            <li>
              <span className="font-mono text-foreground">ANALYTICS</span> — funnel, response rate
              and stage timing computed in SQL.
            </li>
            <li>
              <span className="font-mono text-foreground">SETTINGS</span> — CSV/JSON export, theme
              and default-view preferences.
            </li>
            <li>
              Account deletion and password changes are switched off here so the sandbox survives
              the next visitor.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
