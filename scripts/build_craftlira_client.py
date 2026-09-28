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
    pojav_utils = src_dir / "net" / "kdt" / "pojavlaunch" / "utils"
    craftlira_pkg = src_dir / "com" / "craftlira" / "launcher"

    pojav_pkg.mkdir(parents=True, exist_ok=True)
    pojav_extra.mkdir(parents=True, exist_ok=True)
    pojav_prefs.mkdir(parents=True, exist_ok=True)
    pojav_utils.mkdir(parents=True, exist_ok=True)
    craftlira_pkg.mkdir(parents=True, exist_ok=True)

    # Stubs for compilation
    (pojav_pkg / "LauncherActivity.java").write_text(
        'package net.kdt.pojavlaunch;\npublic class LauncherActivity extends android.app.Activity {}\n',
        encoding='utf-8'
    )
    (pojav_pkg / "Tools.java").write_text(
        'package net.kdt.pojavlaunch;\npublic class Tools {\n'
        '    public static String DIR_ACCOUNT_NEW;\n'
        '    public static String DIR_GAME_HOME;\n'
        '    public static void initStorageConstants(android.content.Context c) {}\n'
        '    public static void initEarlyConstants(android.content.Context c) {}\n'
        '}\n',
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
        'package net.kdt.pojavlaunch.prefs;\npublic class LauncherPreferences {\n'
        '    public static android.content.SharedPreferences DEFAULT_PREF;\n'
        '    public static void loadPreferences(android.content.Context c) {}\n'
        '}\n',
        encoding='utf-8'
    )
    (pojav_utils / "LocaleUtils.java").write_text(
        'package net.kdt.pojavlaunch.utils;\npublic class LocaleUtils {\n'
        '    public static android.content.ContextWrapper setLocale(android.content.Context c) { return null; }\n'
        '}\n',
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
import android.preference.PreferenceManager;
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
import net.kdt.pojavlaunch.utils.LocaleUtils;
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

        // Pojav çekirdek ve dil sabitlerini erken başlat
        try {
            Tools.initStorageConstants(this);
            LocaleUtils.setLocale(this);
            LauncherPreferences.loadPreferences(this);
        } catch (Throwable ignored) {}

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
                    try {
                        // 1. Logolar, Bannerlar ve İkonlar için garantili doğrudan fast-path
                        if (url.contains("mascot-transparent.png")) {
                            InputStream is = getAssets().open("public/assets/mascot-transparent.png");
                            return new WebResourceResponse("image/png", null, is);
                        }
                        if (url.contains("banner.jpg")) {
                            InputStream is = getAssets().open("public/assets/banner.jpg");
                            return new WebResourceResponse("image/jpeg", null, is);
                        }
                        if (url.contains("mascot.png")) {
                            InputStream is = getAssets().open("public/assets/mascot.png");
                            return new WebResourceResponse("image/png", null, is);
                        }
                        if (url.contains("favicon.svg")) {
                            InputStream is = getAssets().open("public/favicon.svg");
                            return new WebResourceResponse("image/svg+xml", "UTF-8", is);
                        }
                        if (url.contains("icons.svg")) {
                            InputStream is = getAssets().open("public/icons.svg");
                            return new WebResourceResponse("image/svg+xml", "UTF-8", is);
                        }

                        // 2. Genel asset çözümleyici
                        String subPath = null;
                        if (url.contains("android_asset/public/")) {
                            int idx = url.indexOf("android_asset/public/");
                            subPath = url.substring(idx + "android_asset/public/".length());
                        } else if (url.contains("assets/")) {
                            int idx = url.indexOf("assets/");
                            subPath = url.substring(idx);
                        } else if (url.startsWith("file:///")) {
                            subPath = url.substring("file:///".length());
                        }
                        if (subPath != null) {
                            int q = subPath.indexOf('?');
                            if (q != -1) subPath = subPath.substring(0, q);
                            int h = subPath.indexOf('#');
                            if (h != -1) subPath = subPath.substring(0, h);
                            if (subPath.isEmpty()) subPath = "index.html";

                            String mimeType = "application/octet-stream";
                            String encoding = null;
                            if (subPath.endsWith(".html")) { mimeType = "text/html"; encoding = "UTF-8"; }
                            else if (subPath.endsWith(".js")) { mimeType = "text/javascript"; encoding = "UTF-8"; }
                            else if (subPath.endsWith(".css")) { mimeType = "text/css"; encoding = "UTF-8"; }
                            else if (subPath.endsWith(".json")) { mimeType = "application/json"; encoding = "UTF-8"; }
                            else if (subPath.endsWith(".png")) mimeType = "image/png";
                            else if (subPath.endsWith(".jpg") || subPath.endsWith(".jpeg")) mimeType = "image/jpeg";
                            else if (subPath.endsWith(".svg")) { mimeType = "image/svg+xml"; encoding = "UTF-8"; }
                            else if (subPath.endsWith(".webp")) mimeType = "image/webp";
                            else if (subPath.endsWith(".woff2")) mimeType = "font/woff2";
                            else if (subPath.endsWith(".woff")) mimeType = "font/woff";
                            else if (subPath.endsWith(".ttf")) mimeType = "font/ttf";
                            else if (subPath.endsWith(".mp3")) mimeType = "audio/mpeg";

                            InputStream is = null;
                            String clean = subPath;
                            while (clean.startsWith("/")) clean = clean.substring(1);
                            if (clean.startsWith("public/")) clean = clean.substring(7);

                            String[] candidates = new String[] {
                                "public/" + clean,
                                "public/assets/" + clean,
                                clean.startsWith("assets/") ? "public/" + clean : "public/assets/" + clean,
                                clean
                            };
                            for (String cand : candidates) {
                                try {
                                    is = getAssets().open(cand);
                                    if (is != null) break;
                                } catch (Throwable ignored) {}
                            }

                            if (is != null) {
                                return new WebResourceResponse(mimeType, encoding, is);
                            }
                        }
                    } catch (Throwable t) {
                        Log.w("CraftLiraWeb", "Asset load error: " + url + " - " + t.getMessage());
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
                Tools.initStorageConstants(this);
                LocaleUtils.setLocale(this);
                LauncherPreferences.loadPreferences(this);
            } catch (Throwable ignored) {}

            // 1. Ücretsiz/Offline hesap dosyasını (craftlira.json) Pojav'ın erişebileceği tüm dizinlere kaydet
            String json = "{\\n" +
                    "  \\"username\\": \\"" + username + "\\",\\n" +
                    "  \\"authType\\": \\"LOCAL\\",\\n" +
                    "  \\"isMicrosoft\\": false,\\n" +
                    "  \\"profileId\\": \\"00000000-0000-0000-0000-000000000000\\",\\n" +
                    "  \\"accessToken\\": \\"0\\",\\n" +
                    "  \\"refreshToken\\": \\"0\\",\\n" +
                    "  \\"expiresAt\\": 0\\n" +
                    "}";

            File[] accountDirs = new File[] {
                getFilesDir().getParentFile() != null ? new File(getFilesDir().getParentFile(), "accounts") : null,
                new File(getFilesDir(), "accounts"),
                Tools.DIR_ACCOUNT_NEW != null ? new File(Tools.DIR_ACCOUNT_NEW) : null
            };

            for (File accDir : accountDirs) {
                if (accDir == null) continue;
                try {
                    if (!accDir.exists()) {
                        accDir.mkdirs();
                    }
                    File accFile = new File(accDir, "craftlira.json");
                    FileWriter writer = new FileWriter(accFile);
                    writer.write(json);
                    writer.close();
                } catch (Throwable ignored) {}
            }

            // 2. Tercihleri (seçili hesap, sürüm ve RAM) tüm SharedPreferences kayıtlarına yaz
            try {
                SharedPreferences prefs1 = getSharedPreferences("net.kdt.pojavlaunch_preferences", MODE_PRIVATE);
                prefs1.edit().putString("selected_account_file", "craftlira.json").putString("currentInstance", "1.20.4").commit();

                SharedPreferences prefs2 = PreferenceManager.getDefaultSharedPreferences(this);
                prefs2.edit().putString("selected_account_file", "craftlira.json").putString("currentInstance", "1.20.4").commit();

                if (LauncherPreferences.DEFAULT_PREF != null) {
                    LauncherPreferences.DEFAULT_PREF.edit().putString("selected_account_file", "craftlira.json").putString("currentInstance", "1.20.4").commit();
                }

                if (ramMb > 0) {
                    prefs1.edit().putInt("ramAllocation", ramMb).commit();
                    prefs2.edit().putInt("ramAllocation", ramMb).commit();
                    if (LauncherPreferences.DEFAULT_PREF != null) {
                        LauncherPreferences.DEFAULT_PREF.edit().putInt("ramAllocation", ramMb).commit();
                    }
                }
            } catch (Throwable ignored) {}

            // 3. 1.20.4 Towny instance profilinin diskte mevcut olduğundan emin ol
            try {
                String instanceJson = "{\\n" +
                        "  \\"name\\": \\"1.20.4\\",\\n" +
                        "  \\"versionId\\": \\"1.20.4\\",\\n" +
                        "  \\"icon\\": \\"default\\",\\n" +
                        "  \\"sharedData\\": true,\\n" +
                        "  \\"argsMode\\": 1\\n" +
                        "}";
                File[] instDirs = new File[] {
                    new File(Tools.DIR_GAME_HOME != null ? Tools.DIR_GAME_HOME : getFilesDir().getAbsolutePath(), "instances/1.20.4"),
                    new File(getFilesDir(), "instances/1.20.4"),
                    getFilesDir().getParentFile() != null ? new File(getFilesDir().getParentFile(), "instances/1.20.4") : null
                };
                for (File idir : instDirs) {
                    if (idir == null) continue;
                    try {
                        if (!idir.exists()) idir.mkdirs();
                        File mFile = new File(idir, "mojo_instance.json");
                        FileWriter fw = new FileWriter(mFile);
                        fw.write(instanceJson);
                        fw.close();
                    } catch (Throwable ignored) {}
                }
            } catch (Throwable ignored) {}

            // 4. Arka planda şeffaf çalışan LauncherActivity'yi tetikle (Pojav menüsü görünmez, doğrudan Minecraft açılır)
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
            }, 500);

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

    # 5. LauncherActivity'yi exported=true ve TranslucentAppTheme yap (Menü arkaplanda şeffaf kalır)
    if 'android:theme="@style/TranslucentAppTheme"' not in content:
        content = re.sub(
            r'<activity\s+[^>]*?android:name="net\.kdt\.pojavlaunch\.LauncherActivity"[^>]*?/>',
            '<activity android:exported="true" android:label="@string/app_short_name" android:name="net.kdt.pojavlaunch.LauncherActivity" android:theme="@style/TranslucentAppTheme" android:windowSoftInputMode="adjustResize"/>',
            content
        )

    manifest_file.write_text(content, encoding="utf-8")
    print("[OK] AndroidManifest.xml: CraftLiraMainActivity ana başlatıcı & LauncherActivity şeffaf yapıldı.")

