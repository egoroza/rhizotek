import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import type { Prisma } from "@prisma/client";

import { prisma } from "../app/lib/db.server";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SourceImage {
  url: string;
  caption?: string;
  source?: string | null;
  attribution?: string | null;
  license?: string | null;
  isGenerated?: boolean;
}

interface SourceStrain {
  name: string;
  description: string;
  cultivationNotes: string;
  biography: string;
  media: {
    profileImage: SourceImage | null;
    usesParentImage: boolean;
  };
}

interface SourceFungus {
  commonName: string;
  isCultivatable: boolean;
  biography: string;
  taxonomy: {
    division: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  morphology: {
    capColors: string[];
    hymenophore: string;
    stipe: string;
    chemicalReactions: string[];
    sporePrintColor: string;
  };
  ecology: {
    growthType: string;
    warningMessage: string | null;
  };
  cultivation: Prisma.InputJsonValue;
  media: {
    profileImage: SourceImage;
    additionalImages: SourceImage[];
    sporePrintImage: SourceImage;
  };
  strains: SourceStrain[];
}

async function main() {
  const dataPath = join(__dirname, "..", "fungi_data_staging.json");
  const data: SourceFungus[] = JSON.parse(readFileSync(dataPath, "utf-8"));

  for (const entry of data) {
    const fungus = await prisma.fungus.upsert({
      where: {
        genus_species: {
          genus: entry.taxonomy.genus,
          species: entry.taxonomy.species,
        },
      },
      create: {
        commonName: entry.commonName,
        isCultivatable: entry.isCultivatable,
        biography: entry.biography,
        division: entry.taxonomy.division,
        class: entry.taxonomy.class,
        order: entry.taxonomy.order,
        family: entry.taxonomy.family,
        genus: entry.taxonomy.genus,
        species: entry.taxonomy.species,
        capColors: entry.morphology.capColors,
        hymenophore: entry.morphology.hymenophore,
        stipe: entry.morphology.stipe,
        chemicalReactions: entry.morphology.chemicalReactions,
        sporePrintColor: entry.morphology.sporePrintColor,
        growthType: entry.ecology.growthType,
        warningMessage: entry.ecology.warningMessage,
        cultivation: entry.cultivation ?? undefined,
      },
      update: {
        commonName: entry.commonName,
        isCultivatable: entry.isCultivatable,
        biography: entry.biography,
        division: entry.taxonomy.division,
        class: entry.taxonomy.class,
        order: entry.taxonomy.order,
        family: entry.taxonomy.family,
        capColors: entry.morphology.capColors,
        hymenophore: entry.morphology.hymenophore,
        stipe: entry.morphology.stipe,
        chemicalReactions: entry.morphology.chemicalReactions,
        sporePrintColor: entry.morphology.sporePrintColor,
        growthType: entry.ecology.growthType,
        warningMessage: entry.ecology.warningMessage,
        cultivation: entry.cultivation ?? undefined,
      },
    });

    // Re-derive images/strains from scratch each run so reseeding is idempotent.
    await prisma.fungusImage.deleteMany({ where: { fungusId: fungus.id } });
    await prisma.strain.deleteMany({ where: { fungusId: fungus.id } });

    const images: { type: "PROFILE" | "ADDITIONAL" | "SPORE_PRINT"; img: SourceImage }[] = [
      { type: "PROFILE", img: entry.media.profileImage },
      ...entry.media.additionalImages.map((img) => ({ type: "ADDITIONAL" as const, img })),
      { type: "SPORE_PRINT", img: entry.media.sporePrintImage },
    ];

    for (const { type, img } of images) {
      if (!img?.url) continue;
      await prisma.fungusImage.create({
        data: {
          fungusId: fungus.id,
          type,
          url: img.url,
          caption: img.caption ?? null,
          source: img.source ?? null,
          attribution: img.attribution ?? null,
          license: img.license ?? null,
          isGenerated: img.isGenerated ?? false,
        },
      });
    }

    for (const strain of entry.strains) {
      await prisma.strain.create({
        data: {
          fungusId: fungus.id,
          name: strain.name,
          description: strain.description,
          cultivationNotes: strain.cultivationNotes,
          biography: strain.biography,
          imageUrl: strain.media?.profileImage?.url ?? null,
          imageSource: strain.media?.profileImage?.source ?? null,
          imageAttribution: strain.media?.profileImage?.attribution ?? null,
          imageLicense: strain.media?.profileImage?.license ?? null,
          usesParentImage: strain.media?.usesParentImage ?? false,
        },
      });
    }

    console.log(`Seeded ${entry.commonName}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
