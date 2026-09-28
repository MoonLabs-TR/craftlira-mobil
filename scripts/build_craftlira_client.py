#!/usr/bin/env python3
"""
CraftLira Mobil - Tek Parça Tam İstemci Derleyici (V2)
- Ana Giriş Aktivitesi: CraftLiraMainActivity (Özel React Arayüzünü doğrudan açar)
- İkinci uygulama yok, harici kurulum yok, Pojav menüsü yok
- Ücretsiz / Offline hesap desteği
- oyna.craftlira.com:25565 Towny doğrudan sunucu bağlantısı
- 140MB tek parça APK
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

def download_if_needed(url: str, dest: Path, desc: str, min_size: int = 500000):
    if dest.exists() and dest.stat().st_size > min_size:
        print(f"[*] {desc} zaten mevcut: {dest.name} ({dest.stat().st_size // 1024} KB)")
        return
    print(f"[+] {desc} indiriliyor: {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out_file:
        shutil.copyfileobj(resp, out_file)
    print(f"[OK] {desc} indirildi ({dest.stat().st_size // 1024} KB)")

def compile_main_activity(dest_smali_dir: Path):
    """CraftLiraMainActivity sınıfını derler ve smali üretir."""
    print("[+] CraftLiraMainActivity (Ana Başlatıcı Aktivite) derleniyor...")
    temp_dir = BUILD_DIR / "temp_act"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)

    src_dir = temp_dir / "src"
    bin_dir = temp_dir / "bin"
    dex_dir = temp_dir / "dex"

    pojav_pkg = src_dir / "net" / "kdt" / "pojavlaunch"
    pojav_extra = pojav_pkg / "extra"
    pojav_prefs = pojav_pkg / "prefs"
    craftlira_pkg = src_dir / "com" / "craftlira" / "launcher"

    pojav_pkg.mkdir(parents=True, exist_ok=True)
    pojav_extra.mkdir(parents=True, exist_ok=True)
    pojav_prefs.mkdir(parents=True, exist_ok=True)
    craftlira_pkg.mkdir(parents=True, exist_ok=True)

    # Stubs for compilation
    (pojav_pkg / "LauncherActivity.java").write_text(
        'package net.kdt.pojavlaunch;\npublic class LauncherActivity extends android.app.Activity {}\n',
        encoding='utf-8'
    )
    (pojav_pkg / "Tools.java").write_text(
        'package net.kdt.pojavlaunch;\npublic class Tools { public static String DIR_ACCOUNT_NEW; }\n',
        encoding='utf-8'
    )
    (pojav_extra / "ExtraCore.java").write_text(
        'package net.kdt.pojavlaunch.extra;\npublic class ExtraCore { public static void setValue(String k, Object v) {} }\n',
        encoding='utf-8'
    )
    (pojav_extra / "ExtraConstants.java").write_text(
        'package net.kdt.pojavlaunch.extra;\npublic class ExtraConstants { public static final String LAUNCH_GAME = "launch_game"; }\n',
        encoding='utf-8'
    )
    (pojav_prefs / "LauncherPreferences.java").write_text(
        'package net.kdt.pojavlaunch.prefs;\npublic class LauncherPreferences { public static android.content.SharedPreferences DEFAULT_PREF; }\n',
        encoding='utf-8'
    )

    act_code = '''package com.craftlira.launcher;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import net.kdt.pojavlaunch.LauncherActivity;
import net.kdt.pojavlaunch.Tools;
import net.kdt.pojavlaunch.extra.ExtraConstants;
import net.kdt.pojavlaunch.extra.ExtraCore;
import net.kdt.pojavlaunch.prefs.LauncherPreferences;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;

public class CraftLiraMainActivity extends Activity {

    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            try {
                WebView.setDataDirectorySuffix("craftlira");
            } catch (Throwable ignored) {}
        }

        try {
            mWebView = new WebView(this);
            mWebView.setBackgroundColor(0xFF0D0F14);

            ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
            );
            setContentView(mWebView, params);

            WebSettings settings = mWebView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setDatabaseEnabled(true);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            mWebView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    Log.d("CraftLiraWeb", "[" + consoleMessage.messageLevel() + "] "
                            + consoleMessage.message() + " ("
                            + consoleMessage.sourceId() + ":"
                            + consoleMessage.lineNumber() + ")");
                    return true;
                }
            });

            mWebView.setWebViewClient(new WebViewClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        WebResourceResponse resp = handleAsset(request.getUrl().toString());
                        if (resp != null) return resp;
                    }
                    return super.shouldInterceptRequest(view, request);
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                    WebResourceResponse resp = handleAsset(url);
                    if (resp != null) return resp;
                    return super.shouldInterceptRequest(view, url);
                }

                private WebResourceResponse handleAsset(String url) {
                    if (url == null) return null;
                    if (url.contains("android_asset/public/")) {
                        try {
                            int idx = url.indexOf("android_asset/public/");
                            String subPath = url.substring(idx + "android_asset/public/".length());
                            int q = subPath.indexOf('?');
                            if (q != -1) subPath = subPath.substring(0, q);
                            int h = subPath.indexOf('#');
                            if (h != -1) subPath = subPath.substring(0, h);
                            if (subPath.isEmpty()) subPath = "index.html";

                            String mimeType = "application/octet-stream";
                            if (subPath.endsWith(".html")) mimeType = "text/html";
                            else if (subPath.endsWith(".js")) mimeType = "text/javascript";
                            else if (subPath.endsWith(".css")) mimeType = "text/css";
                            else if (subPath.endsWith(".json")) mimeType = "application/json";
                            else if (subPath.endsWith(".png")) mimeType = "image/png";
                            else if (subPath.endsWith(".jpg") || subPath.endsWith(".jpeg")) mimeType = "image/jpeg";
                            else if (subPath.endsWith(".svg")) mimeType = "image/svg+xml";
                            else if (subPath.endsWith(".woff2")) mimeType = "font/woff2";
                            else if (subPath.endsWith(".woff")) mimeType = "font/woff";
                            else if (subPath.endsWith(".ttf")) mimeType = "font/ttf";
                            else if (subPath.endsWith(".mp3")) mimeType = "audio/mpeg";

                            InputStream is = getAssets().open("public/" + subPath);
                            return new WebResourceResponse(mimeType, "UTF-8", is);
                        } catch (Throwable t) {
                            Log.w("CraftLiraWeb", "Asset load error: " + url + " - " + t.getMessage());
                        }
                    }
                    return null;
                }

                @Override
                public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                    Log.e("CraftLiraWeb", "WebView Error: " + errorCode + " - " + description + " URL: " + failingUrl);
                }
            });

            mWebView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void launchTowny(final String username, final int ramMb) {
                    new Handler(Looper.getMainLooper()).post(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                prepareAndLaunch(username, ramMb);
                            } catch (Throwable t) {
                                t.printStackTrace();
                            }
                        }
                    });
                }

                @JavascriptInterface
                public boolean isEngineReady() {
                    return true;
                }
            }, "CraftLiraNative");

            mWebView.loadUrl("file:///android_asset/public/index.html");
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }


    private void prepareAndLaunch(String username, int ramMb) {
        try {
            if (username == null || username.trim().isEmpty()) {
                username = "Oyuncu";
            }
            username = username.trim();

            try {
                File accDir = new File(getFilesDir(), "accounts");
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

                SharedPreferences prefs = getSharedPreferences("net.kdt.pojavlaunch_preferences", MODE_PRIVATE);
                prefs.edit().putString("selected_account_file", "craftlira.json").commit();
                if (LauncherPreferences.DEFAULT_PREF != null) {
                    LauncherPreferences.DEFAULT_PREF.edit().putString("selected_account_file", "craftlira.json").commit();
                }
            } catch (Throwable ignored) {}

            try {
                if (ramMb > 0) {
                    SharedPreferences prefs = getSharedPreferences("net.kdt.pojavlaunch_preferences", MODE_PRIVATE);
                    prefs.edit().putInt("ramAllocation", ramMb).commit();
                    if (LauncherPreferences.DEFAULT_PREF != null) {
                        LauncherPreferences.DEFAULT_PREF.edit().putInt("ramAllocation", ramMb).commit();
                    }
                }
            } catch (Throwable ignored) {}

            Intent launchIntent = new Intent(this, LauncherActivity.class);
            launchIntent.putExtra("auto_launch_craftlira", true);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(launchIntent);

            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    try {
                        ExtraCore.setValue(ExtraConstants.LAUNCH_GAME, Boolean.TRUE);
                    } catch (Throwable ignored) {}
                }
            }, 600);

        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
'''
    (craftlira_pkg / "CraftLiraMainActivity.java").write_text(act_code, encoding='utf-8')

    java_files = [str(p) for p in src_dir.rglob("*.java")]
    bin_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(['javac', '-cp', str(ANDROID_JAR), '-d', str(bin_dir)] + java_files, check=True)

    dex_dir.mkdir(parents=True, exist_ok=True)
    class_files = [str(p) for p in (bin_dir / "com" / "craftlira" / "launcher").glob("*.class")]
    subprocess.run(['java', '-cp', str(R8_JAR), 'com.android.tools.r8.D8', '--output', str(dex_dir), '--lib', str(ANDROID_JAR)] + class_files, check=True)

    dex_zip = temp_dir / "dex.zip"
    with zipfile.ZipFile(dex_zip, 'w') as z:
        z.write(dex_dir / "classes.dex", "classes.dex")

    smali_out = temp_dir / "smali_out"
    subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'd', str(dex_zip), '-o', str(smali_out), '-f'], check=True)

    target_bridge_dir = dest_smali_dir / "com" / "craftlira" / "launcher"
    target_bridge_dir.mkdir(parents=True, exist_ok=True)

    generated_smalis = list((smali_out / "smali" / "com" / "craftlira" / "launcher").glob("*.smali"))
    for sf in generated_smalis:
        shutil.copy2(sf, target_bridge_dir / sf.name)
    print(f"[OK] {len(generated_smalis)} CraftLira Smali dosyası entegre edildi.")

def patch_manifest(decompiled_dir: Path):
    """AndroidManifest.xml dosyasını yapılandırır."""
    manifest_file = decompiled_dir / "AndroidManifest.xml"
    content = manifest_file.read_text(encoding="utf-8")

    # 1. <application> içinden android:process=":launcher" kaldır
    content = content.replace('android:process=":launcher"', '')

    # 2. android:requestLegacyExternalStorage="true" ekle
    if 'android:requestLegacyExternalStorage="true"' not in content:
        content = content.replace('<application ', '<application android:requestLegacyExternalStorage="true" ')

    # 3. TestStorageActivity içinden MAIN / LAUNCHER intent filter'ını kaldır
    pattern_test = r'(<activity[^>]*?TestStorageActivity[^>]*?>)(.*?)(</activity>)'
    def replace_test_activity(match):
        inner = match.group(2)
        inner_cleaned = re.sub(r'<intent-filter>.*?</intent-filter>', '', inner, flags=re.DOTALL)
        tag = match.group(1).replace('android:exported="true"', 'android:exported="false"')
        return tag + inner_cleaned + match.group(3)

    content = re.sub(pattern_test, replace_test_activity, content, flags=re.DOTALL)

    # 4. CraftLiraMainActivity'yi MAIN ve LAUNCHER olarak ekle
    craftlira_activity_xml = '''
        <activity
            android:name="com.craftlira.launcher.CraftLiraMainActivity"
            android:label="CraftLira Mobil"
            android:theme="@style/AppTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>'''

    if "com.craftlira.launcher.CraftLiraMainActivity" not in content:
        content = content.replace('</application>', craftlira_activity_xml + '\n    </application>')

    # 5. LauncherActivity'yi exported=true yap
    content = content.replace(
        '<activity android:label="@string/app_short_name" android:name="net.kdt.pojavlaunch.LauncherActivity"',
        '<activity android:exported="true" android:label="@string/app_short_name" android:name="net.kdt.pojavlaunch.LauncherActivity"'
    )

    manifest_file.write_text(content, encoding="utf-8")
    print("[OK] AndroidManifest.xml: CraftLiraMainActivity ana başlatıcı yapıldı.")

def patch_smali_engine(decompiled_dir: Path):
    """Pojav smali kodlarına oyna.craftlira.com otomatik bağlantı ve depolama bypass ekler."""
    # 1. Tools.checkStorageRoot -> her zaman true döndür (MissingStorageActivity crash'ini engeller)
    tools_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "Tools.smali"
    if tools_smali.exists():
        t_content = tools_smali.read_text(encoding="utf-8")
        target_method = """.method public static checkStorageRoot(Landroid/content/Context;)Z
    .locals 0

    .line 147
    invoke-static {p0}, Lnet/kdt/pojavlaunch/Tools;->getPojavStorageRoot(Landroid/content/Context;)Ljava/io/File;

    move-result-object p0

    if-eqz p0, :cond_0

    const/4 p0, 0x1

    return p0

    :cond_0
    const/4 p0, 0x0

    return p0
