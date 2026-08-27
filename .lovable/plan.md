# Prispôsobenie cvikov veku, výške a váhe

## Ako to je dnes (overené v kóde)

- Do AI ide celý profil cvičenca: vek, pohlavie, výška, váha, stupeň, disciplíny (`WorkoutAI.tsx`).
- V pokynoch pre AI je jediné vekové pravidlo: "u detí a mládeže do 14 rokov preferuj vlastnú váhu a techniku" (`generate-workout`).
- Katalóg cvikov, z ktorého AI vyberá, sa filtruje **iba** podľa prostredia (fitko / doma s pomôckami / bez pomôcok) a zvolených partií. Vek ani váha ho neovplyvňujú.
- Počet sérií a opakovaní určuje AI voľne; odporúčaná záťaž (kg) sa nenavrhuje vôbec.

Takže: vek/výška/váha sú pre AI len informácia, nie tvrdé obmedzenie.

## Čo navrhujem doplniť

1. **Tvrdé vekové pravidlá pri výbere cvikov**
   - Do 12 rokov: len vlastná váha a ľahké pomôcky — z katalógu sa vyradia cviky s činkami/strojmi a rizikové cviky (drepy s veľkou osou, mŕtvy ťah s osou, tlaky nad hlavu s veľkou váhou).
   - 13-15 rokov: technika a stredná záťaž, bez maximálok; vyradia sa rovnaké rizikové cviky s ťažkou osou.
   - 16+: celý katalóg podľa prostredia.

2. **Prispôsobenie objemu a opakovaní**
   - Mladší (do 15) dostanú viac opakovaní a menej sérií, dlhší oddych sa nemení.
   - Pri vyššej hmotnosti sa obmedzia skokové/nárazové cviky (výskoky, burpees) a nahradia sa šetrnejšími alternatívami.

3. **Zrozumiteľné odôvodnenie v pláne**
   - Pod názvom plánu sa zobrazí veta typu "Prispôsobené pre 12-ročného cvičenca — bez záťaže, dôraz na techniku".

4. **Odporúčaná záťaž ako pomôcka**
   - Pri cvikoch so záťažou AI navrhne orientačné kg (podľa veku, váhy a cieľa) ako predvyplnený tip v tréningu; cvičenec ho môže prepísať.

## Technické detaily

- `src/lib/catalog.ts` — pridať `ageFilter(exercise, age, weight)` a zoznam rizikových cvikov/vybavenia podľa vekového pásma.
- `src/pages/WorkoutAI.tsx` — pri stavbe `catalogPayload` aplikovať vekový filter pred odoslaním do funkcie; posielať aj `ageBand`.
- `supabase/functions/generate-workout/index.ts` — rozšíriť systémový prompt o konkrétne pravidlá pre pásma (do 12 / 13-15 / 16+), rozsahy opakovaní a pole `suggestedWeightKg` v odpovedi + krátke `adaptation` odôvodnenie.
- `src/hooks/useWorkouts.ts` / `WorkoutSession.tsx` — predvyplniť navrhované kg do prvej série (voliteľné, cvičenec prepíše).
- Žiadne zmeny v databáze ani v prístupových právach.
