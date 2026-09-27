import React from 'react';
import { Sparkles, Info } from 'lucide-react';

export default function Toast({ message, visible }) {
  if (!visible || !message) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(21, 27, 39, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        zIndex: 120,
        maxWidth: '90%',
        width: 'max-content',
        animation: 'slideDown 0.25s ease-out'
      }}
    >
      <Sparkles size={16} color="#fbbf24" />
      <span>{message}</span>
    </div>
  );
}