def patch_resources(decompiled_dir: Path):
    """Pojav arayüzünü gizler ve şeffaf tema ekler (Sadece Minecraft gösterilir)."""
    res_dir = decompiled_dir / "res"

    # 1. styles.xml içine TranslucentAppTheme ekle
    styles_file = res_dir / "values" / "styles.xml"
    if styles_file.exists():
        s_content = styles_file.read_text(encoding="utf-8")
        if "TranslucentAppTheme" not in s_content:
            theme_xml = """    <style name="TranslucentAppTheme" parent="@style/AppTheme">
        <item name="android:windowBackground">@android:color/transparent</item>
        <item name="android:colorBackgroundCacheHint">@null</item>
        <item name="android:windowIsTranslucent">true</item>
        <item name="android:windowAnimationStyle">@android:style/Animation</item>
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
    </style>
</resources>"""
            s_content = s_content.replace("</resources>", theme_xml)
            styles_file.write_text(s_content, encoding="utf-8")
            print("[OK] styles.xml: TranslucentAppTheme şeffaf tema eklendi.")

    # 2. activity_pojav_launcher.xml: Pojav menü öğelerini (hesap seçici, ayarlar, ana menü) gizle
    layout_file = res_dir / "layout" / "activity_pojav_launcher.xml"
    if layout_file.exists():
        l_content = layout_file.read_text(encoding="utf-8")
        if 'android:id="@id/account_spinner"' in l_content and 'android:id="@id/account_spinner" android:visibility="gone"' not in l_content:
            l_content = l_content.replace('android:id="@id/account_spinner"', 'android:id="@id/account_spinner" android:visibility="gone"')
        if 'android:id="@id/setting_button"' in l_content and 'android:id="@id/setting_button" android:visibility="gone"' not in l_content:
            l_content = l_content.replace('android:id="@id/setting_button"', 'android:id="@id/setting_button" android:visibility="gone"')
        if 'android:id="@id/container_fragment"' in l_content and 'android:id="@id/container_fragment" android:visibility="gone"' not in l_content:
            l_content = l_content.replace('android:id="@id/container_fragment"', 'android:id="@id/container_fragment" android:visibility="gone"')
        layout_file.write_text(l_content, encoding="utf-8")
        print("[OK] activity_pojav_launcher.xml: Pojav menü öğeleri gizlendi (Arka planda çalışır).")

    # 3. fragment_launcher.xml: Ana menü fragment içeriğini tamamen gizle
    frag_file = res_dir / "layout" / "fragment_launcher.xml"
    if frag_file.exists():
        f_content = frag_file.read_text(encoding="utf-8")
        if 'android:id="@id/fragment_menu_main"' in f_content and 'android:id="@id/fragment_menu_main" android:visibility="gone"' not in f_content:
            f_content = f_content.replace('android:id="@id/fragment_menu_main"', 'android:id="@id/fragment_menu_main" android:visibility="gone"')
            frag_file.write_text(f_content, encoding="utf-8")
            print("[OK] fragment_launcher.xml: Pojav ana menü içeriği gizlendi.")

    # 4. Pojav Hesap Sorma ve Giriş Ekranlarını Sıfırla ve Görünmez Yap
    # NPE oluşmaması için dummy ID'ler korunarak görünmez yapılır
    auth_select = res_dir / "layout" / "fragment_select_auth_method.xml"
    if auth_select.exists():
        auth_select.write_text(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" '
            'android:layout_width="0.0dip" android:layout_height="0.0dip" '
            'android:background="@android:color/transparent" android:visibility="gone">\n'
            '    <Button android:id="@id/button_microsoft_authentication" android:layout_width="0dp" android:layout_height="0dp" android:visibility="gone" />\n'
            '    <Button android:id="@id/button_elyby_authentication" android:layout_width="0dp" android:layout_height="0dp" android:visibility="gone" />\n'
            '    <Button android:id="@id/button_local_authentication" android:layout_width="0dp" android:layout_height="0dp" android:visibility="gone" />\n'
            '</FrameLayout>\n',
            encoding='utf-8'
        )
        print("[OK] fragment_select_auth_method.xml: Görünmez dummy layout yapıldı.")

    local_login = res_dir / "layout" / "fragment_local_login.xml"
    if local_login.exists():
        local_login.write_text(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" '
            'android:layout_width="0.0dip" android:layout_height="0.0dip" '
            'android:background="@android:color/transparent" android:visibility="gone">\n'
            '    <EditText android:id="@id/login_edit_email" android:layout_width="0dp" android:layout_height="0dp" android:visibility="gone" />\n'
            '    <Button android:id="@id/login_button" android:layout_width="0dp" android:layout_height="0dp" android:visibility="gone" />\n'
            '</FrameLayout>\n',
            encoding='utf-8'
        )
        print("[OK] fragment_local_login.xml: Görünmez dummy layout yapıldı.")

    ms_login = res_dir / "layout" / "fragment_microsoft_login.xml"
    if ms_login.exists():
        ms_login.write_text(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" '
            'android:layout_width="0.0dip" android:layout_height="0.0dip" '
            'android:background="@android:color/transparent" android:visibility="gone" />\n',
            encoding='utf-8'
        )
        print("[OK] fragment_microsoft_login.xml: Görünmez dummy layout yapıldı.")