.end method"""
        replacement_method = """.method public static checkStorageRoot(Landroid/content/Context;)Z
    .locals 0

    const/4 v0, 0x1

    return v0
.end method"""
        if target_method in t_content:
            t_content = t_content.replace(target_method, replacement_method)
            tools_smali.write_text(t_content, encoding="utf-8")
            print("[OK] Tools.smali: checkStorageRoot daima true olarak ayarlandı.")

    # 2. GameRunner.smali: oyna.craftlira.com:25565 doğrudan sunucuya bağlan
    gamerunner_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "utils" / "jre" / "GameRunner.smali"
    if gamerunner_smali.exists():
        gr_content = gamerunner_smali.read_text(encoding="utf-8")
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
                gamerunner_smali.write_text(gr_content, encoding="utf-8")
                print("[OK] GameRunner.smali: oyna.craftlira.com:25565 doğrudan bağlantı kodu eklendi.")

    # 3. Instances.smali: Varsayılan versiyon 1.20.4
    instances_smali = decompiled_dir / "smali_classes3" / "net" / "kdt" / "pojavlaunch" / "instances" / "Instances.smali"
    if instances_smali.exists():
        inst_content = instances_smali.read_text(encoding="utf-8")
        inst_content = inst_content.replace('const-string v0, "1.12.2"', 'const-string v0, "1.20.4"')
        inst_content = inst_content.replace('const-string v0, "latest_release"', 'const-string v0, "1.20.4"')
        instances_smali.write_text(inst_content, encoding="utf-8")
        print("[OK] Instances.smali: Varsayılan sürüm 1.20.4 yapıldı.")

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    print("=" * 65)
    print("  CraftLira Mobil - Tek Parça Tam İstemci Derleyici (V2)")
    print("  Sunucu: oyna.craftlira.com:25565 | Versiyon: Java 1.20.4 Towny")
    print("=" * 65)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    RELEASE_DIR.mkdir(parents=True, exist_ok=True)

    download_if_needed(APKTOOL_URL, APKTOOL_JAR, "Apktool")
    download_if_needed(UBER_SIGNER_URL, UBER_SIGNER_JAR, "Uber Apk Signer")
    download_if_needed(R8_URL, R8_JAR, "R8/D8 Compiler")
    download_if_needed(ANDROID_JAR_URL, ANDROID_JAR, "Android Platform SDK Jar")
    download_if_needed(BASE_ENGINE_URL, ENGINE_BASE_APK, "Temel Oyun Motoru (130 MB)", min_size=50000000)

    # 1. React Web Arayüzünü her zaman temizleyip derle
    dist_dir = BASE_DIR / "dist"
    print("[+] React arayüzü güncel kodlarla derleniyor...")
    if os.name == 'nt':
        subprocess.run(["npm.cmd", "run", "build"], cwd=str(BASE_DIR), check=True)
    else:
        subprocess.run(["npm", "run", "build"], cwd=str(BASE_DIR), check=True)
    print(f"[OK] React arayüzü hazır: {dist_dir}")

    # 2. Motor APK'sını decompile et
    decompiled_dir = BUILD_DIR / "decompiled"
    if not (decompiled_dir / "AndroidManifest.xml").exists():
        print("[+] Oyun motoru ayrıştırılıyor (Apktool)...")
        subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'd', str(ENGINE_BASE_APK), '-o', str(decompiled_dir), '-f'], check=True)
    else:
        print("[*] Mevcut ayrıştırılmış motor kullanılıyor.")

    # 3. CraftLiraMainActivity derle ve yerleştir
    dest_smali = decompiled_dir / "smali_classes3"
    compile_main_activity(dest_smali)

    # 4. Manifest ve Smali yamalarını uygula
    patch_manifest(decompiled_dir)
    patch_smali_engine(decompiled_dir)

    # 5. React dosyalarını assets/public içine yerleştir ve index.html'i Android WebView için optimize et
    assets_public_dir = decompiled_dir / "assets" / "public"
    if assets_public_dir.exists():
        shutil.rmtree(assets_public_dir)
    shutil.copytree(dist_dir, assets_public_dir)

    target_index_html = assets_public_dir / "index.html"
    if target_index_html.exists():
        h_content = target_index_html.read_text(encoding="utf-8")
        # 1. Mutlak yolları (örn: /assets/) göreli yollara (./assets/) dönüştür
        h_content = re.sub(r'href="/assets/', 'href="./assets/', h_content)
        h_content = re.sub(r'src="/assets/', 'src="./assets/', h_content)
        # 2. Chromium strict MIME type ve CORS blokajını engellemek için type="module" ve crossorigin'i temizle
        h_content = re.sub(r'<script\s+type="module"\s+crossorigin\s+src="([^"]+)">\s*</script>', r'<script defer src="\1"></script>', h_content)
        h_content = re.sub(r'<script\s+type="module"\s+src="([^"]+)">\s*</script>', r'<script defer src="\1"></script>', h_content)
        h_content = h_content.replace(' crossorigin', '').replace('crossorigin ', '').replace('crossorigin', '')
        target_index_html.write_text(h_content, encoding="utf-8")
        print("[OK] assets/public/index.html göreli yollar ve defer script ile Android WebView için optimize edildi.")
    print(f"[OK] React varlıkları assets/public içine kopyalandı.")

    # 6. Marka ve İsimlendirme
    res_dir = decompiled_dir / "res"
    if res_dir.exists():
        for val_dir in res_dir.glob("values*"):
            strings_xml = val_dir / "strings.xml"
            if strings_xml.exists():
                try:
                    s_content = strings_xml.read_text(encoding="utf-8", errors="ignore")
                    s_content = re.sub(r'<string name="app_name">.*?</string>', '<string name="app_name">CraftLira Mobil</string>', s_content)
                    s_content = re.sub(r'<string name="app_short_name">.*?</string>', '<string name="app_short_name">CraftLira</string>', s_content)
                    strings_xml.write_text(s_content, encoding="utf-8")
                except Exception:
                    pass

    # 7. İkonları CraftLira Tilki simgesi ile güncelle
    if MASCOT_PATH.exists():
        mascot_bytes = MASCOT_PATH.read_bytes()
        icon_count = 0
        for icon in res_dir.glob("**/ic_launcher*.png"):
            try:
                icon.write_bytes(mascot_bytes)
                icon_count += 1
            except Exception:
                pass
        print(f"[OK] {icon_count} adet uygulama ikonu güncellendi.")

    # 8. Rebuild APK
    unaligned_apk = BUILD_DIR / "CraftLira-unaligned.apk"
    print("[+] Tek parça CraftLira APK derleniyor (Apktool)...")
    subprocess.run(['java', '-jar', str(APKTOOL_JAR), 'b', str(decompiled_dir), '--use-aapt2', '-o', str(unaligned_apk)], check=True)

    # 9. Sign APK
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
