export default async function handler(request, response) {
  try {
    const endpoints = [
      'https://api.dexscreener.com/latest/dex/search?q=solana',
      'https://api.dexscreener.com/latest/dex/search?q=solana&page=2',
      'https://api.dexscreener.com/latest/dex/search?q=solana&page=3'
    ];

    let solPairs = [];

    for(const url of endpoints){
      const res = await fetch(url);
      const data = await res.json();
      const filtered = (data.pairs || []).filter(p => p.chainId === 'solana');
      solPairs = solPairs.concat(filtered);
    }

    // Remove duplicates by contract address
    const seen = new Set();
    solPairs = solPairs.filter(p => {
      if(seen.has(p.baseToken?.address)) return false;
      seen.add(p.baseToken?.address);
      return true;
    });

    response.setHeader('Access-Control-Allow-Origin','*');
    response.setHeader('Access-Control-Allow-Methods','GET');

    return response.status(200).json({ pairs: solPairs, timestamp: new Date().toISOString() });
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
}
