import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  Copy, 
  Check, 
  X
} from 'lucide-react';
import { sound } from '../utils/audio';
import { launchGameDirectly, ENGINE_CONFIG } from '../utils/engineInstaller';

export default function LaunchModal({ 
  isOpen, 
  onClose, 
  username, 
  ram = 4, 
  autoConnect = true 
}) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(20);
  const [copiedIp, setCopiedIp] = useState(false);

  const steps = [
    { 
      title: "Dahili CraftLira Motoru Hazırlanıyor...", 
      desc: `Java ${ENGINE_CONFIG.targetVersion} oyun çekirdeği kontrol ediliyor` 
    },
    { 
      title: "Oyuncu Profili & Bellek Tahsisi...", 
      desc: `${username} profili için ${ram} GB RAM ayrılıyor` 
    },
    { 
      title: "Towny Kaynak Paketleri & Dokular...", 
      desc: "Özel arayüz, sesler ve optimizasyonlar yükleniyor" 
    },
    { 
      title: "Towny Sunucusuna Bağlanılıyor...", 
      desc: "oyna.craftlira.com dünyasına doğrudan giriş yapılıyor..." 
    },
    { 
      title: "Minecraft Başlatılıyor...", 
      desc: "CraftLira Towny dünyasına bağlanılıyor, lütfen bekleyin..." 
    }
  ];

  // Execute client trigger
  const triggerClientLaunch = () => {
    sound.playLaunch();
    launchGameDirectly({
      username: username || 'Oyuncu',
      ram,
      autoConnect
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setProgress(20);
      return;
    }

    const timers = [
      setTimeout(() => { setStep(1); setProgress(45); }, 500),
      setTimeout(() => { setStep(2); setProgress(75); }, 1100),
      setTimeout(() => { setStep(3); setProgress(90); }, 1700),
      setTimeout(() => { 
        setStep(4); 
        setProgress(100); 
        sound.playSuccess();
        triggerClientLaunch();
      }, 2300)
    ];

    return () => timers.forEach(clearTimeout);
  }, [isOpen, username, ram, autoConnect]);

  const handleCopyIp = () => {
    sound.playSuccess();
    navigator.clipboard?.writeText(ENGINE_CONFIG.serverHost);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(11, 13, 17, 0.95)',
        backdropFilter: 'blur(14px)',
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 18px',
        overflowY: 'auto'
      }}
    >
      {/* Close button at top right */}
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

      {/* Mascot Graphic */}
      <div 
        className={step === 4 ? '' : 'animate-float'}
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          background: '#161925',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          padding: 8
        }}
      >
        <img 
          src="./assets/mascot-transparent.png" 
          alt="CraftLira Fox" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 4 }}>
        Craft<span style={{ color: '#fbbf24' }}>Lira</span> Towny
      </h2>
      
      <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>
        {steps[step].title}
      </p>

      {/* Progress Bar */}
      <div 
        style={{
          width: '100%',
          maxWidth: 300,
          height: 7,
          background: '#1c202d',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 8
        }}
      >
        <div 
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--gold-gradient)',
            borderRadius: 8,
            transition: 'width 0.35s ease'
          }}
        />
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, textAlign: 'center', maxWidth: 290, minHeight: 28 }}>
        {steps[step].desc}
      </div>

      {/* Client Launch Parameters Box */}
      <div 
        style={{
          width: '100%',
          maxWidth: 300,
          background: '#131622',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 11,
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Oyuncu:</span>
          <span style={{ fontWeight: 700, color: '#fff' }}>{username}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Oyun Motoru:</span>
          <span style={{ fontWeight: 700, color: '#fbbf24' }}>
            Dahili CraftLira Java (1.20.4)
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Bağlantı:</span>
          <span style={{ fontWeight: 700, color: '#10b981' }}>oyna.craftlira.com (Oto-Giriş)</span>
        </div>
      </div>

      {/* When Launched (Step 4) Action Controls */}
      {step === 4 ? (
        <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {/* Re-trigger launch */}
          <button
            onClick={triggerClientLaunch}
            className="btn-launch-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <RotateCw size={16} />
            <span>Oyunu Tekrar Aç / Bağlan</span>
          </button>

          {/* Quick Copy IP Button */}
          <button
            onClick={handleCopyIp}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              background: '#1a1e2b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            {copiedIp ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedIp ? 'Sunucu IP Kopyalandı' : 'oyna.craftlira.com IP Kopyala'}</span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              padding: '8px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: 11,
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            Kapat
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#94a3b8',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          İptal Et
        </button>
      )}
    </div>
  );
}
