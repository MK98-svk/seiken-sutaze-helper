# Poznámky k cvikom

Cieľ: pri každom cviku mať malé okienko na poznámku (napr. "nabudúce pridať 2,5 kg", "tyč 12 kg + 2×10 kg = 32 kg"), aby si to človek nemusel písať do Excelu.

## Ako to bude fungovať

- Pri každom cviku v prebiehajúcom tréningu pribudne malá ikona/riadok „Poznámka“.
- Poznámka je viazaná na dvojicu cvičenec + cvik, takže sa automaticky zobrazí pri tom istom cviku aj v ďalších tréningoch (presne ako riadok v Exceli).
- Ukladá sa automaticky po dopísaní (bez extra tlačidla), s krátkym potvrdením.
- Ak je poznámka prázdna, zobrazí sa len decentné „Pridať poznámku“, nič nezavadzia.
- To isté okienko bude aj v editore plánu (Upraviť plán) pri každom cviku.
- Funguje rovnako na mobile aj na PC; upravovať ju môže každý prihlásený cvičenec pri svojich cvikoch (tréner/admin aj u svojich zverencov).

## Voliteľná pomôcka na hmotnosť

Pri poli s váhou pribudne malý prepínač „nakladanie“: zadá sa hmotnosť tyče (predvolene 20 kg, dá sa prepísať napr. na 12 kg) a kotúče na jednej strane, appka dopočíta celkovú váhu a zapíše ju do série. Nastavená hmotnosť tyče sa pamätá v zariadení.

## Technické detaily

- Migrácia: nová tabuľka `public.exercise_notes` (`id`, `member_id` → `members.id`, `exercise_id text`, `note text`, `created_at`, `updated_at`), unikát na (`member_id`, `exercise_id`), trigger `update_updated_at`.
- GRANT SELECT/INSERT/UPDATE/DELETE pre `authenticated`, ALL pre `service_role`; RLS „vlastník alebo tréner/admin“ v rovnakom tvare ako pri `workout_sessions` (kontrola cez `members.user_id = auth.uid()` alebo `has_role`).
- Nový hook `src/hooks/useExerciseNotes.ts`: načítanie máp poznámok pre daného člena, `upsertNote(exerciseId, note)` s debounce a invalidáciou cache.
- `WorkoutSession.tsx`: pri hlavičke každého cviku rozbaliteľné `Textarea` s poznámkou.
- `EditPlanDialog.tsx`: rovnaké pole pri položke plánu.
- Kalkulačka nakladania: čistý UI komponent (`PlateCalcPopover.tsx`), bez zmeny dát – len zapíše výslednú váhu do existujúceho poľa; hmotnosť tyče v `localStorage`.
