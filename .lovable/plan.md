# Zachovanie poradia cvikov v tréningovom pláne

## Úprava
- Ku každej sérii uložiť poradové číslo cviku z plánu.
- Pri spustení uloženého plánu vytvoriť série s týmto poradím.
- V otvorenom tréningu radiť cviky podľa uloženého poradia, nie podľa náhodného poradia načítania.
- Pri posunutí cviku šípkami uložiť nové poradie natrvalo pre daný tréning.
- Nový cvik pridaný počas tréningu zaradiť na koniec.

## Technické detaily
- Do `workout_sets` pridať stĺpec `exercise_order` s bezpečnou predvolenou hodnotou a zachovať existujúce oprávnenia.
- Rozšíriť mapovanie a zápis sérií o `exercise_order`.
- Nahradiť lokálne poradie v prehliadači trvalým poradím uloženým v databáze.
- Existujúce tréningy zostanú funkčné; nové spustenia plánov budú presne kopírovať uložené poradie.

## Overenie
- Spustiť plán B a porovnať poradie v editore s poradím v tréningu.
- Overiť posun cviku, opätovné otvorenie tréningu a mobilné zobrazenie.
