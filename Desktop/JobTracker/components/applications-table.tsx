'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApplicationDialog } from '@/components/application-dialog';
import { deleteApplication } from '@/lib/actions/applications';
import type { Application } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [newOpen, setNewOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [deleteApp, setDeleteApp] = useState<Application | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteApp) return;
    startTransition(async () => {
      const result = await deleteApplication(deleteApp.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Application deleted');
        setDeleteApp(null);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {applications.length} {applications.length === 1 ? 'APPLICATION' : 'APPLICATIONS'}
        </p>
        <Button size="sm" onClick={() => setNewOpen(true)} className="gap-1.5">
          <Plus size={14} />
          New Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="border border-border rounded py-24 text-center">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">NO APPLICATIONS YET</p>
          <p className="mt-2 text-sm text-muted-foreground">Start tracking by adding your first application.</p>
          <Button size="sm" variant="outline" onClick={() => setNewOpen(true)} className="mt-4 gap-1.5">
            <Plus size={14} />
            Add Application
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">COMPANY</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">ROLE</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">STATUS</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">APPLIED</TableHead>
                <TableHead className="font-mono text-[10px] tracking-wider text-muted-foreground">LOCATION</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer"
                  onClick={() => setEditApp(app)}
                >
                  <TableCell className="font-medium">{app.company}</TableCell>
                  <TableCell className="text-muted-foreground">{app.role}</TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] tracking-wider border border-border px-2 py-0.5 uppercase">
                      {STATUS_LABELS[app.status]}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {app.applied_at ? format(new Date(app.applied_at), 'd MMM yyyy') : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {app.location ?? '—'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {app.job_url && (
                          <DropdownMenuItem asChild>
                            <a href={app.job_url} target="_blank" rel="noreferrer" className="gap-2">
                              <ExternalLink size={12} />
                              View Listing
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setEditApp(app)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteApp(app)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ApplicationDialog open={newOpen} onOpenChange={setNewOpen} />
      <ApplicationDialog
        open={!!editApp}
        onOpenChange={(open) => !open && setEditApp(null)}
        application={editApp ?? undefined}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteApp} onOpenChange={(open) => !open && setDeleteApp(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs tracking-widest text-muted-foreground font-normal">
              CONFIRM DELETE
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Remove <span className="text-foreground font-medium">{deleteApp?.company}</span> {deleteApp?.role}?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteApp(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
