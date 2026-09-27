import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  X, 
  ShieldCheck, 
  Cpu, 
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { 
  checkIsEngineInstalled, 
  downloadAndInstallEngine
} from '../utils/engineInstaller';

export default function EngineInstallerModal({
  isOpen,
  onClose,
  onInstalledSuccess,
  onLaunchGame
}) {
  // states: 'idle' | 'downloading' | 'installing' | 'ready' | 'error'
  const [status, setStatus] = useState('idle');
  const [percent, setPercent] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(85);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setPercent(0);
      setErrorMessage('');
      return;
    }

    // Check if already installed when opening modal
    checkIsEngineInstalled().then((isInstalled) => {
      if (isInstalled) {
        setStatus('ready');
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    sound.playTap();
    setStatus('downloading');
    setPercent(0);
    setErrorMessage('');

    try {
      await downloadAndInstallEngine({
        onProgress: (p) => {
          setPercent(p.percent);
          if (p.bytesDownloaded) {
            setDownloadedMB((p.bytesDownloaded / (1024 * 1024)).toFixed(1));
          }
          if (p.totalBytes) {
            setTotalMB((p.totalBytes / (1024 * 1024)).toFixed(1));
          }
        }
      });

      // İndirme bitti, Android installer açıldı
      sound.playSuccess();
      setStatus('installing');
    } catch (err) {
      console.error('Download error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'İndirme sırasında bir bağlantı sorunu oluştu.');
    }
  };

  const handleVerifyInstallation = async () => {
    sound.playTap();
    const isInstalled = await checkIsEngineInstalled();
    if (isInstalled) {
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setStatus('ready');
      if (onInstalledSuccess) onInstalledSuccess();
    } else {
      // Hala kurulmadıysa kullanıcıyı bilgilendir
      setStatus('installing');
      alert("Motor henüz kurulmamış görünüyor. Lütfen Android kurulum penceresinde 'Yükle' dediğinizden emin olun.");
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(11, 13, 17, 0.95)',
        backdropFilter: 'blur(14px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        overflowY: 'auto'
      }}
    >
      {/* Kapat butonu */}
      <button
        onClick={() => {
          sound.playTap();
          onClose();
        }}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={18} />
      </button>

      {/* Mascot / Engine Icon */}
      <div 
        className={status === 'downloading' ? 'animate-pulse' : 'animate-float'}
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          background: '#161925',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          padding: 8
        }}
      >
        <img 
          src="/assets/mascot-transparent.png" 
          alt="CraftLira Fox" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 4 }}>
        Craft<span style={{ color: '#fbbf24' }}>Lira</span> Oyun Motoru
      </h2>

      {/* Duruma göre içerik */}
      {status === 'idle' && (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>
            Telefondan <b>1.20.4 Towny</b> dünyasına giriş yapabilmek için gerekli oyun motoru tek dokunuşla indirilir ve kurulur.
          </p>

          <div 
            style={{
              width: '100%',
              background: '#131622',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 12,
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 18
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="#fbbf24" />
              <span><b>Oyun Sürümü:</b> Minecraft Java 1.20.4</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={16} color="#10b981" />
              <span><b>Paket Boyutu:</b> ~85 MB (Otomatik İndirme)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span><b>Entegrasyon:</b> oyna.craftlira.com Doğrudan Bağlantı</span>
            </div>
          </div>

          <button
            onClick={handleStartDownload}
            className="btn-launch-primary"
            style={{ width: '100%', padding: '13px', fontSize: 13.5 }}
          >
            <Download size={18} />
            <span>MOTORU İNDİR VE KUR</span>
          </button>
        </div>
      )}

      {status === 'downloading' && (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
            Oyun Motoru İndiriliyor... %{percent}
          </p>

          {/* Progress bar */}
          <div 
            style={{
              width: '100%',
              height: 10,
              background: '#1c202d',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 8
            }}
          >
            <div 
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'var(--gold-gradient)',
                borderRadius: 8,
                transition: 'width 0.25s ease'
              }}
            />
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
            <span>İndirilen: {downloadedMB} MB</span>
            <span>Toplam: {totalMB} MB</span>
          </div>

          <p style={{ fontSize: 11.5, color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
            İndirme tamamlandığında Android sistem kurulum arayüzü otomatik olarak açılacaktır.
          </p>
        </div>
      )}

      {status === 'installing' && (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
            Kurulum Ekranı Başlatıldı!
          </p>

          <div 
            style={{
              width: '100%',
              background: '#131622',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 12,
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <b style={{ color: '#fbbf24' }}>1.</b>
              <span>Açılan pencerede <b>"Yükle"</b> veya <b>"Güncelle"</b> seçeneğine dokunun.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <b style={{ color: '#fbbf24' }}>2.</b>
              <span>Güvenlik uyarısı çıkarsa <b>"Bu kaynaktan izin ver"</b>i açın.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <b style={{ color: '#fbbf24' }}>3.</b>
              <span>Yükleme bitince aşağıdaki <b>"Doğrula"</b> butonuna basın.</span>
            </div>
          </div>

          <button
            onClick={handleVerifyInstallation}
            className="btn-launch-primary"
            style={{ width: '100%', padding: '13px', fontSize: 13.5, marginBottom: 8 }}
          >
            <CheckCircle2 size={18} />
            <span>KURULUMU TAMAMLADIM, DOĞRULA</span>
          </button>

          <button
            onClick={handleStartDownload}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <RotateCw size={13} />
            <span>Kurulum Ekranını Yeniden Aç</span>
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
            <CheckCircle2 size={20} />
            <span>Oyun Motoru Hazır ve Aktif!</span>
          </div>

          <p style={{ fontSize: 12.5, color: '#cbd5e1', textAlign: 'center', marginBottom: 18 }}>
            CraftLira dahili oyun motoru başarıyla kuruldu. Artık tek tıkla doğrudan Towny dünyasına bağlanabilirsiniz.
          </p>

          <button
            onClick={() => {
              sound.playLaunch();
              onClose();
              if (onLaunchGame) onLaunchGame();
            }}
            className="btn-launch-primary"
            style={{ width: '100%', padding: '13px', fontSize: 14 }}
          >
            <Play size={18} fill="#0b0d12" />
            <span>ŞİMDİ TOWNY'YE BAĞLAN</span>
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            <AlertTriangle size={20} />
            <span>Kurulum Başlatılamadı</span>
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>
            {errorMessage || 'İndirme sırasında bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'}
          </p>

          <button
            onClick={handleStartDownload}
            className="btn-launch-primary"
            style={{ width: '100%', padding: '12px', fontSize: 13, marginBottom: 8 }}
          >
            <RotateCw size={16} />
            <span>TEKRAR DENE</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            Vazgeç
          </button>
        </div>
      )}
    </div>
  );
}
