import React from 'react';
import { Settings, ArrowRight, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export default function OnboardingModal({ isOpen, onClose, onGoToSettings }) {
  if (!isOpen) return null;

  const handleGoSettings = () => {
    sound.playTap();
    onGoToSettings();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 10, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        className="launcher-card"
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#131622',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(245, 158, 11, 0.2)',
          borderRadius: 22,
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Wiggling / Rocking Cute Mascot */}
        <div
          className="mascot-wiggle-animation"
          style={{
            width: 105,
            height: 105,
            borderRadius: 28,
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(26, 32, 46, 0.9) 100%)',
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            padding: 6
          }}
        >
          <img
            src="./assets/mascot-transparent.png"
            alt="CraftLira Fox Mascot"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Mascot Speech Bubble */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 18,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={14} color="#fbbf24" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>
              Selam Maceracı!
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
            CraftLira Towny başlatıcısına hoş geldin! Oyuna bağlanmadan önce{' '}
            <b style={{ color: '#fff' }}>Ayarlar</b> sekmesine giderek kendi{' '}
            <b style={{ color: '#fbbf24' }}>Minecraft kullanıcı adını</b> kaydetmelisin.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleGoSettings}
            className="btn-launch-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13,
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Settings size={16} />
            <span>Ayarlara Git & İsim Belirle</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              padding: '8px',
              borderRadius: 10,
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Daha Sonra
          </button>
        </div>
      </div>
    </div>
  );
}
