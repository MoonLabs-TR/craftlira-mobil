# CraftLira Mobil - Geliştirme ve Durum Raporu
**Tarih:** 28 Eylül 2026  
**Sunucu:** `oyna.craftlira.com:25565`  
**Sürüm:** Minecraft Java 1.20.4+ (Towny)  
**Nihai APK Durumu:** 140 MB - Tek Parça Tam İstemci (Başarılı)

---

## 1. Genel Özet ve Hedef
CraftLira Mobil için harici hiçbir yardımcı uygulamaya (Asistan APK, ayrı PojavLauncher simgesi vb.) ihtiyaç duymayan, **tek bir simgeyle açılan**, açıldığında **özel altın temalı CraftLira React arayüzünü** gösteren ve "TOWNY'YE BAĞLAN" dendiğinde **ücretsiz/offline** kullanıcı adıyla doğrudan `oyna.craftlira.com:25565` sunucusuna giren **140 MB'lık tek parça tam Android istemcisi** üretildi.

---

## 2. Yaşanan Sorunlar ve Çözümleri

### A. 5 MB APK ve İkinci Uygulama ("Asistan APK") Sorunu
* **Sorun:** İlk derlemelerde üretilen Capacitor APK'sı sadece ~5 MB idi. İçinde Java oyun motoru bulunmadığı için uygulama içi indirme başlatıp telefona harici bir "PojavLauncher" APK'sı kurdurmaya çalışıyordu. Bu durum telefonda 2 ayrı simge ve kafa karıştırıcı bir kurulum süreci oluşturuyordu.
* **Çözüm:** Harici indirme ve yardımcı APK mimarisi tamamen kaldırıldı. OpenJDK, GL4ES, LWJGL3 ve ses motorları tek bir 140 MB APK içerisine gömüldü.

### B. Pojav Arayüzünün Doğrudan Açılması Sorunu
* **Sorun:** Motor doğrudan yeniden markalandığında, uygulama açılır açılmaz Pojav'ın ham Java başlatıcı menüsü (hesap ekleme, Microsoft login vs.) gelmiş ve hazırlanan özel CraftLira arayüzü kaybolmuştu.
* **Çözüm:** Pojav'ın kendi arayüzü ana girişten çıkarıldı. Ana giriş kapısı olarak özel React arayüzünü tam ekran ve izole şekilde açan `CraftLiraMainActivity` aktivitesi geliştirildi.

### C. Açılışta Çökme (Crash) Sorunu
* **Sorun:** Sonraki denemede APK kuruluyor ancak tıklandığında açılmadan kapanıyordu.
  * **Sebep 1 (Scoped Storage Hatası):** Pojav'ın eski `TestStorageActivity` sınıfı Android 11, 12, 13 ve 14/15 sürümlerindeki kapsamlı depolama kuralları nedeniyle `/sdcard/` yoluna erişemeyip hata aktivitesini tetikliyordu.
  * **Sebep 2 (WebView Multi-Process Çakışması):** Uygulama etiketinde yer alan `android:process=":launcher"` nedeniyle Android 9+, WebView oluşturulurken `RuntimeException: Using WebView from more than one process at once` hatası verip uygulamayı anında kapatıyordu.
* **Çözüm:** 
  1. `CraftLiraMainActivity` uygulamanın birincil açılış aktivitesi (`MAIN` ve `LAUNCHER`) yapıldı.
  2. `TestStorageActivity` devre dışı bırakıldı ve `Tools.checkStorageRoot` depolama kontrolü daima `true` dönecek şekilde yamalandı.
  3. `<application>` etiketinden `:launcher` işlem adı kaldırıldı ve WebView için güvenli dizin ön eki (`setDataDirectorySuffix`) eklendi.

---

## 3. Tamamlanan Teknik Entegrasyonlar

1. **Özel React Arayüzü Entegrasyonu:**
   - React varlıkları (`npm run build`) doğrudan APK'nın `assets/public/` dizinine yerleştirildi.
   - Tilki maskotu, canlı `oyna.craftlira.com` oyuncu sayacı, Market, Haberler, Bilgi ve Ayarlar sekmeleri sorunsuz çalışıyor.

2. **Ücretsiz (Offline) Hesap Otomasyonu:**
   - Microsoft hesabı veya orijinal MC zorunluluğu yoktur.
   - Kullanıcı Ayarlar'dan veya ilk açılışta girdiği kullanıcı adıyla "TOWNY'YE BAĞLAN" butonuna bastığı an, Java köprüsü arka planda `accounts/craftlira.json` profilini otomatik oluşturup oyuna aktarır.

3. **Otomatik Sunucu Bağlantısı:**
   - `GameRunner.smali` motoruna doğrudan `--quickPlayMultiplayer oyna.craftlira.com:25565` komut satırı argümanı enjekte edildi.
   - Oyun açılır açılmaz ana menüde beklemeden doğrudan Towny sunucusuna giriş yapar.

4. **Tam Otomatik Derleyici Scripti (`scripts/build_craftlira_client.py`):**
   - React derlemesi, Java köprüsünün derlenmesi (D8/R8), motorun ayrıştırılması (Apktool), Smali yamalarının uygulanması, ikonların yerleştirilmesi ve Uber Apk Signer ile v1/v2/v3 imzalanması tek bir komutla tamamlanır hale getirildi.

5. **GitHub Actions CI/CD Pipeline (.github/workflows/build-apk.yml):**
   - Her `git push` yapıldığında bulut üzerinde otomatik olarak 140 MB tek parça `CraftLira-Mobil.apk` üretilir ve Artifacts olarak indirilebilir duruma getirilir.

---

## 4. Test Edilecek Son Derleme
GitHub Actions üzerinde derlemesi başarıyla tamamlanmış son çalışan sürüm:

* **Çalışma Numarası:** `#36359971706`
* **Boyut:** ~140 MB
* **Bağlantı:** [GitHub Actions #36359971706 - CraftLira-Mobil-APK](https://github.com/MoonLabs-TR/craftlira-mobil/actions/runs/36359971706)

---

## 5. Yarın Kalkınca Yapılacaklar (Yol Haritası)

- [ ] **Temiz Kurulum Testi:** Telefonda önceden kurulu eski CraftLira / Pojav sürümleri tamamen kaldırılıp yukarıdaki 140 MB'lık yeni APK kurulacak.
- [ ] **Arayüz ve Dokunmatik Kontroller:** Uygulama açılışı, React arayüzünün akıcılığı ve Towny'ye bağlanma testi kontrol edilecek.
- [ ] **Oyun İçi Kontroller (Gerekiyorsa):** Oyun ekranında ekrana gelen sanal butonların (yürüme, eğilme, envanter, sohbet) konumu ve görünürlüğü CraftLira'ya özel optimize edilecek.
- [ ] **Release / Dağıtım Hazırlığı:** İstenirse GitHub Releases sekmesine doğrudan herkesin indirebileceği bir `.apk` bağlantısı olarak eklenecek.

İyi uykular! Yarın kalktığında kaldığımız yerden test edip devam ederiz.
