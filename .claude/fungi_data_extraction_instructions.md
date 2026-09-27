# Fungi Data Extraction Instructions

## Objective

Your task is to research specific species of fungi using connected mycology and biodiversity MCPs (such as iNaturalist, GBIF, Mushroom Observer, FungalTraits, or FUNGuild) and compile the data into a strictly typed, raw JSON array. For images, use Wikimedia Commons and iNaturalist's photo endpoints (see rule 6 under Extraction Rules & Logic) rather than generic web search results, since both provide usable, attributable, and reasonably stable image licensing.

Do not write this data to a database. Output the final result as a valid JSON file (e.g., `fungi_data_staging.json`) so it can be manually reviewed before being seeded into a PostgreSQL database via Prisma.

## Target Species List

### Gourmet & Medicinal Saprotrophs (Wood and Compost Lovers)

- Lentinula edodes (Shiitake)
- Hericium erinaceus (Lion's Mane)
- Flammulina velutipes (Enoki / Velvet Foot)
- Pleurotus ostreatus var. columbinus (Blue Oyster)
- Pleurotus djamor (Pink Oyster)
- Pleurotus citrinopileatus (Golden Oyster)
- Pleurotus eryngii (King Oyster / King Trumpet)
- Grifola frondosa (Maitake / Hen of the Woods)
- Ganoderma lucidum (Reishi)
- Pholiota microspora (Nameko)
- Pholiota adiposa (Chestnut Mushroom)
- Cyclocybe aegerita (Pioppino / Black Poplar)
- Stropharia rugosoannulata (Wine Cap / King Stropharia)
- Agaricus bisporus (White Button / Cremini / Portobello)
- Trametes versicolor (Turkey Tail)
- Hericium americanum (Bear's Head Tooth)

### Active Saprotrophs (Dung and Grain Lovers)

- Psilocybe cubensis (Strains: Golden Teacher, B+, Jedi Mind Fuck, Stargazer, Penis Envy)
- Psilocybe natalensis (Natal Super Strength)
- Panaeolus cyanescens (Blue Meanies)

### Informational Only / Mycorrhizal (For Ectomycorrhizal Warning UI Testing)

- Amanita muscaria (Fly Agaric)[cite: 2]
- Boletus edulis (King Bolete / Porcini)
- Cantharellus cibarius (Golden Chanterelle)

## Extraction Rules & Logic

1. **Growth Type & Mycorrhizal Warning:** Identify the growth type (e.g., Saprotrophic, Ectomycorrhizal, Parasitic). If the species cannot be easily cultivated indoors (e.g., Ectomycorrhizal species), set `isCultivatable` to `false`. You **must** also populate the `ecology.warningMessage` field with the exact string: _"Heads up! [Species Name] is an ectomycorrhizal fungus. It must form a mutually beneficial relationship with the root systems of living trees and cannot be cultivated indoors."_
2. **Cultivatable Species:** If `isCultivatable` is `true`, leave `warningMessage` as `null` and ensure the `cultivation` object is as detailed as possible.
3. **Strains:** If a species has notable cultivated strains or varieties (e.g., "Golden Teacher" for _P. cubensis_, or "Blue Oyster" for _P. ostreatus_), include them in the nested `strains` array.
4. **Data Formatting:** Use arrays of strings for fields that can have multiple values (e.g., `capColors`, `methods`, `defaultBulk`).
5. **Biography:** Write a casual, laid-back 2-3 paragraph overview for every species in `biography` — AI-generated is fine, just keep the tone approachable rather than clinical. Every strain also gets its own shorter `biography` (about one paragraph), since strains vary enough in look/behavior/history to be worth a few sentences of their own.
6. **Images — sourcing:** Pull images from stable, clearly-licensed sources rather than generic web search results — prefer Wikimedia Commons (via the Wikipedia REST summary endpoint for a page's lead image, and the Commons API for a species' image category) and iNaturalist's taxa/photos endpoints (`api.inaturalist.org/v1/taxa`), since both expose usable photos with attribution and license metadata attached. GBIF occurrence multimedia is an acceptable fallback. For every image, record `source` (which service it came from), `attribution` (photographer/uploader credit as given by that service, or `null` if the license doesn't require one), and `license` (e.g. `"CC-BY-SA 4.0"`, `"CC0"`, or `null` if unknown) — never store a bare URL with no license info if the source page states one.
7. **Images — profile & additional:** `media.profileImage` is one representative, in-focus photo of the mature fruiting body. `media.additionalImages` is 2-3 photos showing meaningful variation — e.g. a different life stage (primordia/pinning vs. mature), a different substrate/habitat, or a notable variant — each with a short `caption` describing what it shows.
8. **Images — spore print:** `media.sporePrintImage` should be a real spore print photo if one can be reliably found (rare, but sometimes available for well-documented species). If not, generate a simple graphic instead: an inline SVG showing a solid-color deposit in the shade named by `morphology.sporePrintColor` — e.g. a circular/blob shape on a plain background — encoded as a **base64** data URI (`data:image/svg+xml;base64,...`), not a raw `;utf8,` URI. (A raw `;utf8,` URI breaks the moment the SVG contains a `#` — e.g. any hex color — since `#` starts a URL fragment and truncates everything after it. Always base64-encode generated SVGs for this reason.) Set `isGenerated: true` for a generated graphic (with `source`/`attribution`/`license` as `null`), or `false` for a real sourced photo (with source metadata populated as in rule 6).
9. **Strain images:** Give each strain its own `media.profileImage` only when a photo can be found that is *confidently and specifically* labeled as that strain (not just the parent species) — strain identification from photos alone is unreliable even for experts, so don't guess. When no such photo exists, set `media.profileImage` to the parent species' `media.profileImage` value and set `media.usesParentImage: true` to make the fallback explicit; when a genuinely strain-specific photo is used, set `media.usesParentImage: false`. Strains do not get their own `additionalImages` or `sporePrintImage` — those stay species-level, since spore print color and habitat don't vary meaningfully by strain.

## Required JSON Schema

Please format every species according to this exact JSON structure:

```json
[
  {
    "commonName": "String",
    "isCultivatable": "Boolean",
    "biography": "String (2-3 casual paragraphs)",
    "taxonomy": {
      "division": "String",
      "class": "String",
      "order": "String",
      "family": "String",
      "genus": "String",
      "species": "String"
    },
    "morphology": {
      "capColors": ["String"],
      "hymenophore": "String (e.g., gills, pores, teeth)",
      "stipe": "String",
      "chemicalReactions": ["String"],
      "sporePrintColor": "String"
    },
    "ecology": {
      "growthType": "String",
      "warningMessage": "String or null"
    },
    "cultivation": {
      "difficulty": "String (Beginner, Intermediate, Expert) or null",
      "methods": ["String (e.g., liquid culture, agar, cloning)"],
      "defaultGrain": ["String"],
      "defaultBulk": ["String"],
      "targetCNRatio": "Number or null",
      "incubation": {
        "temperatureRangeC": [Min, Max],
        "relativeHumidity": "Percentage String (e.g., '90-100%')"
      },
      "fruiting": {
        "temperatureRangeC": [Min, Max],
        "relativeHumidity": "Percentage String",
        "targetVPD": "String or null"
      },
      "thermodynamics": {
        "sterilizationPSI": "Number",
        "sterilizationMinutes16oz": "Number",
        "sterilizationMinutes5lb": "Number"
      }
    },
    "media": {
      "profileImage": {
        "url": "String",
        "source": "String (e.g., 'Wikimedia Commons', 'iNaturalist')",
        "attribution": "String or null",
        "license": "String or null (e.g., 'CC-BY-SA 4.0', 'CC0')"
      },
      "additionalImages": [
        {
          "url": "String",
          "caption": "String (what it shows, e.g. life stage or habitat)",
          "source": "String",
          "attribution": "String or null",
          "license": "String or null"
        }
      ],
      "sporePrintImage": {
        "url": "String (real photo URL, or a data:image/svg+xml;utf8,... generated graphic)",
        "isGenerated": "Boolean",
        "source": "String or null",
        "attribution": "String or null",
        "license": "String or null"
      }
    },
    "strains": [
      {
        "name": "String",
        "description": "String",
        "cultivationNotes": "String",
        "biography": "String (~1 casual paragraph)",
        "media": {
          "profileImage": {
            "url": "String",
            "source": "String",
            "attribution": "String or null",
            "license": "String or null"
          },
          "usesParentImage": "Boolean (true if profileImage is a fallback copy of the species' own profileImage, because no confidently strain-specific photo was found)"
        }
      }
    ]
  }
]
```

## Execution

Please begin researching the provided species list. Cross-reference data across your available tools to ensure accuracy, particularly regarding cultivation metrics (temperatures, substrates, sterilization times) and taxonomic hierarchy. Once complete, write the output to `fungi_data_staging.json`.
