
-- =====================================================================
-- PORTAL MATRIX VIRAL — FOUNDATION SCHEMA
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$ begin create type public.app_role as enum ('admin','moderator','user'); exception when duplicate_object then null; end $$;
do $$ begin create type public.provider_kind as enum ('llm','image','video','audio','search','social','payment','storage'); exception when duplicate_object then null; end $$;
do $$ begin create type public.provider_status as enum ('active','degraded','disabled','pending'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_kind as enum ('post','short','reel','thumbnail','script','hook','cta','ugc','vsl','image','video','audio'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_status as enum ('draft','queued','generating','ready','published','failed','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.social_platform as enum ('tiktok','instagram','facebook','threads','x','youtube','kwai','discord','telegram'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_status as enum ('trialing','active','past_due','canceled','expired','incomplete'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('pending','processing','succeeded','failed','refunded','canceled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_kind as enum ('pix','subscription','one_time','payout'); exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  locale text default 'pt-BR',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------
-- ROLES (separate table — never store roles on profile)
-- ---------------------------------------------------------------------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(_user_id, 'admin') $$;

-- ---------------------------------------------------------------------
-- CREDITS
-- ---------------------------------------------------------------------
create table public.credits_wallet (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  lifetime_earned integer not null default 0,
  lifetime_spent integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.credits_wallet enable row level security;

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  ref_kind text,
  ref_id uuid,
  created_at timestamptz not null default now()
);
alter table public.credit_transactions enable row level security;
create index on public.credit_transactions(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  status subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  infinitepay_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create index on public.subscriptions(user_id, status);

-- ---------------------------------------------------------------------
-- PROVIDERS + CAPABILITIES
-- ---------------------------------------------------------------------
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind provider_kind not null,
  status provider_status not null default 'pending',
  priority integer not null default 100,
  secret_name text,
  base_url text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.providers enable row level security;

create table public.capabilities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind provider_kind not null,
  default_provider text,
  fallback_chain text[] not null default '{}',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.capabilities enable row level security;

create table public.provider_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider_slug text not null,
  capability_slug text,
  tokens_in integer default 0,
  tokens_out integer default 0,
  cost_cents integer default 0,
  latency_ms integer,
  success boolean default true,
  error text,
  created_at timestamptz not null default now()
);
alter table public.provider_usage enable row level security;
create index on public.provider_usage(provider_slug, created_at desc);

-- ---------------------------------------------------------------------
-- CONTENT
-- ---------------------------------------------------------------------
create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind content_kind not null,
  title text,
  body text,
  media_url text,
  thumbnail_url text,
  status content_status not null default 'draft',
  viral_score numeric(5,2),
  platforms social_platform[] not null default '{}',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.content_assets enable row level security;
create index on public.content_assets(user_id, created_at desc);

create table public.content_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.content_assets(id) on delete cascade,
  capability_slug text not null,
  provider_slug text,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status content_status not null default 'queued',
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.content_jobs enable row level security;
create index on public.content_jobs(user_id, status);

-- ---------------------------------------------------------------------
-- SOCIAL DISTRIBUTION
-- ---------------------------------------------------------------------
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform social_platform not null,
  handle text not null,
  external_id text,
  access_token_secret text,
  refresh_token_secret text,
  expires_at timestamptz,
  status text not null default 'connected',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, handle)
);
alter table public.social_accounts enable row level security;

create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.content_assets(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  platform_post_id text,
  attempts integer not null default 0,
  last_error text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.scheduled_posts enable row level security;
create index on public.scheduled_posts(scheduled_for, status);

-- ---------------------------------------------------------------------
-- INTELLIGENCE (Trends + Policies)
-- ---------------------------------------------------------------------
create table public.trends (
  id uuid primary key default gen_random_uuid(),
  platform social_platform not null,
  keyword text not null,
  score numeric(6,2) not null default 0,
  region text default 'BR',
  payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);
alter table public.trends enable row level security;
create index on public.trends(platform, captured_at desc);

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  platform social_platform not null,
  rule_key text not null,
  title text not null,
  severity text not null default 'info',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(platform, rule_key)
);
alter table public.policies enable row level security;

-- ---------------------------------------------------------------------
-- AFFILIATE
-- ---------------------------------------------------------------------
create table public.affiliates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null,
  parent_id uuid references auth.users(id) on delete set null,
  clicks integer not null default 0,
  conversions integer not null default 0,
  balance_cents integer not null default 0,
  lifetime_cents integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.affiliates enable row level security;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  reward_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique(referred_user_id)
);
alter table public.referrals enable row level security;

