# Spoľahlivý signál konca prestávky na všetkých telefónoch

## Prečo to teraz nefunguje všade

- Vibrovanie (`navigator.vibrate`) podporuje len Android (Samsung, Xiaomi). iPhone/Safari ho nemá vôbec — v prehliadači sa to obísť nedá.
- Zvuk je teraz generovaný cez WebAudio. Keď je telefón zamknutý alebo je appka na pozadí, prehliadač WebAudio uspí a časovač spomalí — takže signál buď nezaznie, alebo príde neskoro.

Riešenie: zvuk urobiť hlavným signálom a zabezpečiť, aby zaznel aj pri zamknutom telefóne, cez slúchadlá a popri Spotify. Vibrovanie zostane ako bonus tam, kde ho systém podporuje.

## Čo sa zmení

1. **Zvuk cez skutočný audio prvok, nie len WebAudio**
   - Zvuky (pípnutie, trojité pípnutie, gong, píšťalka) sa vygenerujú do audio súboru v pamäti a prehrajú cez štandardný prehrávač zvuku, ktorý na mobiloch funguje aj pri zhasnutom displeji.
   - Prehrávanie sa „odomkne“ pri prvom dotyku v tréningu (spustenie časovača / odškrtnutie série), ako to iOS vyžaduje.

2. **Udržanie zvuku nažive počas prestávky**
   - Kým beží časovač oddychu, na pozadí ide tichá slučka. Vďaka tomu operačný systém neuspí zvukový kanál a signál zaznie presne v čase 0, aj keď je telefón v vrecku.
   - Slučka sa zastaví hneď po skončení prestávky, aby zbytočne nežrala batériu.

3. **Časovač podľa reálneho času, nie podľa tikania**
   - Prestávka sa bude počítať z cieľového času (koniec = štart + dĺžka), takže keď prehliadač na pozadí spomalí tikanie, po návrate sa čas dorovná a signál sa spustí správne.

4. **Vibrovanie ako doplnok**
   - Ostane zapnuté na Androide. V nastaveniach pribudne poznámka, že iPhone vibrovanie z prehliadača nepodporuje, preto je dôležitý zvuk.

5. **Nastavenia notifikácií — upozornenia a test**
   - Tlačidlo „Vyskúšať signál“ prehrá zvuk rovnakou cestou, akou ho prehrá časovač (aby test naozaj niečo dokazoval).
   - Krátke upozornenie: na iPhone treba mať vypnutý tichý režim (prepínač na boku), inak zvuk z prehliadača nezaznie.

## Technické detaily

- `src/lib/notifications.ts`: pridať generovanie WAV bufferu (PCM) pre každý typ zvuku, prehrávanie cez `HTMLAudioElement` s `blob:`/data URI, `unlockAudio()` prehrá tichý klip pri geste, `startRestAudioKeepAlive()` / `stopRestAudioKeepAlive()` na tichú slučku. `restFinishedAlert()` bude používať túto cestu a vibrovanie ponechá pod `navigator.vibrate?.`.
- `src/pages/WorkoutSession.tsx`: časovač prepísať na `deadlineRef` (`Date.now()`-based), interval len prepočítava zostatok; keep-alive sa spustí pri štarte oddychu a zastaví pri 0 / pauze / resete / odchode zo stránky.
- `src/pages/NotificationSettings.tsx`: test tlačidlo volá rovnakú funkciu ako alert; doplniť text o iPhone tichom režime a chýbajúcom vibrovaní na iOS.
- Bez zmien v databáze; nastavenia zostávajú lokálne pre zariadenie.
