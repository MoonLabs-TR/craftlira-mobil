import React, { useState, useEffect, useCallback } from 'react';
import './styles/launcher.css';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import GoldenParticles from './components/GoldenParticles';
import OynaView from './views/OynaView';
import MarketView from './views/MarketView';
import BilgiView from './views/BilgiView';
import HaberlerView from './views/HaberlerView';
import AyarlarView from './views/AyarlarView';
import LaunchModal from './components/LaunchModal';
import NotificationsModal from './components/NotificationsModal';
import StoreRedirectModal from './components/StoreRedirectModal';
import OnboardingModal from './components/OnboardingModal';
import UpdateModal from './components/UpdateModal';
import Toast from './components/Toast';
import { Wifi, BatteryCharging } from 'lucide-react';
import { sound } from './utils/audio';
import { fetchServerStatus } from './utils/serverStatus';
import { checkForAppUpdates, CURRENT_VERSION } from './utils/versionCheck';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('play');

  // Real Persistent Player Nickname
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('craftlira_player_name') || '';
  });

  // Real Live Minecraft Server Status
  const [serverStatus, setServerStatus] = useState({
    online: false,
    players: 0,
    maxPlayers: 1000,
    version: '1.20.4+',
    ping: 0,
    loading: true
  });

  const [ram, setRam] = useState(4);
  const [soundMuted, setSoundMuted] = useState(false);
  const [fpsBoost, setFpsBoost] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [texturePack, setTexturePack] = useState('default');

  // Direct Server Auto-Connect (QuickPlay)
  const [autoConnect, setAutoConnect] = useState(() => {
    return localStorage.getItem('craftlira_autoconnect') !== 'false';
  });

  // Modals
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  
  // In-App Update Modal
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Mascot Onboarding Tutorial (Shows on first launch)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('craftlira_tutorial_seen');
  });

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Clock
  const [currentTime, setCurrentTime] = useState('19:50');

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2800);
  };

  // Real Live Server Status Query
  const updateStatus = useCallback(async (manual = false) => {
    if (manual) {
      setServerStatus(prev => ({ ...prev, loading: true }));
    }
    const status = await fetchServerStatus();
    setServerStatus({ ...status, loading: false });

    if (manual) {
      if (status.online) {
        showToast(`Sunucu Aktif: ${status.players} oyuncu çevrim içi`);
      } else {
        showToast("Sunucu şu anda çevrimdışı veya bakımda.");
      }
    }
  }, []);

  // Fetch status on mount and poll every 45s
  useEffect(() => {
    updateStatus();
    const interval = setInterval(() => {
      updateStatus();
    }, 45000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Live status bar clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchGame = () => {
    setIsLaunchModalOpen(true);
  };

  const handleOpenStoreModal = () => {
    sound.playTap();
    setIsStoreModalOpen(true);
  };

  const handleGoToSettings = () => {
    setActiveTab('settings');
    setTimeout(() => {
      const input = document.getElementById('settings-username-input');
      if (input) input.focus();
    }, 150);
  };

  const handleCloseTutorial = () => {
    localStorage.setItem('craftlira_tutorial_seen', 'true');
    setIsOnboardingOpen(false);
  };

  const handleTutorialGoToSettings = () => {
    handleCloseTutorial();
    handleGoToSettings();
  };

  // Automatic in-app update check on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForAppUpdates().then((res) => {
        if (res && res.updateAvailable) {
          setUpdateInfo(res);
          setIsUpdateModalOpen(true);
        }
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Manual update check from Settings view
  const handleManualCheckUpdates = async () => {
    sound.playTap();
    showToast("Güncellemeler denetleniyor...");
    const res = await checkForAppUpdates();
    if (res && res.updateAvailable) {
      setUpdateInfo(res);
      setIsUpdateModalOpen(true);
    } else {
      sound.playSuccess();
      showToast(`Uygulamanız güncel! (v${CURRENT_VERSION})`);
    }
  };

  return (
    <div className="launcher-container">
      {/* Mobile Application Container */}
      <div className="device-frame">
        {/* Golden Particles Floating Directly Inside Application */}
        <GoldenParticles />

        {/* Mobile Status Bar (Clock, Camera Notch, WiFi, Battery) */}
        <div className="mobile-status-bar">
          <span>{currentTime}</span>
          <div className="notch-camera"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Wifi size={13} />
            <BatteryCharging size={14} color="#10b981" />
          </div>
        </div>

        {/* Brand Top Header with Real Live Online Status */}
        <TopHeader
          serverStatus={serverStatus}
          onRefreshStatus={() => updateStatus(true)}
          soundMuted={soundMuted}
          setSoundMuted={setSoundMuted}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          hasUnreadNotifications={false}
        />

        {/* Toast Notification */}
        <Toast message={toast.message} visible={toast.visible} />

        {/* Scrollable View Area */}
        <main className="app-scroll-content">
          {activeTab === 'play' && (
            <OynaView
              username={username}
              serverStatus={serverStatus}
              onRefreshStatus={() => updateStatus(true)}
              onLaunchGame={handleLaunchGame}
              onGoToSettings={handleGoToSettings}
              autoConnect={autoConnect}
              showToast={showToast}
            />
          )}

          {activeTab === 'market' && (
            <MarketView
              onRequestStoreModal={handleOpenStoreModal}
              showToast={showToast}
            />
          )}

          {activeTab === 'info' && (
            <BilgiView showToast={showToast} />
          )}

          {activeTab === 'news' && (
            <HaberlerView />
          )}

          {activeTab === 'settings' && (
            <AyarlarView
              username={username}
              setUsername={setUsername}
              ram={ram}
              setRam={setRam}
              soundMuted={soundMuted}
              setSoundMuted={setSoundMuted}
              fpsBoost={fpsBoost}
              setFpsBoost={setFpsBoost}
              hapticEnabled={hapticEnabled}
              setHapticEnabled={setHapticEnabled}
              texturePack={texturePack}
              setTexturePack={setTexturePack}
              autoConnect={autoConnect}
              setAutoConnect={setAutoConnect}
              onCheckUpdates={handleManualCheckUpdates}
              showToast={showToast}
            />
          )}
        </main>

        {/* Mascot First-Launch Tutorial Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={handleCloseTutorial}
          onGoToSettings={handleTutorialGoToSettings}
        />

        {/* Game Launch Modal */}
        <LaunchModal
          isOpen={isLaunchModalOpen}
          onClose={() => setIsLaunchModalOpen(false)}
          username={username || 'Oyuncu'}
          ram={ram}
          autoConnect={autoConnect}
        />

        {/* In-App Update Modal */}
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          updateInfo={updateInfo}
        />

        {/* Notifications Slide-over Modal */}
        <NotificationsModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />

        {/* Store Confirmation Modal */}
        <StoreRedirectModal
          isOpen={isStoreModalOpen}
          onClose={() => setIsStoreModalOpen(false)}
        />

        {/* Bottom Navigation Dock */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNewsCount={0}
          onOpenStore={handleOpenStoreModal}
        />
      </div>
    </div>
  );
}
