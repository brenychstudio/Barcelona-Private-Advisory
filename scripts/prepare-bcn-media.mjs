import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();
const OUTPUT_ROOT = path.join(PROJECT_ROOT, "public", "media", "bcn-advisory");
const REGISTRY_PATH = path.join(PROJECT_ROOT, "src", "data", "bcnMedia.ts");

const folders = [
  "hero",
  "properties",
  "districts",
  "thresholds",
  "dossier",
  "lens",
  "materials",
  "case",
  "_source",
];

const mediaMap = [
  {
    sourceBase: "1",
    folder: "hero",
    filename: "advisory-hero-city-field.webp",
    id: "hero.cityField",
    role: "hero",
    title: "Barcelona advisory city field",
    alt: "Barcelona advisory city field for private property search.",
  },
  {
    sourceBase: "2",
    folder: "hero",
    filename: "advisory-hero-interior-light.webp",
    id: "hero.interiorLight",
    role: "hero",
    title: "Barcelona advisory interior light",
    alt: "Refined Barcelona interior with soft daylight for advisory presentation.",
  },
  {
    sourceBase: "3",
    folder: "hero",
    filename: "advisory-hero-terrace-sea.webp",
    id: "hero.terraceSea",
    role: "hero",
    title: "Barcelona advisory terrace sea",
    alt: "Barcelona terrace and sea-light atmosphere for private buyer advisory.",
  },
  {
    sourceBase: "4",
    folder: "properties",
    filename: "l-01-gracia-design-light-bedroom.webp",
    id: "properties.l01",
    role: "property",
    title: "Gracia design light bedroom",
    alt: "Design-led Gracia property image with calm daylight.",
  },
  {
    sourceBase: "5",
    folder: "properties",
    filename: "l-02-eixample-classic-balcony-renovation.webp",
    id: "properties.l02",
    role: "property",
    title: "Eixample classic balcony renovation",
    alt: "Classic Eixample renovation with balcony rhythm and refined finish.",
  },
  {
    sourceBase: "6",
    folder: "properties",
    filename: "l-03-poblenou-refined-industrial-premium.webp",
    id: "properties.l03",
    role: "property",
    title: "Poblenou refined industrial premium",
    alt: "Poblenou property image with refined industrial and premium material tone.",
  },
  {
    sourceBase: "7",
    folder: "properties",
    filename: "l-04-diagonal-mar-high-floor-sea-hint.webp",
    id: "properties.l04",
    role: "property",
    title: "Diagonal Mar high floor sea hint",
    alt: "Diagonal Mar property image with high-floor sea-light atmosphere.",
  },
  {
    sourceBase: "8",
    folder: "properties",
    filename: "l-05-sarria-family-ready-quiet-fit.webp",
    id: "properties.l05",
    role: "property",
    title: "Sarria family-ready quiet fit",
    alt: "Sarria family property image with calm residential character.",
  },
  {
    sourceBase: "9",
    folder: "properties",
    filename: "l-06-barceloneta-compact-beach-side-unit.webp",
    id: "properties.l06",
    role: "property",
    title: "Barceloneta compact beach-side unit",
    alt: "Compact Barceloneta beach-side property image.",
  },
  {
    sourceBase: "10",
    folder: "properties",
    filename: "l-07-el-born-heritage-detail-refined.webp",
    id: "properties.l07",
    role: "property",
    title: "El Born heritage detail refined",
    alt: "El Born property image with refined heritage detail.",
  },
  {
    sourceBase: "11",
    folder: "properties",
    filename: "l-08-pedralbes-villa-calm-interior.webp",
    id: "properties.l08",
    role: "property",
    title: "Pedralbes villa calm interior",
    alt: "Pedralbes property image with private villa calm.",
  },
  {
    sourceBase: "12",
    folder: "properties",
    filename: "l-09-investment-lens-clean-modern-unit.webp",
    id: "properties.l09",
    role: "property",
    title: "Investment lens clean modern unit",
    alt: "Clean modern Barcelona property image for investment lens review.",
  },
  {
    sourceBase: "13",
    folder: "districts",
    filename: "eixample-structured-urban-rhythm.webp",
    id: "districts.eixample",
    role: "district",
    title: "Eixample structured urban rhythm",
    alt: "Eixample district image with structured urban rhythm.",
  },
  {
    sourceBase: "14",
    folder: "districts",
    filename: "gracia-human-scale-design.webp",
    id: "districts.gracia",
    role: "district",
    title: "Gracia human-scale design",
    alt: "Gracia district image with human-scale streets and design character.",
  },
  {
    sourceBase: "15",
    folder: "districts",
    filename: "sarria-family-calm-routes.webp",
    id: "districts.sarria",
    role: "district",
    title: "Sarria family calm routes",
    alt: "Sarria district image for family calm and residential routes.",
  },
  {
    sourceBase: "16",
    folder: "districts",
    filename: "poblenou-modern-creative-coastal.webp",
    id: "districts.poblenou",
    role: "district",
    title: "Poblenou modern creative coastal",
    alt: "Poblenou district image with modern creative coastal-adjacent tone.",
  },
  {
    sourceBase: "17",
    folder: "districts",
    filename: "diagonal-mar-coastal-terrace.webp",
    id: "districts.diagonalMar",
    role: "district",
    title: "Diagonal Mar coastal terrace",
    alt: "Diagonal Mar district image with coastal terrace logic.",
  },
  {
    sourceBase: "18",
    folder: "districts",
    filename: "barceloneta-compact-sea-proximity.webp",
    id: "districts.barceloneta",
    role: "district",
    title: "Barceloneta compact sea proximity",
    alt: "Barceloneta district image with compact sea proximity.",
  },
  {
    sourceBase: "19",
    folder: "districts",
    filename: "pedralbes-private-villa-calm.webp",
    id: "districts.pedralbes",
    role: "district",
    title: "Pedralbes private villa calm",
    alt: "Pedralbes district image with private villa calm.",
  },
  {
    sourceBase: "20",
    folder: "thresholds",
    filename: "family-calm-threshold.webp",
    id: "thresholds.familyCalm",
    role: "threshold",
    title: "Family calm threshold",
    alt: "Buyer intent threshold image for family calm.",
  },
  {
    sourceBase: "21",
    folder: "thresholds",
    filename: "sea-light-threshold.webp",
    id: "thresholds.seaLight",
    role: "threshold",
    title: "Sea light threshold",
    alt: "Buyer intent threshold image for sea light and terrace logic.",
  },
  {
    sourceBase: "22",
    folder: "thresholds",
    filename: "investment-logic-threshold.webp",
    id: "thresholds.investmentLogic",
    role: "threshold",
    title: "Investment logic threshold",
    alt: "Buyer intent threshold image for investment logic.",
  },
  {
    sourceBase: "23",
    folder: "thresholds",
    filename: "design-renovation-threshold.webp",
    id: "thresholds.designRenovation",
    role: "threshold",
    title: "Design renovation threshold",
    alt: "Buyer intent threshold image for design renovation.",
  },
  {
    sourceBase: "24",
    folder: "thresholds",
    filename: "privacy-threshold.webp",
    id: "thresholds.privacy",
    role: "threshold",
    title: "Privacy threshold",
    alt: "Buyer intent threshold image for privacy-led advisory.",
  },
  {
    sourceBase: "25",
    folder: "thresholds",
    filename: "walkable-daily-life-threshold.webp",
    id: "thresholds.walkableDailyLife",
    role: "threshold",
    title: "Walkable daily life threshold",
    alt: "Buyer intent threshold image for walkable daily life.",
  },
  {
    sourceBase: "26",
    folder: "dossier",
    filename: "private-shortlist-cover.webp",
    id: "dossier.privateShortlistCover",
    role: "dossier",
    title: "Private shortlist cover",
    alt: "Private Barcelona shortlist dossier cover image.",
  },
  {
    sourceBase: "27",
    folder: "dossier",
    filename: "due-diligence-field-note.webp",
    id: "dossier.dueDiligenceFieldNote",
    role: "dossier",
    title: "Due diligence field note",
    alt: "Barcelona advisory due diligence field note image.",
  },
  {
    sourceBase: "28",
    folder: "dossier",
    filename: "acquisition-brief-table.webp",
    id: "dossier.acquisitionBriefTable",
    role: "dossier",
    title: "Acquisition brief table",
    alt: "Barcelona acquisition brief table for advisory dossier.",
  },
  {
    sourceBase: "29",
    folder: "materials",
    filename: "premium-materials-study.webp",
    id: "materials.premiumStudy",
    role: "materials",
    title: "Premium materials study",
    alt: "Premium materials study for Barcelona advisory visual system.",
  },
  {
    sourceBase: "30",
    folder: "materials",
    filename: "renovation-detail-study.webp",
    id: "materials.renovationDetail",
    role: "materials",
    title: "Renovation detail study",
    alt: "Renovation detail study for Barcelona advisory decisions.",
  },
  {
    sourceBase: "31",
    folder: "case",
    filename: "buyer-case-resolution.webp",
    id: "case.buyerResolution",
    role: "case",
    title: "Buyer case resolution",
    alt: "Buyer case resolution image for Barcelona advisory workflow.",
  },
  {
    sourceBase: "Barcelona Lens Spatial Field",
    folder: "lens",
    filename: "barcelona-lens-spatial-field.webp",
    id: "lens.spatialField",
    role: "lens",
    title: "Barcelona Lens spatial field",
    alt: "Barcelona Lens spatial field image for district advisory navigation.",
  },
];

