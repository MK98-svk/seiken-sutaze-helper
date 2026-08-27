# Ukladanie AI tréningov a týždenný plán

## Ako to funguje dnes (overené v kóde a databáze)

- Pri AI tréningu si volíš aj "koľkokrát do týždňa" (days) — táto hodnota sa **len posiela AI ako pokyn**, nikde sa neukladá.
- Vygenerovaný plán sa **neuloží** — existuje len na obrazovke. Uloží sa až vtedy, keď dáš "Spustiť tréning": vznikne jeden konkrétny tréning (workout_sessions + série).
- Sekcia "Moje plány" ukladá plány (workout_plans), ale plní sa len z rozpracovaného tréningu, nie z AI.
- Ty ako admin **vidíš všetko**: v Posilňovaní cez "Cvičenci" → detail človeka sú jeho tréningy a progres. Prístupové pravidlá v databáze admina aj trénera púšťajú ku všetkým tréningom a plánom.

## Čo navrhujem doplniť

1. **AI plán sa automaticky uloží**
   - Po vygenerovaní sa plán uloží medzi "Moje plány" pod názvom, ktorý dala AI (napr. "Domáca sila"), spolu s cieľom, prostredím a počtom tréningov za týždeň.
   - Tlačidlo "Spustiť tréning" zostáva — spustí tréning z uloženého plánu, dá sa ho spustiť opakovane (2× do týždňa = 2 spustenia).

2. **Týždenný prehľad plnenia**
   - Pri každom pláne sa zobrazí "tento týždeň 1/2 tréningy" podľa toho, koľkokrát bol už v aktuálnom týždni odcvičený.

3. **Trénerský/admin pohľad na plány**
   - V detaile cvičenca (Cvičenci → meno) pribudne sekcia "Plány" so zoznamom jeho uložených plánov, frekvenciou a plnením za tento týždeň.

## Technické detaily

- `workout_plans.config` rozšíriť o `daysPerWeek` (jsonb, bez migrácie schémy).
- `useWorkoutPlans` – mapovať `daysPerWeek`, doplniť do `savePlan`.
- `WorkoutAI.tsx` – po úspešnom generovaní zavolať `savePlan(...)`; ak sa uloženie nepodarí, plán sa aj tak dá spustiť.
- `WorkoutPlans.tsx` – zobraziť frekvenciu a počet odcvičení v aktuálnom týždni (z `workout_sessions` podľa `member_id` + `title`/plánu).
- `MemberProgress.tsx` (alebo `CoachMemberDetail.tsx`) – pridať zoznam plánov cez `useWorkoutPlans(memberId)`.
- Žiadne zmeny v prístupových pravidlách nie sú potrebné.
