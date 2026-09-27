import React from 'react';
import { ShoppingBag, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export default function MarketView({ onRequestStoreModal }) {
  return (
    <div className="market-view-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Store Redirect Hero Card */}
      <div 
        className="launcher-card"
        style={{
          background: '#141722',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          textAlign: 'center',
          padding: '28px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14
        }}
      >
        <div 
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: 'rgba(245, 158, 11, 0.15)',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}
        >
          <ShoppingBag size={28} />
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, color: '#fff' }}>
            CraftLira Resmi Mağazası
          </h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
            VIP üyelikler, Towny paraları, kasalar ve kozmetikler resmi web mağazamız üzerinden güvenle temin edilebilir.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            onRequestStoreModal();
          }}
          className="btn-launch-primary"
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '13px 18px',
            fontSize: 14,
            gap: 8,
            marginTop: 4
          }}
        >
          <span>Mağazaya Git (craftlira.com/store)</span>
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Security & Payment highlights */}
      <div className="launcher-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color="#10b981" />
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <b>3D Secure Güvenli Ödeme:</b> Papara, Kredi Kartı ve Havale/EFT.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={18} color="#fbbf24" />
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <b>Anında Otomatik Teslimat:</b> Satın aldığınız ürün saniyeler içinde Towny hesabınıza tanımlanır.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
