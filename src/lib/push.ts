// Push notifikácie cez Firebase Cloud Messaging – registrácia zariadenia a naplánované pripomienky.
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/notifications";

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
    const query = new URLSearchParams(firebaseConfig as Record<string, string>).toString();
    const registration = await navigator.serviceWorker.register(`/push/firebase-messaging-sw.js?${query}`);

    const messaging = getMessaging(initializeApp(firebaseConfig));
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) return "denied";

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return "not-logged-in";

    await db.from("push_tokens").upsert({ user_id: user.id, token, platform: "web" }, { onConflict: "token" });
    await syncReminderPrefs();
    localStorage.setItem(ENABLED_KEY, "1");
    return "registered";
  } catch (e) {
    console.error("enablePush:", e);
    return "error";
  }
}

/** Vypne push notifikácie pre toto zariadenie. */
export async function disablePush() {
  try {
    localStorage.removeItem(ENABLED_KEY);
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user) {
      await db.from("push_tokens").delete().eq("user_id", auth.user.id);
      await db.from("notification_prefs").delete().eq("user_id", auth.user.id);
    }
  } catch {
    /* ignore */
  }
}

/** Uloží nastavenie pripomienok tréningu na server, aby push prišiel aj pri vypnutej appke. */
export async function syncReminderPrefs() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    const s = loadSettings();
    await db.from("notification_prefs").upsert({
      user_id: user.id,
      reminder_enabled: s.reminderEnabled && pushEnabledLocally(),
      reminder_days: s.reminderDays,
      reminder_time: s.reminderTime,
      tz_offset_minutes: -new Date().getTimezoneOffset(),
    });
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
    await db.from("scheduled_reminders").insert({
      user_id: user.id,
      due_at: new Date(Date.now() + seconds * 1000).toISOString(),
      title: "Oddych skončil",
      body: "Poď na ďalšiu sériu 💪",
      kind: "rest",
    });
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
