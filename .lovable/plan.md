# Sám sa prihlásim na súťaž

## Cieľ
Členovia (resp. užívatelia s priradenými členmi) sa pred súťažou sami zapíšu na konkrétne súťaže a označia si, čo idú robiť (kata, kobudo, kumite). Pri kata si vyberú ešte verziu **Goju-ryu** a/alebo **Open (rengo)**. Tieto údaje potom uvidíš pri zobrazení súťaže a po importe oficiálnej štartovky sa s ňou spárujú do existujúceho zoznamu, kde sa už dopĺňajú výsledky ako doteraz.

## UX

### 1. Tlačidlo „Prihlásiť sa na súťaž"
- V hornej lište vedľa „Pridať seba" pribudne tlačidlo **„Prihlásiť sa na súťaž"** (viditeľné každému prihlásenému, kto má aspoň jedného člena prepojeného so svojím účtom; admin to vidí vždy).
- Otvorí dialóg so zoznamom **nadchádzajúcich** súťaží (datum >= dnes).
- Pre každú súťaž a pre každého „môjho člena" sa zobrazí karta:
  - názov + dátum súťaže
  - meno člena
  - checkboxy disciplín — zobrazia sa len tie, ktoré má člen v profile zaškrtnuté (kata / kobudo / kumite)
  - ak je zaškrtnutá **Kata**, pod ňou pribudnú dva pod-checkboxy: **Goju-ryu** a **Open (rengo)** (môže byť oba)
- Tlačidlo **Uložiť** pre celú súťaž → zapíše/aktualizuje záznam(y).

### 2. Zobrazenie v súťaži
- V detaile súťaže (desktop tabuľka aj mobilné karty) v stĺpci „Disciplíny" pribudne **plánovaný zoznam** pred reálnymi výsledkami:
  - napr. „Plán: Kata (Goju, Open), Kumite"
- Po importe štartovky sa plán spojí s reálnym zápisom — člen sa zobrazí len raz, aj keď je v oboch.
- Admin/coach môže ručne plán upraviť alebo zmazať.

### 3. Import štartovky
- Logika ostáva (PDF → AI → fuzzy match), ale pri matchnutí člena, ktorý sa už sám prihlásil:
  - jeho `member_competition_entries.registered = true` ostane
  - plánované disciplíny sa zachovajú a zobrazia spolu s tými z PDF
- Noví členovia z PDF (ktorí sa neprihlásili) sa pridajú ako doteraz.

## Technické zmeny

### DB
Nová tabuľka `member_competition_intents`:
- `id uuid pk default gen_random_uuid()`
- `member_id uuid not null`
- `competition_id uuid not null`
- `kata boolean not null default false`
- `kata_goju boolean not null default false`
- `kata_open boolean not null default false`
- `kobudo boolean not null default false`
- `kumite boolean not null default false`
- `created_at`, `updated_at` timestamptz
- unique (`member_id`, `competition_id`)
- trigger `update_updated_at`

RLS:
- SELECT: všetci authenticated
- INSERT/UPDATE/DELETE: admin alebo coach **alebo** vlastník člena (`EXISTS members WHERE members.id = member_id AND members.user_id = auth.uid()`)

Zápis intentu zároveň zapíše/aktualizuje `member_competition_entries.registered = true` (cez trigger alebo z klienta), aby člen automaticky figuroval v zozname zaregistrovaných na súťaž.

### Frontend
- Nový hook `useCompetitionIntents()` v `src/hooks/useClubData.ts` (analogický k `useCompetitionEntries`, s realtime).
- Nový komponent `SelfRegisterDialog.tsx`:
  - načíta moje členstvá (`members.user_id === user.id`), nadchádzajúce súťaže a existujúce intenty
  - formulár s checkboxmi (auto-disable disciplíny, ktoré člen nemá v profile)
  - validácia: ak `kata = true`, musí byť aspoň jedna z `kata_goju` / `kata_open`
- `Index.tsx`: pridať tlačidlo do hlavičky.
- `MemberTable.tsx` + `MobileCompetitionView.tsx`: v stĺpci „Disciplíny" zobraziť „Plán: …" riadok pri členoch, ktorí majú intent pre danú súťaž.
- `AddResultDialog.tsx`: ak existuje intent s `kata_goju` alebo `kata_open`, predvyplniť výber kategórie podľa toho (vyhľadávanie v `competitionCategories.ts` — Goju ide do bežných kata kategórií, Open do RENGO OPEN).

### Žiadne zmeny
- Existujúci flow importu štartovky/výsledkov, výpočet medailí, role, štatistiky.

## Otvorené otázky (vyrieš pred implementáciou alebo počas)
1. Pri **kata** — má byť možné označiť **iba Open** bez Goju (napr. starší cvičenci, ktorí idú len rengo)? Predpokladám áno, oba sú nezávislé checkboxy pod kata.
2. Má sa intent dať vytvoriť aj na súťaž v minulosti (napr. dodatočne pred importom štartovky)? Predpokladám áno — admin/coach hocikedy, člen len pre budúce.
