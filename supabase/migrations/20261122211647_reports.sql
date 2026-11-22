create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  seller_id uuid references public.profiles(id) on delete set null,
  reason text not null check (reason in ('spam','scam','inappropriate','prohibited','harassment','other')),
  details text check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, listing_id)   -- one report per person per listing
);

create index on public.reports (status, created_at);

alter table public.reports enable row level security;

-- you can see your own reports (used to hide those posts from your feed).
-- nobody can read anyone else's, and there is no insert policy: reports go through the function below.
create policy "Reporters can see their own reports"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid());

create function public.report_listing(p_listing uuid, p_reason text, p_details text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_seller uuid;
begin
  select seller_id into v_seller from public.listings where id = p_listing;
  if v_seller is null then raise exception 'Listing not found'; end if;
  if v_seller = auth.uid() then raise exception 'You cannot report your own listing'; end if;

  insert into public.reports (reporter_id, listing_id, seller_id, reason, details)
  values (auth.uid(), p_listing, v_seller, p_reason, left(p_details, 500))
  on conflict (reporter_id, listing_id) do nothing;
end;
$$;

revoke all on function public.report_listing(uuid, text, text) from public;
grant execute on function public.report_listing(uuid, text, text) to authenticated;