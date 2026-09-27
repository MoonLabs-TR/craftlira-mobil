import React from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { sound } from '../utils/audio';

export default function NotificationsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 85,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '50px 16px 16px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="launcher-card"
        style={{
          background: '#121722',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 18
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="#fbbf24" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Bildirimler</h3>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{ color: '#94a3b8', fontSize: 18, fontWeight: 700 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Clean Empty State (No API currently) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 16px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#1a1e2b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              marginBottom: 12
            }}
          >
            <BellOff size={22} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Bildiriminiz Yok
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 220, lineHeight: 1.4 }}>
            Şu anda görüntülenecek aktif bir bildirim bulunmuyor.
          </div>
        </div>
      </div>
    </div>
  );
}
