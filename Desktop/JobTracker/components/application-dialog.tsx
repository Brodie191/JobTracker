'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createApplication, updateApplication } from '@/lib/actions/applications';
import { UrlParseRow } from '@/components/url-parse-row';
import type { Application, ApplicationStatus } from '@/lib/types';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/types';

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application;
}

export function ApplicationDialog({ open, onOpenChange, application }: ApplicationDialogProps) {
  const isEdit = !!application;
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState({
    company: application?.company ?? '',
    role: application?.role ?? '',
    status: application?.status ?? 'applied',
    applied_at: application?.applied_at ?? new Date().toISOString().split('T')[0],
    location: application?.location ?? '',
    salary_range: application?.salary_range ?? '',
    job_url: application?.job_url ?? '',
    notes: application?.notes ?? '',
  });

  const set = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleExtracted = (extracted: Partial<typeof fields>) => {
    setFields((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(extracted).filter(([, v]) => v !== undefined && v !== '')
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      if (isEdit) {
        const result = await updateApplication(application.id, {
          company: fields.company,
          role: fields.role,
          status: fields.status as ApplicationStatus,
          location: fields.location || null,
          salary_range: fields.salary_range || null,
          job_url: fields.job_url || null,
          notes: fields.notes || null,
          applied_at: fields.applied_at,
        });
        if (result?.error) toast.error(result.error);
        else { toast.success('Application updated'); onOpenChange(false); }
      } else {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => formData.set(k, v));
        const result = await createApplication(formData);
        if (result?.error) toast.error(result.error);
        else {
          toast.success('Application added');
          setFields({ company: '', role: '', status: 'applied', applied_at: new Date().toISOString().split('T')[0], location: '', salary_range: '', job_url: '', notes: '' });
          onOpenChange(false);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs tracking-widest text-muted-foreground font-normal">
            {isEdit ? 'EDIT APPLICATION' : 'NEW APPLICATION'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!isEdit && <UrlParseRow onFieldsExtracted={handleExtracted} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">COMPANY</Label>
              <Input name="company" required value={fields.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">ROLE</Label>
              <Input name="role" required value={fields.role} onChange={(e) => set('role', e.target.value)} placeholder="Software Engineer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">STATUS</Label>
              <Select name="status" value={fields.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="font-mono text-xs">{STATUS_LABELS[s]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">APPLIED DATE</Label>
              <Input name="applied_at" type="date" value={fields.applied_at} onChange={(e) => set('applied_at', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">LOCATION</Label>
              <Input name="location" value={fields.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote / London" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider">SALARY RANGE</Label>
              <Input name="salary_range" value={fields.salary_range} onChange={(e) => set('salary_range', e.target.value)} placeholder="£60k - £80k" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono tracking-wider">JOB URL</Label>
            <Input name="job_url" type="url" value={fields.job_url} onChange={(e) => set('job_url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono tracking-wider">NOTES</Label>
            <Textarea name="notes" rows={3} value={fields.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Referral, interview notes, etc." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
