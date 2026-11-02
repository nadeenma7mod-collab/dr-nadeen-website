-- نفّذ هذا الملف بعد التأكد أن جدول admin_users ودالة is_site_admin()
-- وسياسات RLS الخاصة بالمديرة موجودة بالفعل كما أعددنا سابقًا.
-- لا تنشئ الجداول الأساسية مرة أخرى.

alter table public.profiles
  add column if not exists name_en text default 'Dr. Nadeen Mahmoud',
  add column if not exists bio_en text default 'Welcome to my official platforms',
  add column if not exists logo_url text default '',
  add column if not exists primary_color text default '#456b5d',
  add column if not exists background_color text default '#f6f5ef',
  add column if not exists text_color text default '#24342e',
  add column if not exists card_style text default 'soft';

alter table public.links
  add column if not exists platform text default 'social',
  add column if not exists username text default '',
  add column if not exists followers_count text default '',
  add column if not exists account_avatar_url text default '';

-- أنشئ مساحة صور عامة، والرفع مسموح فقط للمديرة.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view site assets" on storage.objects;
create policy "Public can view site assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-assets');

drop policy if exists "Site admin can upload assets" on storage.objects;
create policy "Site admin can upload assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-assets' and public.is_site_admin());

drop policy if exists "Site admin can update assets" on storage.objects;
create policy "Site admin can update assets"
on storage.objects for update
to authenticated
using (bucket_id = 'site-assets' and public.is_site_admin())
with check (bucket_id = 'site-assets' and public.is_site_admin());

drop policy if exists "Site admin can delete assets" on storage.objects;
create policy "Site admin can delete assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-assets' and public.is_site_admin());

-- إضافة الحسابات الأربعة إذا لم تكن موجودة بالفعل.
insert into public.links (title,url,icon,platform,username,sort_order,is_active)
select v.title,v.url,v.platform,v.platform,v.username,v.sort_order,true
from (values
 ('TikTok','https://www.tiktok.com/@nadeenmahmoud115','tiktok','@nadeenmahmoud115',1),
 ('Instagram','https://www.instagram.com/dr_nadein/','instagram','@dr_nadein',2),
 ('Facebook','https://www.facebook.com/share/1DnS2SbeQ4/','facebook','Facebook',3),
 ('YouTube','https://youtube.com/@nadeenmahmoud-p3x','youtube','@nadeenmahmoud-p3x',4)
) as v(title,url,platform,username,sort_order)
where not exists (select 1 from public.links l where l.platform = v.platform);


-- تعطيل أي روابط قديمة غير المنصات الأربع المطلوبة (مثل واتساب/تيليجرام).
update public.links
set is_active = false, updated_at = now()
where coalesce(platform, 'social') not in ('tiktok','instagram','facebook','youtube');
