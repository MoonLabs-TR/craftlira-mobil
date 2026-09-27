import React, { useState, useEffect } from 'react';
import { 
  User, 
  Volume2, 
  Vibrate, 
  Zap, 
  Cpu, 
  Moon,
  Save,
  Check,
  UserCheck,
  Gamepad2
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function AyarlarView({
  username,
  setUsername,
  ram,
  setRam,
  soundMuted,
  setSoundMuted,
  fpsBoost,
  setFpsBoost,
  hapticEnabled,
  setHapticEnabled,
  texturePack,
  setTexturePack,
  autoConnect = true,
  setAutoConnect,
  showToast
}) {
  const [inputName, setInputName] = useState(username || '');
  const [isSaved, setIsSaved] = useState(Boolean(username && username.trim().length >= 3));

  useEffect(() => {
    setInputName(username || '');
    setIsSaved(Boolean(username && username.trim().length >= 3));
  }, [username]);

  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    const clean = inputName.trim();
    const isValid = /^[a-zA-Z0-9_]{3,16}$/.test(clean);

    if (!isValid) {
      sound.playTap();
      showToast("Geçersiz kullanıcı adı! (3-16 karakter, harf/rakam/alt çizgi)");
      return;
    }

    sound.playSuccess();
    setUsername(clean);
    localStorage.setItem('craftlira_player_name', clean);
    setIsSaved(true);
    showToast(`Oyuncu adınız başarıyla kaydedildi: ${clean}`);
  };

  return (
    <div className="ayarlar-view-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Dedicated Player Profile & Nickname Setup Card */}
      <div 
        className="launcher-card"
        style={{
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          background: '#141722',
          padding: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} color="#fbbf24" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
              Minecraft Oyuncu Adı (Nickname)
            </span>
          </div>
          {isSaved && username && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserCheck size={12} />
              <span>Kaydedildi</span>
            </span>
          )}
        </div>

        {/* Input & Save Box */}
        <form onSubmit={handleSaveName} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div 
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#1c202d',
              border: isSaved ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <img 
              src={`https://mc-heads.net/avatar/${encodeURIComponent(inputName.trim() || 'Steve')}/44`} 
              alt={inputName || 'Steve'}
              onError={(e) => { e.target.src = '/assets/mascot-transparent.png'; }}
              style={{ width: '85%', height: '85%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <input 
              type="text"
              id="settings-username-input"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (isSaved && e.target.value !== username) {
                  setIsSaved(false);
                }
              }}
              placeholder="Oyuncu adınızı girin..."
              maxLength={16}
              style={{
                width: '100%',
                background: '#0d0f15',
                border: isSaved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-launch-primary"
            style={{
              height: 44,
              width: 'auto',
              padding: '0 16px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              gap: 5,
              whiteSpace: 'nowrap'
            }}
          >
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isSaved ? 'Kayıtlı' : 'Kaydet'}</span>
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
          Sunucuya bağlanırken bu kullanıcı adı ile giriş yapacaksınız.
        </p>
      </div>

      {/* CraftLira Dahili Oyun Motoru */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <Gamepad2 size={16} />
            <span>CraftLira Dahili Oyun Motoru</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 6 }}>
            Java 1.20.4 Entegre
          </span>
        </div>

        <div style={{ background: '#0e1017', borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Dahili İstemci Durumu</div>
            <div style={{ fontSize: 10.5, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span>Yüklü ve Hazır</span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800 }}>v1.20.4 Towny</span>
        </div>

        {/* QuickPlay Direct Auto-Connect Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Hızlı Oto-Bağlan (QuickPlay)</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
              Menüyü atlayıp doğrudan play.craftlira.com'a bağlanır
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              const next = !autoConnect;
              setAutoConnect(next);
              localStorage.setItem('craftlira_autoconnect', String(next));
              showToast(next ? "Oto-bağlantı aktif" : "Oto-bağlantı kapatıldı");
            }}
            style={{
              width: 44,
              height: 24,
              borderRadius: 20,
              background: autoConnect ? 'var(--gold-500)' : '#262a36',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: 'none',
              flexShrink: 0
            }}
          >
            <div 
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 3,
                left: autoConnect ? 23 : 3,
                transition: 'left 0.2s'
              }}
            />
          </button>
        </div>
      </div>

      {/* RAM & Hardware Settings */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <Cpu size={16} />
            <span>Bellek (RAM) Tahsisi</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>{ram} GB</span>
        </div>

        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
          Cihazınızın donanımına göre ayrılan RAM miktarı:
        </p>

        <select 
          value={ram}
          onChange={(e) => {
            sound.playTap();
            setRam(Number(e.target.value));
            showToast(`Bellek ayarlandı: ${e.target.value} GB`);
          }}
          style={{
            width: '100%',
            background: '#0d0f15',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 12,
            outline: 'none'
          }}
        >
          <option value={2}>2 GB (Giriş Seviye Cihazlar)</option>
          <option value={3}>3 GB (Standart)</option>
          <option value={4}>4 GB (Önerilen)</option>
          <option value={6}>6 GB (Yüksek Performans)</option>
          <option value={8}>8 GB (En Yüksek)</option>
        </select>
      </div>

      {/* Performance & Toggles */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <Zap size={16} />
            <span>Performans & Arayüz</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* FPS Boost */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>FPS Boost Modu</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Düşük donanımlı telefonlarda performansı artırır</div>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setFpsBoost(!fpsBoost);
                showToast(fpsBoost ? "FPS Boost kapatıldı" : "FPS Boost aktif edildi");
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 20,
                background: fpsBoost ? 'var(--gold-500)' : '#262a36',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div 
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: fpsBoost ? 23 : 3,
                  transition: 'left 0.2s'
                }}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Arayüz Sesleri</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Dokunma ve tıklama sesleri</div>
            </div>
            <button
              onClick={() => {
                const newState = !soundMuted;
                setSoundMuted(newState);
                sound.soundEnabled = !newState;
                if (!newState) sound.playTap();
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 20,
                background: !soundMuted ? 'var(--gold-500)' : '#262a36',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div 
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: !soundMuted ? 23 : 3,
                  transition: 'left 0.2s'
                }}
              />
            </button>
          </div>

          {/* Haptic Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Titreşim (Haptic)</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Dokunmatik telefon titreşimi</div>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                const newState = !hapticEnabled;
                setHapticEnabled(newState);
                sound.hapticEnabled = newState;
                if (newState) sound.vibrate(30);
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 20,
                background: hapticEnabled ? 'var(--gold-500)' : '#262a36',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div 
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: hapticEnabled ? 23 : 3,
                  transition: 'left 0.2s'
                }}
              />
            </button>
          </div>

          {/* Texture Pack Selector */}
          <div style={{ paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Doku Paketi
            </label>
            <select
              value={texturePack}
              onChange={(e) => {
                sound.playTap();
                setTexturePack(e.target.value);
                showToast(`Doku paketi seçildi: ${e.target.value}`);
              }}
              style={{
                width: '100%',
                background: '#0d0f15',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="default">CraftLira Özel HD Paketi</option>
              <option value="faithful">Faithful 32x Klasik</option>
              <option value="pvp-boost">Ultra PvP FPS Boost (Hafif)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Powered By MoonLabs Footer */}
      <div 
        style={{ 
          textAlign: 'center', 
          padding: '16px 0 8px 0', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 6 
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Moon size={14} color="#fbbf24" />
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Powered by</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', letterSpacing: 0.5 }}>MoonLabs</span>
        </div>
        <div style={{ fontSize: 10, color: '#475569' }}>CraftLira Mobile • Towny Edition v1.0.0</div>
      </div>

    </div>
  );
}
