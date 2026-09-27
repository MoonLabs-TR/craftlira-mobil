/**
 * CraftLira Dahili Oyun Motoru & Doğrudan Bağlantı Denetleyicisi
 * Uygulamaya entegre Minecraft Java 1.20.4 motorunu doğrudan çalıştırır.
 */

export const LAUNCHER_CONFIG = {
  serverHost: 'oyna.craftlira.com',
  serverPort: 25565,
  targetVersion: '1.20.4',
  appPackage: 'com.craftlira.launcher'
};

/**
 * Android cihaz tespiti
 */
export function isAndroidDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || navigator.vendor || window.opera);
}

/**
 * Dahili motoru doğrudan başlatır ve Towny sunucusuna bağlar
 */
export function launchMinecraftClient({
  username = 'Oyuncu',
  ram = 4,
  autoConnect = true,
  onFeedback = () => {}
}) {
  const host = LAUNCHER_CONFIG.serverHost;
  const port = LAUNCHER_CONFIG.serverPort;
  const version = LAUNCHER_CONFIG.targetVersion;
  const user = encodeURIComponent(username || 'Oyuncu');
  const serverTarget = `${host}:${port}`;
  const isAndroid = isAndroidDevice();

  // 1. Dahili Android / Native Bridge kontrolü (APK içi C/Java köprüsü)
  if (typeof window !== 'undefined') {
    if (window.CraftLiraNative?.launchTowny) {
      try {
        window.CraftLiraNative.launchTowny(username || 'Oyuncu', (Number(ram) || 4) * 1024);
        onFeedback({ status: 'launched', method: 'craftlira-native' });
        return { success: true, method: 'native-bridge' };
      } catch (err) {
        console.warn('CraftLiraNative launchTowny error:', err);
      }
    }

    if (window.CraftLiraBridge?.launchGame) {
      try {
        window.CraftLiraBridge.launchGame(username, host, port, ram, autoConnect);
        onFeedback({ status: 'launched', method: 'craftlira-native-bridge' });
        return { success: true, method: 'native-bridge' };
      } catch (err) {
        console.warn('Native bridge error:', err);
      }
    }

    if (window.CraftLiraNative?.launch) {
      try {
        window.CraftLiraNative.launch({ username, host, port, ram, autoConnect, version });
        onFeedback({ status: 'launched', method: 'craftlira-native' });
        return { success: true, method: 'native-bridge' };
      } catch (err) {
        console.warn('Native engine error:', err);
      }
    }
  }

  // 2. Android Dahili İstemci Intent Çağrısı (QuickPlay direkt sunucuya giriş)
  const quickPlayParam = autoConnect ? serverTarget : '';
  
  // Dahili APK launch intent (uygulama içi aktiviteyi veya motoru tetikler)
  const intentUrl = `intent://launch?version=${version}&server=${serverTarget}#Intent;package=net.kdt.pojavlaunch;S.server=${host};i.port=${port};S.username=${user};S.user=${user};S.quickPlayMultiplayer=${quickPlayParam};S.version=${version};i.ramAllocation=${ram};end`;
  const internalUri = `pojav://launch?version=${version}&server=${serverTarget}&user=${user}&ram=${ram}&autoConnect=${autoConnect ? 1 : 0}`;

  try {
    if (isAndroid) {
      window.location.href = intentUrl;
    } else {
      window.location.href = internalUri;
    }
    onFeedback({ status: 'launched', method: 'internal-engine' });
    return { success: true, method: 'internal-engine' };
  } catch (err) {
    console.error('Launch engine error:', err);
    return { success: false, error: err };
  }
}
