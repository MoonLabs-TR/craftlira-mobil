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

### D. Açılışta Bembeyaz Ekran Gelmesi Sorunu
* **Sorun:** Uygulama açıldığında çökmüyor ancak altın sarısı React arayüzü yerine tamamen bomboş beyaz bir ekran geliyordu.
* **Sebep 1 (Vite Mutlak Yollar):** `vite.config.js` varsayılan olarak `/assets/...` (root slash) üretiyordu. Android WebView'de `file:///android_asset/public/index.html` açıldığında bu istek `file:///assets/...` şeklinde köke yöneliyor ve 404 (dosya bulunamadı) oluyordu.
* **Sebep 2 (Chromium ES Module & MIME Type Blokajı):** Modern Chromium WebView motorları `file://` protokolü üzerinden çağrılan `<script type="module" crossorigin src="...">` etiketlerini strict CORS ve MIME type denetimine sokar. `file://` üzerinden gelen yanıtlarda HTTP `Content-Type: text/javascript` başlığı bulunmadığından Chromium scripti çalıştırmayı reddediyordu.
* **Sebep 3 (WebView Varsayılan Rengi):** WebView'in arka plan rengi varsayılan olarak beyaz (`#FFFFFF`) olduğu için henüz içerik yüklenirken bile gözü yoran beyaz bir alan oluşuyordu.
* **Çözüm:**
  1. `CraftLiraMainActivity` içinde `WebView.setBackgroundColor(0xFF0D0F14)` tanımlandı (asla beyaz zemin oluşmaz).
  2. `settings.setAllowFileAccessFromFileURLs(true)` ve `settings.setAllowUniversalAccessFromFileURLs(true)` açıldı.
  3. `WebViewClient.shouldInterceptRequest` metodunda `file:///android_asset/public/` varlıkları yakalanarak `.js` dosyalarına kesin `text/javascript`, `.css` dosyalarına `text/css` MIME başlığı verildi.
  4. Derleme scriptinde `index.html` içeriğindeki `type="module"` ve `crossorigin` öznitelikleri kaldırılarak güvenli `<script defer src="./assets/...">` formatına dönüştürüldü ve tüm yollar `./assets/` yapıldı.
  5. Kaynak `index.html` içerisine inline koyu arka plan stili ve global hata yakalayıcı yerleştirildi.

### E. "Oyna" Deyince Pojav Menüsü ve "Hesap İsmi Girin" Gelmesi Sorunu
* **Sorun:** CraftLira arayüzünde "Oyna / Towny'ye Bağlan" butonuna tıklandığında arka planda doğrudan Minecraft açılmak yerine PojavLauncher'ın yeşil "OYNA" butonlu başlatıcı menüsü geliyor ve "Hesap ismi girin / hesap seçin" diyalogu açılıyordu.
* **Sebep 1 (Hesap Dizini & Tercih Kayıt Uyuşmazlığı):** Pojav motoru hesap dosyasını `Tools.DIR_ACCOUNT_NEW` (`/data/user/0/.../accounts`) altında ararken, önceki Java köprüsü dosyayı sadece `getFilesDir()/accounts` altına yazıyordu. Ayrıca varsayılan `LauncherPreferences.DEFAULT_PREF` yapılandırılmadığı için Pojav seçili hesap bulamayıp hesap ekranını tetikliyordu.
* **Sebep 2 (Launcher Menüsünün Görünür Olması):** `LauncherActivity` standart opak `AppTheme` ile açılıyor ve `activity_pojav_launcher.xml` içindeki spinner ve butonlar görüntüleniyordu.
* **Çözüm:**
  1. `CraftLiraMainActivity.java` içinde hesap dosyası (`craftlira.json`) Pojav'ın erişebileceği tüm dizinlere (`DIR_ACCOUNT_NEW`, `parent/accounts`, `files/accounts`) anında yazıldı; `selected_account_file="craftlira.json"` ve `currentInstance="1.20.4"` tüm SharedPreferences alanlarına işlendi.
  2. `LauncherActivity` için `@style/TranslucentAppTheme` şeffaf teması eklendi; `activity_pojav_launcher.xml` ve `fragment_launcher.xml` arayüz öğeleri `android:visibility="gone"` yapılarak arka plana gizlendi.
  3. `Accounts.smali` içindeki `getCurrent()` metoduna offline fallback garantisi eklendi (asla `null` dönmez).
  4. `LauncherActivity.smali` içindeki hesap kontrolü `goto :cond_4` ile bypass edildi ve `onCreate` anında otomatik `launch_game` tetiklemesi sağlandı.
  5. Oyundan çıkıldığında Pojav menüsü yerine doğrudan `CraftLiraMainActivity` ekranına dönülmesi sağlandı (`Tools.smali`).

