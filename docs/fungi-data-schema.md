# Fungi data schema

The JSON shape produced by the fungi research task (`.claude/fungi_data_extraction_instructions.md`) and staged in `fungi_data_staging.json` at the repo root before being seeded into Postgres via `prisma/seed.ts`. See [`database-schema.md`](./database-schema.md) for how this maps onto the actual Prisma models.

## Top-level shape

A JSON array, one object per species:

```json
[
  {
    "commonName": "String",
    "isCultivatable": "Boolean",
    "biography": "String (2-3 casual paragraphs)",
    "taxonomy": { "...": "see below" },
    "morphology": { "...": "see below" },
    "ecology": { "...": "see below" },
    "cultivation": { "...": "see below" },
    "media": { "...": "see below" },
    "strains": [{ "...": "see below" }]
  }
]
```

### `taxonomy`

| Field | Type | Notes |
|---|---|---|
| `division` | String | |
| `class` | String | |
| `order` | String | |
| `family` | String | |
| `genus` | String | |
| `species` | String | Full binomial (e.g. `"Lentinula edodes"`), including a `var.` suffix where relevant |

### `morphology`

| Field | Type | Notes |
|---|---|---|
| `capColors` | String[] | |
| `hymenophore` | String | e.g. gills, pores, teeth |
| `stipe` | String | |
| `chemicalReactions` | String[] | Bruising, staining, latex, etc. — `[]` if none noted |
| `sporePrintColor` | String | |

### `ecology`

| Field | Type | Notes |
|---|---|---|
| `growthType` | String | e.g. Saprotrophic, Ectomycorrhizal |
| `warningMessage` | String \| null | Populated **only** when `isCultivatable` is `false`, with the exact string: _"Heads up! [Species Name] is an ectomycorrhizal fungus. It must form a mutually beneficial relationship with the root systems of living trees and cannot be cultivated indoors."_ |

### `cultivation`

Every field is `null` (or an empty array) when `isCultivatable` is `false`.

| Field | Type | Notes |
|---|---|---|
| `difficulty` | String \| null | `"Beginner"`, `"Intermediate"`, or `"Advanced"` |
| `methods` | String[] | e.g. liquid culture, agar, cloning |
| `defaultGrain` | String[] | |
| `defaultBulk` | String[] | |
| `targetCNRatio` | Number \| null | |
| `incubation.temperatureRangeC` | [Number, Number] \| null | `[min, max]` |
| `incubation.relativeHumidity` | String \| null | e.g. `"90-100%"` |
| `fruiting.temperatureRangeC` | [Number, Number] \| null | |
| `fruiting.relativeHumidity` | String \| null | |
| `fruiting.targetVPD` | String \| null | Often `null` — rarely a single sourceable figure |
| `thermodynamics.sterilizationPSI` | Number \| null | |
| `thermodynamics.sterilizationMinutes16oz` | Number \| null | |
| `thermodynamics.sterilizationMinutes5lb` | Number \| null | |

A `null` here means the research genuinely couldn't source that figure with confidence — it was left blank rather than guessed. See the review artifact's "to verify" badges for which species/fields those are.

### `media`

| Field | Type | Notes |
|---|---|---|
| `profileImage` | Image | One representative photo of the mature fruiting body |
| `additionalImages` | Image[] | 2-3 photos showing meaningful variation (life stage, habitat, variant), each with a `caption` |
| `sporePrintImage` | Image & `{ isGenerated: Boolean }` | A real photo when reliably found, otherwise a generated inline SVG |

**Image** object:

| Field | Type | Notes |
|---|---|---|
| `url` | String | An `https://` URL (Wikimedia Commons / iNaturalist), or for a generated spore print, a `data:image/svg+xml;base64,...` URI |
| `caption` | String | `additionalImages` only |
| `source` | String \| null | Which service the photo came from |
| `attribution` | String \| null | Photographer/uploader credit, `null` if the license doesn't require one |
| `license` | String \| null | e.g. `"CC-BY-SA 4.0"`, `"CC0"` |
| `isGenerated` | Boolean | `sporePrintImage` only |

Generated spore-print SVGs **must** be base64-encoded (`;base64,`), not a raw `;utf8,` URI — a raw URI breaks the moment the SVG contains a `#` (any hex color), since `#` starts a URL fragment and truncates everything after it.

### `strains[]`

| Field | Type | Notes |
|---|---|---|
| `name` | String | |
| `description` | String | |
| `cultivationNotes` | String | |
| `biography` | String | ~1 casual paragraph |
| `media.profileImage` | Image | See above |
| `media.usesParentImage` | Boolean | `true` when no confidently strain-specific photo exists and `profileImage` is a copy of the parent species' — strain photo ID from images alone isn't reliable, so this is never guessed |

Strains do not get their own `additionalImages` or `sporePrintImage` — spore print color and habitat don't vary meaningfully by strain, so those stay species-level only.

## Design notes

- **Images are external URLs, not local files.** The data intentionally references the canonical Wikimedia Commons / iNaturalist source URLs. (The review artifact mirrors copies locally only because its sandboxed viewer can't hotlink external hosts — that's a viewer limitation, not something reflected in this data.)
- **Attribution/license is mandatory whenever the source states one.** Any candidate photo without clear licensing was skipped rather than used unattributed.
- **`null` over guessing.** Any field the research couldn't confidently source is `null`/`[]`, never a plausible-sounding fabricated value.
