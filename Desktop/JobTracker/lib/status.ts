import type { ApplicationStatus } from '@/lib/types';

// Full class names listed as literals so Tailwind's JIT can detect them.
// Never build these dynamically with template literals — they get purged.

export const STATUS_BORDER_LEFT: Record<ApplicationStatus, string> = {
  applied:      'border-l-applied',
  interviewing: 'border-l-interviewing',
  offer:        'border-l-offer',
  rejected:     'border-l-rejected',
};

export const STATUS_TEXT: Record<ApplicationStatus, string> = {
  applied:      'text-applied',
  interviewing: 'text-interviewing',
  offer:        'text-offer',
  rejected:     'text-rejected',
};

export const STATUS_BG_DOT: Record<ApplicationStatus, string> = {
  applied:      'bg-applied',
  interviewing: 'bg-interviewing',
  offer:        'bg-offer',
  rejected:     'bg-rejected',
};
