// Push notifikácie cez Firebase Cloud Messaging – registrácia zariadenia a naplánované pripomienky.
import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { loadSettings, playSound, vibrate } from "@/lib/notifications";

// Nové tabuľky ešte nie sú v generovaných DB typoch – pristupujeme k nim cez voľnejší klient.
const db = supabase as any;

// Verejné (publishable) údaje Firebase web push – slúžia len na registráciu zariadenia v prehliadači.
const FALLBACK = {
  apiKey: "AIzaSyAqho-7dkOWvTuEOZlnixc38iJeLE0j0Dg",
  projectId: "karate-seiken",
  appId: "1:479802412729:web:5533dc3a165dbcdb30d568",
  vapidKey: "BB-jtrZHIBSZHfSwMHqCSzG581MRW_LHTw2kSt95fQcJLlK_e77dK0Zg3_M_XhPQpXpW_ZQ9UR-3pAODBQ2I-Fc",
};

const appId = (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID as string | undefined) || FALLBACK.appId;
const vapidKey =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY as string | undefined) || FALLBACK.vapidKey;
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY as string | undefined) || FALLBACK.apiKey,
  projectId:
    (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID as string | undefined) || FALLBACK.projectId,
  appId,
  messagingSenderId: appId?.split(":")[1] ?? "",
};

export type PushStatus =
  | "registered"
  | "not-configured"
  | "unsupported"
  | "open-in-new-tab"
  | "denied"
  | "not-logged-in"
  | "error";

const ENABLED_KEY = "seiken_push_enabled";

function firebaseMessaging() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
}

async function getPushRegistration() {
  const query = new URLSearchParams(firebaseConfig as Record<string, string>).toString();
  return navigator.serviceWorker.register(`/push/firebase-messaging-sw.js?${query}`, { scope: "/push/" });
}

export function pushEnabledLocally(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Zapne push notifikácie: povolenie, registrácia zariadenia a uloženie tokenu. Volaj z kliku používateľa. */
export async function enablePush(): Promise<PushStatus> {
  const { apiKey, projectId, messagingSenderId } = firebaseConfig;
  if (!apiKey || !projectId || !appId || !vapidKey || !messagingSenderId) return "not-configured";
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return "unsupported";
  if (!("Notification" in window) || !(await isSupported().catch(() => false))) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  try {
    // Vlastný scope /push/ – neprebije to pôvodný PWA service worker v koreňovom scope.
    const registration = await getPushRegistration();

    const messaging = firebaseMessaging();
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) return "denied";

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return "not-logged-in";

    const { error: tokenError } = await db
      .from("push_tokens")
      .upsert({ user_id: user.id, token, platform: "web" }, { onConflict: "token" });
    if (tokenError) throw tokenError;
    localStorage.setItem(ENABLED_KEY, "1");
    await syncReminderPrefs();
    return "registered";
  } catch (e) {
    console.error("enablePush:", e);
    return "error";
  }
}

/** Obnoví registráciu po aktualizácii PWA alebo po zneplatnení tokenu. */
export async function refreshPushRegistration(): Promise<PushStatus | "disabled"> {
  if (!pushEnabledLocally()) return "disabled";
  if (typeof window === "undefined" || window.top !== window.self) return "open-in-new-tab";
  if (!("Notification" in window) || Notification.permission !== "granted") {
    localStorage.removeItem(ENABLED_KEY);
    return "denied";
  }
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return "not-logged-in";

    const registration = await getPushRegistration();
    const messaging = firebaseMessaging();
    let token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) return "error";

    const { data: stored, error: readError } = await db
      .from("push_tokens")
      .select("id")
      .eq("user_id", user.id)
      .eq("token", token)
      .maybeSingle();
    if (readError) throw readError;

    // FCM token mohol byť po aktualizácii aplikácie zneplatnený a server ho vymazal.
    if (!stored) {
      await deleteToken(messaging).catch(() => false);
      token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
      if (!token) return "error";
      const { error: saveError } = await db
        .from("push_tokens")
        .upsert({ user_id: user.id, token, platform: "web" }, { onConflict: "token" });
      if (saveError) throw saveError;
    }

    await syncReminderPrefs();
    return "registered";
  } catch (e) {
    console.error("refreshPushRegistration:", e);
    return "error";
  }
}

