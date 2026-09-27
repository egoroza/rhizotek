# Database schema

Prisma models in `prisma/schema.prisma`, backed by a local Postgres (see [Local development](#local-development) below). This currently covers only the fungi reference data seeded from `fungi_data_staging.json` (see [`fungi-data-schema.md`](./fungi-data-schema.md) for that source shape) — `Recipe`, `Experiment`, and other product-spec models aren't modeled yet.

## Models

### `Fungus`

One row per species (or named variety, e.g. *Pleurotus ostreatus var. columbinus*). Taxonomy and morphology are flattened onto the model directly since they're simple, always-present, single-species facts.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `commonName` | String | |
| `isCultivatable` | Boolean | |
| `biography` | String | |
| `division`, `class`, `order`, `family`, `genus`, `species` | String | Taxonomy |
| `capColors` | String[] | Morphology |
| `hymenophore` | String | |
| `stipe` | String | |
| `chemicalReactions` | String[] | |
| `sporePrintColor` | String | |
| `growthType` | String | Ecology |
| `warningMessage` | String? | Ectomycorrhizal warning, `null` when cultivatable |
| `cultivation` | Json? | See [Why `cultivation` is JSON](#why-cultivation-is-json) |
| `images` | FungusImage[] | Relation |
| `strains` | Strain[] | Relation |
| `createdAt` / `updatedAt` | DateTime | |

Unique on `[genus, species]` — this is what the seed script upserts against, so re-running the seed updates existing rows instead of duplicating them.

### `FungusImage`

One row per image (profile, additional, or spore print), rather than JSON columns, so images are individually queryable (e.g. "all photos missing a license") without unpacking JSON.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `fungusId` | String | FK → `Fungus`, cascades on delete |
| `type` | `PROFILE` \| `ADDITIONAL` \| `SPORE_PRINT` | Enum `FungusImageType` |
| `url` | String | External URL or (for a generated spore print) a base64 SVG data URI |
| `caption` | String? | Set for `ADDITIONAL` images |
| `source` | String? | |
| `attribution` | String? | |
| `license` | String? | |
| `isGenerated` | Boolean | Default `false`; `true` for generated spore-print placeholders |

### `Strain`

A named cultivar/variety of a `Fungus` (e.g. "Golden Teacher"). Strains only ever have a single image, so — unlike `Fungus` — that image's fields are flattened directly onto the model rather than pulled into `FungusImage`.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `fungusId` | String | FK → `Fungus`, cascades on delete |
| `name` | String | |
| `description` | String | |
| `cultivationNotes` | String | |
| `biography` | String | |
| `imageUrl` / `imageSource` / `imageAttribution` / `imageLicense` | String? | |
| `usesParentImage` | Boolean | `true` when no confidently strain-specific photo exists and the image is a copy of the parent species' |

Unique on `[fungusId, name]`.

## Why `cultivation` is JSON

Every other nested object in the source data (`taxonomy`, `morphology`, `ecology`) is flattened into scalar columns. `cultivation` is the one exception, kept as a single `Json?` column instead of ~12 more scalar fields. Reasoning:

- Per the product spec, a species' cultivation data is a **default template** — when a user creates a Recipe, these values get copied in and then become independently user-editable. The `Fungus` row itself is never queried or filtered by, say, "sterilization PSI between X and Y"; it's read once, wholesale, to pre-fill a new Recipe.
- Keeping it as one JSON blob means the shape can evolve (e.g. adding a new cultivation field) without a migration, which matters more here than for taxonomy/morphology since cultivation guidance is the part most likely to be refined over time.

If per-field querying on cultivation data becomes a real need later, this is the field to normalize first.

## Local development

A dedicated Postgres runs in Docker via `docker-compose.yml` (not shared with any other project's database):

```bash
docker compose up -d          # start Postgres on localhost:5433
pnpm prisma:generate           # regenerate the Prisma client after schema changes
pnpm exec prisma migrate dev   # create/apply a migration
pnpm db:seed                   # seed from fungi_data_staging.json
```

`DATABASE_URL` lives in `.env` (gitignored) — see `.env.example` for the shape. Prisma 7 moved datasource configuration out of `schema.prisma` and into `prisma.config.ts`; the application itself connects via the `@prisma/adapter-pg` driver adapter (see `app/lib/db.server.ts`), not the URL in `schema.prisma` directly.

To reset from scratch: `docker compose down -v` (drops the volume) then repeat the steps above.
