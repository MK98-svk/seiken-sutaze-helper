# Doplnky výživy – nová sekcia v aplikácii

Tretia hlavná sekcia (popri Súťaže a Posilňovanie) s produktmi zo Zdravého sveta, načítanými priamo z XML feedu klienta.

## Čo som overil vo feede

- Feed obsahuje **129 produktov** (značka Vesantech / zdravysvet.sk).
- Každý produkt má: názov, popis (HTML), obrázok, cenu s DPH, výrobcu, EAN, odkaz na e-shop.
- Kategórie vo feede sú **nepoužiteľné** – všetkých 129 produktov má rovnakú `Health & Beauty`. Kategorizáciu si teda urobíme sami podľa názvu a popisu.

## Ako to bude vyzerať

**Dlaždica „Doplnky výživy“** na hlavnej stránke, vedľa Súťaží a Posilňovania.

**Prehľad produktov** (`/doplnky`):
- Vyhľadávanie podľa názvu.
- Vodorovné čipy s kategóriami (počet produktov pri každej).
- Mriežka kariet: obrázok, názov, krátky podnadpis, cena. Na mobile 2 stĺpce, na desktope 3–4.
- Radenie: odporúčané / najlacnejšie / najdrahšie / A–Z.

**Detail produktu** (dialóg po kliknutí na kartu):
- Veľký obrázok, cena, výrobca, celý popis (očistené HTML – dávkovanie, zloženie, upozornenia).
- Tlačidlo **Kúpiť na zdravysvet.sk**, ktoré otvorí produkt v e-shope v novej karte.

Vizuál drží existujúci dark theme, Oswald nadpisy a oranžový akcent klubu.

## Kategórie

Produkty sa automaticky zaradia podľa kľúčových slov v názve a popise:

1. Vitamíny a minerály
2. Imunita
3. Probiotiká a trávenie
4. Omega 3 a oleje
5. Medicinálne huby
6. Šport a energia (kreatín, elektrolyty, kolagén, proteín)
7. Vlasy, pleť a krása
8. Pre deti
9. Spánok a regenerácia
10. Longevity a antioxidanty
11. Zvýhodnené balíčky (1+1, 2+1, shotboxy)
12. Ostatné (zvyšok bez zhody)

Produkt patrí do jednej hlavnej kategórie (podľa poradia priority vyššie), takže sa nikde nezdvojuje.

## Technické riešenie

- **Edge funkcia `nutrition-feed`**: stiahne XML feed (priamo z prehliadača to nejde kvôli CORS), rozparsuje `SHOPITEM`, očistí HTML popis, priradí kategóriu a vráti JSON. Výsledok si drží v pamäti ~6 hodín, aby sa feed nesťahoval pri každom otvorení.
- **Frontend**: `src/pages/Supplements.tsx` + `src/components/SupplementCard.tsx` a `SupplementDetailDialog.tsx`, dáta cez TanStack Query (`useSupplements` hook) s cache na 1 hodinu.
- **Kategorizačné pravidlá**: `src/lib/supplementCategories.ts` (zdieľané typy), samotné priradenie beží v edge funkcii.
- **Routing**: nová route `/doplnky` v `App.tsx`, dlaždica v `Home.tsx`, ikonka v hlavičke Súťaží aj Posilňovania (rovnako ako teraz Dumbbell).
- Žiadne zmeny v databáze – produkty sa nikam neukladajú, čítajú sa vždy z feedu.
- Prístup: rovnako ako zvyšok appky, len pre prihlásených.

## Otvorené drobnosti

Ak neskôr budeš chcieť obľúbené produkty, odporúčania trénera alebo affiliate parametre v odkazoch, dá sa to doplniť – v tejto verzii to nie je.
