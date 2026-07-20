## Čo si overil

V DB pri **14. MS WUKF – Cluj-Napoca (22.7.2026)** je:
- 0 registrácií v `member_competition_entries`
- 0 kategórií v `member_competition_categories`
- 0 intentov, 0 výsledkov

Kód v `MemberTable.tsx` (riadok 115) filtruje `members.filter(m => isRegistered(m.id, selectedComp.id))`, čiže pri tejto súťaži **má zobraziť prázdnu tabuľku** s textom „Žiadni registrovaní členovia na túto súťaž." Aktuálne pravidlo je teda správne — údaj v DB tvrdí, že tam nikto nie je.

**Preto tie mená, ktoré vidíš, s najväčšou pravdepodobnosťou pochádzajú zo starej vyrovnávacej pamäte prehliadača / PWA** (appka drží staré `entries`), nie z reálnych dát. Zopár krokov to overí — a ak áno, len refresh to vyrieši, netreba zásah do kódu.

## Plán

1. **Ty:** v appke daj tvrdý refresh (pull-to-refresh na mobile, alebo Ctrl+Shift+R / zavri a znova otvor PWA). Ak sa po refreshi pri **14. MS WUKF – Cluj-Napoca** ukáže „Žiadni registrovaní členovia", je to len cache — pokračujeme bodom 3.
2. **Ak sa po refreshi stále zobrazujú mená:** pošli mi screenshot, pozriem sa, či ide o iný pohľad (napr. „Všetky – prehľad členov") alebo o skutočnú chybu, a opravím to.
3. **Import jednotlivcov na MS WUKF Cluj-Napoca:**
   - Pošli sem PDF štartovku (individuálov, prípadne aj tímy zvlášť).
   - Ja z nej vyparsujem mená + kategórie (Kata / Kumite / Kobudo, WUKF formát), spárujem s existujúcimi členmi (fuzzy match ako predtým).
   - Členov, ktorých v systéme ešte nemáme, vypíšem najprv na potvrdenie (aby sme nepridali cudzích, ako Daniel Haas pri Rovne Cup).
   - Po odsúhlasení: vložím ich ako registrovaných na WUKF a doplním im WUKF kategórie do `member_competition_categories` (aby sa dali pri pridávaní výsledku presne vybrať).
   - Tímy nechám bokom, kým nepošleš aj tímové zápisy — tie potom pridám samostatne do `team_competition_results`.

## Otázka pred implementáciou

Buď priamo pripoj **PDF štartovku pre MS WUKF Cluj-Napoca (jednotlivci)** do ďalšej správy, alebo mi najprv daj vedieť výsledok tvrdého refreshu, ak chceš aby som najskôr vyriešil ten cache problém.
