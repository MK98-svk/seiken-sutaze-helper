export const ACTIVITY_CATEGORIES = ["Všetky", "Reflex", "Rýchlosť", "Precíznosť", "Práca nôh", "Kata", "Rozcvička"] as const;
export type ActivityCategory = Exclude<typeof ACTIVITY_CATEGORIES[number], "Všetky">;
export type DiagramKind = "signal" | "targets" | "mirror" | "cones" | "line" | "sequence";
export interface KarateActivity {
  id: string;
  name: string;
  category: ActivityCategory;
  level: "Začiatočníci" | "Pokročilí" | "Všetky úrovne";
  age: string;
  duration: number;
  people: string;
  equipment: string[];
  summary: string;
  goal: string;
  setup: string;
  steps: string[];
  dose: string;
  cues: string[];
  easier: string;
  harder: string;
  safety: string;
  measure: string;
  diagram: DiagramKind;
  beats: string[];
}

// Original coaching notes; diagrams show organisation, not technique biomechanics.
export const karateActivities: KarateActivity[] = [
  {
    id: "farebny-signal", name: "Farebný signál", category: "Reflex", level: "Začiatočníci", age: "7+ rokov", duration: 6, people: "Dvojice", equipment: ["2 farebné značky", "Lapa"],
    summary: "Rozlíšenie signálu, rozhodnutie a jeden kontrolovaný úder na lapu.",
    goal: "Zrýchliť správnu reakciu bez predčasného vyrážania a straty krytu.",
    setup: "Dvojica stojí oproti sebe v dosahu jedného kroku. Držiaci má lapu vo výške trupu a dve rozdielne farebné značky. Vopred dohodnite: prvá farba znamená úder, druhá zostať v kryte.",
    steps: ["Cvičenec zaujme pohodlný bojový postoj a sleduje hrudník partnera.", "Partner po náhodnej pauze 2–4 sekundy ukáže jednu farbu; lapu drží stabilne.", "Na dohodnutú farbu cvičenec urobí jeden kontrolovaný gyaku-zuki na lapu a ihneď obnoví kryt. Na druhú farbu sa nepohne.", "Po 8 signáloch si partneri vymenia úlohy."],
    dose: "3 × 8 signálov na osobu · 30 s prestávka medzi kolami",
    cues: ["Najprv rozpoznať, potom reagovať.", "Úder sa končí návratom ruky do krytu.", "Partner nemení vzdialenosť počas úderu."],
    easier: "Použiť iba jeden signál a začať bez kroku.", harder: "Pridať tretí signál: krok dozadu bez úderu; nezvyšovať silu kontaktu.", safety: "Údery len na lapu, nikdy na tvár. Tréner kontroluje zápästie a stabilitu držiaceho.", measure: "Počet správnych reakcií z 8; osobitne počítať predčasné štarty.", diagram: "signal", beats: ["Čakanie v kryte", "Signál partnera", "Úder na lapu", "Návrat do krytu"],
  },
  {
    id: "dve-lapy", name: "Dva ciele, správna voľba", category: "Precíznosť", level: "Všetky úrovne", age: "8+ rokov", duration: 8, people: "Dvojice", equipment: ["2 lapy"],
    summary: "Úder do pomenovaného cieľa s dôrazom na vzdialenosť a presnosť.", goal: "Trafiť vybranú lapu technicky čisto, nie iba čo najrýchlejšie.",
    setup: "Partner drží dve lapy vedľa seba vo výške trupu, približne na šírku ramien. Označte ich ako 1 a 2. Vzdialenosť nastavte tak, aby cvičenec nemusel prepínať lakeť.",
    steps: ["Tréner alebo partner povie číslo cieľa.", "Cvičenec zasiahne určenú lapu jedným priamym úderom s ľahkým kontaktom.", "Po údere sa vráti do pôvodnej vzdialenosti a krytu.", "Po 10 pokusoch vymeníte držiaceho; ďalšie kolo začne druhá ruka."],
    dose: "3 × 10 pokusov na osobu · 30–45 s prestávka",
    cues: ["Oči sledujú cieľ, ramená zostávajú uvoľnené.", "Netlačiť sa telom cez lapu.", "Presnosť má prednosť pred frekvenciou."], easier: "Pomenovať cieľ ešte pred postojom a nechať dlhšiu pauzu.", harder: "Striedať čísla nepravidelne alebo pridať jeden malý nástupný krok.", safety: "Lapy nesmú byť pri hlave držiaceho. Držiaci má pevný postoj a mierne pokrčené lakte.", measure: "Správny cieľ + čistý návrat: počet úspešných pokusov z 10.", diagram: "targets", beats: ["Výber cieľa 1", "Úder na cieľ 1", "Výber cieľa 2", "Úder na cieľ 2"],
  },
  {
    id: "zrkadlo", name: "Zrkadlo v kumite", category: "Práca nôh", level: "Všetky úrovne", age: "7+ rokov", duration: 6, people: "Dvojice", equipment: ["Bez pomôcok"],
    summary: "Partner kopíruje pohyb vedúceho a drží rovnakú vzdialenosť.", goal: "Vnímať partnera, meniť smer a udržať postoj bez kríženia nôh.", setup: "Dvojica stojí oproti sebe s odstupom približne 2 m. Každá dvojica má vlastný voľný pás tatami. Jeden je vedúci, druhý zrkadlo.",
    steps: ["Vedúci sa pohybuje malými krokmi dopredu, dozadu a do strán.", "Zrkadlo reaguje tak, aby vzdialenosť zostávala rovnaká, bez úderov a kopov.", "Na povel trénera obaja zastanú v stabilnom postoji.", "Po 30 sekundách vymenia úlohy."], dose: "4 × 30 s na osobu · 20 s prestávka", cues: ["Nohy sa nekrížia.", "Pohľad na stred tela partnera.", "Krátke kroky a rovnaká výška postoja."], easier: "Pohyb len dopredu a dozadu, pomalá chôdza.", harder: "Pridať krátke zastavenia a zmeny tempa, stále bez kontaktu.", safety: "Dvojice nesmú vstupovať do cudzieho priestoru; žiadne prudké cúvanie naslepo.", measure: "Koľkokrát dvojica stratila dohodnutú vzdialenosť alebo skrížila nohy.", diagram: "mirror", beats: ["Základná vzdialenosť", "Pohyb do strany", "Partner kopíruje", "Spoločné zastavenie"],
  },
  {
    id: "trojuholnik", name: "Trojuholník nástupu", category: "Práca nôh", level: "Pokročilí", age: "10+ rokov", duration: 8, people: "Dvojice", equipment: ["3 kužele", "Lapa"], summary: "Nástup k cieľu a odchod pod uhlom namiesto cúvania po priamke.", goal: "Spojiť kontrolovaný nástup s únikom mimo pôvodnej línie.", setup: "Tri kužele vytvoria trojuholník so stranou asi 1,5 m. Partner s lapou stojí za predným vrcholom. Kužele sú orientačné body, nie prekážky na preskakovanie.",
    steps: ["Cvičenec začne pri zadnom vrchole v bojovom postoji.", "Urobí nástup k lape a jeden kontrolovaný priamy úder.", "Odíde šikmo k bočnému kužeľu, otočený k partnerovi.", "Vráti sa na štart a zopakuje z opačnej strany."], dose: "3 × 6 nástupov na každú stranu · 45 s prestávka", cues: ["Kryt zostáva aj pri odchode.", "Neotáčať sa k partnerovi chrbtom.", "Technika a únik sú dva čisté pohyby."], easier: "Prejsť trasu bez úderu pomalým krokom.", harder: "Partner určí stranu odchodu až po údere.", safety: "Dostatočná vzdialenosť od kužeľov, bez kontaktu s partnerom mimo lapy.", measure: "Čisté nástupy a úniky bez kríženia nôh zo 6 pokusov.", diagram: "cones", beats: ["Štart", "Nástup na lapu", "Odchod pod uhlom", "Návrat"],
  },
  {
    id: "kratky-sprint", name: "Štart na povel", category: "Rýchlosť", level: "Všetky úrovne", age: "8+ rokov", duration: 7, people: "Skupina", equipment: ["2 kužele"], summary: "Krátky štart na nepravidelný signál a kontrolované zabrzdenie.", goal: "Rozvíjať prvý krok a reakciu bez únavového šprintovania.", setup: "Vyznačte štart a cieľ vo vzdialenosti 3–4 m, za cieľom nechajte aspoň 2 m na spomalenie. Skupina cvičí po jednom v oddelených dráhach.", steps: ["Cvičenec čaká v ľahkom bojovom postoji.", "Na hlasový povel vyrazí k cieľu; povel prichádza po nepravidelnej pauze.", "Za cieľom postupne zabrzdí, otočí sa a pokojne sa vráti.", "Ďalší pokus začne až po obnovení dychu a voľnej dráhe."], dose: "2 × 5 štartov · 20–30 s medzi štartmi · 60 s medzi kolami", cues: ["Prvý krok bez zbytočného pohybu dozadu.", "Výbušný štart, mäkké brzdenie.", "Skončiť kolo, keď výrazne klesá kvalita."], easier: "Skrátiť dráhu na 2 m a začať z prirodzeného stoja.", harder: "Použiť dva povely: jeden štartuje, druhý znamená zostať.", safety: "Bez pretekania v tesnej spoločnej dráhe; suchý, nešmykľavý povrch a priestor na brzdenie.", measure: "Správne štarty z 5 a počet predčasných reakcií.", diagram: "line", beats: ["Čakanie na štarte", "Povel", "Krátky šprint", "Spomalenie"],
  },
  {
    id: "kizami-navrat", name: "Kizami-zuki a návrat", category: "Rýchlosť", level: "Pokročilí", age: "10+ rokov", duration: 6, people: "Dvojice", equipment: ["Lapa"], summary: "Krátke kvalitné série prednej ruky, nie dlhé úderové maratóny.", goal: "Zrýchliť vyslanie a návrat prednej ruky pri zachovaní postoja.", setup: "Partner drží stabilnú lapu vo výške trupu. Cvičenec je v pohodlnom dosahu, bez potreby veľkého nástupu. Najprv tréner skontroluje techniku pomaly.", steps: ["Urobte 3 pomalé skúšobné údery a nastavte vzdialenosť.", "Na povel urobte tri samostatné rýchle kizami-zuki; po každom úplný návrat do krytu.", "Partner poskytne spätnú väzbu k stabilite a presnosti.", "Po sérii oddych, potom výmena úloh a postoja."], dose: "5 × 3 údery na každú stranu · 20–30 s prestávka", cues: ["Uvoľnené rameno, pevné zápästie.", "Rýchly návrat je súčasť úderu.", "Žiadne nakláňanie za lapou."], easier: "Jednotlivé údery v pomalom tempe bez časového tlaku.", harder: "Spustiť sériu na vizuálny signál namiesto hlasu.", safety: "Ľahký kontakt, neprepínať lakeť. Pri bolesti ramena alebo zápästia zastaviť.", measure: "Koľko z 3 úderov má presný zásah, stabilný postoj a úplný návrat.", diagram: "signal", beats: ["Kryt", "Signál", "Krátka séria", "Úplný návrat"],
  },
  {
    id: "reakcna-lopticka", name: "Chyť po odraze", category: "Reflex", level: "Začiatočníci", age: "7+ rokov", duration: 5, people: "Dvojice", equipment: ["Mäkká loptička"], summary: "Sledovanie loptičky a krátky reakčný krok po nečakanom pustení.", goal: "Precvičiť zrakovú reakciu, koordináciu rúk a prvý krok.", setup: "Partner drží mäkkú loptičku pred sebou. Cvičenec stojí asi 1 m od neho v prirodzenom postoji. Loptička sa púšťa z výšky pásu, nehádže sa na človeka.", steps: ["Partner pustí loptičku po náhodnej pauze bez predchádzajúceho odpočítavania.", "Cvičenec urobí krátky krok a chytí loptičku po prvom odraze.", "Loptičku vráti a zaujme pôvodné miesto.", "Po 8 pokusoch si vymenia úlohy."], dose: "3 × 8 pustení na osobu · 30 s prestávka", cues: ["Pohľad sleduje loptičku, nie ruku partnera.", "Malý krok, nie skok po hlave.", "Uvoľnené ruky pripravené na chytenie."], easier: "Menšia vzdialenosť a povolené dva odrazy.", harder: "Striedať miesto pustenia mierne doľava a doprava.", safety: "Len mäkká loptička, bez vrhania na tvár a bez skokov na zem. Okolie musí byť voľné.", measure: "Chytenia po prvom odraze z 8 pokusov.", diagram: "targets", beats: ["Pripravený postoj", "Pustenie loptičky", "Krátky krok a chytenie", "Návrat na miesto"],
  },
  {
    id: "mae-geri", name: "Mae-geri do malého cieľa", category: "Precíznosť", level: "Všetky úrovne", age: "9+ rokov", duration: 8, people: "Dvojice", equipment: ["Kopací blok", "Páska na označenie cieľa"], summary: "Kontrolovaný predný kop, návrat kolena a stabilné dosadnutie.", goal: "Zlepšiť presnosť mae-geri bez straty rovnováhy a bez silového kontaktu.", setup: "Na veľkom kopacom bloku vyznačte páskou menší cieľ. Držiaci ho drží pred trupom v primeranej výške cvičenca. Výšku určuje tréner podľa pohyblivosti, nie súťažou o najvyšší kop.", steps: ["Cvičenec zdvihne koleno a na chvíľu stabilizuje postoj.", "Urobí kontrolovaný mae-geri na vyznačený cieľ.", "Najprv stiahne predkolenie a koleno, až potom položí nohu.", "Po 5 kopoch vystrieda nohu; po kole si partneri vymenia úlohy."], dose: "3 × 5 kopov každou nohou · 30–45 s prestávka", cues: ["Koleno sa vracia pred položením nohy.", "Trup bez veľkého záklonu.", "Neopierať sa po zásahu o blok."], easier: "Nižší cieľ a pomalé kopanie bez sily.", harder: "Pred kopom pridať krátky nástup, nemení sa výška ani sila.", safety: "Držiaci musí byť stabilný; nekopať do malých ručných láp ani do hlavy. Pri bolesti kolena alebo bedra zastaviť.", measure: "Presné zásahy a stabilné návraty z 5 na každú nohu.", diagram: "signal", beats: ["Postoj", "Zdvih kolena", "Kontrolovaný zásah", "Stiahnutie a dosadnutie"],
  },
  {
    id: "kata-stop", name: "Kata: zastav a skontroluj", category: "Kata", level: "Všetky úrovne", age: "7+ rokov", duration: 10, people: "Skupina", equipment: ["Bez pomôcok"], summary: "Krátky úsek známej kata s kontrolou postoja v každom zastavení.", goal: "Spresniť postoje, orientáciu a konečnú polohu techník.", setup: "Tréner vyberie úsek 3–5 techník kata, ktorú skupina už pozná. Každý má dostatok miesta na celý úsek; prvé prevedenie je pomalé.", steps: ["Skupina prejde vybraný úsek krok za krokom na povel trénera.", "Po každej technike zastane na 2 sekundy.", "Tréner skontroluje chodidlá, smer kolien a polohu rúk; opravuje vždy iba jednu vec.", "Úsek zopakujte plynulo a porovnajte, či oprava zostala zachovaná."], dose: "3 pomalé a 3 plynulé opakovania · 30 s prestávka podľa potreby", cues: ["Postoj zodpovedá konkrétnej kata a škole.", "Koleno smeruje prirodzene s chodidlom.", "Pohľad ide pred zmenou smeru."], easier: "Len 2 známe techniky bez obratov.", harder: "Pridať zmenu smeru a porovnať koncové miesto na tatami.", safety: "Nesnažiť sa násilne zväčšovať hĺbku postoja. Medzi cvičencami musí zostať priestor aj pri obrate.", measure: "Počet opakovaní, v ktorých zostala jedna konkrétna oprava zachovaná.", diagram: "sequence", beats: ["Prvá technika", "Kontrola postoja", "Zmena smeru", "Ďalšia technika"],
  },
  {
    id: "kata-rytmus", name: "Kata: rytmus úseku", category: "Kata", level: "Pokročilí", age: "10+ rokov", duration: 8, people: "Jednotlivci / skupina", equipment: ["Bez pomôcok"], summary: "Striedanie uvoľneného presunu a ostrého dokončenia techniky.", goal: "Rozlišovať prechod, dokončenie a pauzu bez mechanicky rovnakého tempa.", setup: "Vyberte krátky známy úsek kata. Tréner vysvetlí jeho rytmus podľa konkrétnej školy a vyznačí miesta, kde sa techniky spájajú do sekvencie.", steps: ["Úsek najprv prejdite pomaly bez zvýrazneného dokončenia.", "Pri ďalšom opakovaní zvýraznite len koniec každej techniky, medzi nimi zostávajte uvoľnení.", "Potom spojte dohodnutú sekvenciu bez zbytočných prestávok.", "Posledné opakovanie vykonajte samostatne, tréner dá spätnú väzbu k jednej rytmickej chybe."], dose: "4 × 3 opakovania krátkeho úseku · 30–45 s prestávka", cues: ["Uvoľnenie nie je strata postoja.", "Nedržať dych počas celej sekvencie.", "Rytmus vychádza z kata, nie z náhodného zrýchľovania."], easier: "Len dvojica techník na dva zreteľné povely.", harder: "Samostatné prevedenie bez počítania trénera.", safety: "Bez maximálnych prudkých rozsahov za studena; pri technike nesilovať kĺby do krajnej polohy.", measure: "Počet správne spojených sekvencií bez vloženej pauzy.", diagram: "sequence", beats: ["Uvoľnený presun", "Dokončenie", "Spojená sekvencia", "Kontrolovaná pauza"],
  },
  {
    id: "semafor", name: "Karate semafor", category: "Rozcvička", level: "Začiatočníci", age: "6+ rokov", duration: 5, people: "Skupina", equipment: ["3 farebné značky"], summary: "Hravá rozcvička s pohybom, zastavením a zmenou smeru.", goal: "Zvýšiť pozornosť a postupne rozhýbať skupinu bez kontaktu.", setup: "Vyznačte voľnú plochu. Zelená = ľahký pohyb, oranžová = pomalé kroky v postoji, červená = zastaviť. Každý si drží vlastný priestor.", steps: ["Začnite minútou ľahkej chôdze a pohybu rúk.", "Tréner mení farby; skupina vykoná dohodnutý pohyb.", "Pri červenej každý bezpečne zabrzdí a skontroluje rovnováhu.", "V ďalšom kole pridajte na zelenej bočný pohyb, stále bez kontaktu."], dose: "3 × 45 s · 20 s prestávka", cues: ["Pozerať pred seba, nie iba na značku.", "Zastavenie bez zrážok.", "Tempo je rozcvičkové, nie šprint."], easier: "Iba zelená a červená, celá hra chôdzou.", harder: "Pridať zmenu smeru na samostatný hlasový povel.", safety: "Žiadne vypadávanie za chybu ani trestné cviky. Tréner zníži počet cvičencov na ploche, ak sa míňajú tesne.", measure: "Správne a bezpečné zastavenia pri 6 červených signáloch.", diagram: "cones", beats: ["Ľahký pohyb", "Pomalé kroky", "Zastavenie", "Zmena smeru"],
  },
  {
    id: "mobilita-postoj", name: "Mobilita pred karate", category: "Rozcvička", level: "Všetky úrovne", age: "7+ rokov", duration: 7, people: "Skupina", equipment: ["Bez pomôcok"], summary: "Postupné rozhýbanie členkov, bedier a ramien pred technikou.", goal: "Pripraviť telo na postoje a kopy bez násilného strečingu.", setup: "Každý má vlastný priestor na tatami. Pohyby sa vykonávajú v pohodlnom rozsahu. Tréner predvedie každý pohyb a sleduje kvalitu, nie hĺbku.", steps: ["1 minúta ľahkej chôdze s postupným zapojením rúk.", "8 kontrolovaných prenesení váhy dopredu a dozadu na každú stranu s pätou na zemi.", "8 pomalých zdvihov kolena a malých otvorení bedra na každú stranu bez švihu.", "8 krúžení ramien a 6 pomalých prechodov medzi prirodzeným a bojovým postojom."], dose: "1–2 pokojné kolá · bez zadržiavania dychu", cues: ["Rozsah pohybu bez bolesti.", "Päta a koleno zostávajú pod kontrolou.", "Postupné tempo, žiadne prudké švihy."], easier: "Menší rozsah a opora pri zdvíhaní kolena.", harder: "Pridať pomalý kontrolovaný mae-geri bez kontaktu po rozohriatí.", safety: "Žiadne násilné naťahovanie partnerom. Bolesť nie je cieľ rozcvičky; pri bolesti pohyb vynechať.", measure: "Plynulé prevedenie a stabilita na oboch stranách bez bolesti.", diagram: "sequence", beats: ["Ľahká chôdza", "Členky", "Bedrá", "Ramená a postoje"],
  },
];

const normalize = (value: string) => value.toLocaleLowerCase("sk").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export function filterActivities(query: string, category: string, level: string) {
  const tokens = normalize(query).trim().split(/\s+/).filter(Boolean);
  return karateActivities.filter((a) =>
    (category === "Všetky" || a.category === category) &&
    (level === "Všetky úrovne" || a.level === level || a.level === "Všetky úrovne") &&
    tokens.every((token) => normalize([a.name, a.category, a.summary, ...a.equipment].join(" ")).includes(token)),
  );
}