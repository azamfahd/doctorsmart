
-- 1. قم بإنشاء جدول المرضى (patients)
create table patients (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null,
  status text
);

-- 2. تفعيل سياسة الأمان (RLS)
alter table patients enable row level security;

-- 3. إنشاء سياسة تسمح بالوصول الكامل (يمكنك تخصيصها لاحقاً)
create policy "Allow all access" on patients for all using (true);