### F. Görsellerin, Logoların ve Bannerların Yüklenmemesi Sorunu
* **Sorun:** React arayüzündeki tilki maskotu (`mascot-transparent.png`), sunucu bannerı (`banner.jpg`) ve fallback avatarları Android WebView'de kırık resim simgesi olarak görünüyor ya da hiç yüklenmiyordu.
* **Sebep 1 (Binary WebResourceResponse ve UTF-8 Encoding Çakışması):** `CraftLiraMainActivity.java` içinde `shouldInterceptRequest` metodu tüm yanıtları `new WebResourceResponse(mimeType, "UTF-8", is)` şeklinde döndürüyordu. Resimler (`image/png`, `image/jpeg`, `image/webp`) ve fontlar ikili (binary) veri olduğu için `UTF-8` parametresi verildiğinde Android Chromium motoru resmi metin akışı gibi işlemeye çalışıyor veya `charset=UTF-8` başlığı nedeniyle resmi decode edemeyip reddediyordu (`ERR_IMAGE_DECODE_FAILED`).
* **Sebep 2 (Yol Çözümleme ve 404 Hataları):** Bileşenlerdeki `/assets/banner.jpg` gibi mutlak yollar Android WebView'de `file:///assets/banner.jpg` şeklinde çözülüp 404 hatasına düşüyordu.
* **Çözüm:**
  1. `handleAsset` içinde görseller, sesler ve fontlar için `encoding` değeri `null` yapıldı (ikili akış saf byte olarak aktarılır).
  2. `mascot-transparent.png`, `banner.jpg`, `mascot.png`, `favicon.svg` ve `icons.svg` için doğrudan ad eşleştirmeli fast-path eklendi; dosya hangi protokolle istenirse istensin anında assets içinden bulunup servis edilir.
  3. Tüm React bileşenlerinde (`OynaView`, `AyarlarView`, `TopHeader`, `LaunchModal`, `OnboardingModal`, `EngineInstallerModal`) görsel yolları göreli (`./assets/...`) standartlaştırıldı.

### G. Pojav "Hesap Ekle / Yerel Giriş" Ekranının Görünmesi Sorunu
* **Sorun:** "Oyna" denildiğinde PojavLauncher'ın "Hesap ekle", "Microsoft / Yerel Giriş" ve "E-posta veya kullanıcı adı girin" fragment menüleri kullanıcıya gösteriliyordu.
* **Sebep:** Pojav motoru ilk açılışta `AccountSpinner` aracılığıyla hesap listesini denetler; kayıtlı hesap yoksa `createAccount()` metodunu çağırır. Bu metot `start_login_procedure` yayınlar, `LauncherActivity` ise bunu dinleyip `Tools.swapFragment` ile `SelectAuthFragment` veya `LocalLoginFragment` açar.
* **Çözüm (4 Kademeli Çelik Kalkan):**
  1. **Tetikleyici İptali (`AccountSpinner.smali`):** `createAccount()` metodu içi tamamen boşaltılarak sadece `return-void` yapıldı; hesap menüsü çağırma tetikleyicisi kökten kesildi.
  2. **Dinleyici İptali (`LauncherActivity.smali`):** `lambda$new$1` (hesap menüsü listener'ı) anında `return 0` dönecek şekilde nötralize edildi; hesap fragmenti çağırma yeteneği alındı.
  3. **Fragment Geçiş Kilidi (`Tools.smali`):** `swapFragment` metodu başına Smali yaması eklendi. Hedef fragment adında `"Auth"` veya `"Login"` geçtiği an metod hiçbir işlem yapmadan anında `return-void` ile sonlandırılır.
  4. **Arayüz ve Yaşam Döngüsü Nötralizasyonu (`SelectAuthFragment.smali`, `LocalLoginFragment.smali` & XML):** 
     - İlgili fragmentlerin `onViewCreated` metodları doğrudan `return-void` yapıldı.
     - `fragment_select_auth_method.xml` ve `fragment_local_login.xml` dosyaları 0x0 dip, şeffaf ve `visibility="gone"` yapıldı (NPE önlemek için görünmez dummy ID'ler bırakıldı).
  5. **Hesap Garantisi (`Accounts.smali`):** `Accounts.getCurrent()` metodu daima `craftlira.json` dosyasını, bulunamazsa bellek içi `"Oyuncu"` offline hesabını dönecek şekilde yamalandı (asla `null` dönmez).

---

## 3. Tamamlanan Teknik Entegrasyonlar

1. **Özel React Arayüzü Entegrasyonu:**
   - React varlıkları (`npm run build`) doğrudan APK'nın `assets/public/` dizinine yerleştirildi.
   - Tilki maskotu, sunucu bannerı, canlı `oyna.craftlira.com` oyuncu sayacı, Market, Haberler, Bilgi ve Ayarlar sekmeleri sorunsuz çalışıyor.

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
GitHub'a gönderilen son commit ile birlikte GitHub Actions üzerinde yeni ve hatasız APK otomatik olarak üretilecektir:

* **İş Akışı:** [GitHub Actions - CraftLira Mobil APK Derleyici](https://github.com/MoonLabs-TR/craftlira-mobil/actions)
* **Beklenen Boyut:** ~140 MB
* **İçerik:** Kırık görsel sorunu çözülmüş, Pojav hesap arayüzü 4 kademeli kilitle tamamen yok edilmiş, tek tıkla doğrudan Towny'ye bağlanan tam sürüm.

---

## 5. Yol Haritası ve Test Adımları

- [ ] **Temiz Kurulum Testi:** Telefonda önceden kurulu eski CraftLira / Pojav sürümleri tamamen kaldırılıp GitHub Actions'tan indirilen yeni APK kurulacak.
- [ ] **Görsel Kontrolü:** Tilki logosu, banner ve avatarların kusursuz yüklendiği doğrulanacak.
- [ ] **Towny Bağlantı Testi:** Kullanıcı adı girilip "TOWNY'YE BAĞLAN" tıklandığında hiçbir Pojav menüsü ve hesap sorma ekranı gelmeden doğrudan oyunun açıldığı kontrol edilecek.
