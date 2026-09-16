import { createClient } from "npm:@supabase/supabase-js@2";

// Tento kľúč musí sedieť s hodnotou v cron jobe (tabuľka cron.job).
const CRON_SECRET = "260cc976c1af50757fedee6afd9b9d6b259ff59c7f38a1cc";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

type SendResult = "ok" | "stale" | "error";

async function sendPush(token: string, title: string, body: string): Promise<SendResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const connectionKey = Deno.env.get("FIREBASE_MESSAGING_API_KEY");
  if (!LOVABLE_API_KEY || !connectionKey) {
    console.error("Chýbajú prihlasovacie údaje na odosielanie (gateway).");
    return "error";
  }
  try {
    const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          data: { title, body, path: "/posilnovanie" },
          webpush: {
            headers: { urgency: "high" },
            notification: {
              title,
              body,
              icon: "/pwa-icon-192.png",
              badge: "/pwa-icon-192.png",
              tag: "seiken-push",
              renotify: true,
              vibrate: [250, 120, 250],
              data: { url: "/posilnovanie" },
            },
            fcm_options: { link: "/posilnovanie" },
          },
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`FCM odoslanie zlyhalo [${res.status}]: ${text}`);
      // Neplatný/vypršaný token zariadenia → vymažeme, aby sme naň neposielali.
      if (res.status === 404 || (res.status === 400 && text.includes("UNREGISTERED"))) return "stale";
      return "error";
    }
    return "ok";
  } catch (e) {
    console.error("FCM odoslanie zlyhalo:", e);
    return "error";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const now = new Date();
  let sent = 0;
  let weekly = 0;

  // 1) Jednorazové pripomienky (napr. koniec prestávky medzi sériami).
  const { data: due, error: e1 } = await admin
    .from("scheduled_reminders")
    .select("id, user_id, title, body")
    .eq("sent", false)
    .lte("due_at", now.toISOString())
    .limit(100);
  if (e1) console.error("scheduled_reminders:", e1);

  for (const r of due ?? []) {
    const { data: tokens } = await admin.from("push_tokens").select("token").eq("user_id", r.user_id);
    let reminderDelivered = false;
    for (const t of tokens ?? []) {
      const result = await sendPush(t.token, r.title, r.body);
      if (result === "ok") {
        sent++;
        reminderDelivered = true;
      }
      if (result === "stale") await admin.from("push_tokens").delete().eq("token", t.token);
    }
    // Za vybavenú ju označíme iba vtedy, keď sa aspoň jednému zariadeniu naozaj odoslala.
    // Bez tokenu alebo pri dočasnej chybe ostane čakajúca a ďalší beh ju skúsi znova.
    const { data: remainingTokens } = await admin.from("push_tokens").select("id").eq("user_id", r.user_id).limit(1);
    if (reminderDelivered || !remainingTokens?.length) {
      await admin.from("scheduled_reminders").update({ sent: true }).eq("id", r.id);
    }
  }

  // Staré odoslané pripomienky vyčistíme.
  await admin
    .from("scheduled_reminders")
    .delete()
    .lt("due_at", new Date(Date.now() - 7 * 86400000).toISOString());

  // 2) Týždenné pripomienky tréningu podľa nastavení používateľa.
  const dayIdx = (now.getDay() + 6) % 7; // 0 = pondelok
  const today = now.toISOString().slice(0, 10);
  const { data: prefs, error: e2 } = await admin
    .from("notification_prefs")
    .select("*")
    .eq("reminder_enabled", true);
  if (e2) console.error("notification_prefs:", e2);

  for (const p of prefs ?? []) {
    if (!Array.isArray(p.reminder_days) || !p.reminder_days.includes(dayIdx)) continue;
    if (p.last_sent_date === today) continue;

    const [h, m] = String(p.reminder_time ?? "18:00").split(":").map(Number);
    // Uložený čas je lokálny čas používateľa; prepočítame na UTC.
    const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h || 0, m || 0);
    const tz = Number(p.tz_offset_minutes ?? 0);
    const targetUtc = base - tz * 60000;
    const diff = now.getTime() - targetUtc;
    if (diff < 0 || diff > 10 * 60 * 1000) continue;

    const { data: tokens } = await admin.from("push_tokens").select("token").eq("user_id", p.user_id);
    if (!tokens?.length) continue;
    for (const t of tokens) {
      const result = await sendPush(t.token, "Čas na tréning 🥋", "Podľa tvojho plánu je teraz čas cvičiť.");
      if (result === "ok") weekly++;
      if (result === "stale") await admin.from("push_tokens").delete().eq("token", t.token);
    }
    await admin.from("notification_prefs").update({ last_sent_date: today }).eq("user_id", p.user_id);
  }

  return new Response(JSON.stringify({ ok: true, sent, weekly }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
