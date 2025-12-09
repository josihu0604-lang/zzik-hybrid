
-- Migration: Create Dead Letter Queue (DLQ) Table
-- Used for storing failed events for later replay/analysis

create table if not exists public.dead_letter_queue (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  payload jsonb not null,
  error_message text,
  stack_trace text,
  status text default 'failed' check (status in ('failed', 'replaying', 'resolved', 'ignored')),
  attempts int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for querying by status (common access pattern)
create index if not exists idx_dlq_status on public.dead_letter_queue(status);

-- RLS Policies (Admin only)
alter table public.dead_letter_queue enable row level security;

create policy "Admins can do everything with DLQ"
  on public.dead_letter_queue
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'super_admin')
    )
  );
