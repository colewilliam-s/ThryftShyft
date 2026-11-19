-- What this adds:
--   1. campus center coordinates
-- 2-3. location fields (visibility, prompted, changed time) now live in a PRIVATE table,
--      public.location_settings, instead of on profiles. Other users can't read them and
--      users can't edit them directly, so the once-a-day limit can't be bypassed.
--   4. save_my_location / clear_my_location / mark_location_prompted
--   5. nearby_listings (applies the sharing rules and returns labels only)


-- ============================================================
-- 1. CAMPUS CENTER (one public point per campus)
-- ============================================================
alter table public.campuses add column if not exists center_lat double precision;
alter table public.campuses add column if not exists center_lng double precision;

-- APPROXIMATE placeholder: middle of campus in Google Maps
-- UVM Davis Center - Transportation Pickup Location: 44.475211, -73.194897
update public.campuses
set center_lat = 44.478, center_lng = -73.196
where university_domain = 'uvm.edu' and center_lat is null;

-- ============================================================
-- 2. PRIVATE LOCATION SETTINGS
-- ============================================================
-- One row per user, created by the functions below. No row = sharing is off.
create table if not exists public.location_settings (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  visibility  text not null default 'off' check (visibility in ('off', 'community', 'public')),
  prompted_at timestamptz,  -- when the setup screen was shown or completed
  changed_at  timestamptz   -- last time the saved location moved (survives "turn off")
);

alter table public.location_settings enable row level security;

-- Read your own row only. No insert/update/delete policies on purpose.
drop policy if exists "Users can read their own location settings" on public.location_settings;
create policy "Users can read their own location settings"
  on public.location_settings for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ============================================================
-- 3. PRIVATE LOCATION TABLE
-- ============================================================
create table if not exists public.profile_locations (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  source     text not null check (source in ('device', 'campus_spot')),
  spot_id    uuid references public.campus_spots (id) on delete set null,
  lat        double precision,
  lng        double precision,
  updated_at timestamptz not null default now(),
  check (
    (source = 'device' and lat is not null and lng is not null and spot_id is null)
    or (source = 'campus_spot' and lat is null and lng is null)
  )
);

alter table public.profile_locations enable row level security;

-- Read your own row only. No insert/update/delete policies on purpose:
-- writes go through the security definer functions below.
drop policy if exists "Users can read their own location" on public.profile_locations;
create policy "Users can read their own location"
  on public.profile_locations for select
  to authenticated
  using (user_id = (select auth.uid()));



-- ============================================================
-- 4. WRITE FUNCTIONS
-- ============================================================

