// Export postů Deník Hokeje do PNG stejným vykreslovačem jako aplikace Studio.
// Použití: node tools/render-post.mjs <post.json> [výstupní složka]
//
// post.json:
// {
//   "format": "ig",                       // ig = Instagram/Facebook 1080×1350, tt = TikTok 1080×1920, yt = YouTube 1280×720
//   "slides": [
//     { "template": "titulek", "photo": "foto/01.jpg", "kicker": "MS 2010",
//       "headline": "*Zlato* z Kolína nad Rýnem.", "fit": { "x": 0.5, "y": 0.3, "zoom": 1 } },
//     { "template": "slovnicek", "photo": "foto/02.jpg", "term": "buly", "desc": "…", "textY": 0.6 }
//   ]
// }
// Cesty k fotkám jsou relativní k souboru post.json. Každý slajd může přepsat "format".
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specPath = process.argv[2];
if (!specPath) {
  console.error("Použití: node tools/render-post.mjs <post.json> [výstupní složka]");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const base = dirname(resolve(specPath));
const outDir = resolve(process.argv[3] ?? base);
mkdirSync(outDir, { recursive: true });
const prefix = spec.name ?? basename(specPath, ".json");

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const dataUrl = (p) => `data:${MIME[extname(p).toLowerCase()] ?? "image/jpeg"};base64,${readFileSync(p).toString("base64")}`;
const wordmark = dataUrl(resolve(root, "studio/wordmark.png"));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(root, "studio/render.html")).href);
await page.evaluate(() => window.DH.ready());

for (const [i, slide] of spec.slides.entries()) {
  const s = { format: spec.format ?? "ig", ...slide };
  const photo = s.photo ? dataUrl(resolve(base, s.photo)) : null;
  const png = await page.evaluate(async ({ s, photo, wordmark }) => {
    const [ph, wm] = await Promise.all([photo ? DH.loadImage(photo) : null, DH.loadImage(wordmark)]);
    const c = document.getElementById("c");
    DH.render(c, s, { photo: ph, wordmark: wm });
    return c.toDataURL("image/png");
  }, { s, photo, wordmark });
  const file = resolve(outDir, `${prefix}-${String(i + 1).padStart(2, "0")}.png`);
  writeFileSync(file, Buffer.from(png.split(",")[1], "base64"));
  console.log("✔", file);
}
await browser.close();
