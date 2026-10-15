---
name: post
description: Vytvoří carousel nebo single post pro Instagram, Facebook a TikTok ve stylu Deník Hokeje (šablona Titulek s červeným přechodem nebo Slovníček) – texty, výřezy fotek, hotová PNG a caption. Použij pro posty a carousely.
---

# Tvorba příspěvků Deník Hokeje

Argument: téma (+ volitelně počet slajdů, šablona, fotky).

1. Přečti `reference/posty/README.md` a prohlédni si obrázky v `reference/posty/`. To je závazný styl.
2. Ověř fakta a čísla (web search); nejisté označ `[OVĚŘIT]` a do grafiky je nedávej.
3. Zvol šablonu podle obsahu:
   - **`titulek`** (série typu „Jak šel čas?“, příběhy, výsledky): `kicker` = krátký nadpis (např. „MS 1947“), `headline` = 1 věta na 2–3 řádky (max ~60 znaků), 2–4 klíčová slova v `*hvězdičkách*` = červeně. Končí tečkou.
   - **`slovnicek`** (vysvětlení pojmů): `term` malými písmeny, `desc` 1–2 věty hovorově a s nadsázkou. Text umísti do volného místa fotky (`textY`, `textX`), `textColor` `dark` na ledu / `light` na tribuně.
   - Carousel: slajd 1 = háček (titulek), uprostřed obsah, poslední slajd = otázka do komentářů / výzva „Ulož si“.
4. Fotky: vlastní fotky od uživatele (zeptej se na ně), jinak volné fotky z Wikimedia Commons (stahuj přes `thumb.wikimedia.org/.../1920px-…`, ulož do `output/posty/RRRR-MM-DD-slug/foto/`, autora a licenci zapiš do captionu). Nikdy nevydávej fotku z jiného roku/akce za tu, o které post mluví.
5. Napiš `output/posty/RRRR-MM-DD-slug/post.json` (formát v hlavičce `tools/render-post.mjs`, vzor `output/posty/2026-10-15-ms-2010/post.json`):
   - `format`: `ig` (Instagram + Facebook), `tt` (TikTok), `yt` (YouTube).
   - `fit`: `{x, y, zoom}` – výřez fotky (0–1), aby obličeje nezakryl text.
6. Vyrenderuj: `npm install` (jen poprvé) a `node tools/render-post.mjs output/posty/RRRR-MM-DD-slug/post.json`.
7. **Prohlédni si každé PNG** a oprav výřez, pozici textu nebo délku textu, dokud nic nepřekrývá obličeje a text je čitelný. Pro TikTok vyrenderuj i `format: "tt"`.
8. Ulož `output/posty/RRRR-MM-DD-slug.md` (tabulka slajdů + caption s otázkou a hashtagy, kredity fotek) a ukaž výsledek. Uživatel může post doladit v aplikaci Deník Hokeje Studio („Kopírovat pro Claude“ vrací JSON zpět).
