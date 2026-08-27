# Úprava uložených plánov

Dnes sa uložený plán dá len spustiť alebo zmazať. Doplníme plnú editáciu.

## Čo pribudne

**1. Editácia plánu v „Moje plány"**
- Pri každom pláne tlačidlo „Upraviť", ktoré otvorí editor plánu.
- V editore sa dá:
  - premenovať plán,
  - zmeniť počet sérií a opakovaní pri každom cviku (napr. z 3×10 na 5×5),
  - zmeniť odporúčanú váhu (kg) pri cviku,
  - odstrániť cvik z plánu,
  - pridať nový cvik cez vyhľadávanie v katalógu (rovnaký katalóg 1300+ cvikov, s obrázkom a možnosťou otvoriť detail s animáciou),
  - zmeniť počet tréningov do týždňa.
- Uloženie zmien prepíše existujúci plán (nevytvára duplikát).

**2. Nastavenie sérií a opakovaní hneď pri skladaní tréningu**
- V katalógu (Fitko / Doma) sa v spodnej lište rozbalí zoznam vybraných cvikov, kde sa dá pri každom nastaviť série × opakovania ešte pred spustením alebo uložením ako plán.

**3. Zachovanie správania pri spustení**
- Spustený tréning z plánu vygeneruje presne toľko sérií, koľko je v pláne nastavených, s predvyplnenými opakovaniami a váhou.

## Technické detaily

- Migrácia: tabuľka `workout_plans` momentálne nemá povolený UPDATE. Pridá sa politika, aby vlastník člena (a admin/tréner) mohol svoj plán upraviť.
- `useWorkoutPlans.ts`: doplní sa `updatePlan(id, { name, items, daysPerWeek })`, ktorý zapíše `plan.items` a `config.daysPerWeek`.
- Nový komponent `EditPlanDialog.tsx`: editor položiek (`PlannedItem`) + vyhľadávanie v katalógu cez `useCatalog`, detail cviku cez existujúci `ExerciseDetailDialog`.
- `WorkoutPlans.tsx`: tlačidlo „Upraviť" pri každom pláne, otvorí dialóg.
- `StrengthMode.tsx`: rozbaliteľný panel vybraných cvikov s nastavením sérií/opakovaní, zapisuje do draftu (`writeDraft`).