/** Zobrazí prijatú správu aj vtedy, keď je aplikácia práve otvorená. */
export function listenForForegroundPush(onReceived: (title: string, body: string) => void) {
  if (typeof window === "undefined" || !("Notification" in window)) return () => undefined;
  try {
    return onMessage(firebaseMessaging(), (payload) => {
      const title = payload.data?.title || payload.notification?.title || "KK Seiken";
      const body = payload.data?.body || payload.notification?.body || "Máš nové upozornenie.";
      const settings = loadSettings();
      playSound(settings.sound, settings.volume);
      if (settings.vibrate) vibrate();
      onReceived(title, body);
    });
  } catch (e) {
    console.error("listenForForegroundPush:", e);
    return () => undefined;
  }
}

/** Vypne push notifikácie pre toto zariadenie. */
export async function disablePush() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    let token: string | null = null;
    if ("serviceWorker" in navigator && (await isSupported().catch(() => false))) {
      const registration = await navigator.serviceWorker.getRegistration("/push/");
      if (registration) {
        token = await getToken(firebaseMessaging(), { vapidKey, serviceWorkerRegistration: registration }).catch(() => null);
        await deleteToken(firebaseMessaging()).catch(() => false);
      }
    }
    if (auth?.user) {
      if (token) await db.from("push_tokens").delete().eq("user_id", auth.user.id).eq("token", token);
      await db.from("notification_prefs").upsert({ user_id: auth.user.id, reminder_enabled: false });
    }
  } catch {
    /* ignore */
  } finally {
    localStorage.removeItem(ENABLED_KEY);
  }
}

/** Uloží nastavenie pripomienok tréningu na server, aby push prišiel aj pri vypnutej appke. */
export async function syncReminderPrefs() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    const s = loadSettings();
    const { error } = await db.from("notification_prefs").upsert({
      user_id: user.id,
      reminder_enabled: s.reminderEnabled && pushEnabledLocally(),
      reminder_days: s.reminderDays,
      reminder_time: s.reminderTime,
      tz_offset_minutes: -new Date().getTimezoneOffset(),
    });
    if (error) throw error;
  } catch {
    /* ignore */
  }
}

/** Naplánuje push na koniec prestávky – príde aj pri zhasnutom displeji. */
export async function scheduleRestReminder(seconds: number) {
  try {
    if (!pushEnabledLocally()) return;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    const { error } = await db.from("scheduled_reminders").insert({
      user_id: user.id,
      due_at: new Date(Date.now() + seconds * 1000).toISOString(),
      title: "Oddych skončil",
      body: "Poď na ďalšiu sériu 💪",
      kind: "rest",
    });
    if (error) throw error;
  } catch {
    /* ignore */
  }
}

/** Zruší naplánovaný push na koniec prestávky (pauza, reset, koniec). */
export async function cancelRestReminders() {
  try {
    if (!pushEnabledLocally()) return;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    await db
      .from("scheduled_reminders")
      .delete()
      .eq("user_id", user.id)
      .eq("kind", "rest")
      .eq("sent", false);
  } catch {
    /* ignore */
  }
}

/** Odošle skúšobnú push správu cez rovnaký serverový tok ako reálne pripomienky. */
export async function scheduleTestPush(): Promise<boolean> {
  try {
    const refreshed = await refreshPushRegistration();
    if (refreshed !== "registered") return false;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return false;
    const { error } = await db.from("scheduled_reminders").insert({
      user_id: user.id,
      due_at: new Date().toISOString(),
      title: "Test KK Seiken",
      body: "Push notifikácie na tomto telefóne fungujú.",
      kind: "test",
    });
    return !error;
  } catch (e) {
    console.error("scheduleTestPush:", e);
    return false;
  }
}
