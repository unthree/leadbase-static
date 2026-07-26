-- LeadbasePro — initial schema (plan Section 8 / SPEC §5).
-- Every table is per-user and RLS-scoped to auth.uid().

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'solo' check (plan in ('solo','operator','studio')),
  interests jsonb not null default '[]',
  goals jsonb not null default '[]',
  agent_paused boolean not null default false,
  approval_mode text not null default 'every-message' check (approval_mode in ('every-message','batches-only')),
  run_window text not null default '02:00–06:00',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

-- ---------- opportunities ----------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  match int not null check (match between 0 and 100),
  why text,
  buyer text,
  signal text,
  difficulty text check (difficulty in ('Low','Medium','High')),
  revenue text,
  tags text[] not null default '{}',
  status text not null default 'new' check (status in ('new','saved','built','archived')),
  saved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- portfolio (micro-businesses) ----------
create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  status text not null default 'researching'
    check (status in ('researching','building','testing','active','archived')),
  revenue text not null default '—',
  leads int not null default 0,
  note text,
  next_action text,
  gradient text not null default 'swarm' check (gradient in ('swarm','flow','pulse')),
  opportunity_id uuid references public.opportunities on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- leads (buyer-leads per business) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  portfolio_id uuid not null references public.portfolio on delete cascade,
  name text not null,
  snippet text,
  value_cents int not null default 0,
  intent numeric(3,2) not null default 0 check (intent between 0 and 1),
  status text not null default 'new' check (status in ('new','engaged','won','lost')),
  created_at timestamptz not null default now()
);

-- ---------- agent_runs ----------
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null default 'discovery',
  state text not null default 'queued' check (state in ('queued','running','done','failed')),
  summary text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- agent_tasks (drives workbench + activity feed) ----------
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  run_id uuid references public.agent_runs on delete cascade,
  label text not null,
  kind text not null default 'build',
  state text not null default 'queued' check (state in ('queued','running','done','failed')),
  pct int not null default 0 check (pct between 0 and 100),
  created_at timestamptz not null default now()
);

-- ---------- assets ----------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  portfolio_id uuid references public.portfolio on delete cascade,
  kind text not null default 'landing' check (kind in ('landing','magnet','outreach')),
  title text not null,
  url text,
  state text not null default 'draft' check (state in ('draft','ready','live')),
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists idx_opportunities_user on public.opportunities(user_id, status);
create index if not exists idx_portfolio_user on public.portfolio(user_id, status);
create index if not exists idx_leads_business on public.leads(portfolio_id);
create index if not exists idx_agent_tasks_run on public.agent_tasks(run_id);
create index if not exists idx_assets_business on public.assets(portfolio_id);

-- ---------- RLS: owner-only on every table ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','opportunities','portfolio','leads','agent_runs','agent_tasks','assets']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles keys on user_id; the rest on user_id too.
create policy "own profile" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own opportunities" on public.opportunities
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own portfolio" on public.portfolio
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own leads" on public.leads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own agent_runs" on public.agent_runs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own agent_tasks" on public.agent_tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own assets" on public.assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- auto-create a profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep portfolio.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists portfolio_touch on public.portfolio;
create trigger portfolio_touch before update on public.portfolio
  for each row execute function public.touch_updated_at();

-- ---------- realtime (SPEC §5) ----------
alter publication supabase_realtime add table public.agent_runs;
alter publication supabase_realtime add table public.agent_tasks;
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.assets;
