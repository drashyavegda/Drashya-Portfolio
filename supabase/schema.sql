-- ============================================================================
-- Drashya Vegda Portfolio — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Singleton site state (profile, education, availability, resume, settings)
-- ----------------------------------------------------------------------------
create table if not exists public.site_state (
  id int primary key default 1 check (id = 1),
  profile jsonb not null default '{}'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  education jsonb not null default '{}'::jsonb,
  resume jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Content collections
-- ----------------------------------------------------------------------------
create table if not exists public.skills (
  id text primary key,
  name text not null,
  category text not null default 'Programming Languages',
  description text not null default '',
  learning boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null default '',
  description text not null default '',
  featured boolean not null default false,
  position int not null default 0,
  highlights jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  demo_url text,
  github_url text,
  screenshots jsonb not null default '[]'::jsonb,
  case_study jsonb not null default '{}'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.hackathons (
  id text primary key,
  name text not null,
  date text,
  project text,
  technologies jsonb not null default '[]'::jsonb,
  status text not null default 'participated' check (status in ('participated','finalist','winner')),
  certificate_file text,
  certificate_link text,
  notes text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id text primary key,
  title text not null,
  org text not null default '',
  date text,
  file text,
  kind text not null default 'image' check (kind in ('pdf','image')),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_topics (
  id text primary key,
  title text not null,
  note text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  category text not null default 'Programming',
  language text not null default 'en' check (language in ('en','hi','gu')),
  published_at text,
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text not null default '',
  seo_description text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  role text not null default '',
  feedback text not null,
  image text,
  linkedin text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Contact messages (private)
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Privacy-friendly analytics (aggregate only — no IPs, no personal data)
-- ----------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('page_view','project_view','section_view','blog_view')),
  key text not null,
  device text not null default 'unknown',
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
--    Public: read content, insert messages/analytics.
--    Admin (authenticated via Supabase Auth): full control.
--    The Next.js server uses the service-role key for writes (bypasses RLS);
--    RLS below protects the database from anonymous direct access.
-- ----------------------------------------------------------------------------
alter table public.site_state        enable row level security;
alter table public.skills            enable row level security;
alter table public.projects          enable row level security;
alter table public.hackathons        enable row level security;
alter table public.certificates      enable row level security;
alter table public.learning_topics   enable row level security;
alter table public.posts             enable row level security;
alter table public.testimonials      enable row level security;
alter table public.messages          enable row level security;
alter table public.analytics_events  enable row level security;

-- Public read on content tables
create policy "public read site_state"      on public.site_state      for select using (true);
create policy "public read skills"          on public.skills          for select using (true);
create policy "public read projects"        on public.projects        for select using (true);
create policy "public read hackathons"      on public.hackathons      for select using (true);
create policy "public read certificates"    on public.certificates    for select using (true);
create policy "public read learning_topics" on public.learning_topics for select using (true);
create policy "public read published posts" on public.posts           for select using (true);
create policy "public read testimonials"    on public.testimonials    for select using (true);

-- Public insert for messages + analytics (write-only, never readable anonymously)
create policy "public insert messages"         on public.messages         for insert with check (true);
create policy "public insert analytics_events" on public.analytics_events for insert with check (true);

-- Admin (authenticated) full access
create policy "admin all site_state"      on public.site_state      for all to authenticated using (true) with check (true);
create policy "admin all skills"          on public.skills          for all to authenticated using (true) with check (true);
create policy "admin all projects"        on public.projects        for all to authenticated using (true) with check (true);
create policy "admin all hackathons"      on public.hackathons      for all to authenticated using (true) with check (true);
create policy "admin all certificates"    on public.certificates    for all to authenticated using (true) with check (true);
create policy "admin all learning_topics" on public.learning_topics for all to authenticated using (true) with check (true);
create policy "admin all posts"           on public.posts           for all to authenticated using (true) with check (true);
create policy "admin all testimonials"    on public.testimonials    for all to authenticated using (true) with check (true);
create policy "admin all messages"        on public.messages        for all to authenticated using (true) with check (true);
create policy "admin all analytics"       on public.analytics_events for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 6. Storage bucket for uploads (certificates, screenshots, resume, avatars)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "public read uploads"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "admin write uploads"
  on storage.objects for all to authenticated
  using (bucket_id = 'uploads') with check (bucket_id = 'uploads');

-- ----------------------------------------------------------------------------
-- 7. Admin user
--    Create the admin in Supabase Dashboard → Authentication → Users →
--    "Add user" → set email + password (e.g. your Gmail). The site's /admin
--    login uses Supabase Auth automatically once Supabase env vars are set.
-- ----------------------------------------------------------------------------
