import React from 'react';
import { Bell, Volume2, VolumeX, RotateCw } from 'lucide-react';
import { sound } from '../utils/audio';

export default function TopHeader({ 
  serverStatus,
  onRefreshStatus,
  soundMuted, 
  setSoundMuted,
  onOpenNotifications,
  hasUnreadNotifications
}) {
  const toggleSound = () => {
    const newState = !soundMuted;
    setSoundMuted(newState);
    sound.soundEnabled = !newState;
    if (!newState) {
      sound.playTap();
    }
  };

  const isOnline = serverStatus?.online;
  const playerCount = serverStatus?.players ?? 0;
  const isLoading = serverStatus?.loading;

  return (
    <header className="app-top-header">
      <div className="brand-wrapper">
        <div className="brand-mascot-icon animate-float">
          <img src="./assets/mascot-transparent.png" alt="CraftLira Fox" />
        </div>
        <div className="brand-text">
          <h1>Craft<span>Lira</span></h1>
        </div>
      </div>

      <div className="header-actions">
        {/* Real Live Server Status Badge */}
        <button
          className="server-ping-badge"
          onClick={() => {
            sound.playTap();
            onRefreshStatus();
          }}
          title={
            isLoading
              ? "Sunucu durumu kontrol ediliyor..."
              : isOnline
              ? `${playerCount}/${serverStatus.maxPlayers} Oyuncu Aktif (Tıkla ve Güncelle)`
              : "Sunucu şu an çevrimdışı veya bakımda (Tıkla ve Yenile)"
          }
          style={{
            cursor: 'pointer',
            background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            borderColor: isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            color: isOnline ? '#34d399' : '#f87171'
          }}
        >
          {isLoading ? (
            <RotateCw size={12} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <div 
              className="online-dot" 
              style={{
                backgroundColor: isOnline ? 'var(--color-online)' : '#ef4444',
                boxShadow: isOnline ? '0 0 6px var(--color-online)' : '0 0 6px #ef4444'
              }} 
            />
          )}
          <span>{isLoading ? '...' : isOnline ? playerCount : '0'}</span>
        </button>

        {/* Audio Toggle */}
        <button 
          className="header-icon-btn" 
          onClick={toggleSound}
          title={soundMuted ? "Sesi Aç" : "Sesi Kapat"}
          aria-label="Ses Ayarı"
        >
          {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Notifications */}
        <button 
          className="header-icon-btn" 
          onClick={() => {
            sound.playTap();
            onOpenNotifications();
          }}
          title="Bildirimler"
          aria-label="Bildirimler"
        >
          <Bell size={16} />
          {hasUnreadNotifications && <span className="notif-badge" />}
        </button>
      </div>
    </header>
  );
}
