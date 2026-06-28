-- Users profile
create table if not exists users_profile (
  id uuid references auth.users primary key,
  display_name text,
  created_at timestamptz default now(),
  height_cm numeric,
  weight_kg numeric,
  birth_year int,
  activity_level text check (activity_level in ('sedentary','light','moderate','active','very_active')),
  goal_type text check (goal_type in ('lose','maintain','gain'))
);

alter table users_profile enable row level security;
create policy "Users can manage own profile" on users_profile
  for all using (auth.uid() = id);

-- User goals
create table if not exists user_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users_profile(id) on delete cascade unique,
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric
);

alter table user_goals enable row level security;
create policy "Users can manage own goals" on user_goals
  for all using (auth.uid() = user_id);

-- Food items (shared cache)
create table if not exists food_items (
  id uuid default gen_random_uuid() primary key,
  fdc_id text unique,
  name text not null,
  brand text,
  serving_size_g numeric not null default 100,
  serving_unit text not null default 'g',
  nutrients jsonb not null default '{}',
  source text not null default 'usda',
  created_at timestamptz default now()
);

alter table food_items enable row level security;
create policy "Anyone authenticated can read food items" on food_items
  for select using (auth.uid() is not null);
create policy "Anyone authenticated can insert food items" on food_items
  for insert with check (auth.uid() is not null);

-- Food log entries
create table if not exists food_log_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  log_date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_item_id uuid references food_items(id),
  description text,
  servings numeric not null default 1,
  serving_unit text not null default 'serving',
  nutrients_override jsonb not null default '{}',
  source text not null default 'search',
  created_at timestamptz default now()
);

alter table food_log_entries enable row level security;
create policy "Users can manage own log entries" on food_log_entries
  for all using (auth.uid() = user_id);

create index on food_log_entries (user_id, log_date);

-- AI estimate log
create table if not exists ai_estimate_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  prompt_text text,
  response_json jsonb,
  confidence text check (confidence in ('high','medium','low')),
  created_at timestamptz default now()
);

alter table ai_estimate_log enable row level security;
create policy "Users can manage own AI logs" on ai_estimate_log
  for all using (auth.uid() = user_id);
