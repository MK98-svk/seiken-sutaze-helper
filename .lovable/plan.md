# Nová sekcia Tréningy

Kalendár tréningov na sezónu 2026/2027 z nahratého dokumentu, s odklikávaním odcvičených tréningov a mesačným súhrnom pre fakturáciu. Základ pre budúcu dochádzku.

## Rozvrh
- Pondelok 17:30–20:00 — tréning pre všetkých
- Utorok 18:00–19:30 — repre kata
- Streda 18:00–19:30 — kumite
- Štvrtok 17:30–20:00 — tréning pre všetkých

## Čo vznikne

**Kalendár na celú sezónu (7.9.2026 – 30.6.2027)**
Naplní sa presne podľa nahratého dokumentu: 172 termínov, z toho 155 tréningových dní. Dni, keď sa netrénuje (sviatky a prázdniny), budú viditeľne označené sivou s dôvodom, napr. „Sedembolestná Panna Mária (štátny sviatok)", „vianočné prázdniny", „Veľkonočný pondelok".

**Prehľad po mesiacoch**
Nová položka „Tréningy" na úvodnej obrazovke. V nej prepínanie mesiacov, zoznam termínov s dátumom, dňom, typom tréningu a časom.

**Odklikávanie (len admin)**
Pri každom tréningovom termíne zaškrtávacie políčko „Odcvičené". Zapisuje sa, kto a kedy odklikol. Voliteľná poznámka k termínu (napr. zmena času, náhradná telocvičňa).

**Mesačný súhrn pre fakturáciu**
Nad zoznamom pásik: počet plánovaných tréningov v mesiaci, počet odcvičených, počet zrušených a spolu odcvičených hodín (pondelok/štvrtok 2,5 h, utorok/streda 1,5 h). To je číslo, ktoré potrebuješ na faktúru.

**Príprava na dochádzku**
Ostatní členovia zoznam iba vidia. Štruktúra sa navrhne tak, aby sa neskôr dala k termínu doplniť prezencia členov bez prerábania.

## Technické detaily
- Nová tabuľka `club_trainings`: dátum, deň, typ (`vsetci` / `kata` / `kumite`), čas od/do, príznak či sa trénuje, dôvod zrušenia, príznak odcvičené + kto a kedy, poznámka.
- Prístupové pravidlá: čítanie pre všetkých prihlásených, zápis/úprava len admin (a tréner), cez `has_role`.
- Naplnenie 172 riadkov migráciou priamo z dokumentu.
- Nová stránka `src/pages/Trainings.tsx` + route `/treningy`, dlaždica v `Home.tsx`, hook `src/hooks/useTrainings.ts` (TanStack Query + realtime).
- Mobile-first karty, dizajn podľa zvyšku appky.
