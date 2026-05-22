'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, updatePassword } from '@/lib/actions/profile';

interface ProfileFormProps {
  displayName: string | null;
  email: string;
}

export function ProfileForm({ displayName, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) toast.error(result.error);
      else toast.success('Profile updated');
    });
  };

  return (
    <form onSubmit={handleProfile} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label className="text-xs font-mono tracking-wider">DISPLAY NAME</Label>
        <Input name="display_name" defaultValue={displayName ?? ''} placeholder="Your name" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-mono tracking-wider">EMAIL</Label>
        <Input value={email} disabled className="opacity-50" />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();

  const handlePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success('Password updated');
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={handlePassword} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label className="text-xs font-mono tracking-wider">CURRENT PASSWORD</Label>
        <Input name="current_password" type="password" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-mono tracking-wider">NEW PASSWORD</Label>
        <Input name="new_password" type="password" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-mono tracking-wider">CONFIRM PASSWORD</Label>
        <Input name="confirm_password" type="password" required />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  );
}
