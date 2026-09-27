import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Server, 
  Castle, 
  Swords, 
  Coins, 
  Settings, 
  RotateCw,
  Download
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function OynaView({ 
  username, 
  serverStatus,
  onRefreshStatus,
  onLaunchGame,
  onGoToSettings,
  isEngineInstalled = false,
  onRequestEngineInstall,
  autoConnect = true,
  showToast
}) {
  const [copied, setCopied] = useState(false);

  const serverIP = "play.craftlira.com";

  const handleCopyIP = () => {
    sound.playSuccess();
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    showToast("Sunucu IP kopyalandı: play.craftlira.com");
    setTimeout(() => setCopied(false), 2200);
  };

  const handleConnect = () => {
    if (!isEngineInstalled) {
      sound.playTap();
      if (onRequestEngineInstall) onRequestEngineInstall();
      return;
    }

    if (!username || username.trim().length < 3) {
      sound.playTap();
      showToast("Lütfen önce Ayarlar sekmesinden Minecraft kullanıcı adınızı belirleyin!");
      onGoToSettings();
      return;
    }

    sound.playLaunch();
    onLaunchGame();
  };

  const isOnline = serverStatus?.online;
  const playerCount = serverStatus?.players ?? 0;
  const maxPlayers = serverStatus?.maxPlayers ?? 1000;
  const isLoading = serverStatus?.loading;

  return (
    <div className="oyna-view-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Hero Banner Card with Mascot */}
      <div 
        className="launcher-card hero-banner-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          background: '#141722',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          position: 'relative'
        }}
      >
        {/* Banner Image */}
        <div 
          style={{
            height: 135,
            width: '100%',
            backgroundImage: 'url(/assets/banner.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(11, 13, 17, 0.2) 0%, rgba(20, 23, 34, 0.95) 100%)'
            }}
          />

          {/* Towny Tag */}
          <div 
            style={{
              position: 'absolute',
              top: 10,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(15, 17, 24, 0.85)',
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid rgba(245, 158, 11, 0.35)',
              fontSize: 11,
              fontWeight: 700,
              color: '#fbbf24'
            }}
          >
            <Castle size={13} />
            <span>TÜRKİYE'NİN LİDER TOWNY SUNUCUSU</span>
          </div>
        </div>

        {/* Mascot & Server Details */}
        <div style={{ padding: '0 15px 15px 15px', marginTop: -38, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src="/assets/mascot-transparent.png" 
                alt="CraftLira Fox" 
                className="animate-float"
                style={{ 
                  width: 62, 
                  height: 62, 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 14px rgba(245, 158, 11, 0.4))'
                }}
              />

              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                  Craft<span style={{ color: '#fbbf24' }}>Lira</span> Towny
                </h2>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Minecraft Java 1.20.4+ (Entegre)
                </div>
              </div>
            </div>

            {/* Real Live Server Online Status */}
            <div 
              onClick={onRefreshStatus}
              style={{ 
                textAlign: 'right', 
                fontSize: 11, 
                fontWeight: 700, 
                color: isOnline ? '#10b981' : '#f87171',
                cursor: 'pointer'
              }}
              title="Sunucu durumunu güncellemek için tıkla"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                {isLoading ? (
                  <RotateCw size={10} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span 
                    className="online-dot pulsing-indicator" 
                    style={{ background: isOnline ? 'var(--color-online)' : '#ef4444' }} 
                  />
                )}
                <span>{isLoading ? 'KONTROL...' : isOnline ? 'AKTİF' : 'ÇEVRİMDISI'}</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 10 }}>
                {isOnline ? `${playerCount}/${maxPlayers} Oyuncu` : 'Sunucu Kapalı'}
              </span>
            </div>
          </div>

          {/* Quick Copy IP Box */}
          <div 
            onClick={handleCopyIP}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Server size={18} color="#fbbf24" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
                  {serverIP}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Sunucu Adresi • Dokun ve Kopyala
                </div>
              </div>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: copied ? '#10b981' : '#f59e0b',
                background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                padding: '5px 10px',
                borderRadius: 8
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Player Card & Launch Action */}
      <div className="launcher-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div 
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#1c202d',
                border: username ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img 
                src={`https://mc-heads.net/avatar/${encodeURIComponent(username || 'Steve')}/40`} 
                alt={username || 'Steve'}
                onError={(e) => { e.target.src = '/assets/mascot-transparent.png'; }}
                style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Aktif Oyuncu
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: username ? '#fff' : '#f87171' }}>
                {username ? username : 'İsim Belirlenmedi'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onGoToSettings();
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: '#1c202d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fbbf24',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer'
            }}
          >
            <Settings size={13} />
            <span>{username ? 'Ayarlardan Değiştir' : 'İsim Belirle'}</span>
          </button>
        </div>

        {/* Connect / Launch Button */}
        <button 
          id="main-launch-btn"
          className="btn-launch-primary"
          onClick={handleConnect}
          style={{
            background: isEngineInstalled 
              ? 'var(--gold-gradient)' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          }}
        >
          {isEngineInstalled ? (
            <>
              <Play size={18} fill="#0b0d12" />
              <span>TOWNY'YE BAĞLAN</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>OYUN MOTORUNU KUR (1.20.4)</span>
            </>
          )}
        </button>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10.5, color: '#94a3b8' }}>
          <span 
            style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              background: isEngineInstalled ? '#10b981' : '#f59e0b', 
              display: 'inline-block' 
            }} 
          />
          <span style={{ color: isEngineInstalled ? '#cbd5e1' : '#fbbf24', fontWeight: isEngineInstalled ? 400 : 700 }}>
            {isEngineInstalled 
              ? 'Dahili CraftLira Motoru (1.20.4) Hazır • Doğrudan Giriş' 
              : 'Oyun Motoru Kurulu Değil • Dokun ve Tek Tıkla Kur'}
          </span>
        </div>
      </div>

      {/* Towny Gameplay Highlights */}
      <div className="launcher-card" style={{ padding: '14px 15px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Castle size={16} color="#fbbf24" />
          <span>Towny Dünyası Hakkında</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0e1017', padding: '9px 12px', borderRadius: 10 }}>
            <Castle size={16} color="#f59e0b" />
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <b style={{ color: '#fff' }}>Kasaba ve Ulus Sistemi:</b> Kendi kasabanı kur, halkını topla ve imparatorluğunu büyüt.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0e1017', padding: '9px 12px', borderRadius: 10 }}>
            <Swords size={16} color="#ef4444" />
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <b style={{ color: '#fff' }}>Kuşatmalar ve Savaşlar:</b> Düşman kasabalara savaş ilan et, topraklarını genişlet.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0e1017', padding: '9px 12px', borderRadius: 10 }}>
            <Coins size={16} color="#fbbf24" />
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <b style={{ color: '#fff' }}>Dengeli Ekonomi:</b> Meslekler, pazar ve açık artırma ile altınlarını biriktir.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
