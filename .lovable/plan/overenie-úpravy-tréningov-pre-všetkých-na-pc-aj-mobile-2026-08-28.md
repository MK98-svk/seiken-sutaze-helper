# Overenie: úpravy tréningov pre všetkých, na PC aj mobile

## Aktuálny stav (overené v kóde)
- Databázové pravidlá pre plány, tréningy aj série sú "vlastník alebo tréner/admin" — každý prihlásený cvičenec môže upravovať svoje vlastné záznamy. Nič nie je obmedzené len na admina.
- Tlačidlá Upraviť / Pridať sériu / Pridať cvik ani polia pre série a opakovania nemajú v kóde žiadnu podmienku na rolu admina. Rola sa používa len na to, aby tréner videl aj cudzích členov.

## Čo spravím
1. Prejdem appku v prehliadači v mobilnom rozlíšení (360 px) aj na desktope a skontrolujem, či sú na oboch viditeľné a použiteľné:
   - Upraviť plán (vrátane +/- pri sériách a mazania hodnoty naprázdno)
   - Pridať sériu a Pridať cvik v prebiehajúcom tréningu
   - Pokračovať / Upraviť pri existujúcich tréningoch vo Výsledkoch
2. Ak niečo na mobile prekáža (orezanie, malé tlačidlá, nedostupné pri scrollovaní), opravím rozloženie — bez zásahu do logiky.
3. Zhrniem výsledok kontroly.