-- save_my_location: checks the inputs, re-rounds coordinates, confirms a chosen dorm belongs to your campus, 
--                   clears the unused source, enforces the daily limit, and updates profiles.location_visibility.
create or replace function public.save_my_location(
  p_visibility text,
  p_source text,
  p_spot_id uuid,
  p_lat double precision,
  p_lng double precision
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  existing public.profile_locations%rowtype;
  last_change timestamptz;
  -- Minimum time between location changes. Use interval '0 seconds' while testing.
  -- min_gap constant interval := interval '1 day'; -- might want for safety?
  min_gap constant interval := interval '0 seconds'; 
  spot_val uuid := null;
  new_lat double precision := null;
  new_lng double precision := null;
  moved boolean;
begin
  if uid is null then
    raise exception 'You need to be signed in.';
  end if;
  if p_visibility not in ('community', 'public') then
    raise exception 'Invalid visibility.';
  end if;
  if p_source not in ('device', 'campus_spot') then
    raise exception 'Invalid location source.';
  end if;

  select * into existing from public.profile_locations where user_id = uid;
  select changed_at into last_change from public.location_settings where user_id = uid;

  if p_source = 'campus_spot' then
    -- null spot = "prefer not to say". A real spot must belong to the user's own campus.
    if p_spot_id is not null then
      if not exists (
        select 1
        from public.campus_spots s
        join public.campuses c on c.id = s.campus_id
        join public.profiles p on p.university_domain = c.university_domain
        where s.id = p_spot_id and p.id = uid
      ) then
        raise exception 'That spot is not part of your campus.';
      end if;
      spot_val := p_spot_id;
    end if;
  else
    if p_lat is null or p_lng is null then
      -- Keep the existing saved area, change visibility only
      if existing.user_id is null or existing.source <> 'device' then
        raise exception 'Choose your location first.';
      end if;
      new_lat := existing.lat;
      new_lng := existing.lng;
    else
      if p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180 then
        raise exception 'Invalid coordinates.';
      end if;
      -- Round again on the server (2 decimals is about 1 km), never trust the client
      new_lat := round(p_lat::numeric, 2)::double precision;
      new_lng := round(p_lng::numeric, 2)::double precision;
    end if;
  end if;

  moved := existing.user_id is null
    or existing.source is distinct from p_source
    or existing.spot_id is distinct from spot_val
    or existing.lat is distinct from new_lat
    or existing.lng is distinct from new_lng;

  if moved and last_change is not null and now() - last_change < min_gap then
    raise exception 'You can only change your location once a day. Try again later.';
  end if;

  insert into public.profile_locations as pl (user_id, source, spot_id, lat, lng, updated_at)
  values (uid, p_source, spot_val, new_lat, new_lng, now())
  on conflict (user_id) do update
    set source = excluded.source,
        spot_id = excluded.spot_id,
        lat = excluded.lat,
        lng = excluded.lng,
        updated_at = case when moved then now() else pl.updated_at end;

  insert into public.location_settings as ls (user_id, visibility, prompted_at, changed_at)
  values (uid, p_visibility, now(), case when moved then now() else null end)
  on conflict (user_id) do update
    set visibility = excluded.visibility,
        prompted_at = coalesce(ls.prompted_at, now()),
        changed_at = case when moved then now() else ls.changed_at end;
end;
$$;

-- clear_my_location: deletes the row and sets visibility to off
create or replace function public.clear_my_location()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'You need to be signed in.';
  end if;
  delete from public.profile_locations where user_id = uid;
  -- changed_at is kept on purpose, so clearing and re-saving can't dodge the daily limit
  update public.location_settings set visibility = 'off' where user_id = uid;
end;
$$;

-- mark_location_prompted: stamps the time once.
create or replace function public.mark_location_prompted()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;
  insert into public.location_settings as ls (user_id, prompted_at)
  values (uid, now())
  on conflict (user_id) do update
    set prompted_at = coalesce(ls.prompted_at, now());
end;
$$;

-- ============================================================
-- 5. FEED FUNCTION
-- ============================================================

-- nearby_listings: Reads listings, profiles, profile_locations, campus_spots, and campuses
--                  Returns active listings with a distance LABEL and a sort rank. (Coordinates never leave the database!)
-- Rules:
--   * viewer not sharing                -> label null, rank 0 for everything (feed is newest first)
--   * seller not sharing / out of scope -> 'Location not shared', sorted last
--   * both on the same campus           -> 'Same area' / 'Elsewhere on campus' / 'On campus'
--   * otherwise                         -> distance bucket in miles

-- If ywe need add or drop columns from listings (brand, color, price_type...), add them to the
-- returns table list, base select and the final select, then drop and recreate this function.
drop function if exists public.nearby_listings(integer, integer);

create function public.nearby_listings(
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  seller_id uuid,
  title text,
  description text,
  price numeric,
  category text,
  size text,
  condition text,
  brand text,
  color text,
  image_url text,
  status text,
  created_at timestamptz,
  distance_label text,
  distance_rank integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select p.id,
           p.university_domain as domain,
           coalesce(ls.visibility, 'off') as vis,
           pl.source,
           s.zone,
           case when pl.source = 'device' then pl.lat else c.center_lat end as eff_lat,
           case when pl.source = 'device' then pl.lng else c.center_lng end as eff_lng
    from public.profiles p
    left join public.location_settings ls on ls.user_id = p.id
    left join public.profile_locations pl on pl.user_id = p.id
    left join public.campus_spots s on s.id = pl.spot_id
    left join public.campuses c on c.university_domain = p.university_domain
    where p.id = auth.uid()
  ),
  base as (
    select l.id, l.seller_id, l.title, l.description, l.price, l.category, l.size,
           l.condition, l.brand, l.color, l.image_url, l.status, l.created_at,
           sp.university_domain as s_domain,
           coalesce(sls.visibility, 'off') as s_vis,
           spl.source as s_source,
           ss.zone as s_zone,
           case when spl.source = 'device' then spl.lat else sc.center_lat end as s_lat,
           case when spl.source = 'device' then spl.lng else sc.center_lng end as s_lng
    from public.listings l
    join public.profiles sp on sp.id = l.seller_id
    left join public.location_settings sls on sls.user_id = l.seller_id
    left join public.profile_locations spl on spl.user_id = l.seller_id
    left join public.campus_spots ss on ss.id = spl.spot_id
    left join public.campuses sc on sc.university_domain = sp.university_domain
    where l.status = 'active'
  ),
  scored as (
    select b.*,
           coalesce(m.vis <> 'off' and m.source is not null, false) as me_sharing,
           (b.seller_id = m.id) as is_mine,
           coalesce(
             b.s_vis <> 'off' and b.s_source is not null
             and (b.s_vis = 'public' or (b.s_vis = 'community' and b.s_domain = m.domain)),
             false
           ) as seller_visible,
           coalesce(
             m.source = 'campus_spot' and b.s_source = 'campus_spot' and m.domain = b.s_domain,
             false
           ) as both_campus,
           m.zone as m_zone,
           case
             when m.eff_lat is not null and m.eff_lng is not null
                  and b.s_lat is not null and b.s_lng is not null
             then 3959 * 2 * asin(least(1, sqrt(
                    power(sin(radians(b.s_lat - m.eff_lat) / 2), 2)
                    + cos(radians(m.eff_lat)) * cos(radians(b.s_lat))
                      * power(sin(radians(b.s_lng - m.eff_lng) / 2), 2)
                  )))
           end as miles
    from base b
    left join me m on true
  )
  select sc.id, sc.seller_id, sc.title, sc.description, sc.price, sc.category, sc.size,
         sc.condition, sc.brand, sc.color, sc.image_url, sc.status, sc.created_at,
         case
           when not sc.me_sharing then null
           when sc.is_mine then 'Your listing'
           when not sc.seller_visible then 'Location not shared'
           when sc.both_campus and sc.m_zone is not null and sc.m_zone = sc.s_zone then 'Same area'
           when sc.both_campus and sc.m_zone is not null and sc.s_zone is not null then 'Elsewhere on campus'
           when sc.both_campus then 'On campus'
           when sc.miles is null then 'Distance unavailable'
           when sc.miles < 0.5 then 'Under 0.5 mi'
           when sc.miles < 1 then '0.5 to 1 mi'
           when sc.miles < 3 then '1 to 3 mi'
           when sc.miles < 5 then '3 to 5 mi'
           when sc.miles < 10 then '5 to 10 mi'
           else '10+ mi'
         end as distance_label,
         case
           when not sc.me_sharing then 0
           when sc.is_mine then 0
           when not sc.seller_visible then 99
           when sc.both_campus and sc.m_zone is not null and sc.m_zone = sc.s_zone then 1
           when sc.both_campus then 2
           when sc.miles is null then 90
           when sc.miles < 0.5 then 3
           when sc.miles < 1 then 4
           when sc.miles < 3 then 5
           when sc.miles < 5 then 6
           when sc.miles < 10 then 7
           else 8
         end as distance_rank
  from scored sc
  order by distance_rank, sc.created_at desc
  limit p_limit offset p_offset;
$$;

-- ============================================================
-- 6. WHO MAY CALL THE FUNCTIONS
-- ============================================================
revoke all on function public.save_my_location(text, text, uuid, double precision, double precision) from public, anon;
revoke all on function public.clear_my_location() from public, anon;
revoke all on function public.mark_location_prompted() from public, anon;
revoke all on function public.nearby_listings(integer, integer) from public, anon;

grant execute on function public.save_my_location(text, text, uuid, double precision, double precision) to authenticated;
grant execute on function public.clear_my_location() to authenticated;
grant execute on function public.mark_location_prompted() to authenticated;
grant execute on function public.nearby_listings(integer, integer) to authenticated;