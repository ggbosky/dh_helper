---
name: thumbnail
description: Navrhne high-CTR YouTube náhledovku pro Deník Hokeje – layout, 1–3 slova textu a přesný fotorealistický prompt bez AI looku. Použij pro thumbnail, náhledovku nebo cover videa.
---

# Generátor náhledovek Deník Hokeje

Argument: název/téma videa (+ volitelně hráči, emoce).

1. Projdi `reference/thumbnaily/` (pokud tam něco je) a drž jejich vizuální jazyk.
2. Najdi nejsilnější příběhový kontrast (hráč vs hráč, radost vs zkáza, před vs po) a jednu dominantní emoci.
3. Vyplň `templates/thumbnail.md`:
   - Text max 1–3 slova, verzálky, čitelné i na mobilu (test: 168×94 px).
   - Paleta z `CLAUDE.md`, jen jeden agresivní akcent (žlutá, když je fotka plná červené, jinak červená).
   - Logo `assets/logo/denik-hokeje-logo-256.png` malé, mimo pravý dolní roh.
   - Prompt v angličtině, fotografický jazyk (objektiv, světlo arény, textura kůže, pot, sprej ledu, film grain) + negative prompt proti AI looku.
   - Nepoužívej skutečné logo NHL/klubů v promptu, pokud to uživatel výslovně nechce – generátory je deformují; dresy popiš barvami.
4. Dodej 2 varianty (A/B test) s odlišným textem nebo emocí.
   - Typografický layout můžeš vyrenderovat přes `.slide--yt` ve `studio/` (vzor v `studio/index.html`) a `node tools/render.mjs`; fotku pak grafik vloží pod text.
5. Ulož do `output/thumbnaily/RRRR-MM-DD-slug.md`.
