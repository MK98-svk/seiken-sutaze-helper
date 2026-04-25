Našiel som reálny nesúlad: dáta v databáze existujú, ale nové družstvá pre `3. kolo SP – Dubnica` sú uložené inak ako v starších súťažiach.

Konkrétne:
- `3. kolo SP – Dubnica` má v databáze 13 družstiev a 32 registrovaných pretekárov.
- Verejné API ich normálne vracia, čiže problém nie je v tom, že by sa neuložili.
- Staršie funkčné súťaže majú družstvá uložené s disciplínou `kata` / `kumite`.
- Nový import uložil disciplíny ako `KATA TEAM` a `KUMITE ROTÁCIE`.
- Staršia verzia mobilnej appky filtrovala presne iba `kata` / `kumite`, takže takéto nové záznamy neukáže. To vysvetľuje, prečo predchádzajúce súťaže fungovali a táto nie.

Plán opravy:

1. Opravím existujúce dáta pre družstvá
   - V databáze prevediem existujúce tímové disciplíny na jednotný interný formát:
     - všetko kata tímové bude `kata`
     - všetko kumite/rotácie tímové bude `kumite`
   - Kategória zostane pôvodná, napr. `KT03 KATA TEAM...` alebo `KS02 KUMITE ROTÁCIE...`, takže text sa nestratí.
   - Tým sa Dubnica zobrazí aj v staršej/cacheovanej mobilnej verzii, ktorá očakáva presne `kata` alebo `kumite`.

2. Opravím import štartovnej listiny do budúcna
   - Pri ukladaní družstiev z PDF už nebudem ukladať surový názov disciplíny z PDF do stĺpca `discipline`.
   - Pred uložením ho normalizujem:
     - `KATA TEAM`, `Mixed Pairs Kata`, `Mixed Team Kata` -> `kata`
     - `KUMITE ROTÁCIE`, `Kumite Team`, podobné názvy -> `kumite`
   - Pôvodný názov ostane viditeľný v kategórii/textoch, ale interný filter bude stabilný.

3. Nechám zobrazovanie tolerantné
   - Aktuálna obrazovka už vie zachytiť aj `KATA TEAM` / `KUMITE ROTÁCIE`; nechám to tam ako poistku.
   - Hlavná oprava však bude v dátach a importe, aby sa to nezlomilo ani pri staršom mobilnom builde.

4. Doplním bezpečné obnovovanie po importe
   - Po importe sa znovu načítajú:
     - členovia súťaže,
     - družstvá,
     - výsledky.
   - Import družstiev budem ukladať tak, aby sa zbytočne neduplikovali rovnaké družstvá pri opakovanom nahratí tej istej štartovky.

5. Overím po oprave
   - Skontrolujem databázu: Dubnica musí mať 13 družstiev s `discipline = kata/kumite`.
   - Skontrolujem verejné načítanie dát bez admin oprávnení.
   - Skontrolujem, že starší aj nový filter by ich zobrazil.
   - Skontrolujem build.

Technicky pôjde hlavne o:
- databázovú migráciu na normalizáciu `team_competition_results.discipline`,
- úpravu `ImportStartlistDialog.tsx`, aby nové importy už ukladali kanonické `kata` / `kumite`,
- prípadne malú pomocnú funkciu na normalizáciu tímových disciplín.