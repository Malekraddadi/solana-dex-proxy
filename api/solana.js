// Solana Elite Scanner Proxy v9.0
// Aggregates Solscan + DexScreener + Social signals + Chatter
// Ready for deployment on Vercel

export default async function handler(req, res) {
  try {
    // ------------------ 1️⃣ Solscan Latest Tokens ------------------
    const solscanUrl = 'https://public-api.solscan.io/v1/token/list?sortBy=createdAt';
    const solscanRes = await fetch(solscanUrl);
    const solscanData = await solscanRes.json();
    const solTokens = solscanData.data?.slice(0,50).map(t=>({
      name: t.name,
      ticker: t.symbol,
      address: t.address,
      source:'solscan'
    })) || [];

    // ------------------ 2️⃣ DexScreener Solana Pairs ------------------
    const dsUrl = 'https://api.dexscreener.com/latest/dex/search?q=solana';
    const dsRes = await fetch(dsUrl);
    const dsData = await dsRes.json();
    const dsPairs = dsData.pairs?.filter(p=>p.chainId==='solana') || [];
    const dsTokens = dsPairs.map(p=>({
      name: p.baseToken.name,
      ticker: p.baseToken.symbol,
      address: p.baseToken.address,
      dex:{liquidity:p.liquidity?.usd||0, volume:p.volume?.m5||0},
      source:'dexscreener'
    }));

    // ------------------ 3️⃣ X/Twitter Public Search (Placeholder) ------------------
    const hashtags = ['SolanaGems','SolanaNewToken','SolanaMeme'];
    const socialTokens = [];
    // TODO: Add public scraping for token mentions
    // Example placeholder:
    // socialTokens.push({name:'TokenX', ticker:'TX', address:'ADDR', social:{mentions:12}, source:'twitter'});

    // ------------------ 4️⃣ Telegram/Discord Public Chatter (Placeholder) ------------------
    const chatterTokens = [];
    // TODO: Fetch public channels messages & extract token mentions

    // ------------------ 5️⃣ Merge All Sources ------------------
    const mergedMap = new Map();
    [...solTokens, ...dsTokens, ...socialTokens, ...chatterTokens].forEach(t=>{
      if(!t.address) return;
      if(!mergedMap.has(t.address)) mergedMap.set(t.address, t);
      else {
        const existing = mergedMap.get(t.address);
        mergedMap.set(t.address,{
          ...existing,
          ...t,
          dex: t.dex||existing.dex,
          social: t.social||existing.social,
          chatter: t.chatter||existing.chatter
        });
      }
    });

    const mergedTokens = Array.from(mergedMap.values());

    // ------------------ 6️⃣ Return JSON ------------------
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET');
    return res.status(200).json({timestamp:new Date().toISOString(), tokens:mergedTokens});

  } catch(err){
    console.error('Proxy Error:', err);
    return res.status(500).json({error:err.message});
  }
}
