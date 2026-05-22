'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ApplicationDialog } from '@/components/application-dialog';

interface DashboardShellProps {
  email: string;
  children: React.ReactNode;
}

export function DashboardShell({ email, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setNewDialogOpen(true);
    }
    if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
      setNewDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navLinks = [
    { href: '/applications', label: 'APPLICATIONS', index: '01' },
    { href: '/board', label: 'BOARD', index: '02' },
    { href: '/analytics', label: 'ANALYTICS', index: '03' },
    { href: '/settings', label: 'SETTINGS', index: '04' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <span className="font-mono text-xs tracking-widest text-muted-foreground">JOB TRACKER</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(({ href, label, index }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="font-mono text-[10px]">{index}</span>
                <span className="font-mono text-[11px] tracking-wider">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <p className="text-[11px] text-muted-foreground truncate px-1">{email}</p>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-[11px] font-mono tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>

      {/* Global new application dialog (cmd+k / n) */}
      <ApplicationDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />
    </div>
  );
}
