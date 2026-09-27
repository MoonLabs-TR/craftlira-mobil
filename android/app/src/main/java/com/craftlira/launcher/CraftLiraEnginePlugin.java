package com.craftlira.launcher;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "CraftLiraEngine")
public class CraftLiraEnginePlugin extends Plugin {

    private static final String TAG = "CraftLiraEngine";
    private static final String ENGINE_PACKAGE = "net.kdt.pojavlaunch";
    private static final String DEFAULT_ENGINE_URL = "https://github.com/TeamPojavLauncher/PojavLauncher/releases/download/pojav-legacy/Pojavlauncher-release.apk";

    private boolean isDownloading = false;

    /**
     * Motorun cihazda kurulu olup olmadığını kontrol eder
     */
    @PluginMethod
    public void isEngineInstalled(PluginCall call) {
        Context context = getContext();
        PackageManager pm = context.getPackageManager();
        JSObject ret = new JSObject();

        try {
            PackageInfo info = pm.getPackageInfo(ENGINE_PACKAGE, 0);
            ret.put("installed", true);
            ret.put("packageName", ENGINE_PACKAGE);
            ret.put("versionName", info.versionName != null ? info.versionName : "1.0");
        } catch (PackageManager.NameNotFoundException e) {
            ret.put("installed", false);
            ret.put("packageName", ENGINE_PACKAGE);
        }

        call.resolve(ret);
    }

    /**
     * Motor APK'sını indirir ve Android Kurulum Arayüzünü (Package Installer) açar
     */
    @PluginMethod
    public void downloadAndInstallEngine(PluginCall call) {
        if (isDownloading) {
            call.reject("İndirme işlemi zaten devam ediyor.");
            return;
        }

        String downloadUrl = call.getString("url", DEFAULT_ENGINE_URL);
        Context context = getContext();

        isDownloading = true;

        new Thread(() -> {
            InputStream input = null;
            FileOutputStream output = null;
            HttpURLConnection connection = null;

            try {
                URL url = new URL(downloadUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setInstanceFollowRedirects(true);
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.connect();

                // Yönlendirmeleri takip et (GitHub releases 302 döndürür)
                int status = connection.getResponseCode();
                if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM || status == 307 || status == 308) {
                    String newUrl = connection.getHeaderField("Location");
                    connection.disconnect();
                    connection = (HttpURLConnection) new URL(newUrl).openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(30000);
                    connection.connect();
                }

                int fileLength = connection.getContentLength();
                input = connection.getInputStream();

                File cacheDir = context.getExternalFilesDir(null);
                if (cacheDir == null) {
                    cacheDir = context.getCacheDir();
                }

                File apkFile = new File(cacheDir, "craftlira_engine.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                output = new FileOutputStream(apkFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;
                long lastProgressTime = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    long now = System.currentTimeMillis();
                    if (now - lastProgressTime > 200 || total == fileLength) {
                        lastProgressTime = now;
                        int percent = fileLength > 0 ? (int) ((total * 100) / fileLength) : 0;
                        
                        JSObject progressObj = new JSObject();
                        progressObj.put("percent", percent);
                        progressObj.put("bytesDownloaded", total);
                        progressObj.put("totalBytes", fileLength);
                        notifyListeners("engineDownloadProgress", progressObj);
                    }
                }

                output.flush();
                output.close();
                input.close();
                connection.disconnect();

                isDownloading = false;

                // 100% bildirimi gönder
                JSObject finalProgress = new JSObject();
                finalProgress.put("percent", 100);
                finalProgress.put("bytesDownloaded", total);
                finalProgress.put("totalBytes", total);
                notifyListeners("engineDownloadProgress", finalProgress);

                // Android Package Installer'ı tetikle
                new Handler(Looper.getMainLooper()).post(() -> {
                    try {
                        Uri apkUri = FileProvider.getUriForFile(
                                context,
                                context.getPackageName() + ".fileprovider",
                                apkFile
                        );

                        Intent installIntent = new Intent(Intent.ACTION_VIEW);
                        installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(installIntent);

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("message", "Kurulum ekranı başlatıldı.");
                        call.resolve(ret);
                    } catch (Exception e) {
                        Log.e(TAG, "Kurulum başlatılamadı: ", e);
                        call.reject("Kurulum ekranı açılamadı: " + e.getMessage());
                    }
                });

            } catch (Exception e) {
                isDownloading = false;
                Log.e(TAG, "İndirme hatası: ", e);
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                    if (connection != null) connection.disconnect();
                } catch (Exception ignored) {}

                call.reject("İndirme sırasında hata oluştu: " + e.getMessage());
            }
        }).start();
    }

    /**
     * Oyunu PojavLauncher üzerinden doğrudan başlatır
     */
    @PluginMethod
    public void launchGame(PluginCall call) {
        Context context = getContext();
        PackageManager pm = context.getPackageManager();

        String username = call.getString("username", "Oyuncu");
        String host = call.getString("serverHost", "oyna.craftlira.com");
        int port = call.getInt("serverPort", 25565);
        int ram = call.getInt("ram", 4);
        boolean autoConnect = call.getBoolean("autoConnect", true);

        try {
            Intent launchIntent = pm.getLaunchIntentForPackage(ENGINE_PACKAGE);
            if (launchIntent == null) {
                JSObject err = new JSObject();
                err.put("success", false);
                err.put("error", "not_installed");
                call.resolve(err);
                return;
            }

            String serverTarget = host + ":" + port;
            launchIntent.putExtra("username", username);
            launchIntent.putExtra("user", username);
            launchIntent.putExtra("server", serverTarget);
            launchIntent.putExtra("quickPlayMultiplayer", autoConnect ? serverTarget : "");
            launchIntent.putExtra("ramAllocation", ram);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            context.startActivity(launchIntent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("method", "native-intent");
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Oyun başlatılamadı: ", e);
            call.reject("Oyun başlatılamadı: " + e.getMessage());
        }
    }
}
