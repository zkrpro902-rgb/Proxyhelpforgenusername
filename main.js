export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    // Route proxies
    if (url.searchParams.get('proxies') === '1') {
      try {
        const r = await fetch('https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&timeout=5000&country=all&simplified=true');
        const txt = await r.text();
        const list = txt.split('\n').map(l => l.trim()).filter(l => /^\d+\.\d+\.\d+\.\d+:\d+$/.test(l));
        return new Response(JSON.stringify({ proxies: list }), { headers: cors });
      } catch {
        return new Response(JSON.stringify({ proxies: [] }), { headers: cors });
      }
    }

    // Route check username
    const name = url.searchParams.get('name');
    if (!name) return new Response(JSON.stringify({ error: 'no name' }), { headers: cors });
    try {
      const r = await fetch('https://discord.com/api/v9/unique-usernames/username-attempt-unauthed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
      if (r.status === 429) return new Response(JSON.stringify({ status: 'ratelimit' }), { headers: cors });
      const d = await r.json();
      return new Response(JSON.stringify({ status: d.taken === false ? 'available' : 'taken' }), { headers: cors });
    } catch {
      return new Response(JSON.stringify({ status: 'error' }), { headers: cors });
    }
  }
};
