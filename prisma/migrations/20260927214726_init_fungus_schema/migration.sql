-- CreateEnum
CREATE TYPE "FungusImageType" AS ENUM ('PROFILE', 'ADDITIONAL', 'SPORE_PRINT');

-- CreateTable
CREATE TABLE "Fungus" (
    "id" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "isCultivatable" BOOLEAN NOT NULL,
    "biography" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "capColors" TEXT[],
    "hymenophore" TEXT NOT NULL,
    "stipe" TEXT NOT NULL,
    "chemicalReactions" TEXT[],
    "sporePrintColor" TEXT NOT NULL,
    "growthType" TEXT NOT NULL,
    "warningMessage" TEXT,
    "cultivation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fungus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FungusImage" (
    "id" TEXT NOT NULL,
    "fungusId" TEXT NOT NULL,
    "type" "FungusImageType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "source" TEXT,
    "attribution" TEXT,
    "license" TEXT,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FungusImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strain" (
    "id" TEXT NOT NULL,
    "fungusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cultivationNotes" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageSource" TEXT,
    "imageAttribution" TEXT,
    "imageLicense" TEXT,
    "usesParentImage" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Strain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fungus_genus_species_key" ON "Fungus"("genus", "species");

-- CreateIndex
CREATE INDEX "FungusImage_fungusId_idx" ON "FungusImage"("fungusId");

-- CreateIndex
CREATE INDEX "Strain_fungusId_idx" ON "Strain"("fungusId");

-- CreateIndex
CREATE UNIQUE INDEX "Strain_fungusId_name_key" ON "Strain"("fungusId", "name");

-- AddForeignKey
ALTER TABLE "FungusImage" ADD CONSTRAINT "FungusImage_fungusId_fkey" FOREIGN KEY ("fungusId") REFERENCES "Fungus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strain" ADD CONSTRAINT "Strain_fungusId_fkey" FOREIGN KEY ("fungusId") REFERENCES "Fungus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
