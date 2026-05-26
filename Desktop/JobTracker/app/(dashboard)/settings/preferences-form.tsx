'use client';

import { useEffect, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { updatePreference } from '@/lib/actions/profile';

interface PreferencesFormProps {
  defaultView: 'table' | 'board';
  theme: 'light' | 'dark' | 'system';
}

type RadioGroupProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex items-center gap-8">
      <span className="text-xs font-mono tracking-wider w-28 text-muted-foreground">{label}</span>
      <div className="flex gap-6">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-foreground"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function PreferencesForm({ defaultView, theme: dbTheme }: PreferencesFormProps) {
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();

  // Sync DB value into next-themes on first mount
  useEffect(() => {
    setTheme(dbTheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleView = (value: string) => {
    startTransition(async () => {
      const result = await updatePreference('default_view', value as 'table' | 'board');
      if (result?.error) toast.error(result.error);
      else toast.success('Preference saved');
    });
  };

  const handleTheme = (value: string) => {
    setTheme(value);
    startTransition(async () => {
      await updatePreference('theme', value as 'light' | 'dark' | 'system');
    });
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        label="DEFAULT VIEW"
        options={[{ value: 'table', label: 'Table' }, { value: 'board', label: 'Board' }]}
        value={defaultView}
        onChange={handleView}
      />
      <RadioGroup
        label="THEME"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ]}
        value={theme ?? dbTheme}
        onChange={handleTheme}
      />
    </div>
  );
}
