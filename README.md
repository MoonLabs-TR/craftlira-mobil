# 🦊 CraftLira Mobile Launcher (Android APK Hazır Altyapı)

CraftLira Minecraft sunucusu için özel olarak tasarlanmış, **ergonomik alt gezinme çekmeceli (Bottom Navigation)**, koyu kehribar/altın temalı, modern mobil başlatıcı.

---

## 🌟 Öne Çıkan Özellikler

1. **Göz Yormayan Asil Altın & Obsidyen Tema:**
   - Maskottaki taç ve kürk tonlarından ilham alan sıcak bal/kehribar altın tonları (`#fbbf24`, `#f59e0b`, `#d97706`).
   - Neon/parlak sarı yerine gözü dinlendiren koyu grafit/obsidyen zemin (`#0a0d13`, `#151b27`).
   - Maskot ve sonbahar ormanı görseli banner alanında şık bir biçimde konumlandırılmıştır.

2. **Aşağıda Konumlandırılmış Alt Gezinme Barı (Bottom Dock Navigation):**
   - 🎮 **Oyna (Başlatıcı):** Sunucu IP (`play.craftlira.com`) tek tıkla kopyalama, anlık oyuncu ve ping sayacı, nickname girişi, RAM ve sürüm seçimi, oyun modları (Survival Titan, Skyblock Lira, BedWars, BoxPvP) ve interaktif "CraftLira'ya Bağlan" başlatma simülasyonu.
   - 🛒 **Market:** CraftLira Kredi bakiyesi, VIP üyelikler (LİRA-VIP, MVP, VIP), özel kasalar, kanat kozmetikleri, bakiye yükleme modalı ve konfeti kutlaması.
   - ℹ️ **Bilgi:** Sunucu altyapı bilgisi (DDoS koruması, %99.9 uptime), önemli oyun komutları (`/ada`, `/market`, `/ah`), kurallar, Discord topluluk bağlantısı ve SSS akordiyonu.
   - 📰 **Haberler:** v2.5 güncelleme notları, haftalık etkinlik takvimi, promosyon/hediye kuponu kullanma alanı (`TILKI50`, `CRAFTLIRA2026`).
   - ⚙️ **Ayarlar:** Profil ve skin önizlemesi, FPS Boost modu, dokunmatik titreşim (haptic feedback), ses efektleri ve doku paketi (texture pack) seçimi.

3. **Dokunsal Ses & Haptik Geri Bildirim:**
   - Web Audio API ile harici ses dosyasına ihtiyaç duymadan gerçekçi buton tıklama, altın tınısı ve motor sesleri.
   - Mobil cihazlarda gerçek titreşim (`navigator.vibrate`) desteği.

4. **Android APK Desteği (Capacitor Entegre):**
   - Proje doğrudan Android APK'ya dönüştürülmeye hazırdır.

---

## 🚀 Çalıştırma (Development)

Projeyi bilgisayarınızda veya tarayıcınızda canlı olarak önizlemek için:

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173/` adresine giderek mobil launcher'ı telefon çerçevesinde veya tam ekranda test edebilirsiniz.

---

## 📱 Android APK Çıktısı Alma Adımları

Bu altyapı `@capacitor/core` ve `@capacitor/android` ile tam uyumludur. APK oluşturmak için:

1. **Web Paketini Derleyin:**
   ```bash
   npm run build
   ```

2. **Android Platformunu Ekleyin:**
   ```bash
   npx cap add android
   ```

3. **Projeyi Senkronize Edin:**
   ```bash
   npx cap sync android
   ```

4. **Android Studio ile Açın ve APK Alın:**
   ```bash
   npx cap open android
   ```
   *Android Studio açıldıktan sonra üst menüden **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçeneğine tıklayarak `.apk` dosyanızı doğrudan telefonunuza yükleyebilirsiniz.*
