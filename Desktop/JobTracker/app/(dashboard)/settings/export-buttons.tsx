'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportJson, exportCsv } from '@/lib/actions/export';

export function ExportButtons() {
  const [isPending, startTransition] = useTransition();

  const handleExport = (action: typeof exportJson) => {
    startTransition(async () => {
      const result = await action();
      if (result.error) { toast.error(result.error); return; }

      const blob = new Blob([result.content!], {
        type: result.filename!.endsWith('.json') ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename!;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export ready');
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Export all your applications as a file.</p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleExport(exportJson)}>
          Export JSON
        </Button>
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleExport(exportCsv)}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}
