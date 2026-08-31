// Nastavenia zvukov, vibrácií a pripomienok tréningov (uložené lokálne v zariadení).

export type AlertSound = "ziadny" | "pipnutie" | "trojpip" | "gong" | "pisknutie";

export interface NotifySettings {
  sound: AlertSound;
  volume: number; // 0–1
  vibrate: boolean;
  reminderEnabled: boolean;
  reminderDays: number[]; // 0 = pondelok … 6 = nedeľa
  reminderTime: string; // "18:00"
}

const KEY = "seiken_notify_settings";

export const DEFAULT_SETTINGS: NotifySettings = {
  sound: "pipnutie",
  volume: 0.7,
  vibrate: true,
  reminderEnabled: false,
  reminderDays: [0, 2, 4],
  reminderTime: "18:00",
};

export const SOUND_LABELS: Record<AlertSound, string> = {
  ziadny: "Žiadny zvuk",
  pipnutie: "Pípnutie",
  trojpip: "Trojité pípnutie",
  gong: "Gong",
  pisknutie: "Píšťalka",
};

export const DAY_LABELS = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

export function loadSettings(): NotifySettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: NotifySettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("seiken-notify-settings"));
}

// ─── Zvuk cez WebAudio (nepotrebuje externé súbory) ───
let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = ctx ?? new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Odomkne audio po používateľskom geste (iOS to vyžaduje). */
export function unlockAudio() {
  audioCtx();
}

function tone(ac: AudioContext, at: number, freq: number, dur: number, volume: number, type: OscillatorType = "sine") {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

export function playSound(sound: AlertSound, volume = 0.7) {
  if (sound === "ziadny") return;
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  const v = Math.min(1, Math.max(0, volume));
  switch (sound) {
    case "pipnutie":
      tone(ac, t, 880, 0.25, v);
      break;
    case "trojpip":
      tone(ac, t, 880, 0.12, v);
      tone(ac, t + 0.2, 880, 0.12, v);
      tone(ac, t + 0.4, 1175, 0.3, v);
      break;
    case "gong":
      tone(ac, t, 196, 1.6, v, "triangle");
      tone(ac, t + 0.01, 392, 1.2, v * 0.5, "sine");
      break;
    case "pisknutie":
      tone(ac, t, 1600, 0.35, v, "square");
      tone(ac, t + 0.45, 1600, 0.35, v, "square");
      break;
  }
}

export function vibrate(pattern: number[] = [250, 120, 250]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

/** Signál po skončení oddychu podľa uložených nastavení. */
export function restFinishedAlert(settings: NotifySettings = loadSettings()) {
  playSound(settings.sound, settings.volume);
  if (settings.vibrate) vibrate();
  showNotification("Oddych skončil", "Poď na ďalšiu sériu 💪");
}

// ─── Systémové notifikácie ───
export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "iframe" | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (window.top !== window.self) return "iframe";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function showNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/pwa-icon-192.png", tag: "seiken-workout" });
  } catch {
    /* ignore */
  }
}

// ─── Pripomienky tréningu ───
const FIRED_KEY = "seiken_reminder_last";

/** Vráti true, ak sa pripomienka práve spustila. */
export function checkReminder(now = new Date()): boolean {
  const s = loadSettings();
  if (!s.reminderEnabled) return false;
  const dayIdx = (now.getDay() + 6) % 7;
  if (!s.reminderDays.includes(dayIdx)) return false;

  const [h, m] = s.reminderTime.split(":").map(Number);
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  const diff = now.getTime() - target.getTime();
  if (diff < 0 || diff > 10 * 60 * 1000) return false; // okno 10 minút

  const stamp = `${now.toDateString()}|${s.reminderTime}`;
  if (localStorage.getItem(FIRED_KEY) === stamp) return false;
  localStorage.setItem(FIRED_KEY, stamp);

  showNotification("Čas na tréning 🥋", "Podľa tvojho plánu je teraz čas cvičiť.");
  playSound(s.sound, s.volume);
  if (s.vibrate) vibrate([200, 100, 200]);
  return true;
}