function parseArgs(argv) {
  const options = {
    input: "C:\\Users\\CONCEPT2048\\Downloads\\real-estate",
    quality: 96,
    lossless: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--lossless") {
      options.lossless = true;
      continue;
    }

    const [key, inlineValue] = arg.split("=");
    const nextValue = inlineValue ?? argv[i + 1];

    if (key === "--input") {
      options.input = nextValue;
      if (inlineValue === undefined) i += 1;
    }

    if (key === "--quality") {
      options.quality = Number(nextValue);
      if (inlineValue === undefined) i += 1;
    }
  }

  if (!options.input) {
    throw new Error("Missing --input path.");
  }

  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error("--quality must be an integer from 1 to 100.");
  }

  return options;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getPngIndex(inputDir) {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  const pngFiles = entries.filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".png");

  return new Map(
    pngFiles.map((entry) => [
      path.basename(entry.name, path.extname(entry.name)).toLocaleLowerCase("en-US"),
      entry.name,
    ]),
  );
}

function toPublicPath(filePath) {
  return `/${path.relative(path.join(PROJECT_ROOT, "public"), filePath).replaceAll(path.sep, "/")}`;
}

function toRepoPath(filePath) {
  return path.relative(PROJECT_ROOT, filePath).replaceAll(path.sep, "/");
}

