export function EmptyState() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <div className="font-mono text-xs text-muted-foreground tracking-wider">
          03 / ANALYTICS
        </div>
        <div className="border-t border-border mt-2" />
      </header>
      <div className="border border-border p-12 text-center">
        <div className="font-mono text-xs text-muted-foreground tracking-wider mb-3">
          NO DATA YET
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add your first application from the Applications page.
          Analytics will populate as you go.
        </p>
      </div>
    </div>
  );
}
