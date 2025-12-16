export default async function handler(req, res) {
  try {
    // --- Multi-source URLs ---
    const sources = [
      'https://api.dexscreener.com/latest/dex/search?q=solana',
      'https://api.dexscreener.com/latest/dex/search?q=solana&page=2',
      'https://www.gmgn.xyz/api/solana/new.json', // hypothetical public JSON feed
      'https://api.raydium.io/pools' // example Raydium pools JSON
    ];

    let tokens = [];

    for (const url of sources) {
      try {
        const r = await fetch(url);
        const data = await r.json();

        // Extract pairs safely, depending on source structure
        let extracted = [];
        if (data.pairs) extracted = data.pairs.filter(p => p.chainId === 'solana');
        else if (data.tokens) extracted = data.tokens;
        else if (Array.isArray(data)) extracted = data;

        tokens = tokens.concat(extracted);
      } catch(e) {
        console.log('Source fetch failed:', url, e.message);
        continue; // skip failed source
      }
    }

    // Deduplicate by contract address
    const seen = new Set();
    tokens = tokens.filter(t => {
      const addr = t.baseToken?.address || t.address || t.id;
      if (!addr || seen.has(addr)) return false;
      seen.add(addr);
      return true;
    });

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    return res.status(200).json({ tokens, timestamp: new Date().toISOString() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
