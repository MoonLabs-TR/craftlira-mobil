import React from 'react';
import { Newspaper } from 'lucide-react';

export default function HaberlerView() {
  return (
    <div className="haberler-view-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Clean Empty State - News API not available yet */}
      <div 
        className="launcher-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
          background: '#141722',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#1a1e2b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            marginBottom: 14
          }}
        >
          <Newspaper size={24} />
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          Henüz Haber Bulunmuyor
        </h3>

        <p style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260, lineHeight: 1.5 }}>
          Şu anda yayınlanmış aktif bir duyuru bulunmuyor. Sunucu güncellemeleri ve etkinlikler paylaşıldığında burada görüntülenecektir.
        </p>
      </div>

    </div>
  );
}