function renderRegistry(assets) {
  const rows = assets.map((asset) => ({
    id: asset.id,
    role: asset.role,
    folder: asset.folder,
    title: asset.title,
    alt: asset.alt,
    src: asset.publicPath,
    width: asset.width,
    height: asset.height,
    source: asset.sourceFile,
  }));

  return `export type BcnMediaRole =
  | "hero"
  | "property"
  | "district"
  | "threshold"
  | "dossier"
  | "lens"
  | "materials"
  | "case";

export type BcnMediaFolder =
  | "hero"
  | "properties"
  | "districts"
  | "thresholds"
  | "dossier"
  | "lens"
  | "materials"
  | "case";

export type BcnMediaAsset = {
  id: string;
  role: BcnMediaRole;
  folder: BcnMediaFolder;
  title: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  source: string;
};

export const bcnMediaAssets = ${JSON.stringify(rows, null, 2)} as const satisfies readonly BcnMediaAsset[];

export const bcnMediaById = Object.fromEntries(
  bcnMediaAssets.map((asset) => [asset.id, asset]),
) as Record<(typeof bcnMediaAssets)[number]["id"], (typeof bcnMediaAssets)[number]>;

export function getBcnMedia(id: (typeof bcnMediaAssets)[number]["id"]) {
  return bcnMediaById[id];
}

export const bcnMedia = {
  hero: {
    main: getBcnMedia("hero.cityField"),
    cityField: getBcnMedia("hero.cityField"),
    interiorLight: getBcnMedia("hero.interiorLight"),
    terraceSea: getBcnMedia("hero.terraceSea"),
  },
  properties: {
    graciaDesignLightBedroom: getBcnMedia("properties.l01"),
    eixampleBalconyRenovation: getBcnMedia("properties.l02"),
    poblenouCoastalUrban: getBcnMedia("properties.l03"),
    diagonalMarSeaLight: getBcnMedia("properties.l04"),
    sarriaFamilyCalm: getBcnMedia("properties.l05"),
    barcelonetaCompactBeachSide: getBcnMedia("properties.l06"),
    elBornHeritageDetail: getBcnMedia("properties.l07"),
    pedralbesPrivateResidence: getBcnMedia("properties.l08"),
    investmentCleanModernUnit: getBcnMedia("properties.l09"),
    byListingId: {
      "l-01": getBcnMedia("properties.l01"),
      "l-02": getBcnMedia("properties.l02"),
      "l-03": getBcnMedia("properties.l03"),
      "l-04": getBcnMedia("properties.l04"),
      "l-05": getBcnMedia("properties.l05"),
      "l-06": getBcnMedia("properties.l06"),
      "l-07": getBcnMedia("properties.l07"),
      "l-08": getBcnMedia("properties.l08"),
      "l-09": getBcnMedia("properties.l09"),
    },
  },
  districts: {
    eixample: getBcnMedia("districts.eixample"),
    gracia: getBcnMedia("districts.gracia"),
    sarria: getBcnMedia("districts.sarria"),
    poblenou: getBcnMedia("districts.poblenou"),
    diagonalMar: getBcnMedia("districts.diagonalMar"),
    barceloneta: getBcnMedia("districts.barceloneta"),
    pedralbes: getBcnMedia("districts.pedralbes"),
  },
  thresholds: {
    familyCalm: getBcnMedia("thresholds.familyCalm"),
    seaLight: getBcnMedia("hero.terraceSea"),
    investmentLogic: getBcnMedia("hero.cityField"),
    designRenovation: getBcnMedia("properties.l03"),
    privacy: getBcnMedia("districts.eixample"),
    walkableDailyLife: getBcnMedia("properties.l07"),
    pedralbesExterior: getBcnMedia("districts.pedralbes"),
    pedralbesPrivateAccess: getBcnMedia("thresholds.privacy"),
  },
  dossier: {
    advisoryDossierDesk: getBcnMedia("dossier.privateShortlistCover"),
    acquisitionMemoDetail: getBcnMedia("dossier.dueDiligenceFieldNote"),
    acquisitionBriefTable: getBcnMedia("dossier.acquisitionBriefTable"),
  },
  lens: {
    spatialField: getBcnMedia("lens.spatialField"),
    districtLensDesk: getBcnMedia("dossier.acquisitionBriefTable"),
  },
  materials: {
    finalCtaLimestoneDetail: getBcnMedia("materials.premiumStudy"),
    porcelainShadow: getBcnMedia("materials.renovationDetail"),
    limestoneRailDetail: getBcnMedia("materials.renovationDetail"),
  },
  case: {
    buyerResolution: getBcnMedia("case.buyerResolution"),
  },
} as const;
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputDir = path.resolve(options.input);

  if (!(await pathExists(inputDir))) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  await Promise.all(folders.map((folder) => fs.mkdir(path.join(OUTPUT_ROOT, folder), { recursive: true })));

  const sourceIndex = await getPngIndex(inputDir);
  const missing = [];
  const converted = [];

  for (const item of mediaMap) {
    const sourceFile = sourceIndex.get(item.sourceBase.toLocaleLowerCase("en-US"));

    if (!sourceFile) {
      missing.push(`${item.sourceBase}.png`);
      continue;
    }

    const sourcePath = path.join(inputDir, sourceFile);
    const sourceBackupPath = path.join(OUTPUT_ROOT, "_source", sourceFile);
    const outputPath = path.join(OUTPUT_ROOT, item.folder, item.filename);

    await fs.copyFile(sourcePath, sourceBackupPath);

    await sharp(sourcePath)
      .webp(options.lossless ? { lossless: true } : { quality: options.quality })
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();
    const stats = await fs.stat(outputPath);

    converted.push({
      id: item.id,
      role: item.role,
      folder: item.folder,
      title: item.title,
      alt: item.alt,
      sourceFile,
      sourcePath: toRepoPath(sourceBackupPath),
      outputPath: toRepoPath(outputPath),
      publicPath: toPublicPath(outputPath),
      width: metadata.width,
      height: metadata.height,
      bytes: stats.size,
      mb: Number((stats.size / 1024 / 1024).toFixed(2)),
    });
  }

  const manifest = {
    task: "BCN-MEDIA-01",
    mode: options.lossless ? "lossless" : "quality",
    generatedAt: new Date().toISOString(),
    sourceDir: inputDir,
    outputRoot: toRepoPath(OUTPUT_ROOT),
    format: options.lossless ? "webp-lossless" : "webp",
    quality: options.lossless ? null : options.quality,
    expected: mediaMap.length,
    converted: converted.length,
    missing,
    folders,
    assets: converted,
  };

  await fs.writeFile(path.join(OUTPUT_ROOT, "media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(REGISTRY_PATH, renderRegistry(converted));

  console.log(`Converted: ${converted.length}/${mediaMap.length}`);
  console.log(`Missing: ${missing.length ? missing.join(", ") : "none"}`);
  console.log(`Manifest: ${toRepoPath(path.join(OUTPUT_ROOT, "media-manifest.json"))}`);
  console.log(`Registry: ${toRepoPath(REGISTRY_PATH)}`);

  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
