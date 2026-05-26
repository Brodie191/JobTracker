import { z } from 'zod';

export const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(120),
  role: z.string().trim().min(1, 'Role is required').max(120),
  status: z.enum(['applied', 'interviewing', 'offer', 'rejected']),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  salary_range: z.string().trim().max(60).optional().or(z.literal('')),
  job_url: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Must be an http or https URL')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  applied_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
});

export const profileSchema = z.object({
  display_name: z.string().trim().max(60).optional().or(z.literal('')),
});

export const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8, 'Minimum 8 characters').max(72),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const preferenceSchema = z.object({
  default_view: z.enum(['table', 'board']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const deleteConfirmSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
