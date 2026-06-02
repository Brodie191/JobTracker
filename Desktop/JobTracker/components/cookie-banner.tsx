'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ConsentChoice = 'accepted' | 'rejected';
const CONSENT_KEY = 'cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored !== 'accepted' && stored !== 'rejected') {
      setVisible(true);
    }
  }, []);

  function handleChoice(choice: ConsentChoice) {
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background"
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use strictly necessary cookies to keep you signed in. No analytics or
          advertising cookies are set.{' '}
          <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Cookie policy
          </Link>
          {' · '}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleChoice('rejected')}>
            Reject all
          </Button>
          <Button size="sm" onClick={() => handleChoice('accepted')}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
