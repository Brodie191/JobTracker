import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <Skeleton className="h-3 w-4 mb-2" />
        <Skeleton className="h-8 w-32" />
        <div className="border-t border-border mt-4" />
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-px w-8" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </section>

      <div className="border-t border-border mb-12" />

      <section className="mb-12">
        <Skeleton className="h-3 w-48 mb-6" />
        <Skeleton className="h-48 w-full" />
      </section>

      <div className="border-t border-border mb-12" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <Skeleton className="h-3 w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      </section>
    </div>
  );
}
