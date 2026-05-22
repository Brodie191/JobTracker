import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Skeleton className="h-3 w-4 mb-2" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="border border-border rounded overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex gap-8">
          {['COMPANY', 'ROLE', 'STATUS', 'APPLIED', 'LOCATION'].map((h) => (
            <Skeleton key={h} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-8 border-b border-border last:border-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
