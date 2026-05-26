-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  default_view text not null default 'table' check (default_view in ('table', 'board')),
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'applied' check (status in ('applied', 'interviewing', 'offer', 'rejected')),
  location text,
  salary_range text,
  job_url text,
  notes text,
  applied_at date not null default current_date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Users can manage own applications"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Analytics view
create or replace view public.application_stats
with (security_invoker = true) as
select
  count(*)::int                                                          as total,
  count(*) filter (where status in ('applied', 'interviewing'))::int    as active,
  count(*) filter (where status = 'offer')::int                         as offers,
  count(*) filter (where status = 'rejected')::int                      as rejected,
  count(*) filter (where status = 'interviewing')::int                  as interviewing,
  count(*) filter (where status = 'applied')::int                       as applied,
  case
    when count(*) = 0 then 0
    else round(
      count(*) filter (where status != 'applied')::numeric / count(*)::numeric * 100, 1
    )
  end                                                                    as response_rate
from public.applications
where user_id = auth.uid();

-- Weekly applications RPC
create or replace function public.applications_by_week(weeks_back integer default 12)
returns table(week_start date, count bigint)
language sql
security invoker
stable
as $$
  select
    date_trunc('week', applied_at)::date as week_start,
    count(*)                             as count
  from public.applications
  where
    user_id = auth.uid()
    and applied_at >= current_date - (weeks_back * 7)
  group by 1
  order by 1;
$$;

-- Stage timing RPC
create or replace function public.stage_timing()
returns table(stage text, avg_days numeric)
language sql
security invoker
stable
as $$
  select
    'applied_to_interviewing' as stage,
    round(avg(
      extract(epoch from (updated_at - created_at)) / 86400
    )::numeric, 1) as avg_days
  from public.applications
  where user_id = auth.uid()
    and status = 'interviewing'
  union all
  select
    'interviewing_to_offer' as stage,
    round(avg(
      extract(epoch from (updated_at - created_at)) / 86400
    )::numeric, 1) as avg_days
  from public.applications
  where user_id = auth.uid()
    and status = 'offer';
$$;
