export default async function handler(req, res) {
  try {
    // Solscan: latest minted Solana tokens
    const solscanUrl = 'https://public-api.solscan.io/v1/token/list?sortBy=createdAt';
    const sRes = await fetch(solscanUrl);
    const solscanData = await sRes.json();
    const newTokens = solscanData.data?.slice(0, 50) || []; // latest 50 tokens

    // DexScreener: Solana pairs for liquidity, volume, FDV
    const dexscreenerUrl = 'https://api.dexscreener.com/latest/dex/search?q=solana';
    const dRes = await fetch(dexscreenerUrl);
    const dsData = await dRes.json();
    const dsPairs = dsData.pairs?.filter(p => p.chainId === 'solana') || [];

    // Merge tokens with DEX info
    const merged = [];
    const seen = new Set();
    newTokens.forEach(t => {
      const addr = t.address;
      if (!addr || seen.has(addr)) return;
      seen.add(addr);
      const dex = dsPairs.find(p => p.baseToken.address === addr);
      merged.push({...t, dex});
    });

    // CORS headers for WebView
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    return res.status(200).json({tokens: merged, timestamp: new Date().toISOString()});

  } catch (err) {
    return res.status(500).json({error: err.message});
  }
}
