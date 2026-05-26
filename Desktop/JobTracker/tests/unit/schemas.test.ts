import { describe, it, expect } from 'vitest';
import {
  applicationSchema,
  passwordSchema,
  deleteConfirmSchema,
  preferenceSchema,
} from '@/lib/schemas';

// applicationSchema 

describe('applicationSchema', () => {
  const valid = {
    company: 'Acme',
    role: 'Engineer',
    status: 'applied' as const,
    applied_at: '2024-06-01',
  };

  it('accepts a minimal valid payload', () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts all four statuses', () => {
    for (const status of ['applied', 'interviewing', 'offer', 'rejected'] as const) {
      expect(applicationSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });

  it('rejects an empty company', () => {
    const result = applicationSchema.safeParse({ ...valid, company: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status', () => {
    const result = applicationSchema.safeParse({ ...valid, status: 'ghosted' });
    expect(result.success).toBe(false);
  });

  it('rejects a javascript: URL (XSS vector)', () => {
    const result = applicationSchema.safeParse({
      ...valid,
      job_url: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });

  it('accepts an empty job_url (field is optional)', () => {
    const result = applicationSchema.safeParse({ ...valid, job_url: '' });
    expect(result.success).toBe(true);
  });

  it('accepts a valid HTTPS job_url', () => {
    const result = applicationSchema.safeParse({
      ...valid,
      job_url: 'https://jobs.lever.co/acme/123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid date format', () => {
    const result = applicationSchema.safeParse({ ...valid, applied_at: '01-06-2024' });
    expect(result.success).toBe(false);
  });

  it('trims whitespace from company and role', () => {
    const result = applicationSchema.safeParse({
      ...valid,
      company: '  Acme  ',
      role: '  Engineer  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe('Acme');
      expect(result.data.role).toBe('Engineer');
    }
  });

  it('rejects company longer than 120 characters', () => {
    const result = applicationSchema.safeParse({ ...valid, company: 'A'.repeat(121) });
    expect(result.success).toBe(false);
  });
});

//passwordSchema 

describe('passwordSchema', () => {
  it('accepts matching passwords of sufficient length', () => {
    const result = passwordSchema.safeParse({
      current_password: 'oldpass',
      new_password: 'newpass123',
      confirm_password: 'newpass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = passwordSchema.safeParse({
      current_password: 'oldpass',
      new_password: 'newpass123',
      confirm_password: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('rejects new password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse({
      current_password: 'oldpass',
      new_password: 'short',
      confirm_password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

//deleteConfirmSchema 

describe('deleteConfirmSchema', () => {
  it('accepts the exact phrase DELETE MY ACCOUNT', () => {
    expect(deleteConfirmSchema.safeParse({ confirmation: 'DELETE MY ACCOUNT' }).success).toBe(true);
  });

  it('rejects anything other than the exact phrase', () => {
    for (const bad of ['delete my account', 'DELETE MY ACCOUNT ', 'yes', '']) {
      expect(deleteConfirmSchema.safeParse({ confirmation: bad }).success).toBe(false);
    }
  });
});

//preferenceSchema 

describe('preferenceSchema', () => {
  it('accepts valid view and theme values', () => {
    expect(preferenceSchema.safeParse({ default_view: 'board', theme: 'dark' }).success).toBe(true);
  });

  it('rejects an invalid theme', () => {
    expect(preferenceSchema.safeParse({ theme: 'solarized' }).success).toBe(false);
  });

  it('accepts an empty object (all fields optional)', () => {
    expect(preferenceSchema.safeParse({}).success).toBe(true);
  });
});
