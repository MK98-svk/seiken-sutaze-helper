import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const schema = z.object({ userId: z.string().uuid(), password: z.string().min(8).max(128) }).strict();
Deno.serve(async (req) => {
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return reply({});
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return reply({ error: 'Unavailable' }, 503);
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return reply({ error: 'Unauthorized' }, 401);
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error: authError } = await admin.auth.getUser(authorization.slice(7));
  if (authError || !identity.user) return reply({ error: 'Unauthorized' }, 401);
  const { data: roles, error: roleError } = await admin.from('user_roles').select('role').eq('user_id', identity.user.id).eq('role', 'admin');
  if (roleError || !roles?.length) return reply({ error: 'Forbidden' }, 403);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return reply({ error: 'Invalid input' }, 400);
    const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, { password: parsed.data.password });
    if (error) return reply({ error: 'Password update rejected', code: error.code }, 400);
    return reply({ success: true });
  } catch {
    return reply({ error: 'Invalid request' }, 400);
  }
});