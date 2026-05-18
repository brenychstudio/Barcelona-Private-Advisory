import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PDFParse } from "pdf-parse";

const [, , fileArg, ...rest] = process.argv;

if (!fileArg) {
  console.error('Usage: npm run read:pdf -- "C:\\path\\file.pdf" [--pages=1,2] [--max=12000]');
  process.exit(1);
}

const pagesArg = rest.find((arg) => arg.startsWith("--pages="))?.slice("--pages=".length);
const maxArg = rest.find((arg) => arg.startsWith("--max="))?.slice("--max=".length);
const maxChars = Number.isFinite(Number(maxArg)) ? Number(maxArg) : 18000;
const partial = pagesArg
  ? pagesArg
      .split(",")
      .map((page) => Number(page.trim()))
      .filter((page) => Number.isInteger(page) && page > 0)
  : undefined;

const filePath = resolve(fileArg);
const data = await readFile(filePath);
const parser = new PDFParse({ data });

try {
  const info = await parser.getInfo({ parsePageInfo: false });
  const result = await parser.getText(partial?.length ? { partial } : undefined);
  const text = result.text.replace(/\n{3,}/g, "\n\n").trim();
  const clipped = text.length > maxChars ? `${text.slice(0, maxChars)}\n\n[... clipped ${text.length - maxChars} chars ...]` : text;

  console.log(`# ${filePath}`);
  console.log(`Pages: ${info.total}`);
  if (partial?.length) console.log(`Extracted pages: ${partial.join(", ")}`);
  console.log("");
  console.log(clipped);
} finally {
  await parser.destroy();
}
