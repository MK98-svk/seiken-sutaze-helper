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
import { disablePush, enablePush, pushEnabledLocally, scheduleTestPush, syncReminderPrefs } from "@/lib/push";

const SOUND_IDS = Object.keys(SOUND_LABELS) as AlertSound[];

export default function NotificationSettingsPage() {
  const { user, loading } = useAuth();
  const [s, setS] = useState<NotifySettings>(loadSettings);
  const [perm, setPerm] = useState(notificationPermission());
  const [pushOn, setPushOn] = useState(pushEnabledLocally());
  const [pushBusy, setPushBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);

  useEffect(() => {
    saveSettings(s);
    if (pushEnabledLocally()) void syncReminderPrefs();
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

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        toast.success("Push notifikácie vypnuté");
        return;
      }
      const res = await enablePush();
      if (res === "registered") {
        setPushOn(true);
        toast.success("Push notifikácie zapnuté – prídu aj pri zhasnutom displeji");
      } else if (res === "open-in-new-tab") toast.error("Otvor appku v samostatnom okne (nie v náhľade) a skús znova");
      else if (res === "denied") toast.error("Notifikácie sú zakázané v nastaveniach prehliadača");
      else if (res === "not-configured") toast.error("Push nie je zatiaľ nakonfigurovaný");
      else if (res === "not-logged-in") toast.error("Najprv sa prihlás do appky");
      else toast.error("Push sa nepodarilo zapnúť, skús to znova");
    } finally {
      setPushBusy(false);
    }
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

        {/* Push notifikácie */}
        <section className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display text-sm tracking-widest uppercase">Push notifikácie</div>
              <div className="text-[11px] text-muted-foreground">Upozornenia do telefónu aj pri zavretej appke</div>
            </div>
            <Switch checked={pushOn} disabled={pushBusy} onCheckedChange={() => void togglePush()} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {pushOn
              ? "Zapnuté – koniec prestávky aj pripomienka tréningu ti prídu ako notifikácia, aj keď je appka zatvorená alebo máš zhasnutý displej. Na iPhone musí mať appka ikonu na ploche (v Safari: Zdieľať → Na plochu)."
              : "Zapni ich, aby ti koniec prestávky a pripomienka tréningu prišli ako notifikácia do telefónu, aj keď je appka zatvorená alebo máš zhasnutý displej. Na iPhone musí mať appka ikonu na ploche (v Safari: Zdieľať → Na plochu)."}
          </p>
          {pushOn && (
            <Button
              variant="outline"
              size="sm"
              disabled={testBusy}
              onClick={async () => {
                setTestBusy(true);
                const ok = await scheduleTestPush();
                setTestBusy(false);
                if (ok) toast.success("Test odoslaný – notifikácia príde približne do minúty");
                else toast.error("Telefón sa nepodarilo zaregistrovať. Push vypni, znova zapni a potvrď povolenie.");
              }}
            >
              <Bell className="h-4 w-4" /> {testBusy ? "Odosielam…" : "Poslať testovaciu notifikáciu"}
            </Button>
          )}
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
                  {pushOn
                    ? "Pripomienka príde ako push notifikácia do telefónu v zvolený deň a čas."
                    : "Zapni push notifikácie vyššie, nech ti pripomienka reálne príde do telefónu."}
                </div>
                {perm !== "granted" && (
                  <div className="space-y-1.5">
                    <Button size="sm" variant="outline" onClick={askPermission}>
                      Povoliť notifikácie v appke
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      Zobrazí upozornenie len v appke. Aby ti pripomienka prišla aj pri zavretej appke, zapni push notifikácie vyššie.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
