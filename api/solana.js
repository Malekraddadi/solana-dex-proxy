// Node.js serverless function for Vercel
export default async function handler(request, response) {
  try {
    // Fetch DexScreener Solana pairs
    const dexUrl = 'https://api.dexscreener.com/latest/dex/search?q=solana';
    const res = await fetch(dexUrl);
    const data = await res.json();

    // Filter Solana only
    const solPairs = (data.pairs || []).filter(p => p.chainId === 'solana');

    // Add CORS headers for Android / browser
    response.setHeader('Access-Control-Allow-Origin','*');
    response.setHeader('Access-Control-Allow-Methods','GET');

    return response.status(200).json({ pairs: solPairs, timestamp: new Date().toISOString() });
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
}
