const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

export type SendResult = "ok" | "stale" | "error";

export async function sendPush(token: string, title: string, body: string, path = "/"): Promise<SendResult> {
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
          data: { title, body, path },
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
              data: { url: path },
            },
            fcm_options: { link: path },
          },
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`FCM odoslanie zlyhalo [${res.status}]: ${text}`);
      if (res.status === 404 || (res.status === 400 && text.includes("UNREGISTERED"))) return "stale";
      return "error";
    }
    return "ok";
  } catch (e) {
    console.error("FCM odoslanie zlyhalo:", e);
    return "error";
  }
}
