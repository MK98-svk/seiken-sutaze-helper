## Cieľ

Appka už nebude po prihlásení hneď hádzať do súťaží. Vznikne domovská obrazovka s tromi dlaždicami a kompletná nová sekcia **Posilňovanie**.

## 1. Domovská obrazovka (`/`)

Po prihlásení sa zobrazia tri dlaždice v štýle appky (tmavá téma, Oswald, oranžovo-červený akcent):

- **Súťaže** → `/sutaze` (presne dnešná obrazovka, nič sa na nej nemení)
- **Posilňovanie** → `/posilnovanie`
- **Tréningy** → dlaždica so štítkom „Čoskoro", zatiaľ neaktívna

Späť na domov sa dá cez logo/šípku v hlavičke.

## 2. Posilňovanie – výber režimu (`/posilnovanie`)

Tri karty:
1. **Fitko**
2. **Doma s pomôckami** (činky, expandéry, guma, lavička)
3. **Doma bez pomôcok** (vlastná váha)

Plus dve akcie navrchu: **Tréning s AI** a **Výsledky**.

## 3. Partie tela a cviky

Po výbere režimu → výber partie: hrudník, chrbát, ramená, biceps, triceps, nohy, brucho/core, celé telo, kardio.

Karta cviku obsahuje:
- názov (slovensky), obtiažnosť, potrebné vybavenie
- zapojené svaly
- popis techniky krok po kroku + typické chyby
- odporúčané série/opakovania
- tlačidlo **Pozrieť na YouTube** (odkaz na vyhľadávanie/konkrétne video)
- tlačidlo **Pridať do tréningu**

Katalóg pripravím priamo v appke – cca 80–100 cvikov naprieč tromi režimami. YouTube odkazy si po nasadení prejdi a povedz mi, čo vymeniť.

## 4. Tréning s AI

- Ak má účet priradených viac členov (napr. rodič s deťmi), najprv **výber osoby**.
- Z profilu člena sa automaticky načíta vek, pohlavie, výška, váha, disciplíny (kata/kobudo/kumite).
- Používateľ si vyklikne: cieľ (sila / objem / vytrvalosť / rýchlosť pre karate), režim (fitko / doma s pomôckami / bez pomôcok), partie, dĺžku tréningu (20/30/45/60 min), počet dní v týždni.
- AI vygeneruje tréning zo **schváleného katalógu** (nevymýšľa si cviky) – zoznam cvikov, série, opakovania, oddych, rozcvička a strečing.
- Tréning sa dá uložiť a spustiť.

## 5. Spustený tréning

- Zoznam cvikov s odškrtávaním hotových sérií
- Zápis váhy a počtu opakovaní pre každú sériu
- **Časovač oddychu** – štartuje po dokončení série, dĺžka podľa cieľa:
  - sila: 2–3 min
  - objem/hypertrofia: 60–90 s
  - vytrvalosť: 30–45 s
  - dá sa prestaviť ručne, zvukový/vibračný signál na konci
- Po ukončení sa tréning automaticky uloží do výsledkov (dátum, trvanie, cviky, váhy, opakovania).

## 6. Výsledky (`/posilnovanie/vysledky`)

- Hist)ória tréningov podľa dátumu: čo sa cvičilo, aké váhy, koľko opakovaní, celkový objem (kg)
- Detail tréningu
- Jednoduchá štatistika: počet tréningov za mesiac, najčastejšie partie, progres váh pri vybranom cviku
- Pretekár/rodič vidí svoje záznamy, **tréner a admin vidia všetkých**

## Technická časť

- Router: nové routy `/`, `/sutaze`, `/posilnovanie`, `/posilnovanie/:mode`, `/posilnovanie/ai`, `/posilnovanie/trening/:id`, `/posilnovanie/vysledky`. Dnešný `Index.tsx` sa presunie na `/sutaze` bez zmeny logiky.
- Katalóg cvikov: statický TypeScript súbor `src/data/exercises.ts` (bez DB, funguje aj offline v PWA).
- Nové tabuľky v Cloud databáze:
  - `workout_sessions` – member_id, dátum, režim, cieľ, trvanie, poznámka
  - `workout_sets` – session_id, exercise_id, číslo série, váha, opakovania, hotovo
  - `workout_plans` – uložené AI plány (member_id, konfigurácia, zoznam cvikov v JSON)
  - RLS: vlastník (`members.user_id = auth.uid()`) plný prístup; `coach`/`admin` cez `has_role()` čítanie všetkého; GRANT-y pre `authenticated` a `service_role`.
- AI tréning: Edge Function `generate-workout` cez Lovable AI Gateway (model `openai/gpt-5.6-sol`), na vstupe profil + katalóg ID-čiek, na výstupe štruktúrovaný plán. Ošetrené chyby 429 (limit) a 402 (kredity) so zrozumiteľnou hláškou.
- Mobil-first, karty s framer-motion ako v zvyšku appky, žiadny horizontálny scroll.
