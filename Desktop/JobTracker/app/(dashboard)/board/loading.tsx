import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Skeleton className="h-3 w-4 mb-2" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['01', '02', '03', '04'].map((n) => (
          <div key={n}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-border rounded p-3 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
