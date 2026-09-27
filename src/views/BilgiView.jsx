import React, { useState } from 'react';
import { 
  Info, 
  HelpCircle, 
  Terminal, 
  ShieldAlert, 
  MessageSquare, 
  Globe, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Castle,
  Moon
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function BilgiView({ showToast }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    sound.playTap();
    setOpenFaq(openFaq === index ? null : index);
  };

  const townyCommands = [
    { cmd: '/t', desc: 'Kasaba durumunu ve bilgilerini görüntüler' },
    { cmd: '/t new <isim>', desc: 'Yeni bir kasaba kurar' },
    { cmd: '/t claim', desc: 'Bulunduğunuz araziyi kasabaya katar' },
    { cmd: '/t deposit <miktar>', desc: 'Kasaba bankasına para yatırır' },
    { cmd: '/n new <isim>', desc: 'Birden fazla kasabayla Ulus kurar' },
    { cmd: '/ah', desc: 'Açık artırma ve oyuncu ticaret pazarı' }
  ];

  const rules = [
    'Hile, makro, oto-tıklayıcı veya haksız avantaj sağlayan yazılımlar kesinlikle yasaktır.',
    'Towny sınırlarında arazi gaspı (claim blocking) ve kasaba etrafını kasıtlı kapatmak yasaktır.',
    'Genel sohbette küfür, argo, reklam veya diğer oyuncuları rahatsız edici söylemler yasaktır.',
    'Hesap güvenliğiniz kendi sorumluluğunuzdadır, şifrenizi kimseyle paylaşmayınız.'
  ];

  const faqs = [
    {
      q: 'Mobil uygulamadan oyuna nasıl giriş yapabilirim?',
      a: 'Uygulama içinde Minecraft Java 1.20.4 motoru entegre olarak hazır gelir. Ayarlar sekmesinden adınızı kaydedip "TOWNY\'YE BAĞLAN" butonuna basmanız yeterlidir. Harici bir oyun veya hesap satın alımı gerekmez.'
    },
    {
      q: 'Nasıl kasaba kurabilirim?',
      a: 'Sunucuda bir miktar altın/para biriktirdikten sonra sahipsiz bir bölgeye giderek `/t new <KasabaAdı>` komutunu kullanarak kendi kasabanızı anında kurabilirsiniz.'
    },
    {
      q: 'Marketten ürün ve VIP nasıl satın alabilirim?',
      a: 'Resmi web mağazamız olan https://craftlira.com/store adresinden güvenli ödeme ile VIP, Kredi ve kasalar satın alabilirsiniz.'
    },
    {
      q: 'Kuşatma ve savaşlar nasıl işler?',
      a: 'Düşman ilan ettiğiniz kasabaların bayrak alanlarına kuşatma başlatabilir ve savaş puanları toplayarak kasabalarını ele geçirebilirsiniz.'
    }
  ];

  return (
    <div className="bilgi-view-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* Server Specs Header Card */}
      <div className="launcher-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div 
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}
          >
            <Castle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>CraftLira Towny Altyapısı</h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Türkiye Lokasyon • Yüksek FPS & Düşük Ping</span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
          CraftLira Towny; optimize edilmiş sunucu çekirdeği, özel geliştirilmiş kasaba eklentileri ve donanım korumalı DDoS filtrelemesi ile kesintisiz bir Towny deneyimi sunar.
        </p>
      </div>

      {/* Community & Social Links */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <Users size={16} />
            <span>Topluluk & İletişim</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playTap()}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#1a1e2b',
              border: '1px solid rgba(88, 101, 242, 0.3)',
              padding: '10px 12px',
              borderRadius: 10,
              color: '#fff'
            }}
          >
            <MessageSquare size={17} color="#5865f2" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Discord</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Topluluğa Katıl</div>
            </div>
          </a>

          <a
            href="https://craftlira.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playTap()}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#1a1e2b',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '10px 12px',
              borderRadius: 10,
              color: '#fff'
            }}
          >
            <Globe size={17} color="#fbbf24" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Web Sitesi</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>craftlira.com</div>
            </div>
          </a>
        </div>
      </div>

      {/* Towny Commands */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <Terminal size={16} />
            <span>Temel Towny Komutları</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {townyCommands.map((c, i) => (
            <div 
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '7px 10px',
                background: '#0e1017',
                borderRadius: 8,
                fontSize: 12
              }}
            >
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24' }}>{c.cmd}</span>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Section */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <ShieldAlert size={16} />
            <span>Sunucu Kuralları</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rules.map((rule, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#cbd5e1' }}>
              <span style={{ color: '#fbbf24', fontWeight: 800 }}>{idx + 1}.</span>
              <span style={{ lineHeight: 1.4 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="launcher-card">
        <div className="section-title-row">
          <div className="section-title">
            <HelpCircle size={16} />
            <span>Sıkça Sorulan Sorular</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                style={{
                  background: '#0e1017',
                  borderRadius: 8,
                  border: isOpen ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                  overflow: 'hidden'
                }}
              >
                <div 
                  onClick={() => toggleFaq(idx)}
                  style={{
                    padding: '9px 11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: isOpen ? '#fbbf24' : '#fff' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={15} color="#fbbf24" /> : <ChevronDown size={15} color="#94a3b8" />}
                </div>

                {isOpen && (
                  <div style={{ padding: '0 11px 9px 11px', fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Powered by MoonLabs in Bilgi footer */}
      <div style={{ textAlign: 'center', padding: '10px 0 4px 0' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <Moon size={13} color="#fbbf24" />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Altyapı:</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>Powered by MoonLabs</span>
        </div>
      </div>

    </div>
  );
}
