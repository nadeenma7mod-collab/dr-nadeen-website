create table if not exists public.profiles (id uuid primary key default gen_random_uuid(),name text not null default 'د. نادين',bio text default '',avatar_url text default '',theme text default 'purple',updated_at timestamptz default now());
create table if not exists public.links (id uuid primary key default gen_random_uuid(),title text not null,url text not null,icon text default 'link',sort_order integer default 0,is_active boolean default true,start_at timestamptz,end_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());
alter table public.profiles enable row level security;
alter table public.links enable row level security;
-- راجع سياسات RLS الموجودة في مشروع Supabase قبل إضافة أي سياسات جديدة.
