import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPush } from "../_shared/fcm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: userData, error: userErr } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  const user = userData?.user;
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
  const allowed = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!allowed) return json({ error: "forbidden" }, 403);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const competitionId = typeof payload.competitionId === "string" ? payload.competitionId : "";
  const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 100) : "";
  const body = typeof payload.body === "string" ? payload.body.trim().slice(0, 300) : "";
  const sendAtRaw = typeof payload.sendAt === "string" ? payload.sendAt : null;

  if (!competitionId || !title || !body) return json({ error: "missing_fields" }, 400);

  let dueAt = new Date();
  if (sendAtRaw) {
    const parsed = new Date(sendAtRaw);
    if (isNaN(parsed.getTime())) return json({ error: "invalid_date" }, 400);
    dueAt = parsed;
  }
  const immediate = dueAt.getTime() <= Date.now() + 30_000;

  // Príjemcovia = členovia zapísaní na danú súťaž, ktorí majú prepojený účet.
  const { data: entries, error: entErr } = await admin
    .from("member_competition_entries")
    .select("member_id")
    .eq("competition_id", competitionId)
    .eq("registered", true);
  if (entErr) return json({ error: "db_error", details: entErr.message }, 500);

  const memberIds = (entries ?? []).map((e: { member_id: string }) => e.member_id);
  if (memberIds.length === 0) return json({ ok: true, recipients: 0, sent: 0, immediate });

  const { data: members } = await admin
    .from("members")
    .select("user_id")
    .in("id", memberIds)
    .not("user_id", "is", null);

  const userIds = [...new Set((members ?? []).map((m: { user_id: string }) => m.user_id))];
  if (userIds.length === 0) return json({ ok: true, recipients: 0, sent: 0, immediate });

  let sent = 0;
  if (immediate) {
    const { data: tokens } = await admin.from("push_tokens").select("token, user_id").in("user_id", userIds);
    for (const t of tokens ?? []) {
      const result = await sendPush(t.token, title, body);
      if (result === "ok") sent++;
      if (result === "stale") await admin.from("push_tokens").delete().eq("token", t.token);
    }
  } else {
    const rows = userIds.map((uid) => ({
      user_id: uid,
      due_at: dueAt.toISOString(),
      title,
      body,
      kind: "competition",
      sent: false,
    }));
    const { error: insErr } = await admin.from("scheduled_reminders").insert(rows);
    if (insErr) return json({ error: "db_error", details: insErr.message }, 500);
  }

  return json({ ok: true, recipients: userIds.length, sent, immediate, dueAt: dueAt.toISOString() });
});
