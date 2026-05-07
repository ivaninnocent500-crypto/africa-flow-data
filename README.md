# Africa Flow Data

Curated marketplace content and database scaffolding for Africa Flow OS.

## Purpose
- `content/`: reviewed JSON content for countries, destinations, operators, guides, accommodations, itineraries
- `schemas/`: JSON Schemas for validation
- `scripts/`: validation and Supabase sync scripts
- `supabase/migrations/`: Postgres schema migrations
- `supabase/seed.sql`: starter seed data

## Workflow
1. Update curated content JSON.
2. Validate via GitHub Actions.
3. Sync approved content into Supabase.
