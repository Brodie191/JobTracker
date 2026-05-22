'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { moveApplication } from '@/lib/actions/applications';
import type { Application, ApplicationStatus } from '@/lib/types';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/types';
import { Column } from './column';
import { Card } from './card';

const COLUMN_INDEX: Record<ApplicationStatus, string> = {
  applied: '01',
  interviewing: '02',
  offer: '03',
  rejected: '04',
};

interface BoardProps {
  initialApplications: Application[];
}

export function Board({ initialApplications }: BoardProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = applications
      .filter((a) => a.status === status)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    const overId = over.id as string;
    const overApp = applications.find((a) => a.id === overId);
    const destStatus = (overApp?.status ?? overId) as ApplicationStatus;

    if (!STATUS_ORDER.includes(destStatus)) return;
    if (activeApp.status === destStatus && active.id === over.id) return;

    const destApps = grouped[destStatus].filter((a) => a.id !== active.id);
    const overIndex = destApps.findIndex((a) => a.id === overId);
    const newPosition = overIndex === -1 ? destApps.length : overIndex;

    const previous = applications;
    setApplications((apps) =>
      apps.map((a) =>
        a.id === active.id ? { ...a, status: destStatus, position: newPosition } : a
      )
    );

    const result = await moveApplication(active.id as string, destStatus, newPosition);
    if (result?.error) {
      setApplications(previous);
      toast.error('Could not move card');
    }
  }

  const activeApp = applications.find((a) => a.id === activeId);

  if (applications.length === 0) {
    return (
      <div className="border border-border rounded py-24 text-center">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">NO APPLICATIONS YET</p>
        <p className="mt-2 text-sm text-muted-foreground">Add applications from the Applications view to see them here.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            label={STATUS_LABELS[status]}
            index={COLUMN_INDEX[status]}
            applications={grouped[status]}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? <Card application={activeApp} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
