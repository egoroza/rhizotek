# rhizotek

> For educational and research purposes only.

rhizotek is a web-based application that guides beginner mycologists through species-specific mushroom cultivation lifecycles. It abstracts away the complex math of substrate hydration, carbon-to-nitrogen (C:N) ratios, and sterilization thermodynamics into an intuitive, guided UI, serving as both an interactive learning tool and a functional lab assistant.

## What it does

- **Species selection & lifecycle walkthrough** — pick a target species (e.g. *Hericium erinaceus* / Lion's Mane, *Pleurotus ostreatus* / Blue Oyster) and get a visual, step-by-step cultivation timeline from liquid culture/agar through grain spawn, bulk substrate spawning, and fruiting.
- **"No-math" substrate & hydration calculator** — input available dry ingredients (whole oat grain, coco coir, vermiculite, gypsum, etc.) and get the exact water volume needed for 60-65% field capacity, with dynamic C:N ratio safety checking.
- **Sterilization thermodynamics profiler** — select sterilization equipment (e.g. a 16-quart digital pressure canner) and vessel sizes to get a precise time/pressure protocol based on the thermal mass of the load.
- **Fruiting environment & yield tracker** — calculates Vapor Pressure Deficit (VPD) from room temperature/humidity with actionable advice, and tracks Biological Efficiency (BE) across flushes.
- **Experiments** — log dated observations against a recipe, published to a shareable "findings" page (public or private).

Recipes (a species/strain's full supply list, measurements, and ratios) are the core deliverable; experiments are user-recorded observations tied to a recipe for comparing grows.

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | [React Router 7](https://reactrouter.com/) (SPA mode) | TypeScript, Vite. `ssr: false` — builds to a static SPA bundle. |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | CSS-first config via `@theme` in `app/app.css`. No SCSS. |
| Backend & database | PostgreSQL + [Prisma](https://www.prisma.io/) | Production DB hosted on [Supabase](https://supabase.com/); local dev uses a dedicated Docker Postgres (see [Getting started](#getting-started)). Schema currently covers fungi reference data only — see [`docs/database-schema.md`](./docs/database-schema.md). |
| Cross-platform | [Capacitor](https://capacitorjs.com/) | Native wrapper for desktop/mobile use in the workbench, still-air box (SAB), and grow room. Native platforms not yet added. |
| Auth | [Auth0](https://auth0.com/) | Email-based account creation/login. Not yet wired up. |
| Package manager | [pnpm](https://pnpm.io/) | |

## Getting started

**Requirements:** Node >22.22.0 (see [Known issues](#known-issues)), [pnpm](https://pnpm.io/installation).

```bash
pnpm install
cp .env.example .env   # AUTH0_* still needs real values once that service is set up
docker compose up -d   # starts a local Postgres on localhost:5433 (see docs/database-schema.md)
pnpm exec prisma migrate dev   # applies migrations to it
pnpm db:seed            # seeds fungi reference data from fungi_data_staging.json
pnpm dev                # starts the dev server at http://localhost:5173
```

Other scripts:

```bash
pnpm build       # production SPA build -> build/client
pnpm typecheck   # react-router typegen + tsc
pnpm prisma:generate  # regenerate the Prisma client after editing prisma/schema.prisma
pnpm db:seed          # re-run the fungi data seed (idempotent)
```

## Project structure

```
app/
  root.tsx          # HTML shell, Google Fonts, error boundary
  app.css           # Tailwind entry + design tokens (@theme)
  routes.ts         # route config (nested under a shared Header/Footer layout)
  routes/
    home.tsx        # "/" — logo splash page
    layout.tsx      # shared Header/Footer chrome, wraps every route below
    login.tsx, signup.tsx                     # TODO stubs
    browse/         # "/browse" (search + filters, working) and taxonomy-drilldown
                     # routes (division/class/order/family/genus/species — TODO stubs)
    recipes/        # TODO stubs
    experiments/    # TODO stubs
  components/
    Card.tsx, Filter.tsx, Button.tsx, AutocompleteSearch.tsx
  partials/
    Header.tsx, Footer.tsx
  lib/
    db.server.ts       # Prisma client (pg driver adapter)
    fungiFilters.ts     # search + keyword-based filter matching for Browse
    auth.server.ts      # TODO: Auth0
  mock-api/
    fungi.json          # live export of the seeded DB — see prisma/export-fungi-mock.ts
    filters.json         # Browse page's filter definitions
prisma/
  schema.prisma        # Fungus / FungusImage / Strain models (fungi reference data only so far)
  seed.ts              # seeds from fungi_data_staging.json — see docs/database-schema.md
  export-fungi-mock.ts # regenerates app/mock-api/fungi.json from the live DB (`pnpm mock:fungi`)
docs/
  database-schema.md    # Prisma models reference
  fungi-data-schema.md  # fungi_data_staging.json shape reference
capacitor.config.ts # Capacitor config stub, no native platforms added
docker-compose.yml   # local Postgres for dev
.env.example
```

## Design tokens

- **Logo wordmark** ("rhizotek"): `font-logo` — Momo Trust Display
- **Headings**: `font-heading` — Momo Trust Sans
- **Body/paragraph text**: `font-body` (default on `<body>`) — IBM Plex Serif
- **Colors**: `bg-background` (`#F7DBA7`), `text-text` (`#251605`), plus accents `accent-sage` (`#9CAFB7`), `accent-peach` (`#F1AB86`), `accent-rust` (`#C57B57`) — e.g. `bg-accent-rust`, `text-accent-sage`

## Current status

**Working:**
- `/browse` — search box (substring match on common + scientific name) and dropdown filters (cap underside, substrate, stem shape, spore print color, chemical reactions, difficulty) live-filter a card grid pulled from `app/mock-api/fungi.json`. Filter/search state lives in the URL's query params.
- Shared `Header`/`Footer` layout wraps every route.
- Database: `Fungus` / `FungusImage` / `Strain` models, migrated and seeded with all 22 researched species (see [`docs/database-schema.md`](./docs/database-schema.md)).

**Stubbed (`<p>TODO</p>` placeholders):** login, signup, the individual species/taxonomy detail pages under `/browse/...`, recipes, experiments.

**Not started:** `Recipe`/`Experiment`/user-account models, Capacitor native platforms, Auth0.

See [Known issues](#known-issues) for a couple of rough edges in what's already working.

## Known issues

- React Router 8.x requires Node >22.22.0; developing on an older 22.x version works but prints a warning.
- **Cap color filter on `/browse` needs adjustment.** It's not wired up in `app/lib/fungiFilters.ts` yet — `morphology.capColors` entries are descriptive, multi-value, life-stage-qualified strings (e.g. `"Black (young)"`, `"Light brown (mature)"`), so it needs different handling than the other filters' single-keyword matching. Flagged here and in a comment in that file.
