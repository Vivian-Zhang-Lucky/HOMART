-- HOMART 演示聊天表（在 Supabase SQL Editor 中整段执行）
-- 执行后：Database → Replication → 为 public.messages 打开 Realtime

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
