export async function onRequestPost(context) {
  const { request, env } = context;
  const { password, count = 10, attempts = 1 } = await request.json();

  // ⚠️ 修改这里的密码
  if (password !== 'soul2026') {
    return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codes = [];
  const limit = Math.min(parseInt(count) || 10, 100);
  const maxAttempts = parseInt(attempts) || 1;

  for (let i = 0; i < limit; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    const key = `CODE_${code}`;
    const value = {
      max_attempts: maxAttempts,
      used_attempts: 0,
      last_result: null,
      created_at: new Date().toISOString()
    };

    await env.MY_KV.put(key, JSON.stringify(value), { expirationTtl: 2592000 }); // 30天过期
    codes.push({ code, max: maxAttempts, used: 0 });
  }

  return new Response(JSON.stringify({ success: true, codes }), { headers: { 'Content-Type': 'application/json' } });
}