'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import type { Application } from '@/lib/types';
import { STATUS_BORDER_LEFT } from '@/lib/status';

interface CardProps {
  application: Application;
  isDragging?: boolean;
}

export function Card({ application, isDragging }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const borderHue = isDragging
    ? 'border-l-foreground'
    : STATUS_BORDER_LEFT[application.status];

  return (
    <div
      ref={setNodeRef}
      style={isDragging ? undefined : style}
      {...attributes}
      {...listeners}
      className={`bg-background border border-border border-l-2 ${borderHue} p-3 cursor-grab active:cursor-grabbing select-none hover:bg-muted/40 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <p className="text-sm font-medium leading-tight">{application.company}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{application.role}</p>
      {(application.location || application.applied_at) && (
        <div className="mt-2 flex items-center gap-2">
          {application.location && (
            <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
              {application.location}
            </span>
          )}
          {application.applied_at && (
            <span className="font-mono text-[9px] tracking-wider text-muted-foreground ml-auto">
              {format(new Date(application.applied_at), 'd MMM')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
