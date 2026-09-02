import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bell, Play, Vibrate } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertSound,
  DAY_LABELS,
  NotifySettings,
  SOUND_LABELS,
  loadSettings,
  notificationPermission,
  playSound,
  requestNotificationPermission,
  saveSettings,
  unlockAudio,
  vibrate,
} from "@/lib/notifications";

const SOUND_IDS = Object.keys(SOUND_LABELS) as AlertSound[];

export default function NotificationSettingsPage() {
  const { user, loading } = useAuth();
  const [s, setS] = useState<NotifySettings>(loadSettings);
  const [perm, setPerm] = useState(notificationPermission());

  useEffect(() => {
    saveSettings(s);
  }, [s]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const update = (patch: Partial<NotifySettings>) => setS((prev) => ({ ...prev, ...patch }));

  const toggleDay = (i: number) =>
    update({ reminderDays: s.reminderDays.includes(i) ? s.reminderDays.filter((d) => d !== i) : [...s.reminderDays, i].sort() });

  const askPermission = async () => {
    const res = await requestNotificationPermission();
    setPerm(notificationPermission());
    if (res === "granted") toast.success("Notifikácie povolené");
    else if (res === "iframe") toast.error("Otvor appku v samostatnom okne (nie v náhľade) a skús znova");
    else if (res === "denied") toast.error("Notifikácie sú zakázané v nastaveniach prehliadača");
    else if (res === "unsupported") toast.error("Toto zariadenie notifikácie nepodporuje");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PageHeader title="Notifikácie" subtitle="Signál po oddychu a pripomienky tréningu" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {/* Signál po oddychu */}
        <section className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="font-display text-sm tracking-widest uppercase">Koniec prestávky</div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Zvuk</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOUND_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    unlockAudio();
                    update({ sound: id });
                    playSound(id, s.volume);
                  }}
                  className={`rounded-md border p-2 text-xs text-left transition-colors ${
                    s.sound === id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {SOUND_LABELS[id]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Hlasitosť ({Math.round(s.volume * 100)}%)</Label>
            <Slider value={[s.volume * 100]} min={0} max={100} step={5} onValueChange={([v]) => update({ volume: v / 100 })} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Vibrate className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-sm">Vibrovanie</div>
                <div className="text-[11px] text-muted-foreground">Funguje na Androide (Samsung, Xiaomi…)</div>
              </div>
            </div>
            <Switch checked={s.vibrate} onCheckedChange={(v) => update({ vibrate: v })} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm">Držať zvuk nažive počas prestávky</div>
              <div className="text-[11px] text-muted-foreground">
                Spoľahlivejší signál pri zhasnutom displeji, ale telefón stlmí hudbu v slúchadlách. Nechaj vypnuté, ak počúvaš hudbu.
              </div>
            </div>
            <Switch checked={s.keepAudioAlive} onCheckedChange={(v) => update({ keepAudioAlive: v })} />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              unlockAudio();
              playSound(s.sound, s.volume);
              if (s.vibrate) vibrate();
            }}
          >
            <Play className="h-4 w-4" /> Vyskúšať signál
          </Button>

          <p className="text-[11px] text-muted-foreground">
            iPhone z prehliadača vibrovať nevie – tam je hlavný signál zvuk. Aby zaznel, maj vypnutý tichý režim (prepínač na boku) a
            zvuk aspoň raz spusti tlačidlom „Vyskúšať signál“. Cez slúchadlá zvuk zaznie aj popri hudbe a pri zhasnutom displeji.
          </p>
        </section>

        {/* Pripomienky */}
        <section className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display text-sm tracking-widest uppercase">Pripomienka tréningu</div>
              <div className="text-[11px] text-muted-foreground">Vyber dni a čas, kedy chceš upozornenie</div>
            </div>
            <Switch checked={s.reminderEnabled} onCheckedChange={(v) => update({ reminderEnabled: v })} />
          </div>

          {s.reminderEnabled && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {DAY_LABELS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(i)}
                    className={`h-9 w-11 rounded-md border text-xs transition-colors ${
                      s.reminderDays.includes(i) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Čas</Label>
                <Input
                  type="time"
                  value={s.reminderTime}
                  onChange={(e) => update({ reminderTime: e.target.value })}
                  className="w-32"
                />
              </div>

              <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Bell className="h-4 w-4 text-primary shrink-0" />
                  {perm === "granted" ? "Notifikácie sú povolené" : "Povoľ notifikácie, nech ti príde upozornenie"}
                </div>
                {perm !== "granted" && (
                  <Button size="sm" variant="outline" onClick={askPermission}>
                    Povoliť notifikácie
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Pripomienka sa zobrazí, keď máš appku otvorenú alebo bežiacu na pozadí. Pre spoľahlivé upozornenie si appku pridaj na plochu.
                </p>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
