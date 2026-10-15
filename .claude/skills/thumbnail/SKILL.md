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
   - Styl jako posty: šablona `titulek` ve formátu `yt` – červený přechod, bílý nadpis s podtržením (Montserrat), 1–3 slova obřím Roboto Bold, klíčové slovo `#FE0000`.
   - Nápis DENÍK HOKEJE vlevo nahoře (renderer ho přidá sám), nic do pravého dolního rohu (délka videa).
   - Prompt v angličtině, fotografický jazyk (objektiv, světlo arény, textura kůže, pot, sprej ledu, film grain) + negative prompt proti AI looku.
   - Nepoužívej skutečné logo NHL/klubů v promptu, pokud to uživatel výslovně nechce – generátory je deformují; dresy popiš barvami.
4. Dodej 2 varianty (A/B test) s odlišným textem nebo emocí.
   - Když je fotka k dispozici, vyrenderuj náhledovku: `post.json` s `"format": "yt"` a `node tools/render-post.mjs`. Zkontroluj čitelnost i ve 168 px.
5. Ulož do `output/thumbnaily/RRRR-MM-DD-slug.md`.
