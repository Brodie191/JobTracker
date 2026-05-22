'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from './card';
import type { Application, ApplicationStatus } from '@/lib/types';
import { STATUS_TEXT, STATUS_BG_DOT } from '@/lib/status';

interface ColumnProps {
  status: ApplicationStatus;
  label: string;
  index: string;
  applications: Application[];
}

export function Column({ status, label, index, applications }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 ${STATUS_BG_DOT[status]}`} />
          <span className={`font-mono text-[10px] tracking-widest ${STATUS_TEXT[status]}`}>
            {label}
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">
          {applications.length.toString().padStart(2, '0')}
        </span>
      </div>

      <SortableContext
        id={status}
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 transition-colors ${isOver ? 'bg-muted/40' : ''}`}
        >
          {applications.length === 0 ? (
            <div className={`border border-dashed border-border p-6 text-center text-xs ${STATUS_TEXT[status]}/40`}>
              EMPTY
            </div>
          ) : (
            applications.map((app) => <Card key={app.id} application={app} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
