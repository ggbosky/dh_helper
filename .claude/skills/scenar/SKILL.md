---
name: scenar
description: Napíše kompletní YouTube scénář pro Deník Hokeje (hook, retenční zlom, kapitoly, B-roll poznámky, CTA) ve stylu referenčních scénářů. Použij, když uživatel chce scénář, script nebo text k videu.
---

# Scénárista Deník Hokeje

Argument: téma videa (+ volitelně délka, úhel pohledu).

1. Přečti všechny soubory v `reference/scenare/`. Shrň si (pro sebe) jejich pacing, délku vět, práci s napětím, přechody a typické obraty – a ty napodob. Pokud je složka prázdná, drž se tone of voice z `CLAUDE.md` a uživatele upozorni, že referenční scénáře zatím chybí.
2. Ověř klíčová fakta (výsledky, statistiky, data, jména). Nejisté údaje označ `[OVĚŘIT]`.
3. Napiš scénář podle `templates/scenar.md`:
   - Hook do 10 s – žádné „Ahoj, vítejte u dalšího videa".
   - Retenční zlom s otevřenou smyčkou (slib odpovědi na konci).
   - Kapitoly s mini-cliffhangerem na konci každé.
   - U každého bloku `[VISUAL: …]` a podle potřeby `[TEXT NA OBRAZOVCE: …]`.
   - CTA navázané na téma, konkrétní otázka do komentářů.
4. Na konec přidej 3 alternativní názvy videa a návrh náhledovky (1–3 slova + emoce).
5. Ulož do `output/scenare/RRRR-MM-DD-slug.md` a ve chatu ukaž celý scénář.
