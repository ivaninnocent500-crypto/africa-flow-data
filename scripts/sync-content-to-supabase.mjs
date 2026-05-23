import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const root = process.cwd();

function readJsonFiles(folder) {
  const dir = path.join(root, "content", folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

async function getIdBySlug(table, slug) {
  const { data, error } = await supabase.from(table).select("id").eq("slug", slug).single();
  if (error) {
    // Catching the exact failing reference right before throwing
    console.error(`\n❌ [LOOKUP FAILURE] Table: "${table}" | Slug searched: "${slug}"`);
    if (error.code === 'PGRST116') {
      console.error(`💡 Reason: No matching row found. Either the parent record doesn't exist, or it failed to insert.`);
    }
    throw error;
  }
  return data.id;

async function upsertCountries() {
  const countries = readJsonFiles("countries");
  if (!countries.length) return;
  const rows = countries.map((c) => ({
    slug: c.slug,
    name: c.name,
    iso_code: c.iso_code,
    hero_image_url: c.hero_image_url ?? null,
    description: c.description ?? null,
    is_active: c.is_active ?? true
  }));
  const { error } = await supabase.from("countries").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`Countries synced: ${rows.length}`);
}

async function upsertDestinations() {
  const destinations = readJsonFiles("destinations");
  for (const d of destinations) {
    const countryId = await getIdBySlug("countries", d.country_slug);
    const row = {
      slug: d.slug,
      country_id: countryId,
      region_id: null,
      name: d.name,
      destination_type: d.destination_type,
      summary: d.summary ?? null,
      description: d.description ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      hero_image_url: d.hero_image_url ?? null,
      best_months: d.best_months ?? [],
      tags: d.tags ?? [],
      is_published: d.is_published ?? true
    };
    const { error } = await supabase.from("destinations").upsert(row, { onConflict: "slug" });
    if (error) throw error;
    console.log(`Destination synced: ${d.slug}`);
  }
}

async function upsertOperators() {
  const operators = readJsonFiles("operators");
  for (const o of operators) {
    const countryId = o.country_slug ? await getIdBySlug("countries", o.country_slug) : null;
    const row = {
      slug: o.slug,
      name: o.name,
      country_id: countryId,
      description: o.description ?? null,
      website_url: o.website_url ?? null,
      email: o.email ?? null,
      phone: o.phone ?? null,
      whatsapp_number: o.whatsapp_number ?? null,
      logo_url: o.logo_url ?? null,
      years_in_operation: o.years_in_operation ?? null,
      languages: o.languages ?? [],
      specialties: o.specialties ?? [],
      verified_status: o.verified_status ?? "pending",
      review_count: o.review_count ?? 0,
      average_rating: o.average_rating ?? null,
      response_time_hours: o.response_time_hours ?? null,
      cancellation_policy: o.cancellation_policy ?? null,
      payment_policy: o.payment_policy ?? null,
      is_published: o.is_published ?? true
    };
    const { error } = await supabase.from("operators").upsert(row, { onConflict: "slug" });
    if (error) throw error;
    console.log(`Operator synced: ${o.slug}`);
  }
}

async function upsertAccommodations() {
  const accommodations = readJsonFiles("accommodations");
  for (const a of accommodations) {
    const countryId = await getIdBySlug("countries", a.country_slug);
    const destinationId = await getIdBySlug("destinations", a.destination_slug);
    const operatorId = a.operator_slug ? await getIdBySlug("operators", a.operator_slug) : null;
    const accRow = {
      slug: a.slug,
      operator_id: operatorId,
      destination_id: destinationId,
      country_id: countryId,
      name: a.name,
      accommodation_type: a.accommodation_type,
      summary: a.summary ?? null,
      description: a.description ?? null,
      location_label: a.location_label ?? null,
      address_line_1: a.address_line_1 ?? null,
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
      hero_image_url: a.hero_image_url ?? null,
      amenities: a.amenities ?? [],
      room_types: a.room_types ?? [],
      board_basis: a.board_basis ?? [],
      check_in_time: a.check_in_time ?? null,
      check_out_time: a.check_out_time ?? null,
      child_policy: a.child_policy ?? null,
      cancellation_policy: a.cancellation_policy ?? null,
      payment_policy: a.payment_policy ?? null,
      verified_status: a.verified_status ?? "pending",
      review_count: a.review_count ?? 0,
      average_rating: a.average_rating ?? null,
      response_time_hours: a.response_time_hours ?? null,
      is_featured: a.is_featured ?? false,
      is_published: a.is_published ?? true
    };
    const { error } = await supabase.from("accommodations").upsert(accRow, { onConflict: "slug" });
    if (error) throw error;
    const accommodationId = await getIdBySlug("accommodations", a.slug);
    await supabase.from("accommodation_units").delete().eq("accommodation_id", accommodationId);
    if (Array.isArray(a.units) && a.units.length > 0) {
      const units = a.units.map((u) => ({
        accommodation_id: accommodationId,
        unit_name: u.unit_name,
        unit_type: u.unit_type,
        capacity_adults: u.capacity_adults,
        capacity_children: u.capacity_children ?? 0,
        base_price: u.base_price ?? null,
        currency: u.currency ?? "USD",
        amenities: u.amenities ?? [],
        inventory_count: u.inventory_count ?? 0,
        is_published: u.is_published ?? true
      }));
      const { error: unitError } = await supabase.from("accommodation_units").insert(units);
      if (unitError) throw unitError;
    }
    console.log(`Accommodation synced: ${a.slug}`);
  }
}

async function upsertItineraries() {
  const itineraries = readJsonFiles("itineraries");
  for (const i of itineraries) {
    const countryId = await getIdBySlug("countries", i.country_slug);
    const destinationId = await getIdBySlug("destinations", i.destination_slug);
    const operatorId = await getIdBySlug("operators", i.operator_slug);
    const itineraryRow = {
      slug: i.slug,
      operator_id: operatorId,
      country_id: countryId,
      destination_id: destinationId,
      title: i.title,
      itinerary_type: i.itinerary_type,
      summary: i.summary ?? null,
      description: i.description ?? null,
      duration_days: i.duration_days,
      nights: i.nights ?? 0,
      from_price: i.from_price ?? null,
      currency: i.currency ?? "USD",
      price_label: i.price_label ?? "per person",
      inclusions: i.inclusions ?? [],
      exclusions: i.exclusions ?? [],
      highlights: i.highlights ?? [],
      available_months: i.available_months ?? [],
      hero_image_url: i.hero_image_url ?? null,
      max_group_size: i.max_group_size ?? null,
      min_group_size: i.min_group_size ?? 1,
      verified_status: i.verified_status ?? "pending",
      review_count: i.review_count ?? 0,
      average_rating: i.average_rating ?? null,
      response_time_hours: i.response_time_hours ?? null,
      cancellation_policy: i.cancellation_policy ?? null,
      payment_policy: i.payment_policy ?? null,
      is_featured: i.is_featured ?? false,
      is_published: i.is_published ?? true
    };
    const { error } = await supabase.from("itineraries").upsert(itineraryRow, { onConflict: "slug" });
    if (error) throw error;
    const itineraryId = await getIdBySlug("itineraries", i.slug);
    await supabase.from("itinerary_days").delete().eq("itinerary_id", itineraryId);
    if (Array.isArray(i.days) && i.days.length > 0) {
      const days = [];
      for (const day of i.days) {
        let accommodationId = null;
        if (day.accommodation_slug) accommodationId = await getIdBySlug("accommodations", day.accommodation_slug);
        days.push({
          itinerary_id: itineraryId,
          day_number: day.day_number,
          title: day.title,
          summary: day.summary ?? null,
          accommodation_id: accommodationId,
          meals_included: day.meals_included ?? [],
          activities: day.activities ?? [],
          drive_time_label: day.drive_time_label ?? null
        });
      }
      const { error: dayInsertError } = await supabase.from("itinerary_days").insert(days);
      if (dayInsertError) throw dayInsertError;
    }
    console.log(`Itinerary synced: ${i.slug}`);
  }
}

async function main() {
  await upsertCountries();
  await upsertDestinations();
  await upsertOperators();
  await upsertAccommodations();
  await upsertItineraries();
  console.log("Sync completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
