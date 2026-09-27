/**
 * Best-effort keyword classification of the free-text fungi fields into the
 * fixed buckets defined in app/mock-api/filters.json. The source data isn't
 * tagged with these categories directly, so this infers them from wording —
 * it won't be perfect for every edge case, but it's the same "for now"
 * substring-matching spirit as the search box.
 */

export interface FilterableFungus {
  commonName: string;
  taxonomy: { species: string };
  ecology: { growthType: string };
  morphology: {
    hymenophore: string;
    stipe: string;
    sporePrintColor: string;
    chemicalReactions: string[];
  };
  cultivation: { difficulty: string | null } | null;
}

export function matchesSearch(fungus: FilterableFungus, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    fungus.commonName.toLowerCase().includes(q) ||
    fungus.taxonomy.species.toLowerCase().includes(q)
  );
}

function classifyHymenophore(text: string): string {
  const t = text.toLowerCase();
  // Chanterelles' "false gills" are ridges, not true gills — check this first
  // so they don't get miscategorized as "gilled".
  if (t.includes("false gill") || t.includes("ridge")) return "other";
  if (t.includes("tooth") || t.includes("teeth") || t.includes("spine")) return "toothed";
  if (t.includes("pore")) return "pored";
  if (t.includes("gill")) return "gilled";
  return "other";
}

function classifySubstrate(growthType: string): string {
  const t = growthType.toLowerCase();
  if (t.includes("mycorrhizal")) return "mycorrhizal";
  if (t.includes("dung") || t.includes("coprophilous")) return "dung";
  if (t.includes("wood")) return "wood-decay";
  return "soil-litter";
}

function classifyStemShape(stipe: string): string {
  const t = stipe.toLowerCase();
  if (t.includes("volva") || t.includes("annulus") || t.includes("ring")) return "veiled";
  if (t.includes("absent") || t.includes("sessile") || t.includes("stalkless")) return "sessile";
  if (t.includes("off-center") || t.includes("lateral")) return "pleurotoid";
  return "central-stem";
}

function classifySporePrintColor(text: string): string | null {
  const t = text.toLowerCase();
  // Order matters: compound descriptors like "purple-brown" or "blackish-brown"
  // should land in the rarer/more specific bucket, not fall through to brown.
  if (t.includes("purple")) return "purple-black";
  if (t.includes("pink")) return "pink";
  if (t.includes("black")) return "black";
  if (t.includes("brown")) return "brown";
  if (t.includes("white")) return "white";
  return null;
}

function classifyChemicalReactions(reactions: string[]): string[] {
  const tags = new Set<string>();
  for (const reaction of reactions) {
    const t = reaction.toLowerCase();
    if (t.startsWith("no ") || t.includes("does not") || t.includes("no notable")) continue;
    if (t.includes("latex") || t.includes("milk")) tags.add("latex");
    if (t.includes("bruis")) tags.add("bruising");
    if (t.includes("stain") || t.includes("darken") || t.includes("turns")) tags.add("color-change");
  }
  return [...tags];
}

interface FungusFacets {
  hymenophore: string;
  substrate: string;
  morphology: string;
  sporePrintColor: string | null;
  chemicalReactions: string[];
  difficulty: string | null;
}

// TODO: "cap-color" (filters.json) isn't classified/matched here yet. capColors
// entries are descriptive and multi-value with qualifiers (e.g. "Black (young)",
// "Light brown (mature)"), so a single-keyword classifier like the others below
// won't reliably bucket them — needs its own approach. Selecting a cap color in
// the UI currently has no effect on results.

function getFacets(fungus: FilterableFungus): FungusFacets {
  return {
    hymenophore: classifyHymenophore(fungus.morphology.hymenophore),
    substrate: classifySubstrate(fungus.ecology.growthType),
    morphology: classifyStemShape(fungus.morphology.stipe),
    sporePrintColor: classifySporePrintColor(fungus.morphology.sporePrintColor),
    chemicalReactions: classifyChemicalReactions(fungus.morphology.chemicalReactions),
    difficulty: fungus.cultivation?.difficulty?.toLowerCase() ?? null,
  };
}

export type SelectedFilters = Record<string, string[]>;

export function matchesFilters(fungus: FilterableFungus, selected: SelectedFilters): boolean {
  const facets = getFacets(fungus);

  const singleMatch = (param: string, value: string | null) => {
    const chosen = selected[param];
    if (!chosen || chosen.length === 0) return true;
    return value !== null && chosen.includes(value);
  };

  const anyMatch = (param: string, values: string[]) => {
    const chosen = selected[param];
    if (!chosen || chosen.length === 0) return true;
    return values.some((v) => chosen.includes(v));
  };

  return (
    singleMatch("hymenophore", facets.hymenophore) &&
    singleMatch("substrate", facets.substrate) &&
    singleMatch("morphology", facets.morphology) &&
    singleMatch("spore-print-color", facets.sporePrintColor) &&
    anyMatch("chemical-reactions", facets.chemicalReactions) &&
    singleMatch("difficulty", facets.difficulty)
  );
}
