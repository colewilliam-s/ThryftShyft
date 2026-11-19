create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  university_domain text not null unique   -- matches profiles.university_domain
);

create table public.campus_spots (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses(id) on delete cascade,
  name text not null,                      -- the dorm
  zone text not null,                      -- the residence area it belongs to
  created_at timestamptz default now(),
  unique (campus_id, name)
);

alter table public.campuses enable row level security;
alter table public.campus_spots enable row level security;
create policy "Signed-in users can view campuses"
  on public.campuses for select to authenticated using (true);
create policy "Signed-in users can view campus spots"
  on public.campus_spots for select to authenticated using (true);


insert into public.campuses (name, university_domain)
values ('University of Vermont', 'uvm.edu')
on conflict (university_domain) do nothing;

insert into public.campus_spots (campus_id, name, zone)
select c.id, v.name, v.zone
from public.campuses c
cross join (values
  ('Wilks', 'Redstone'),
  ('Davis', 'Redstone'),
  ('Wing', 'Redstone'),
  ('Hamilton', 'Redstone'),
  ('Simpson', 'Redstone'),
  ('Mason', 'Redstone'),
  ('Christie', 'Redstone'),
  ('Wright', 'Redstone'),
  ('Patterson', 'Redstone'),
  ('Slade', 'Redstone'),
  ('Coolidge', 'Redstone'),
  ('Redstone Hall', 'Redstone'),

  ('Harris', 'Athletic'),
  ('Millis', 'Athletic'),
  ('UHeights South', 'Athletic'),
  ('UHeights North', 'Athletic'),
  ('Marsh', 'Athletic'),
  ('Austin', 'Athletic'),
  ('Tupper', 'Athletic'),
  ('Living/Learning A', 'Athletic'),
  ('Living/Learning B', 'Athletic'),
  ('Living/Learning C', 'Athletic'),
  ('Living/Learning D', 'Athletic'),
  ('Living/Learning E', 'Athletic'),

  ('McAuley', 'Trinity'),
  ('Mercy', 'Trinity'),
  ('Back 5', 'Trinity'),
  ('The Cottages', 'Trinity'),
  ('Jeanne Mance', 'Trinity'),

  ('Central Campus Residence', 'Central'),
  ('Converse', 'Central')

) as v(name, zone)
where c.university_domain = 'uvm.edu'
on conflict (campus_id, name) do nothing;