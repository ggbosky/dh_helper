<p align="center"><img src="assets/logo/denik-hokeje-logo-256.png" width="160" alt="Deník Hokeje"></p>

# Deník Hokeje – AI Marketing, Graphic & Script Engine

Pracovní repozitář pro tvorbu obsahu kanálu **Deník Hokeje** s Claude Code.
Hlavní instrukce (system prompt, brand, tone of voice) jsou v [`CLAUDE.md`](CLAUDE.md) – Claude je načte automaticky v každé session.

## Příkazy

| Příkaz | Modul | Příklad |
|---|---|---|
| `/scenar` | Scénář na YouTube | `/scenar Jágr a výluka 2012 v Kladně, 12 minut` |
| `/thumbnail` | Náhledovka (layout + prompt) | `/thumbnail Pastrňák vs. Hašek` |
| `/post` | Carousel / single post + caption | `/post 5 největších přestupů extraligy, 7 slajdů` |
| `/napady` | Virální nápady na videa | `/napady NHL zákulisí, 10` |

## Jak naučit engine váš styl

Nahrajte podklady do složek – engine je čte před každým výstupem:

- `reference/scenare/` – hotové scénáře (Markdown / TXT)
- `reference/posty/` – ukázkové posty a carousely (obrázky + texty captionů)
- `reference/thumbnaily/` – náhledovky, které fungovaly

Hotové výstupy se ukládají do `output/`.
