-- Resources table for TheValluru.com
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  summary text not null default '',
  body text not null default '',
  category text not null default 'LinkedIn Post',
  post_url text not null default '',
  embed_url text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  tags text[] not null default '{}',
  published_at date,
  status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'resources_status_check'
  ) then
    alter table public.resources
      add constraint resources_status_check
      check (status in ('draft', 'published'));
  end if;
end;
$$;

create index if not exists resources_status_idx on public.resources (status);
create index if not exists resources_order_idx on public.resources (sort_order, published_at desc);

-- Keep updated_at fresh on every write.
create or replace function public.touch_resources_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resources_touch_updated_at on public.resources;
create trigger resources_touch_updated_at
  before update on public.resources
  for each row execute function public.touch_resources_updated_at();

-- Row level security: the public site may read published rows and nothing else.
-- All writes go through /api/resources, which uses the service-role key and
-- bypasses RLS after checking the admin password.
alter table public.resources enable row level security;

drop policy if exists "Published resources are publicly readable" on public.resources;
create policy "Published resources are publicly readable"
  on public.resources
  for select
  to anon, authenticated
  using (status = 'published');

grant select on public.resources to anon, authenticated;
grant all on public.resources to service_role;

-- Make the API see the new table immediately instead of waiting for a cache refresh.
notify pgrst, 'reload schema';
