interface StatCardProps {
  value: number | string;
  label: string;
  caption: string;
}

export function StatCard({ value, label, caption }: StatCardProps) {
  return (
    <div>
      <div className="font-mono text-xs text-muted-foreground tracking-wider mb-2">
        {caption}
      </div>
      <div className="font-mono text-4xl text-foreground mb-1">
        {value}
      </div>
      <div className="border-t border-border w-8 mb-2" />
      <div className="text-xs text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
