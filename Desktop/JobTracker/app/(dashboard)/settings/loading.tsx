import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <Skeleton className="h-3 w-4 mb-2" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="border-t border-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <div className="py-8 space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="border-t border-border" />
        </div>
      ))}
    </div>
  );
}
