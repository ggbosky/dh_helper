---
name: post
description: Vytvoří carousel nebo single post pro sociální sítě Deník Hokeje – slajd po slajdu (hook, obsah, CTA s logem) plus kompletní caption s otázkou a hashtagy. Použij pro Instagram/Facebook/TikTok posty a carousely.
---

# Tvorba příspěvků Deník Hokeje

Argument: téma (+ volitelně „single" nebo počet slajdů).

1. Projdi `reference/posty/` a do detailu převezmi typografii, rozvržení a styl textu. Prázdná složka → design system z `CLAUDE.md`.
2. Ověř fakta a čísla; nejisté označ `[OVĚŘIT]`.
3. Vyplň `templates/carousel.md`:
   - Slajd 1: agresivní titulek, který donutí swipnout (max ~6 slov).
   - Slajdy 2–N: jedna myšlenka na slajd, max ~25 slov, klíčové číslo/slovo zvýrazněné akcentem.
   - Poslední slajd: CTA (komentář / uložení / sledování) + logo Deník Hokeje.
   - Caption: první řádek jako hook, krátký text, otázka pro komunitu, 5–12 hashtagů.
4. Vyrob hotovou grafiku:
   - Zkopíruj `studio/index.html` jako vzor do `studio/RRRR-MM-DD-slug.html`, nech jen potřebné sekce a použij komponenty z `studio/brand.css` (`.slide--ig`, `.headline`, `.stats`, `.timeline`, `.shootout`, `.chant`, `.cta-actions`…).
   - Instagram + Facebook: `.slide--ig` (1080×1350). TikTok: `.slide--tt` (1080×1920), text mimo zakryté zóny (zkontroluj přes `.show-safe`).
   - Každý slajd označ `data-export="slug-ig-01"` atd.
   - Export: `npm install` (jen poprvé) a `node tools/render.mjs studio/RRRR-MM-DD-slug.html output/posty/RRRR-MM-DD-slug`.
   - Prohlédni si vyrenderované PNG a oprav přetékající nebo useknutý text.
5. Ulož texty do `output/posty/RRRR-MM-DD-slug.md` (tabulka slajdů + caption).
