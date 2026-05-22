'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">ERROR</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-8">
          An unexpected error occurred. Try again or reload the page.
        </p>
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