-- ---------------------------------------------------------------------
-- GAMIFICATION
-- ---------------------------------------------------------------------
create table public.gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_action_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.gamification enable row level security;

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  awarded_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  unique(user_id, slug)
);
alter table public.achievements enable row level security;

-- ---------------------------------------------------------------------
-- PAYMENTS (InfinitePay-ready)
-- ---------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null default 'infinitepay',
  kind payment_kind not null,
  amount_cents integer not null,
  currency text not null default 'BRL',
  status payment_status not null default 'pending',
  external_id text,
  pix_qr_code text,
  pix_copy_paste text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create index on public.payments(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- LOGS (admin only)
-- ---------------------------------------------------------------------
create table public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  event text,
  signature_ok boolean,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.webhook_logs enable row level security;
create index on public.webhook_logs(source, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_kind text,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create index on public.audit_logs(actor_id, created_at desc);

-- ---------------------------------------------------------------------
-- RLS POLICIES
-- ---------------------------------------------------------------------

-- profiles: self + admin
create policy "profiles self read" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

-- user_roles: read self / admin write
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "roles admin write" on public.user_roles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- credits
create policy "wallet self read" on public.credits_wallet for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "wallet admin write" on public.credits_wallet for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "credit tx self read" on public.credit_transactions for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "credit tx admin write" on public.credit_transactions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- subscriptions
create policy "subs self read" on public.subscriptions for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "subs admin write" on public.subscriptions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- providers + capabilities (authenticated read, admin write)
create policy "providers auth read" on public.providers for select using (auth.role() = 'authenticated');
create policy "providers admin write" on public.providers for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "caps auth read" on public.capabilities for select using (auth.role() = 'authenticated');
create policy "caps admin write" on public.capabilities for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "usage self read" on public.provider_usage for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "usage admin write" on public.provider_usage for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- content
create policy "assets self all" on public.content_assets for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "jobs self all" on public.content_jobs for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- social
create policy "social self all" on public.social_accounts for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "sched self all" on public.scheduled_posts for all using (auth.uid() = user_id or public.is_admin(auth.uid())) with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- trends + policies: auth read
create policy "trends auth read" on public.trends for select using (auth.role() = 'authenticated');
create policy "trends admin write" on public.trends for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "policies auth read" on public.policies for select using (auth.role() = 'authenticated');
create policy "policies admin write" on public.policies for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- affiliate
create policy "aff self read" on public.affiliates for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "aff self update" on public.affiliates for update using (auth.uid() = user_id);
create policy "aff admin write" on public.affiliates for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "ref self read" on public.referrals for select using (auth.uid() = affiliate_user_id or auth.uid() = referred_user_id or public.is_admin(auth.uid()));
create policy "ref admin write" on public.referrals for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- gamification
create policy "gam self read" on public.gamification for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "gam admin write" on public.gamification for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "ach self read" on public.achievements for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "ach admin write" on public.achievements for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- payments
create policy "pay self read" on public.payments for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "pay admin write" on public.payments for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- logs (admin only)
create policy "webhook admin read" on public.webhook_logs for select using (public.is_admin(auth.uid()));
create policy "webhook admin write" on public.webhook_logs for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "audit admin read" on public.audit_logs for select using (public.is_admin(auth.uid()));
create policy "audit admin write" on public.audit_logs for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- TRIGGERS: updated_at + user bootstrap
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger trg_subs_touch before update on public.subscriptions for each row execute function public.touch_updated_at();
create trigger trg_providers_touch before update on public.providers for each row execute function public.touch_updated_at();
create trigger trg_assets_touch before update on public.content_assets for each row execute function public.touch_updated_at();
create trigger trg_social_touch before update on public.social_accounts for each row execute function public.touch_updated_at();
create trigger trg_payments_touch before update on public.payments for each row execute function public.touch_updated_at();

-- Bootstrap new user: profile + wallet + gamification + affiliate code + default role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _code text;
begin
  insert into public.profiles (id, display_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'u_' || substr(replace(new.id::text,'-',''),1,12),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  insert into public.credits_wallet (user_id, balance, lifetime_earned) values (new.id, 100, 100) on conflict do nothing;
  insert into public.gamification (user_id) values (new.id) on conflict do nothing;

  _code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.affiliates (user_id, code) values (new.id, _code) on conflict do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- SEED: capabilities + providers
-- ---------------------------------------------------------------------
insert into public.providers (slug, name, kind, status, priority, secret_name, base_url) values
  ('lovable-ai','Lovable AI Gateway','llm','active',10,'LOVABLE_API_KEY','https://ai.gateway.lovable.dev/v1'),
  ('groq','Groq','llm','pending',20,'GROQ_API_KEY','https://api.groq.com/openai/v1'),
  ('openrouter','OpenRouter','llm','pending',30,'OPENROUTER_API_KEY','https://openrouter.ai/api/v1'),
  ('huggingface','HuggingFace','llm','pending',40,'HUGGINGFACE_API_KEY','https://api-inference.huggingface.co'),
  ('pollinations','Pollinations','image','pending',50,null,'https://image.pollinations.ai'),
  ('openai','OpenAI','llm','pending',60,'OPENAI_API_KEY','https://api.openai.com/v1'),
  ('anthropic','Anthropic Claude','llm','pending',70,'ANTHROPIC_API_KEY','https://api.anthropic.com/v1'),
  ('gemini','Google Gemini','llm','pending',80,'GEMINI_API_KEY','https://generativelanguage.googleapis.com/v1beta'),
  ('runway','Runway','video','pending',90,'RUNWAY_API_KEY',null),
  ('kling','Kling','video','pending',100,'KLING_API_KEY',null),
  ('elevenlabs','ElevenLabs','audio','pending',110,'ELEVENLABS_API_KEY','https://api.elevenlabs.io/v1'),
  ('fal','fal.ai','image','pending',120,'FAL_API_KEY','https://fal.run'),
  ('replicate','Replicate','image','pending',130,'REPLICATE_API_KEY','https://api.replicate.com/v1'),
  ('tavily','Tavily','search','pending',140,'TAVILY_API_KEY','https://api.tavily.com'),
  ('exa','Exa','search','pending',150,'EXA_API_KEY','https://api.exa.ai'),
  ('infinitepay','InfinitePay','payment','pending',10,'INFINITEPAY_API_KEY',null)
on conflict (slug) do nothing;

insert into public.capabilities (slug, name, kind, default_provider, fallback_chain) values
  ('text.generate','Text Generation','llm','lovable-ai', array['groq','openrouter','openai']),
  ('text.chat','Conversational Chat','llm','lovable-ai', array['groq','openrouter']),
  ('text.hook','Viral Hook Generation','llm','lovable-ai', array['groq','openrouter']),
  ('text.script','Script & VSL Writing','llm','lovable-ai', array['openrouter','openai']),
  ('text.cta','CTA Optimization','llm','lovable-ai', array['groq']),
  ('image.generate','Image Generation','image','pollinations', array['fal','replicate']),
  ('image.thumbnail','Thumbnail Generation','image','pollinations', array['fal']),
  ('video.short','Short-form Video','video','runway', array['kling']),
  ('audio.voice','Voice Synthesis','audio','elevenlabs', array[]::text[]),
  ('search.trend','Trend Research','search','tavily', array['exa']),
  ('search.policy','Policy Research','search','tavily', array['exa'])
on conflict (slug) do nothing;
