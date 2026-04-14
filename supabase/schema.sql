-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- Squad members (active users who have pinged)
create table if not exists squad_members (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  lat double precision not null,
  lng double precision not null,
  squad_id uuid references squads(id) on delete set null,
  updated_at timestamptz default now()
);

-- Squads
create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Squad invites
create table if not exists squad_invites (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid references squads(id) on delete cascade,
  from_user uuid references auth.users(id),
  to_user uuid references auth.users(id),
  status text default 'pending', -- pending | accepted | rejected
  created_at timestamptz default now()
);

-- Function: find nearby members within radius_m meters
create or replace function nearby_members(lat float, lng float, radius_m float)
returns table (
  id uuid,
  username text,
  lat double precision,
  lng double precision,
  squad_id uuid
) language sql as $$
  select
    sm.id,
    sm.username,
    sm.lat,
    sm.lng,
    sm.squad_id
  from squad_members sm
  where
    st_dwithin(
      st_makepoint(sm.lng, sm.lat)::geography,
      st_makepoint(lng, lat)::geography,
      radius_m
    )
    and sm.updated_at > now() - interval '10 minutes';
$$;

-- Auto-update updated_at on upsert
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger squad_members_updated_at
before update on squad_members
for each row execute function update_updated_at();

-- RLS: users can only see and write their own row
alter table squad_members enable row level security;

create policy "users can upsert own location"
  on squad_members for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "anyone can read squad members"
  on squad_members for select
  using (true);

alter table squads enable row level security;

create policy "anyone can read squads"
  on squads for select using (true);

create policy "authenticated users can create squads"
  on squads for insert
  with check (auth.uid() = created_by);

alter table squad_invites enable row level security;

create policy "users can see their invites"
  on squad_invites for select
  using (auth.uid() = to_user or auth.uid() = from_user);

create policy "users can send invites"
  on squad_invites for insert
  with check (auth.uid() = from_user);

create policy "recipients can update invite status"
  on squad_invites for update
  using (auth.uid() = to_user);
