---
name: post
description: Vytvoří carousel nebo single post pro sociální sítě Deník Hokeje – slajd po slajdu (hook, obsah, CTA s logem) plus kompletní caption s otázkou a hashtagy. Použij pro Instagram/Facebook/X/TikTok posty a carousely.
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
4. Pokud uživatel chce hotovou grafiku, vyrob slajdy jako HTML/PNG 1080×1350 s logem z `assets/logo/`.
5. Ulož do `output/posty/RRRR-MM-DD-slug.md`.
