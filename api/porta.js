// POST: recebe o login do Supabase (e-mail + senha já conferidos lá), confere se é a dona e devolve a chave do site
// GET: diz se a chave ainda vale
import { DONA, DIAS, novaChave, eDona } from './_porta.js';
const URL_BASE = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.json({ ok: eDona(req) });
  if (req.method !== 'POST') return res.status(405).end();
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false });
  try {
    const r = await fetch(`${URL_BASE}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${token}` } });
    const u = r.ok ? await r.json() : null;
    if (!u || String(u.email || '').toLowerCase() !== DONA) return res.status(403).json({ ok: false });
    const chave = novaChave();
    res.setHeader('Set-Cookie', `porta=${encodeURIComponent(chave)}; Path=/; Max-Age=${DIAS * 86400}; HttpOnly; Secure; SameSite=Lax`);
    res.json({ ok: true, chave });
  } catch (e) { res.status(500).json({ ok: false }) }
}
