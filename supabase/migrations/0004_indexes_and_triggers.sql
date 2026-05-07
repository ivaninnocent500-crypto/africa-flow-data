create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_countries before update on public.countries for each row execute function public.set_updated_at();
create trigger set_updated_at_destinations before update on public.destinations for each row execute function public.set_updated_at();
create trigger set_updated_at_operators before update on public.operators for each row execute function public.set_updated_at();
create trigger set_updated_at_guides before update on public.guides for each row execute function public.set_updated_at();
create trigger set_updated_at_accommodations before update on public.accommodations for each row execute function public.set_updated_at();
create trigger set_updated_at_accommodation_units before update on public.accommodation_units for each row execute function public.set_updated_at();
create trigger set_updated_at_itineraries before update on public.itineraries for each row execute function public.set_updated_at();
create trigger set_updated_at_itinerary_days before update on public.itinerary_days for each row execute function public.set_updated_at();
create trigger set_updated_at_booking_drafts before update on public.booking_drafts for each row execute function public.set_updated_at();
create trigger set_updated_at_booking_requests before update on public.booking_requests for each row execute function public.set_updated_at();
create trigger set_updated_at_reservation_holds before update on public.reservation_holds for each row execute function public.set_updated_at();
create trigger set_updated_at_payment_requests before update on public.payment_requests for each row execute function public.set_updated_at();