def patch_smali_engine(decompiled_dir: Path):
    """Pojav smali kodlarına oyna.craftlira.com otomatik bağlantı, sessiz başlatıcı ve hesap bypass ekler."""
    smali_dir = decompiled_dir / "smali_classes3"

    # 1. Tools.smali: checkStorageRoot daima true & restartLauncherActivity -> CraftLiraMainActivity & swapFragment Auth blokajı
    tools_smali = smali_dir / "net" / "kdt" / "pojavlaunch" / "Tools.smali"
    if tools_smali.exists():
        t_content = tools_smali.read_text(encoding="utf-8")
        target_check_storage = r'(\.method public static checkStorageRoot\(Landroid/content/Context;\)Z\s+\.locals 0)(.*?)(\.end method)'
        replacement_check_storage = r'\1\n\n    const/4 v0, 0x1\n\n    return v0\n\3'
        t_content = re.sub(target_check_storage, replacement_check_storage, t_content, flags=re.DOTALL)

        # Oyundan çıkıldığında Pojav menüsü yerine doğrudan CraftLira ekranına dön
        t_content = t_content.replace(
            "const-class v1, Lnet/kdt/pojavlaunch/LauncherActivity;",
            "const-class v1, Lcom/craftlira/launcher/CraftLiraMainActivity;"
        )

        # swapFragment içinde Auth veya Login fragmentlerine geçişi tamamen engelle
        if ":cond_cfl_cont" not in t_content:
            pattern_swap = r'(\.method public static swapFragment\(Landroidx/fragment/app/FragmentActivity;Ljava/lang/Class;Ljava/lang/String;Landroid/os/Bundle;\)V\s+\.locals )\d+'
            replacement_swap = r'''\1 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroidx/fragment/app/FragmentActivity;",
            "Ljava/lang/Class<",
            "+",
            "Landroidx/fragment/app/Fragment;",
            ">;",
            "Ljava/lang/String;",
            "Landroid/os/Bundle;",
            ")V"
        }
    .end annotation

    if-eqz p1, :cond_cfl_cont

    invoke-virtual {p1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v0

    const-string v1, "Auth"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_cfl_check2

    return-void

    :cond_cfl_check2
    const-string v1, "Login"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v0

    if-eqz v0, :cond_cfl_cont

    return-void

    :cond_cfl_cont'''
            t_content = re.sub(pattern_swap, replacement_swap, t_content)
            print("[OK] Tools.smali: swapFragment Auth/Login engelleyici eklendi.")

        tools_smali.write_text(t_content, encoding="utf-8")
        print("[OK] Tools.smali: checkStorageRoot & restartLauncherActivity yamalandı.")

    # 2. GameRunner.smali: oyna.craftlira.com:25565 doğrudan sunucuya bağlan
    gamerunner_smali = smali_dir / "net" / "kdt" / "pojavlaunch" / "utils" / "jre" / "GameRunner.smali"
    if gamerunner_smali.exists():
        gr_content = gamerunner_smali.read_text(encoding="utf-8")
        if "--quickPlayMultiplayer" not in gr_content:
            pattern_gr = r'(invoke-static \{p0, v3\}, Lnet/kdt/pojavlaunch/utils/JSONUtils;->insertJSONValueList\(Ljava/util/List;Ljava/util/Map;\)Ljava/util/List;\s+move-result-object p0)'
            replacement_gr = r'\1\n\n    const-string v0, "--quickPlayMultiplayer"\n\n    invoke-interface {p0, v0}, Ljava/util/List;->add(Ljava/lang/Object;)Z\n\n    const-string v0, "oyna.craftlira.com:25565"\n\n    invoke-interface {p0, v0}, Ljava/util/List;->add(Ljava/lang/Object;)Z'
            gr_content, count = re.subn(pattern_gr, replacement_gr, gr_content)
            if count > 0:
                gamerunner_smali.write_text(gr_content, encoding="utf-8")
                print("[OK] GameRunner.smali: oyna.craftlira.com:25565 doğrudan bağlantı kodu eklendi.")

    # 3. Instances.smali: Varsayılan versiyon 1.20.4 ve asla null dönmeme
    instances_smali = smali_dir / "net" / "kdt" / "pojavlaunch" / "instances" / "Instances.smali"
    if instances_smali.exists():
        inst_content = instances_smali.read_text(encoding="utf-8")
        inst_content = inst_content.replace('const-string v0, "1.12.2"', 'const-string v0, "1.20.4"')
        inst_content = inst_content.replace('const-string v0, "latest_release"', 'const-string v0, "1.20.4"')

        # loadSelectedInstance null dönerse 1.20.4 oluştur
        if 'sharedData:Z' not in inst_content:
            pattern_inst_null = r'(if-nez v0, :cond_0\s+)(const/4 v0, 0x0\s+return-object v0)'
            replacement_inst_null = r'\1new-instance v0, Lnet/kdt/pojavlaunch/instances/Instance;\n\n    invoke-direct {v0}, Lnet/kdt/pojavlaunch/instances/Instance;-><init>()V\n\n    const-string v1, "1.20.4"\n\n    iput-object v1, v0, Lnet/kdt/pojavlaunch/instances/Instance;->versionId:Ljava/lang/String;\n\n    iput-object v1, v0, Lnet/kdt/pojavlaunch/instances/Instance;->name:Ljava/lang/String;\n\n    const/4 v1, 0x1\n\n    iput-boolean v1, v0, Lnet/kdt/pojavlaunch/instances/Instance;->sharedData:Z'
            inst_content, count = re.subn(pattern_inst_null, replacement_inst_null, inst_content)
            if count > 0:
                print("[OK] Instances.smali: Varsayılan sürüm 1.20.4 & güvenli fallback eklendi.")
        instances_smali.write_text(inst_content, encoding="utf-8")

    # 4. Accounts.smali: getCurrent() ASLA null dönmesin (Pojav hesap diyalogunu tamamen engeller)
    accounts_smali = smali_dir / "net" / "kdt" / "pojavlaunch" / "authenticator" / "accounts" / "Accounts.smali"
    if accounts_smali.exists():
        acc_content = accounts_smali.read_text(encoding="utf-8")
        if ":cond_cfl_ret" not in acc_content:
            pattern_acc = r'(\.method public static getCurrent\(\)Lnet/kdt/pojavlaunch/authenticator/accounts/Account;\s+\.locals 3)(.*?)(\.end method)'
            replacement_acc = r'''\1

    invoke-static {}, Lnet/kdt/pojavlaunch/authenticator/accounts/Accounts;->getSelectedAccount()Ljava/lang/String;

    move-result-object v0

    new-instance v1, Ljava/io/File;

    sget-object v2, Lnet/kdt/pojavlaunch/Tools;->DIR_ACCOUNT_NEW:Ljava/lang/String;

    invoke-direct {v1, v2, v0}, Ljava/io/File;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-static {v1}, Lnet/kdt/pojavlaunch/authenticator/accounts/Accounts;->loadAccount(Ljava/io/File;)Lnet/kdt/pojavlaunch/authenticator/accounts/Account;

    move-result-object v0

    if-eqz v0, :cond_cfl_ret

    return-object v0

    :cond_cfl_ret
    new-instance v1, Ljava/io/File;

    sget-object v2, Lnet/kdt/pojavlaunch/Tools;->DIR_ACCOUNT_NEW:Ljava/lang/String;

    const-string v0, "craftlira.json"

    invoke-direct {v1, v2, v0}, Ljava/io/File;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-static {v1}, Lnet/kdt/pojavlaunch/authenticator/accounts/Accounts;->loadAccount(Ljava/io/File;)Lnet/kdt/pojavlaunch/authenticator/accounts/Account;

    move-result-object v0

    if-eqz v0, :cond_cfl_def

    return-object v0

    :cond_cfl_def
    new-instance v0, Lnet/kdt/pojavlaunch/authenticator/accounts/Account;

    invoke-direct {v0}, Lnet/kdt/pojavlaunch/authenticator/accounts/Account;-><init>()V

    const-string v1, "Oyuncu"

    iput-object v1, v0, Lnet/kdt/pojavlaunch/authenticator/accounts/Account;->username:Ljava/lang/String;

    return-object v0
\3'''
            acc_content, count = re.subn(pattern_acc, replacement_acc, acc_content, flags=re.DOTALL)
            if count > 0:
                print("[OK] Accounts.smali: getCurrent() otomatik offline yedek hesap garantisi eklendi.")
        accounts_smali.write_text(acc_content, encoding="utf-8")

    # 5. LauncherActivity.smali:
    #    a) onCreate sonunda anında LAUNCH_GAME tetikle (bekletme yok)
    #    b) mLaunchGameListener içinde hesap null kontrolünü bypass et (:cond_4'e zıpla)
    #    c) lambda$new$1 (start_login_procedure listener) tamamen iptal et (hesap menüsü asla açılmaz)
    launcher_act_smali = smali_dir / "net" / "kdt" / "pojavlaunch" / "LauncherActivity.smali"
    if launcher_act_smali.exists():
        l_content = launcher_act_smali.read_text(encoding="utf-8")

        # a) Otomatik başlatma: onCreate sonuna launch_game ekle
        if 'const-string v1, "launch_game"' not in l_content:
            pattern_oncreate = r'(const-string v0, "data_migration"\s+invoke-virtual \{p1, v0\}, Lcom/kdt/mcgui/ProgressLayout;->observe\(Ljava/lang/String;\)V\s+)(return-void)'
            replacement_oncreate = r'\1sget-object v0, Ljava/lang/Boolean;->TRUE:Ljava/lang/Boolean;\n\n    const-string v1, "launch_game"\n\n    invoke-static {v1, v0}, Lnet/kdt/pojavlaunch/extra/ExtraCore;->setValue(Ljava/lang/String;Ljava/lang/Object;)V\n\n    \2'
            l_content, count = re.subn(pattern_oncreate, replacement_oncreate, l_content)
            if count > 0:
                print("[OK] LauncherActivity.smali: onCreate anında launch_game tetikleme eklendi.")

        # b) Hesap sorma bloğunu atla (goto :cond_4)
        if 'goto :cond_4' not in l_content:
            pattern_login = r'(move-result-object v1\s+)(if-nez v1, :cond_4)'
            replacement_login = r'\1goto :cond_4'
            l_content, count = re.subn(pattern_login, replacement_login, l_content)
            if count > 0:
                print("[OK] LauncherActivity.smali: start_login_procedure bypass edildi.")

        # c) lambda$new$1 (start_login_procedure) tamamen etkisiz hale getir
        pattern_auth_lambda = r'(\.method synthetic lambda\$new\$1\$net-kdt-pojavlaunch-LauncherActivity\(Ljava/lang/String;Ljava/lang/Boolean;\)Z\s+)(.*?)(\.end method)'
        replacement_auth_lambda = r'''\1.locals 1

    const/4 v0, 0x0

    return v0
\3'''
        l_content, count = re.subn(pattern_auth_lambda, replacement_auth_lambda, l_content, flags=re.DOTALL)
        if count > 0:
            print("[OK] LauncherActivity.smali: lambda$new$1 hesap menüsü çağrısı tamamen devre dışı bırakıldı.")

        launcher_act_smali.write_text(l_content, encoding="utf-8")

    # 6. AccountSpinner.smali: createAccount() metodunu tamamen etkisizleştir
    for as_file in decompiled_dir.rglob("AccountSpinner.smali"):
        try:
            asc = as_file.read_text(encoding="utf-8")
            pattern_ca = r'(\.method private createAccount\(\)V\s+)(.*?)(\.end method)'
            replacement_ca = r'\1.locals 0\n\n    return-void\n\3'
            asc, c = re.subn(pattern_ca, replacement_ca, asc, flags=re.DOTALL)
            if c > 0:
                as_file.write_text(asc, encoding="utf-8")
                print(f"[OK] {as_file.name}: createAccount() devre dışı bırakıldı.")
        except Exception:
            pass

    # 7. Tüm Auth fragmentlerinin onViewCreated metodlarını etkisizleştir (Arayüz asla açılamaz)
    for sf_name in ["SelectAuthFragment.smali", "LocalLoginFragment.smali", "MicrosoftLoginFragment.smali"]:
        for sf_file in decompiled_dir.rglob(sf_name):
            try:
                sfc = sf_file.read_text(encoding="utf-8")
                pattern_ovc = r'(\.method public onViewCreated\(Landroid/view/View;Landroid/os/Bundle;\)V\s+)(.*?)(\.end method)'
                replacement_ovc = r'\1.locals 0\n\n    return-void\n\3'
                sfc, c = re.subn(pattern_ovc, replacement_ovc, sfc, flags=re.DOTALL)
                if c > 0:
                    sf_file.write_text(sfc, encoding="utf-8")
                    print(f"[OK] {sf_name}: onViewCreated temizlendi.")
            except Exception:
                pass

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

    # 4. Manifest, kaynaklar ve Smali yamalarını uygula
    patch_manifest(decompiled_dir)
    patch_resources(decompiled_dir)
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

        # 3. JS bundle dosyalarındaki mutlak /assets/ referanslarını ./assets/ yap
        for js_file in assets_public_dir.glob("**/*.js"):
            try:
                jc = js_file.read_text(encoding="utf-8")
                if '/assets/' in jc:
                    jc = jc.replace('"/assets/', '"./assets/').replace("'/assets/", "'./assets/")
                    js_file.write_text(jc, encoding="utf-8")
            except Exception:
                pass

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
