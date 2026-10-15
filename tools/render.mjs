// Export slajdů Deník Hokeje do PNG v plném rozlišení.
// Použití: node tools/render.mjs <soubor.html> [výstupní složka]
// Vyrenderuje každý prvek s atributem data-export="<název>" do <výstup>/<název>.png.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { pathToFileURL } from "node:url";

const SIZES = { "slide--ig": [1080, 1350], "slide--tt": [1080, 1920], "slide--yt": [1280, 720] };

const input = process.argv[2];
if (!input) {
  console.error("Použití: node tools/render.mjs <soubor.html> [výstupní složka]");
  process.exit(1);
}
const file = resolve(input);
const outDir = resolve(process.argv[3] ?? `output/posty/${basename(dirname(file)) === "studio" ? basename(file, ".html") : basename(dirname(file))}`);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 2000 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.ready);

const slides = await page.$$eval("[data-export]", (els) => els.map((el) => ({ name: el.dataset.export, cls: el.className })));
for (const { name, cls } of slides) {
  const fmt = Object.keys(SIZES).find((k) => cls.includes(k));
  const [w] = SIZES[fmt];
  // Slajd vyjmeme z náhledu a zobrazíme samostatně v nativní šířce.
  await page.evaluate(({ name, w }) => {
    const src = document.querySelector(`[data-export="${name}"]`);
    let stage = document.getElementById("__export");
    if (!stage) {
      stage = document.createElement("div");
      stage.id = "__export";
      stage.style.cssText = "position:fixed;left:0;top:0;z-index:99999;background:#000";
      document.body.appendChild(stage);
    }
    stage.innerHTML = "";
    const clone = src.cloneNode(true);
    clone.style.width = w + "px";
    stage.style.width = w + "px";
    stage.appendChild(clone);
  }, { name, w });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete || new Promise((r) => (i.onload = i.onerror = r)))));
  const path = `${outDir}/${name}.png`;
  await page.locator("#__export > [data-export]").screenshot({ path });
  console.log("✔", path);
}
await browser.close();
