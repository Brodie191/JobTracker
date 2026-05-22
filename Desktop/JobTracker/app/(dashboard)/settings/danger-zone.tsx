'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteAllApplications, deleteAccount } from '@/lib/actions/danger';

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  required,
  buttonLabel,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  required: string;
  buttonLabel: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState('');
  const canSubmit = value === required;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setValue(''); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs tracking-widest text-muted-foreground font-normal">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-1">{description}</p>
        <p className="text-xs text-muted-foreground">
          Type <span className="font-mono text-foreground">{required}</span> to confirm.
        </p>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={required}
          className="font-mono"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" disabled={!canSubmit || isPending} onClick={onConfirm}>
            {isPending ? 'Working...' : buttonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DangerZone() {
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteData = () => {
    startTransition(async () => {
      const result = await deleteAllApplications();
      if (result?.error) toast.error(result.error);
      else { toast.success('All applications deleted'); setDeleteDataOpen(false); }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteAccount('DELETE MY ACCOUNT');
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm">Delete all applications. Your account stays.</p>
        <Button variant="destructive" size="sm" onClick={() => setDeleteDataOpen(true)}>
          Delete all data
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm">Delete account. Permanent, no recovery.</p>
        <Button variant="destructive" size="sm" onClick={() => setDeleteAccountOpen(true)}>
          Delete account
        </Button>
      </div>

      <ConfirmDialog
        open={deleteDataOpen}
        onOpenChange={setDeleteDataOpen}
        title="DELETE ALL APPLICATIONS"
        description="This removes all your applications permanently. Your account is kept."
        required="DELETE"
        buttonLabel="Delete all data"
        onConfirm={handleDeleteData}
        isPending={isPending}
      />
      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="DELETE ACCOUNT"
        description="This permanently deletes your account, profile, and all applications. There is no recovery."
        required="DELETE MY ACCOUNT"
        buttonLabel="Delete account permanently"
        onConfirm={handleDeleteAccount}
        isPending={isPending}
      />
    </div>
  );
}
