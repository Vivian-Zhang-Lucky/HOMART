-- HOMART 演示表（在 Supabase SQL Editor 中整段执行）
-- 执行后：Database → Replication → 为 public.messages 打开 Realtime

-- 产品图片 Storage 桶（在 Supabase Dashboard → Storage → New bucket 手动创建）
-- Bucket 名称：product-images
-- Public bucket：开启（允许匿名读取图片 URL）
-- 创建后在 Storage → Policies 添加策略：允许 anon 角色 INSERT / SELECT

-- 产品同步表（商家端写入，顾客端读取，实现跨设备产品同步）
create table if not exists store_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table store_config enable row level security;

drop policy if exists "demo_store_config_all" on store_config;
create policy "demo_store_config_all" on store_config for all using (true) with check (true);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null default 'default-store',
  customer_id text not null,
  customer_name text,
  customer_email text,
  status text not null default 'open',
  last_message text,
  last_at timestamptz default now(),
  unread_merchant int not null default 0,
  unread_customer int not null default 0,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender text not null check (sender in ('customer', 'seller')),
  body text,
  message_type text not null default 'text',
  product_id text,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conv_created on messages (conversation_id, created_at);
create index if not exists idx_conversations_merchant_last on conversations (merchant_id, last_at desc);

-- 演示用：允许匿名读写（上线前务必改为严格 RLS + 登录）
alter table conversations enable row level security;
alter table messages enable row level security;

drop policy if exists "demo_conversations_all" on conversations;
create policy "demo_conversations_all" on conversations for all using (true) with check (true);

drop policy if exists "demo_messages_all" on messages;
create policy "demo_messages_all" on messages for all using (true) with check (true);
