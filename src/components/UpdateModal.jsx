import React from 'react';
import { 
  Download, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function UpdateModal({ 
  isOpen, 
  onClose, 
  updateInfo 
}) {
  if (!isOpen || !updateInfo) return null;

  const { 
    currentVersion, 
    latestVersion, 
    downloadUrl, 
    releaseNotes, 
    isForce 
  } = updateInfo;

  const handleDownload = () => {
    sound.playSuccess();
    if (downloadUrl) {
      window.open(downloadUrl, '_system');
    }
    if (!isForce) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(9, 11, 15, 0.94)',
        backdropFilter: 'blur(12px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 18px',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div 
        className="launcher-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: 320,
          background: '#131622',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 20,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 35px rgba(245, 158, 11, 0.2)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Dismiss Button (only if not forced) */}
        {!isForce && (
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Animated Badge Icon */}
        <div 
          className="animate-float"
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.35) 100%)',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)'
          }}
        >
          <Sparkles size={32} color="#fbbf24" />
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
          Yeni Sürüm Yayında!
        </h3>
        <p style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 14 }}>
          CraftLira Mobil için yeni bir güncelleme mevcut.
        </p>

        {/* Version Comparison Pill */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1a1e2d',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 14
          }}
        >
          <span style={{ color: '#94a3b8' }}>v{currentVersion}</span>
          <ArrowRight size={13} color="#f59e0b" />
          <span style={{ color: '#10b981' }}>v{latestVersion}</span>
        </div>

        {/* Release Notes Box */}
        <div 
          style={{
            width: '100%',
            background: '#0d0f15',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 11,
            color: '#cbd5e1',
            textAlign: 'left',
            marginBottom: 16,
            maxHeight: 90,
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} />
            <span>Yenilikler & Düzeltmeler:</span>
          </div>
          <div style={{ lineHeight: 1.4, color: '#94a3b8' }}>
            {releaseNotes || 'Yeni sürüm performansı ve sunucu bağlantı optimizasyonları yapıldı.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleDownload}
            className="btn-launch-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13,
              fontWeight: 800,
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Güncellemeyi İndir (APK)</span>
          </button>

          {!isForce && (
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              Daha Sonra Hatırlat
            </button>
          )}
        </div>

        {/* Security badge */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: '#64748b' }}>
          <ShieldCheck size={11} color="#10b981" />
          <span>Resmi CraftLira Güvenli Güncelleme</span>
        </div>
      </div>
    </div>
  );
}
