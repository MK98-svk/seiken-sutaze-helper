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

// ─── Zvuk: PCM/WAV generovaný v pamäti a prehrávaný cez <audio> ───
// Dôvod: WebAudio na mobiloch (najmä iOS) po zamknutí displeja stíchne,
// klasický audio prvok prehrá zvuk aj keď je appka na pozadí.

interface ToneSpec {
  at: number; // sekundy od začiatku
  dur: number;
  freq: number;
  gain: number;
  wave: "sine" | "triangle" | "square";
}

const SOUND_SPECS: Record<Exclude<AlertSound, "ziadny">, ToneSpec[]> = {
  pipnutie: [{ at: 0, dur: 0.28, freq: 880, gain: 1, wave: "sine" }],
  trojpip: [
    { at: 0, dur: 0.14, freq: 880, gain: 1, wave: "sine" },
    { at: 0.22, dur: 0.14, freq: 880, gain: 1, wave: "sine" },
    { at: 0.44, dur: 0.32, freq: 1175, gain: 1, wave: "sine" },
  ],
  gong: [
    { at: 0, dur: 1.8, freq: 196, gain: 1, wave: "triangle" },
    { at: 0.01, dur: 1.3, freq: 392, gain: 0.5, wave: "sine" },
  ],
  pisknutie: [
    { at: 0, dur: 0.35, freq: 1600, gain: 0.7, wave: "square" },
    { at: 0.45, dur: 0.35, freq: 1600, gain: 0.7, wave: "square" },
  ],
};

const SAMPLE_RATE = 22050;

function waveValue(wave: ToneSpec["wave"], phase: number): number {
  switch (wave) {
    case "square":
      return Math.sin(phase) >= 0 ? 0.6 : -0.6;
    case "triangle":
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    default:
      return Math.sin(phase);
  }
}

function encodeWav(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function renderSound(sound: Exclude<AlertSound, "ziadny">): string {
  const specs = SOUND_SPECS[sound];
  const total = Math.max(...specs.map((s) => s.at + s.dur)) + 0.1;
  const samples = new Float32Array(Math.ceil(total * SAMPLE_RATE));
  specs.forEach((s) => {
    const start = Math.floor(s.at * SAMPLE_RATE);
    const len = Math.floor(s.dur * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.01);
      const decay = Math.pow(1 - i / len, 1.6);
      const phase = 2 * Math.PI * s.freq * t;
      samples[start + i] += waveValue(s.wave, phase) * s.gain * attack * decay * 0.9;
    }
  });
  return URL.createObjectURL(encodeWav(samples));
}

const urlCache = new Map<string, string>();

function soundUrl(sound: Exclude<AlertSound, "ziadny">): string {
  let url = urlCache.get(sound);
  if (!url) {
    url = renderSound(sound);
    urlCache.set(sound, url);
  }
  return url;
}

function silentUrl(): string {
  let url = urlCache.get("__silence");
  if (!url) {
    url = URL.createObjectURL(encodeWav(new Float32Array(SAMPLE_RATE)));
    urlCache.set("__silence", url);
  }
  return url;
}

const players = new Map<string, HTMLAudioElement>();

function player(key: string, src: string): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  let el = players.get(key);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    players.set(key, el);
  }
  return el;
}

/** Odomkne prehrávanie zvuku po používateľskom geste (iOS to vyžaduje). */
export function unlockAudio() {
  try {
    const el = player("unlock", silentUrl());
    if (!el) return;
    el.volume = 0.001;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  } catch {
    /* ignore */
  }
}

/** Tichá slučka počas oddychu – drží zvukový kanál nažive, nech signál zaznie aj pri zamknutom telefóne. */
export function startAudioKeepAlive() {
  try {
    const el = player("keepalive", silentUrl());
    if (!el) return;
    el.loop = true;
    el.volume = 0.001;
    if (el.paused) void el.play().catch(() => undefined);
  } catch {
    /* ignore */
  }
}

export function stopAudioKeepAlive() {
  try {
    const el = players.get("keepalive");
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  } catch {
    /* ignore */
  }
}

export function playSound(sound: AlertSound, volume = 0.7) {
  if (sound === "ziadny") return;
  try {
    const el = player(sound, soundUrl(sound));
    if (!el) return;
    el.volume = Math.min(1, Math.max(0, volume));
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  } catch {
    /* ignore */
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
  stopAudioKeepAlive();
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
