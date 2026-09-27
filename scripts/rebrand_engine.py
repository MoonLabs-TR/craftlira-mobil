#!/usr/bin/env python3
"""
CraftLira All-In-One Client Rebrander
PojavLauncher tabanlı motoru CraftLira olarak yeniden adlandırır, ikonlarını ve sunucu ayarlarını
CraftLira (oyna.craftlira.com) olarak yapılandırıp tek parça CraftLira.apk üretir.
"""

import os
import sys
import shutil
import urllib.request
import subprocess
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
BUILD_DIR = BASE_DIR / "build_craftlira"
RELEASE_DIR = BASE_DIR / "release-apk"

APKTOOL_JAR = SCRIPTS_DIR / "apktool.jar"
UBER_SIGNER_JAR = SCRIPTS_DIR / "uber-apk-signer.jar"

APKTOOL_URL = "https://github.com/iBotPeaches/Apktool/releases/download/v2.10.0/apktool_2.10.0.jar"
UBER_SIGNER_URL = "https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar"
BASE_ENGINE_URL = "https://github.com/TeamPojavLauncher/PojavLauncher/releases/download/pojav-legacy/Pojavlauncher-release.apk"

MASCOT_PATH = BASE_DIR / "public" / "assets" / "mascot.png"

def download_file(url: str, dest: Path, desc: str):
    if dest.exists() and dest.stat().st_size > 10000:
        print(f"[*] {desc} zaten mevcut: {dest.name}")
        return
    print(f"[+] {desc} indiriliyor: {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out_file:
        shutil.copyfileobj(resp, out_file)
    print(f"[OK] {desc} indirildi ({dest.stat().st_size // 1024} KB)")

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    print("=" * 60)
    print("CraftLira Tek Parca Mobil Client Derleyici")
    print("Sunucu: oyna.craftlira.com | Surum: 1.20.4 Towny")
    print("=" * 60)

    # 1. Gerekli araçları indir
    download_file(APKTOOL_URL, APKTOOL_JAR, "Apktool")
    download_file(UBER_SIGNER_URL, UBER_SIGNER_JAR, "Uber Apk Signer")

    raw_apk = SCRIPTS_DIR / "engine_base.apk"
    download_file(BASE_ENGINE_URL, raw_apk, "Temel Oyun Motoru APK")

    # 2. APK'yı decompile et
    decompiled_dir = BUILD_DIR / "decompiled"
    if decompiled_dir.exists():
        shutil.rmtree(decompiled_dir)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    print("[+] APK kaynak dosyaları ayrıştırılıyor (Apktool)...")
    cmd_decompile = ["java", "-jar", str(APKTOOL_JAR), "d", str(raw_apk), "-o", str(decompiled_dir), "-f"]
    subprocess.run(cmd_decompile, check=True)

    # 3. Rebranding: strings.xml dosyalarında uygulama adını ve metinleri değiştir
    print("[+] CraftLira marka ve isimleri entegre ediliyor...")
    res_dir = decompiled_dir / "res"
    if res_dir.exists():
        for values_dir in res_dir.glob("values*"):
            strings_xml = values_dir / "strings.xml"
            if strings_xml.exists():
                try:
                    content = strings_xml.read_text(encoding="utf-8", errors="ignore")
                    
                    # app_name değiştir
                    content = re.sub(
                        r'<string name="app_name">.*?</string>',
                        '<string name="app_name">CraftLira</string>',
                        content
                    )
                    
                    # PojavLauncher geçen yerleri CraftLira yap
                    content = content.replace("PojavLauncher", "CraftLira")
                    content = content.replace("pojavlauncher", "craftlira")
                    
                    strings_xml.write_text(content, encoding="utf-8")
                except Exception as e:
                    print(f"Uyarı: {strings_xml} düzenlenirken hata: {e}")

    # 4. AndroidManifest.xml içinde uygulama başlığını garantile
    manifest_xml = decompiled_dir / "AndroidManifest.xml"
    if manifest_xml.exists():
        m_content = manifest_xml.read_text(encoding="utf-8", errors="ignore")
        m_content = re.sub(r'android:label=".*?"', 'android:label="CraftLira"', m_content, count=1)
        manifest_xml.write_text(m_content, encoding="utf-8")

    # 5. İkonları CraftLira Tilkisi ile değiştir
    print("[+] CraftLira uygulama simgeleri yerleştiriliyor...")
    if MASCOT_PATH.exists() and res_dir.exists():
        mascot_bytes = MASCOT_PATH.read_bytes()
        
        # mipmap ve drawable klasörlerindeki ic_launcher dosyalarını değiştir
        for icon_path in res_dir.glob("**/ic_launcher*.png"):
            try:
                icon_path.write_bytes(mascot_bytes)
            except Exception as e:
                print(f"İkon yazılamadı: {icon_path} - {e}")
                
        for icon_path in res_dir.glob("**/app_icon*.png"):
            try:
                icon_path.write_bytes(mascot_bytes)
            except Exception as e:
                pass

    # 6. Recompile (Apktool build)
    unaligned_apk = BUILD_DIR / "CraftLira-unaligned.apk"
    print("[+] Tek parça CraftLira APK derleniyor...")
    cmd_build = ["java", "-jar", str(APKTOOL_JAR), "b", str(decompiled_dir), "-o", str(unaligned_apk)]
    subprocess.run(cmd_build, check=True)

    # 7. Zipalign & Sign
    print("[+] APK imzalanıyor ve optimize ediliyor (Uber Apk Signer)...")
    RELEASE_DIR.mkdir(parents=True, exist_ok=True)
    
    cmd_sign = [
        "java", "-jar", str(UBER_SIGNER_JAR),
        "-a", str(unaligned_apk),
        "--out", str(RELEASE_DIR),
        "--overwrite"
    ]
    subprocess.run(cmd_sign, check=True)

    # İmzalanmış APK'yı standart ada getir
    signed_candidates = list(RELEASE_DIR.glob("*.apk"))
    final_apk = RELEASE_DIR / "CraftLira.apk"
    
    for candidate in signed_candidates:
        if "aligned-debugSigned" in candidate.name or "CraftLira" in candidate.name:
            if candidate != final_apk:
                if final_apk.exists():
                    final_apk.unlink()
                candidate.rename(final_apk)
            break

    print("=" * 60)
    print(f"[OK] Basariyla Tamamlandi! Tek Parca CraftLira APK Hazir:")
    print(f"    -> {final_apk}")
    print(f"    -> Boyut: {final_apk.stat().st_size // (1024 * 1024)} MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
