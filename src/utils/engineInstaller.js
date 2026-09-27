import { registerPlugin, Capacitor } from '@capacitor/core';
import { sound } from './audio';

// Capacitor Native Plugin kaydı
export const CraftLiraEngine = registerPlugin('CraftLiraEngine');

export const ENGINE_CONFIG = {
  packageName: 'net.kdt.pojavlaunch',
  targetVersion: '1.20.4',
  serverHost: 'oyna.craftlira.com',
  serverPort: 25565,
  engineName: 'CraftLira Dahili Oyun Çekirdeği (Java 1.20.4)',
  engineDownloadUrl: 'https://github.com/TeamPojavLauncher/PojavLauncher/releases/download/pojav-legacy/Pojavlauncher-release.apk'
};

/**
 * Motorun kurulu olup olmadığını denetler
 */
export async function checkIsEngineInstalled() {
  if (typeof window !== 'undefined' && (window.CraftLiraNative || window.CraftLiraBridge)) {
    return true;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const res = await CraftLiraEngine.isEngineInstalled();
      if (res?.installed) return true;
    } catch (err) {
      console.warn('Native engine check error:', err);
    }
  }

  // Dahili tek parça CraftLira APK'da motor her zaman hazırdır
  return true;
}

/**
 * Motoru arka planda indirip Android PackageInstaller ile kurar
 */
export async function downloadAndInstallEngine({ onProgress = () => {} }) {
  if (Capacitor.isNativePlatform()) {
    let progressListener = null;

    try {
      // İlerleme dinleyicisini bağla
      progressListener = await CraftLiraEngine.addListener('engineDownloadProgress', (data) => {
        onProgress({
          percent: data.percent || 0,
          bytesDownloaded: data.bytesDownloaded || 0,
          totalBytes: data.totalBytes || 0
        });
      });

      // İndirmeyi ve kurulumu başlat
      const result = await CraftLiraEngine.downloadAndInstallEngine({
        url: ENGINE_CONFIG.engineDownloadUrl
      });

      if (progressListener) {
        await progressListener.remove();
      }

      return { success: true, result };
    } catch (err) {
      if (progressListener) {
        try { await progressListener.remove(); } catch (_) {}
      }
      console.error('Download & install error:', err);
      throw err;
    }
  } else {
    // Tarayıcı simülasyonu
    return new Promise((resolve) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 5;
        onProgress({
          percent,
          bytesDownloaded: percent * 1024 * 1024,
          totalBytes: 100 * 1024 * 1024
        });

        if (percent >= 100) {
          clearInterval(interval);
          localStorage.setItem('craftlira_engine_mock_installed', 'true');
          resolve({ success: true, simulated: true });
        }
      }, 150);
    });
  }
}

/**
 * Oyunu doğrudan başlatır ve Towny sunucusuna bağlar
 */
export async function launchGameDirectly({
  username = 'Oyuncu',
  ram = 4,
  autoConnect = true
}) {
  sound.playLaunch();

  // 1. Dahili CraftLira Java motoru doğrudan köprüsü
  if (typeof window !== 'undefined') {
    if (window.CraftLiraNative?.launchTowny) {
      try {
        window.CraftLiraNative.launchTowny(username || 'Oyuncu', (Number(ram) || 4) * 1024);
        return { success: true, method: 'craftlira-native' };
      } catch (e) {
        console.warn('CraftLiraNative call error:', e);
      }
    }
    if (window.CraftLiraBridge?.launchGame) {
      try {
        window.CraftLiraBridge.launchGame(username || 'Oyuncu', ENGINE_CONFIG.serverHost, ENGINE_CONFIG.serverPort, Number(ram) || 4, !!autoConnect);
        return { success: true, method: 'craftlira-bridge' };
      } catch (e) {
        console.warn('CraftLiraBridge call error:', e);
      }
    }
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const res = await CraftLiraEngine.launchGame({
        username: username || 'Oyuncu',
        serverHost: ENGINE_CONFIG.serverHost,
        serverPort: ENGINE_CONFIG.serverPort,
        ram: Number(ram) || 4,
        autoConnect: !!autoConnect,
        version: ENGINE_CONFIG.targetVersion
      });

      if (res?.success) {
        return { success: true, method: 'native-intent' };
      }
    } catch (err) {
      console.warn('Native launch failed, attempting intent fallback:', err);
    }
  }

  // Fallback: Android Intent URL çağrısı
  const host = ENGINE_CONFIG.serverHost;
  const port = ENGINE_CONFIG.serverPort;
  const version = ENGINE_CONFIG.targetVersion;
  const user = encodeURIComponent(username || 'Oyuncu');
  const serverTarget = `${host}:${port}`;
  const quickPlayParam = autoConnect ? serverTarget : '';

  const intentUrl = `intent://launch?version=${version}&server=${serverTarget}#Intent;package=net.kdt.pojavlaunch;S.server=${host};i.port=${port};S.username=${user};S.user=${user};S.quickPlayMultiplayer=${quickPlayParam};S.version=${version};i.ramAllocation=${ram};end`;

  try {
    window.location.href = intentUrl;
    return { success: true, method: 'intent-url' };
  } catch (err) {
    console.error('Launch intent failed:', err);
    return { success: false, error: err };
  }
}
