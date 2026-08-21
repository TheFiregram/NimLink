create table if not exists gates (
  id text primary key,
  slug text not null unique,
  destination_url text not null,
  title text not null,
  preview text not null default '',
  price_amount text not null,
  price_currency text not null check (price_currency in ('NIM', 'USDT')),
  creator_wallet text not null,
  access_opens integer not null default 3,
  access_days integer not null default 7,
  paused boolean not null default false,
  view_count integer not null default 0,
  sale_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gates_creator_idx on gates (creator_wallet);

create table if not exists purchases (
  id text primary key,
  gate_id text not null references gates(id),
  buyer_wallet text not null,
  tx_hash text not null,
  amount text not null,
  currency text not null,
  created_at timestamptz not null default now(),
  refunded_at timestamptz
);

create unique index if not exists purchases_active_idx
  on purchases (gate_id, buyer_wallet)
  where refunded_at is null;

create index if not exists purchases_buyer_idx on purchases (buyer_wallet);
create index if not exists purchases_gate_idx on purchases (gate_id);

create table if not exists opens (
  id text primary key,
  purchase_id text not null references purchases(id),
  opened_at timestamptz not null default now()
);

create index if not exists opens_purchase_idx on opens (purchase_id);

insert into gates (
  id, slug, destination_url, title, preview,
  price_amount, price_currency, creator_wallet, access_opens, access_days
) values (
  'gate_starter',
  'starter',
  '/unlock/starter',
  'Cycle 2 scoring kit',
  'A one-page brief: scoresheet, 40-second demo script, and copy you can steal for Sip & Ship.',
  '2',
  'USDT',
  'NQ87LATCHCREATOR00000000000',
  3,
  7
) on conflict (slug) do nothing;
