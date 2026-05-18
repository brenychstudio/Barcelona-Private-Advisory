import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "public", "media", "bcn-advisory", "lens", "_source");
const outputRoot = path.join(root, "public", "media", "bcn-advisory", "lens");

const QUALITY = 96;

const assets = [
  ["lens-1.png", "base/lens-spatial-base.webp", "Barcelona Lens spatial base"],
  ["lens-19.png", "base/lens-spatial-base-alt.webp", "Barcelona Lens alternate aerial base"],

  ["lens-3.png", "districts/sarria.webp", "Sarria residential district atmosphere"],
  ["lens-16.png", "districts/gracia.webp", "Gracia walkable district character"],
  ["lens-6.png", "districts/eixample.webp", "Eixample architectural order"],
  ["lens-8.png", "districts/poblenou.webp", "Poblenou contemporary coastal district"],
  ["lens-9.png", "districts/diagonal-mar.webp", "Diagonal Mar sea-light district"],
  ["lens-10.png", "districts/pedralbes.webp", "Pedralbes private residential scale"],

  ["lens-11.png", "properties/family-calm.webp", "Family calm property match"],
  ["lens-18.png", "properties/sea-light.webp", "Sea-light property match"],
  ["lens-14.png", "properties/investment-logic.webp", "Investment logic classic interior property match"],
  ["lens-20.png", "properties/design-renovation.webp", "Design renovation property match"],
  ["lens-15.png", "properties/privacy.webp", "Privacy property match"],
  ["lens-13.png", "properties/walkable-daily-life.webp", "Walkable daily life property match"],

  ["lens-12.png", "signals/sea-light-plane.webp", "Sea-light signal plane"],
  ["lens-22.png", "signals/walkable-daily-life-plane.webp", "Walkable daily life signal plane"],
  ["lens-21.png", "signals/privacy-threshold.webp", "Privacy threshold signal plane"],

  ["lens-24.png", "materials/porcelain-material-plane.webp", "Porcelain material plane"],
  ["lens-23.png", "materials/limestone-light-plane.webp", "Limestone light plane"],
  ["lens-17.png", "materials/advisory-handoff.webp", "Advisory handoff visual"],
];

const manifest = [];

for (const [inputName, outputRelative, description] of assets) {
  const inputPath = path.join(sourceDir, inputName);
  const outputPath = path.join(outputRoot, outputRelative);

  await mkdir(path.dirname(outputPath), { recursive: true });

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  await image
    .webp({
      quality: QUALITY,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  manifest.push({
    source: inputName,
    output: `/media/bcn-advisory/lens/${outputRelative.replaceAll("\\", "/")}`,
    description,
    width: metadata.width,
    height: metadata.height,
  });

  console.log(`${inputName} -> ${outputRelative}`);
}

await writeFile(
  path.join(outputRoot, "lens-media-manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8",
);

console.log(`\nDone. Converted ${manifest.length} assets to WebP quality ${QUALITY}.`);
