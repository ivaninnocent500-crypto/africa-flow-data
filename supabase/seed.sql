insert into public.countries (slug, name, iso_code, hero_image_url, description)
values
  ('tanzania', 'Tanzania', 'TZ', 'https://example.com/images/tanzania.jpg', 'Home to Serengeti, Ngorongoro and Zanzibar.'),
  ('kenya', 'Kenya', 'KE', 'https://example.com/images/kenya.jpg', 'Famous for Maasai Mara, Amboseli and Indian Ocean coast.')
on conflict (slug) do nothing;
