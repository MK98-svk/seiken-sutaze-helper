# Prečo nevidno Posilňovanie po prihlásení

Overil som živú (publikovanú) verziu: balík appky **obsahuje** sekciu Posilňovanie aj dlaždicu na úvodnej obrazovke. Kód je teda v poriadku — zariadenia si držia starú verziu z offline cache (service worker PWA), preto po prihlásení vidno starý domov bez dlaždice.

## Čo navrhujem spraviť

### 1. Automatická aktualizácia bez čakania
Pri štarte appky sa skontroluje nová verzia; keď je dostupná, hneď sa nainštaluje a stránka sa sama obnoví. Používateľ nemusí nič mazať ani zatvárať appku.

### 2. Viditeľné číslo verzie
Do päty úvodnej obrazovky pridám drobný text s verziou buildu, aby sa dalo na diaľku zistiť, či má človek aktuálnu verziu.

### 3. Tlačidlo „Aktualizovať appku“
V hlavičke (pri odhlásení) malá voľba, ktorá vymaže cache, odregistruje service worker a natvrdo načíta appku. Riešenie pre prípad, keď sa niekto zasekne na starej verzii.

### 4. Istota, že sekcia nie je viazaná na rolu
Skontrolujem a potvrdím, že dlaždica Posilňovanie sa zobrazuje každému prihlásenému (nie len adminovi/trénerovi) a že aj ikona činky v hlavičke súťaží je prístupná všetkým.

## Technická časť

- `src/main.tsx`: použiť `registerSW` z `virtual:pwa-register` s `immediate: true`, `onNeedRefresh` → automatický `updateSW(true)`; periodická kontrola aktualizácie (napr. každých 60 s a pri `visibilitychange`).
- `vite.config.ts`: doplniť `navigateFallback`/`cleanupOutdatedCaches` kontrolu a zabezpečiť, že `index.html` sa neserviruje z cache (NetworkFirst pre navigácie).
- Verzia: vystaviť `__APP_VERSION__` cez `define` v `vite.config.ts` (build timestamp) a zobraziť ju v `src/pages/Home.tsx`.
- „Aktualizovať appku“: pomocná funkcia — `caches.keys()` → delete, `serviceWorker.getRegistrations()` → unregister, potom `location.reload()`.
- Žiadne zásahy do databázy ani do logiky súťaží.

Po nasadení bude stačiť jedno posledné manuálne obnovenie u ľudí, ktorí sú zaseknutí na starej verzii; ďalšie aktualizácie sa už rozbehnú samé.
