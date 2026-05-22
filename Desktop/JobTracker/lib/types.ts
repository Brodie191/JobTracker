export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  location: string | null;
  salary_range: string | null;
  job_url: string | null;
  notes: string | null;
  applied_at: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'APPLIED',
  interviewing: 'INTERVIEWING',
  offer: 'OFFER',
  rejected: 'REJECTED',
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'interviewing',
  'offer',
  'rejected',
];
