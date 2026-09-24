import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { useNotifications } from '../../context/NotificationContext';
import { ConnectivityBadge } from './ConnectivityBadge';
import {
  Compass,
  Navigation,
  Radio,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Sliders,
  Layers,
  Truck,
  Bell,
  Globe
} from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { currentLang, changeLanguage, t, supportedLanguages, currentLangMeta } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Helper to determine active role name
  const getCurrentRoleInfo = () => {
    switch (activeTab) {
      case 'driver_hud':
        return { name: t('driver', 'Driver'), id: 'driver_hud' };
      case 'field_portal':
        return { name: t('field_reporter', 'Field Reporter'), id: 'field_portal' };
      case 'admin_verification':
      case 'data_audit':
      case 'operational_validation':
        return { name: t('authority_verifier', 'Authority / Verifier'), id: 'admin_verification' };
      case 'landing':
        return { name: t('switch_role', 'Role Selection'), id: 'landing' };
      case 'control_center':
      case 'deliveries':
      case 'fleet_goods':
      case 'road_intelligence':
      case 'analytics':
      default:
        return { name: t('coordinator', 'Logistics Coordinator'), id: 'control_center' };
    }
  };

  const currentRole = getCurrentRoleInfo();

  // Navigation items specific to role context
  const getNavTabsForRole = () => {
    if (activeTab === 'landing') return [];

    if (currentRole.id === 'control_center') {
      return [
        { id: 'control_center', label: t('dashboard', 'Operations') },
        { id: 'deliveries', label: t('deliveries', 'Deliveries') },
        { id: 'fleet_goods', label: t('fleet_goods', 'Fleet & Hubs') },
        { id: 'road_intelligence', label: t('road_intelligence', 'Road Network') },
        { id: 'analytics', label: t('analytics', 'Analytics') }
      ];
    }

    if (currentRole.id === 'driver_hud') {
      return [
        { id: 'driver_hud', label: t('driver_hud', 'Driver Console') }
      ];
    }

    if (currentRole.id === 'field_portal') {
      return [
        { id: 'field_portal', label: t('field_portal', 'Field Report') }
      ];
    }

    if (currentRole.id === 'admin_verification') {
      return [
        { id: 'admin_verification', label: t('admin_verification', 'Triage Center') },
        { id: 'operational_validation', label: 'Model Validation' },
        { id: 'data_audit', label: 'Data Provenance' }
      ];
    }

    return [];
  };

  const navTabs = getNavTabsForRole();

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Top Government Information Strip */}
      <div
        style={{
          background: 'var(--bg-header-top)',
          color: '#EDF3EF',
          padding: '0.28rem 1.5rem',
          fontSize: '0.72rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--brand-accent)', fontWeight: 700 }}>SIH26002</span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span>Ministry of Development of North Eastern Region (MDoNER)</span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span style={{ color: '#DCE2E7', fontWeight: 600 }}>Team INNOVEXA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem' }}>
          <span style={{ opacity: 0.65 }}>Pilot Sector:</span>
          <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Gangtok & North Sikkim Corridors</span>
        </div>
      </div>

      {/* Main Operational Command Bar */}
      <div
        style={{
          maxWidth: '1650px',
          margin: '0 auto',
          padding: '0.45rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          minHeight: '50px'
        }}
      >
        {/* Left: Product Title */}
        <div
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          title="Return to Welcome Screen"
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--brand-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Compass size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              NER Logistics Intelligence
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              North Eastern Region • Gangtok / North Sikkim
            </div>
          </div>
        </div>

        {/* Center: Contextual Navigation with Subtle Active Indicator */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-xs)',
                  background: isActive ? 'var(--brand-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  position: 'relative'
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0.8rem',
                      right: '0.8rem',
                      height: '2px',
                      background: 'var(--brand-accent)',
                      borderRadius: '1px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls (Connectivity, Theme, Simulation, Role Switcher) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* Connectivity Status */}
          <ConnectivityBadge />

          {/* Notification Intelligence Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: unreadCount > 0 ? 'var(--color-critical-bg)' : 'var(--bg-surface)',
                color: unreadCount > 0 ? 'var(--color-critical)' : 'var(--text-secondary)',
                border: unreadCount > 0 ? '1px solid var(--color-critical-border)' : '1px solid var(--border-default)',
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                minWidth: '32px',
                height: '28px'
              }}
              title={`Notifications (${unreadCount} unread)`}
            >
              <Bell size={13} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--color-critical)',
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    padding: '0 4px',
                    minWidth: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1200,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Intelligence Notifications
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {unreadCount} unread
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    No operational notifications
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((item) => (
                      <div
                        key={item.notification_id}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderBottom: '1px solid var(--border-default)',
                          background: item.is_read ? 'transparent' : 'var(--brand-accent-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: item.severity === 'CRITICAL' ? 'var(--color-critical-bg)' : item.severity === 'HIGH' ? 'var(--color-warning-bg)' : 'var(--bg-subtle)',
                              color: item.severity === 'CRITICAL' ? 'var(--color-critical)' : item.severity === 'HIGH' ? 'var(--color-warning)' : 'var(--text-secondary)'
                            }}
                          >
                            {item.severity} • {item.role}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {item.message}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                          {item.action_label && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                              ⚡ {item.action_label}
                            </span>
                          )}
                          {!item.is_read && (
                            <button
                              onClick={() => markAsRead(item.notification_id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0
                              }}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multilingual Operational Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowThemeMenu(false);
                setShowNotificationMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-default)',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Select Operational Language"
            >
              <Globe size={13} color="var(--brand-accent)" />
              <span>{currentLangMeta?.nativeName || 'English'}</span>
              <ChevronDown size={11} />
            </button>

            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '0.3rem',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  width: '150px'
                }}
              >
                {(supportedLanguages || []).map((item) => {
                  const isSelected = currentLang === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        changeLanguage(item.code);
                        setShowLangMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: isSelected ? 'var(--brand-accent-subtle)' : 'transparent',
                        color: isSelected ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span>{item.nativeName}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.65 }}>({item.name})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
              title="Toggle Theme: Light, Dark, System"
            >
              {theme === 'dark' ? <Moon size={12} /> : theme === 'light' ? <Sun size={12} /> : <Laptop size={12} />}
              <span style={{ textTransform: 'capitalize' }}>{theme}</span>
              <ChevronDown size={11} />
            </button>

            {showThemeMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '0.25rem',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  width: '105px'
                }}
              >
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTheme(item.id);
                        setShowThemeMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '3px',
                        background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                        color: isSelected ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Icon size={12} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Demo Mode Subtle Switch */}
          <button
            onClick={toggleDemoMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: demoMode ? 'var(--color-monitor-bg)' : 'var(--bg-surface)',
              color: demoMode ? 'var(--color-monitor)' : 'var(--text-secondary)',
              border: demoMode ? '1px solid var(--color-monitor-border)' : '1px solid var(--border-default)',
              padding: '0.3rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.76rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Toggle SIH Scenario Simulation Stepper"
          >
            <Sliders size={12} />
            <span>{demoMode ? 'Simulation Active' : 'Simulation'}</span>
          </button>

          {/* Current Role Badge & Switch Role CTA */}
          {activeTab !== 'landing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  padding: '0.3rem 0.55rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.76rem',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                {currentRole.name}
              </div>

              <button
                onClick={() => setActiveTab('landing')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.55rem' }}
                title="Switch to another operational role"
              >
                Switch
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
