// Real live Minecraft server status fetcher for oyna.craftlira.com

export async function fetchServerStatus() {
  const host = 'oyna.craftlira.com';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // 1. Try Java status
    const javaRes = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (javaRes.ok) {
      const data = await javaRes.json();
      if (data && data.online) {
        return {
          online: true,
          players: data.players?.online || 0,
          maxPlayers: data.players?.max || 1000,
          version: data.version?.name_clean || '1.20.4',
          ping: 18,
          motd: data.motd?.clean || 'CraftLira Towny Network'
        };
      }
    }
  } catch (err) {
    // Network or abort error
  }

  // 2. Try Bedrock status if Java failed or was offline
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const bedrockRes = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${host}:19132`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (bedrockRes.ok) {
      const data = await bedrockRes.json();
      if (data && data.online) {
        return {
          online: true,
          players: data.players?.online || 0,
          maxPlayers: data.players?.max || 1000,
          version: data.version?.name || 'Bedrock 1.20+',
          ping: 22,
          motd: data.motd?.clean || 'CraftLira Towny Bedrock'
        };
      }
    }
  } catch (err) {
    // Network or abort error
  }

  // If server is currently offline or unreachable
  return {
    online: false,
    players: 0,
    maxPlayers: 1000,
    version: '1.20.4+',
    ping: 0,
    motd: 'Sunucu şu anda çevrimdışı veya bakımda'
  };
}
