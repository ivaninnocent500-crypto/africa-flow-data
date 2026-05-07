alter table public.countries enable row level security;
alter table public.destinations enable row level security;
alter table public.operators enable row level security;
alter table public.guides enable row level security;
alter table public.accommodations enable row level security;
alter table public.accommodation_units enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.booking_drafts enable row level security;
alter table public.booking_requests enable row level security;
alter table public.reservation_holds enable row level security;
alter table public.payment_requests enable row level security;

create policy "Public read countries" on public.countries for select to anon, authenticated using (is_active = true);
create policy "Public read destinations" on public.destinations for select to anon, authenticated using (is_published = true);
create policy "Public read operators" on public.operators for select to anon, authenticated using (is_published = true);
create policy "Public read guides" on public.guides for select to anon, authenticated using (is_published = true);
create policy "Public read accommodations" on public.accommodations for select to anon, authenticated using (is_published = true);
create policy "Public read accommodation units" on public.accommodation_units for select to anon, authenticated using (is_published = true);
create policy "Public read itineraries" on public.itineraries for select to anon, authenticated using (is_published = true);
create policy "Public read itinerary days" on public.itinerary_days for select to anon, authenticated using (true);

create policy "Users read own booking drafts" on public.booking_drafts for select to authenticated using (user_id = auth.uid());
create policy "Users insert own booking drafts" on public.booking_drafts for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own booking drafts" on public.booking_drafts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users read own booking requests" on public.booking_requests for select to authenticated using (user_id = auth.uid());
create policy "Users insert own booking requests" on public.booking_requests for insert to authenticated with check (user_id = auth.uid());
