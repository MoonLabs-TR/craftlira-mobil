import React from 'react';
import { ShoppingBag, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

export default function StoreRedirectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const storeUrl = "https://craftlira.com/store";

  const handleConfirm = () => {
    sound.playSuccess();
    window.open(storeUrl, '_blank');
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 10, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="launcher-card"
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#131622',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          borderRadius: 20,
          padding: 20,
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
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

        {/* Store Icon */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: 'rgba(245, 158, 11, 0.15)',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            margin: '0 auto 14px auto'
          }}
        >
          <ShoppingBag size={26} />
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Mağazaya Yönlendiriliyorsunuz
        </h3>

        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 14 }}>
          VIP üyelik, Kredi ve kasalar için resmi web mağazamız olan{' '}
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>craftlira.com/store</span> adresine yönlendirileceksiniz.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 11,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 10px',
            borderRadius: 8,
            marginBottom: 18
          }}
        >
          <ShieldCheck size={14} />
          <span>Resmi & Güvenli Ödeme Bağlantısı</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 12,
              background: '#1c202d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            İptal
          </button>

          <button
            onClick={handleConfirm}
            className="btn-launch-primary"
            style={{
              flex: 1.3,
              padding: '11px',
              borderRadius: 12,
              fontSize: 13,
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <span>Mağazaya Git</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
