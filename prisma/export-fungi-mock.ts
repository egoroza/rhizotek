import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";

import { prisma } from "../app/lib/db.server";

const __dirname = dirname(fileURLToPath(import.meta.url));

function imageDTO(img: { id: string; url: string; caption: string | null; source: string | null; attribution: string | null; license: string | null }) {
  return {
    id: img.id,
    url: img.url,
    caption: img.caption,
    source: img.source,
    attribution: img.attribution,
    license: img.license,
  };
}

async function main() {
  const rows = await prisma.fungus.findMany({
    include: { images: true, strains: true },
    orderBy: { commonName: "asc" },
  });

  const out = rows.map((f) => {
    const profileImage = f.images.find((i) => i.type === "PROFILE");
    const sporePrintImage = f.images.find((i) => i.type === "SPORE_PRINT");
    const additionalImages = f.images.filter((i) => i.type === "ADDITIONAL");

    return {
      id: f.id,
      commonName: f.commonName,
      isCultivatable: f.isCultivatable,
      biography: f.biography,
      taxonomy: {
        division: f.division,
        class: f.class,
        order: f.order,
        family: f.family,
        genus: f.genus,
        species: f.species,
      },
      morphology: {
        capColors: f.capColors,
        hymenophore: f.hymenophore,
        stipe: f.stipe,
        chemicalReactions: f.chemicalReactions,
        sporePrintColor: f.sporePrintColor,
      },
      ecology: {
        growthType: f.growthType,
        warningMessage: f.warningMessage,
      },
      cultivation: f.cultivation,
      media: {
        profileImage: profileImage ? imageDTO(profileImage) : null,
        additionalImages: additionalImages.map(imageDTO),
        sporePrintImage: sporePrintImage
          ? { ...imageDTO(sporePrintImage), isGenerated: sporePrintImage.isGenerated }
          : null,
      },
      strains: f.strains.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        cultivationNotes: s.cultivationNotes,
        biography: s.biography,
        media: {
          profileImage: s.imageUrl
            ? {
                url: s.imageUrl,
                source: s.imageSource,
                attribution: s.imageAttribution,
                license: s.imageLicense,
              }
            : null,
          usesParentImage: s.usesParentImage,
        },
      })),
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    };
  });

  const outPath = join(__dirname, "..", "app", "mock-api", "fungi.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${out.length} fungi to ${outPath}`);
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
