import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/applications"
          className="font-mono text-xs tracking-wider underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          BACK TO APPLICATIONS
        </Link>
      </div>
    </div>
  );
}
