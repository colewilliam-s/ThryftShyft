create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_reads enable row level security;

create policy "Users can read their own conversation read states"
on public.conversation_reads
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own conversation read states"
on public.conversation_reads
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own conversation read states"
on public.conversation_reads
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());