import React from 'react';
import { Gamepad2, ShoppingBag, Info, Newspaper, Settings, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

export default function BottomNav({ activeTab, setActiveTab, unreadNewsCount = 0, onOpenStore }) {
  const tabs = [
    { id: 'play', label: 'Oyna', icon: Gamepad2, isMain: true },
    { id: 'market', label: 'Market', icon: ShoppingBag, isExternal: true },
    { id: 'info', label: 'Bilgi', icon: Info },
    { id: 'news', label: 'Haberler', icon: Newspaper, unread: unreadNewsCount > 0 },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  const handleTabClick = (tab) => {
    sound.playTap();
    if (tab.id === 'market') {
      onOpenStore();
      return;
    }
    setActiveTab(tab.id);
  };

  return (
    <nav className="bottom-dock-nav" aria-label="Ana Gezinme Menüsü">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-btn-${tab.id}`}
            onClick={() => handleTabClick(tab)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <div className="icon-wrapper">
              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
              {tab.isExternal && (
                <ExternalLink 
                  size={10} 
                  style={{ position: 'absolute', top: -3, right: -6, color: '#f59e0b' }} 
                />
              )}
              {tab.unread && !isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }}
                />
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
