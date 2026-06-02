import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-4 px-6">
        <div className="mx-auto max-w-sm flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link
            href="/privacy-policy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy policy
          </Link>
          <Link
            href="/cookie-policy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cookie policy
          </Link>
          <a
            href="mailto:babhairsalim33@gmail.com"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
