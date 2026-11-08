// a gravação da segunda página do cadastro → texto (Whisper no Cloudflare Workers AI).
// Aberto para quem está se cadastrando, mas só aceita áudio pequeno (até 4 MB).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    let audio = req.body;
    if (!Buffer.isBuffer(audio)) { const partes = []; for await (const c of req) partes.push(c); audio = Buffer.concat(partes) }
    if (!audio || !audio.length) return res.status(400).json({ error: 'sem áudio' });
    if (audio.length > 4 * 1024 * 1024) return res.status(413).json({ error: 'áudio grande demais' });
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/ai/run/@cf/openai/whisper`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.CF_AI_TOKEN}`, 'Content-Type': 'application/octet-stream' }, body: audio });
    const j = await r.json();
    if (!j.success) return res.status(502).json({ error: JSON.stringify(j.errors).slice(0, 200) });
    res.json({ texto: String(j.result.text || '').trim() });
  } catch (e) { res.status(500).json({ error: String(e.message || e).slice(0, 200) }) }
}
