// Läuft auf Vercels Servern, nicht im Browser — hier ist der Schlüssel sicher.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Nur POST erlaubt' });
    }
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const messages = body.messages;
      if (!messages) return res.status(400).json({ error: 'messages fehlen' });
  
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,   // geheim, kommt aus Vercel
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',           // das günstige Haiku-Modell
          max_tokens: Math.min(body.max_tokens || 1000, 1024),
          messages
        })
      });
  
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }