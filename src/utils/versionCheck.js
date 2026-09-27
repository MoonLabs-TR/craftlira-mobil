/**
 * CraftLira Otomatik Güncelleme Denetleyicisi
 * Uygulama her açıldığında veya Ayarlar'dan tıklandığında yeni sürümü kontrol eder.
 */

export const CURRENT_VERSION = "1.0.0";

/**
 * Semantik sürüm karşılaştırıcı (v1 > v2 ise 1, v1 < v2 ise -1, eşitse 0)
 */
export function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const p1 = String(v1).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p2 = String(v2).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Uzak sunucudan / GitHub'dan en güncel sürümü sorgular
 */
export async function checkForAppUpdates(repoPath = 'MoonLabs-TR/craftlira-mobil') {
  try {
    // 1. GitHub Releases API üzerinden en son yayınlanan sürümü sorgula
    const res = await fetch(`https://api.github.com/repos/${repoPath}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const release = await res.json();
      const latestTag = (release.tag_name || release.name || '').replace(/^v/, '');
      const isNewer = compareVersions(latestTag, CURRENT_VERSION) > 0;
      
      // Varsa APK indirme linkini bul, yoksa release sayfasını ver
      const apkAsset = release.assets?.find(a => a.name.endsWith('.apk'));
      const downloadUrl = apkAsset?.browser_download_url || release.html_url || 'https://craftlira.com/indir';
      
      return {
        updateAvailable: isNewer,
        currentVersion: CURRENT_VERSION,
        latestVersion: latestTag || CURRENT_VERSION,
        downloadUrl,
        releaseNotes: release.body || 'Yeni performans iyileştirmeleri, optimizasyonlar ve Towny güncellemeleri.',
        isForce: (release.body || '').includes('[FORCE_UPDATE]')
      };
    }
  } catch (err) {
    // Çevrimdışı veya GitHub API erişilemediğinde sessizce devam eder
  }

  // Güncelleme yok veya kontrol edilemedi
  return {
    updateAvailable: false,
    currentVersion: CURRENT_VERSION,
    latestVersion: CURRENT_VERSION,
    downloadUrl: 'https://craftlira.com/indir',
    releaseNotes: '',
    isForce: false
  };
}
