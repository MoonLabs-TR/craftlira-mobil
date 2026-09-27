#!/usr/bin/env python3
"""
CraftLira Mobil - Tek Parça Tam İstemci Derleyici
1. React Web Arayüzünü (dist/) derler
2. 130MB Oyun Motorunu (OpenJDK, LWJGL, GL4ES) açar
3. Web arayüzünü doğrudan açan tam ekran WebView köprüsünü entegre eder
4. Ücretsiz/çevrimdışı (offline) oyuncu desteği ve oyna.craftlira.com:25565 otomatik bağlantısını ekler
5. Marka, ikonlar ve başlığı CraftLira Mobil olarak yapılandırıp tek parça APK üretir
"""

import os
import sys
import shutil
import urllib.request
import subprocess
from pathlib import Path
import re
import zipfile

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
BUILD_DIR = BASE_DIR / "build_craftlira"
RELEASE_DIR = BASE_DIR / "release-apk"
CACHE_DIR = BASE_DIR / "cache"

APKTOOL_JAR = CACHE_DIR / "apktool.jar"
UBER_SIGNER_JAR = CACHE_DIR / "uber-apk-signer.jar"
R8_JAR = CACHE_DIR / "r8.jar"
ANDROID_JAR = CACHE_DIR / "android.jar"
ENGINE_BASE_APK = CACHE_DIR / "pojav.apk"

APKTOOL_URL = "https://github.com/iBotPeaches/Apktool/releases/download/v2.10.0/apktool_2.10.0.jar"
UBER_SIGNER_URL = "https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar"
R8_URL = "https://maven.google.com/com/android/tools/r8/8.2.42/r8-8.2.42.jar"
ANDROID_JAR_URL = "https://raw.githubusercontent.com/Sable/android-platforms/master/android-33/android.jar"
BASE_ENGINE_URL = "https://github.com/TeamPojavLauncher/PojavLauncher/releases/download/pojav-legacy/Pojavlauncher-release.apk"

MASCOT_PATH = BASE_DIR / "public" / "assets" / "mascot-transparent.png"

def download_if_needed(url: str, dest: Path, desc: str, min_size: int = 100000):
    if dest.exists() and dest.stat().st_size > min_size:
        print(f"[*] {desc} zaten mevcut: {dest.name} ({dest.stat().st_size // 1024} KB)")
        return
    print(f"[+] {desc} indiriliyor: {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out_file:
        shutil.copyfileobj(resp, out_file)
    print(f"[OK] {desc} indirildi ({dest.stat().st_size // 1024} KB)")

def compile_integration_bridge(dest_smali_dir: Path):
    """CraftLiraIntegration Java sınıfını derler, dex'e dönüştürür ve smali dosyalarını üretir."""
    print("[+] CraftLira Web & Motor Entegrasyon Köprüsü derleniyor...")
    temp_dir = BUILD_DIR / "temp_integration"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)

    src_dir = temp_dir / "src"
    bin_dir = temp_dir / "bin"
    dex_dir = temp_dir / "dex"

    pojav_extra_dir = src_dir / "net" / "kdt" / "pojavlaunch" / "extra"
    pojav_prefs_dir = src_dir / "net" / "kdt" / "pojavlaunch" / "prefs"
    craftlira_pkg_dir = src_dir / "com" / "craftlira" / "launcher"

    pojav_extra_dir.mkdir(parents=True, exist_ok=True)
    pojav_prefs_dir.mkdir(parents=True, exist_ok=True)
    craftlira_pkg_dir.mkdir(parents=True, exist_ok=True)

    # Derleme stubs (runtime'da APK içindeki sınıflarla eşleşir)
    (src_dir / "net" / "kdt" / "pojavlaunch" / "Tools.java").write_text(
        'package net.kdt.pojavlaunch;\npublic class Tools { public static String DIR_ACCOUNT_NEW;\npublic static String DIR_GAME_HOME; }\n',
        encoding='utf-8'
    )
    (pojav_extra_dir / "ExtraCore.java").write_text(
        'package net.kdt.pojavlaunch.extra;\npublic class ExtraCore { public static void setValue(String k, Object v) {} }\n',
        encoding='utf-8'
    )
    (pojav_extra_dir / "ExtraConstants.java").write_text(
        'package net.kdt.pojavlaunch.extra;\npublic class ExtraConstants { public static final String LAUNCH_GAME = "launch_game"; }\n',
        encoding='utf-8'
    )
    (pojav_prefs_dir / "LauncherPreferences.java").write_text(
        'package net.kdt.pojavlaunch.prefs;\npublic class LauncherPreferences { public static android.content.SharedPreferences DEFAULT_PREF; }\n',
        encoding='utf-8'
    )

    # CraftLira Entegrasyon Sınıfı
    bridge_code = '''package com.craftlira.launcher;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import net.kdt.pojavlaunch.Tools;
import net.kdt.pojavlaunch.extra.ExtraConstants;
import net.kdt.pojavlaunch.extra.ExtraCore;
import net.kdt.pojavlaunch.prefs.LauncherPreferences;
import java.io.File;
import java.io.FileWriter;

public class CraftLiraIntegration {

    public static void init(final Activity activity) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Tam ekran özel CraftLira WebView oluştur ve aktiviteye ekle
                    WebView webView = new WebView(activity);
                    ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                    );
                    activity.addContentView(webView, params);

                    WebSettings settings = webView.getSettings();
                    settings.setJavaScriptEnabled(true);
                    settings.setDomStorageEnabled(true);
                    settings.setAllowFileAccess(true);
                    settings.setAllowContentAccess(true);
                    settings.setDatabaseEnabled(true);

                    webView.setWebViewClient(new WebViewClient());

                    webView.addJavascriptInterface(new Object() {
                        @JavascriptInterface
                        public void launchTowny(final String username, final int ramMb) {
                            new Handler(Looper.getMainLooper()).post(new Runnable() {
                                @Override
                                public void run() {
                                    try {
                                        setupAccount(username);
                                        setupPreferences(ramMb);
                                        // Pojav motorunu CraftLira Towny başlatması için tetikle
                                        ExtraCore.setValue(ExtraConstants.LAUNCH_GAME, Boolean.TRUE);
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                        }

                        @JavascriptInterface
                        public boolean isEngineReady() {
                            return true;
                        }
                    }, "CraftLiraNative");

                    // React web uygulamasını yerel assets/public içinden yükle
                    webView.loadUrl("file:///android_asset/public/index.html");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    private static void setupAccount(String username) {
        try {
            if (username == null || username.trim().isEmpty()) {
                username = "Oyuncu";
            }
            username = username.trim();

            File accDir = new File(Tools.DIR_ACCOUNT_NEW);
            if (!accDir.exists()) {
                accDir.mkdirs();
            }

            File accFile = new File(accDir, "craftlira.json");
            String json = "{\\n" +
                    "  \\"username\\": \\"" + username + "\\",\\n" +
                    "  \\"authType\\": \\"LOCAL\\",\\n" +
                    "  \\"isMicrosoft\\": false,\\n" +
                    "  \\"profileId\\": \\"00000000-0000-0000-0000-000000000000\\",\\n" +
                    "  \\"accessToken\\": \\"0\\\",\\n" +
                    "  \\"refreshToken\\": \\"0\\\",\\n" +
                    "  \\"expiresAt\\": 0\\n" +
                    "}";

            FileWriter writer = new FileWriter(accFile);
            writer.write(json);
            writer.close();

            if (LauncherPreferences.DEFAULT_PREF != null) {
                LauncherPreferences.DEFAULT_PREF.edit()
                        .putString("selected_account_file", "craftlira.json")
                        .commit();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void setupPreferences(int ramMb) {
        try {
            if (LauncherPreferences.DEFAULT_PREF != null) {
                SharedPreferences.Editor editor = LauncherPreferences.DEFAULT_PREF.edit();
                if (ramMb > 0) {
                    editor.putInt("ramAllocation", ramMb);
                }
                editor.commit();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
'''
    (craftlira_pkg_dir / "CraftLiraIntegration.java").write_text(bridge_code, encoding='utf-8')

    # javac ile derle
    java_files = [str(p) for p in src_dir.rglob("*.java")]
    bin_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(['javac', '-cp', str(ANDROID_JAR), '-d', str(bin_dir)] + java_files, check=True)

    # D8 ile dex oluştur
    dex_dir.mkdir(parents=True, exist_ok=True)
    class_files = [str(p) for p in (bin_dir / "com" / "craftlira" / "launcher").glob("*.class")]
    subprocess.run(['java', '-cp', str(R8_JAR), 'com.android.tools.r8.D8', '--output', str(dex_dir), '--lib', str(ANDROID_JAR)] + class_files, check=True)

    # Dex'i zipleyip apktool ile baksmali et
    dex_zip = temp_dir / "dex.zip"
    with zipfile.ZipFile(dex_zip, 'w') as z:
        z.write(dex_dir / "classes.dex", "classes.dex")

    smali_out = temp_dir / "smali_out"
    subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'd', str(dex_zip), '-o', str(smali_out), '-f'], check=True)

    # Smali dosyalarını hedef klasöre kopyala
    target_bridge_dir = dest_smali_dir / "com" / "craftlira" / "launcher"
    target_bridge_dir.mkdir(parents=True, exist_ok=True)

    generated_smalis = list((smali_out / "smali" / "com" / "craftlira" / "launcher").glob("*.smali"))
    for sf in generated_smalis:
        shutil.copy2(sf, target_bridge_dir / sf.name)
    print(f"[OK] {len(generated_smalis)} CraftLira Smali dosyası entegre edildi.")

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    print("=" * 65)
    print("  CraftLira Mobil - Tek Parca Tumlesik Client Uretici")
    print("  Sunucu: oyna.craftlira.com:25565 | Versiyon: Java 1.20.4 Towny")
    print("=" * 65)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    RELEASE_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Gerekli araçları kontrol et ve indir
    download_if_needed(APKTOOL_URL, APKTOOL_JAR, "Apktool")
    download_if_needed(UBER_SIGNER_URL, UBER_SIGNER_JAR, "Uber Apk Signer")
    download_if_needed(R8_URL, R8_JAR, "R8/D8 Compiler")
    download_if_needed(ANDROID_JAR_URL, ANDROID_JAR, "Android Platform SDK Jar")
    download_if_needed(BASE_ENGINE_URL, ENGINE_BASE_APK, "Temel Oyun Motoru (130 MB)")

    # 2. React Web Arayüzünü derle (npm run build)
    print("[+] React arayüzü derleniyor (npm run build)...")
    subprocess.run(['npm', 'run', 'build'], cwd=str(BASE_DIR), check=True, shell=True)

    dist_dir = BASE_DIR / "dist"
    if not (dist_dir / "index.html").exists():
        raise FileNotFoundError("dist/index.html derlenemedi!")
    print(f"[OK] React arayüzü derlendi: {dist_dir}")

    # 3. Motor APK'sını decompile et (varsa cache/decompiled kullan veya yeniden çıkar)
    decompiled_dir = BUILD_DIR / "decompiled"
    if not (decompiled_dir / "AndroidManifest.xml").exists():
        print("[+] Oyun motoru ayrıştırılıyor (Apktool)...")
        subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'd', str(ENGINE_BASE_APK), '-o', str(decompiled_dir), '-f'], check=True)
    else:
        print("[*] Mevcut ayrıştırılmış motor kullanılıyor.")

    # 4. CraftLira Entegrasyon Köprüsünü derle ve smali olarak yerleştir
    dest_smali = decompiled_dir / "smali_classes3"
    compile_integration_bridge(dest_smali)

    # 5. LauncherActivity.smali içine CraftLiraIntegration.init() çağrısı ekle
    launcher_act_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "LauncherActivity.smali"
    if launcher_act_smali.exists():
        content = launcher_act_smali.read_text(encoding='utf-8', errors='ignore')
        hook_code = "    invoke-static {p0}, Lcom/craftlira/launcher/CraftLiraIntegration;->init(Landroid/app/Activity;)V\n"
        if "Lcom/craftlira/launcher/CraftLiraIntegration;->init" not in content:
            # bindViews() çağrısından sonraya ekle
            target = "invoke-direct {p0}, Lnet/kdt/pojavlaunch/LauncherActivity;->bindViews()V"
            if target in content:
                content = content.replace(target, target + "\n\n" + hook_code)
                launcher_act_smali.write_text(content, encoding='utf-8')
                print("[OK] LauncherActivity.smali içine CraftLira ana arayüz yükleyici eklendi.")
            else:
                print("[-] bindViews bulunamadı, onCreate kontrol ediliyor...")
        else:
            print("[*] LauncherActivity.smali hook zaten mevcut.")

    # 6. GameRunner.smali içine oyna.craftlira.com:25565 otomatik bağlantısını ekle
    gamerunner_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "utils" / "jre" / "GameRunner.smali"
    if gamerunner_smali.exists():
        gr_content = gamerunner_smali.read_text(encoding='utf-8', errors='ignore')
        if "--quickPlayMultiplayer" not in gr_content:
            target_code = "invoke-static {p0, v3}, Lnet/kdt/pojavlaunch/utils/JSONUtils;->insertJSONValueList(Ljava/util/List;Ljava/util/Map;)Ljava/util/List;\n\n    move-result-object p0"
            replacement_code = """invoke-static {p0, v3}, Lnet/kdt/pojavlaunch/utils/JSONUtils;->insertJSONValueList(Ljava/util/List;Ljava/util/Map;)Ljava/util/List;

    move-result-object p0

    const-string v0, "--quickPlayMultiplayer"

    invoke-interface {p0, v0}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    const-string v0, "oyna.craftlira.com:25565"

    invoke-interface {p0, v0}, Ljava/util/List;->add(Ljava/lang/Object;)Z"""
            if target_code in gr_content:
                gr_content = gr_content.replace(target_code, replacement_code)
                gamerunner_smali.write_text(gr_content, encoding='utf-8')
                print("[OK] GameRunner.smali: oyna.craftlira.com:25565 doğrudan bağlantı kodu eklendi.")
        else:
            print("[*] GameRunner.smali doğrudan sunucu bağlantısı zaten mevcut.")

    # 7. Varsayılan versiyonu 1.20.4 olarak ayarla (Instances.smali)
    instances_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "instances" / "Instances.smali"
    if instances_smali.exists():
        inst_content = instances_smali.read_text(encoding='utf-8', errors='ignore')
        inst_content = inst_content.replace('const-string v0, "1.12.2"', 'const-string v0, "1.20.4"')
        inst_content = inst_content.replace('const-string v0, "latest_release"', 'const-string v0, "1.20.4"')
        instances_smali.write_text(inst_content, encoding='utf-8')
        print("[OK] Instances.smali: Varsayılan sürüm 1.20.4 (CraftLira Towny) olarak yapılandırıldı.")

    # 8. React UI dosyalarını assets/public/ altına yerleştir
    assets_public_dir = decompiled_dir / "assets" / "public"
    if assets_public_dir.exists():
        shutil.rmtree(assets_public_dir)
    shutil.copytree(dist_dir, assets_public_dir)
    print(f"[OK] React varlıkları assets/public içine kopyalandı ({len(list(assets_public_dir.rglob('*')))} dosya).")

    # 9. Marka ve İsimlendirme (strings.xml ve AndroidManifest.xml)
    res_dir = decompiled_dir / "res"
    if res_dir.exists():
        for val_dir in res_dir.glob("values*"):
            strings_xml = val_dir / "strings.xml"
            if strings_xml.exists():
                try:
                    s_content = strings_xml.read_text(encoding="utf-8", errors="ignore")
                    s_content = re.sub(r'<string name="app_name">.*?</string>', '<string name="app_name">CraftLira Mobil</string>', s_content)
                    s_content = re.sub(r'<string name="app_short_name">.*?</string>', '<string name="app_short_name">CraftLira</string>', s_content)
                    s_content = s_content.replace("PojavLauncher", "CraftLira")
                    s_content = s_content.replace("pojavlauncher", "craftlira")
                    strings_xml.write_text(s_content, encoding="utf-8")
                except Exception:
                    pass

    manifest_xml = decompiled_dir / "AndroidManifest.xml"
    if manifest_xml.exists():
        m_content = manifest_xml.read_text(encoding="utf-8", errors="ignore")
        m_content = re.sub(r'android:label=".*?"', 'android:label="CraftLira Mobil"', m_content, count=1)
        manifest_xml.write_text(m_content, encoding="utf-8")
        print("[OK] AndroidManifest.xml uygulama etiketi 'CraftLira Mobil' yapıldı.")

    # 10. Uygulama Simgelerini CraftLira Tilki Logosu ile değiştir
    if MASCOT_PATH.exists():
        mascot_bytes = MASCOT_PATH.read_bytes()
        icon_count = 0
        for icon in res_dir.glob("**/ic_launcher*.png"):
            try:
                icon.write_bytes(mascot_bytes)
                icon_count += 1
            except Exception:
                pass
        print(f"[OK] {icon_count} adet uygulama ikonu CraftLira Tilki simgesi ile güncellendi.")

    # 11. Apktool ile derle
    unaligned_apk = BUILD_DIR / "CraftLira-unaligned.apk"
    print("[+] Tek parça CraftLira APK derleniyor (Apktool)...")
    subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'b', str(decompiled_dir), '--use-aapt2', '-o', str(unaligned_apk)], check=True)

    # 12. Uber Apk Signer ile imzala ve zipalign et
    print("[+] APK imzalanıyor ve optimize ediliyor (Uber Apk Signer)...")
    signed_dir = BUILD_DIR / "signed"
    if signed_dir.exists():
        shutil.rmtree(signed_dir)
    signed_dir.mkdir(parents=True, exist_ok=True)

    subprocess.run(['java', '-jar', str(UBER_SIGNER_JAR), '-a', str(unaligned_apk), '--out', str(signed_dir)], check=True)

    signed_apks = list(signed_dir.glob("*.apk"))
    if not signed_apks:
        raise FileNotFoundError("Uber Apk Signer imzalanmış APK üretemedi!")

    final_apk = RELEASE_DIR / "CraftLira-Mobil.apk"
    shutil.copy2(signed_apks[0], final_apk)

    size_mb = final_apk.stat().st_size // (1024 * 1024)
    print("=" * 65)
    print(f"[BAŞARILI] Tek Parça Tam İstemci Hazır!")
    print(f"  Konum : {final_apk}")
    print(f"  Boyut : {size_mb} MB")
    print(f"  Sunucu: oyna.craftlira.com:25565")
    print("=" * 65)

if __name__ == '__main__':
    main()
