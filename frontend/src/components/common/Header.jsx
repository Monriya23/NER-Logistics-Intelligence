import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { useNotifications } from '../../context/NotificationContext';
import { ConnectivityBadge } from './ConnectivityBadge';
import {
  Truck,
  Navigation,
  Radio,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Globe,
  MoreVertical,
  SlidersHorizontal,
  Activity,
  FileText,
  BarChart3,
  RefreshCw,
  Info,
  Check,
  Bell
} from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { currentLang, changeLanguage, t, supportedLanguages, currentLangMeta } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);

  const headerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowSwitchMenu(false);
        setShowThemeMenu(false);
        setShowMoreMenu(false);
        setShowNotificationMenu(false);
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4 Primary Workspace Tabs
  const primaryRoleTabs = [
    { id: 'logistics', label: t('logistics_coordinator', 'Logistics'), fullLabel: 'LOGISTICS COORDINATOR', icon: Truck },
    { id: 'driver', label: t('driver', 'Driver'), fullLabel: 'DRIVER', icon: Navigation },
    { id: 'field_reports', label: t('field_reporter', 'Field Reports'), fullLabel: 'FIELD REPORTER', icon: Radio },
    { id: 'authority', label: t('authority_verifier', 'Authority'), fullLabel: 'AUTHORITY / VERIFIER', icon: ShieldCheck }
  ];

  // Role workspaces for compact Switch menu
  const roleWorkspaces = [
    {
      id: 'logistics',
      role: 'Logistics Coordinator',
      subtext: 'Plan and monitor essential-goods movement',
      icon: Truck,
      color: '#0284C7'
    },
    {
      id: 'driver',
      role: 'Driver',
      subtext: 'Receive route alerts and report road conditions',
      icon: Navigation,
      color: '#0D9488'
    },
    {
      id: 'field_reports',
      role: 'Field Reporter',
      subtext: 'Capture incidents and road conditions from the ground',
      icon: Radio,
      color: '#D97706'
    },
    {
      id: 'authority',
      role: 'Authority / Verifier',
      subtext: 'Verify incidents and update operational road status',
      icon: ShieldCheck,
      color: '#059669'
    }
  ];

  const handleSelectNav = (tabId) => {
    setActiveTab(tabId);
    setShowMoreMenu(false);
    setShowSwitchMenu(false);
  };

  const closeAllPopups = () => {
    setShowSwitchMenu(false);
    setShowThemeMenu(false);
    setShowMoreMenu(false);
    setShowNotificationMenu(false);
    setShowLangMenu(false);
  };

  // Helper to determine if a workspace tab is active
  const isTabActive = (tabId) => {
    if (tabId === 'logistics') {
      return activeTab === 'logistics' || activeTab === 'control_center' || activeTab === 'deliveries' || activeTab === 'fleet_goods';
    }
    if (tabId === 'driver') {
      return activeTab === 'driver' || activeTab === 'driver_hud';
    }
    if (tabId === 'field_reports') {
      return activeTab === 'field_reports' || activeTab === 'field_portal';
    }
    if (tabId === 'authority') {
      return activeTab === 'authority' || activeTab === 'authority_area' || activeTab === 'admin_verification';
    }
    return activeTab === tabId;
  };

  return (
    <header
      ref={headerRef}
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Top Government Identification Strip */}
      <div
        style={{
          background: 'var(--bg-header-top)',
          color: '#EDF3EF',
          padding: '0.25rem 1.5rem',
          fontSize: '0.74rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--brand-accent)', fontWeight: 800 }}>MDoNER</span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span>Ministry of Development of North Eastern Region</span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span style={{ color: '#DCE2E7', fontWeight: 500 }}>Regional Infrastructure Intelligence</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem' }}>
          <span style={{ opacity: 0.7 }}>Sikkim Operational Pilot •</span>
          <span style={{ fontWeight: 600, color: '#FFFFFF' }}>8-State Coverage</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div
        style={{
          maxWidth: '1680px',
          margin: '0 auto',
          padding: '0.45rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          minHeight: '50px'
        }}
      >
        {/* Left: Product Brand Lockup with Master Logo Mark */}
        <div
          onClick={() => handleSelectNav('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', flexShrink: 0 }}
          title="Return to NEVIA Landing Portal"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <img
              src="/brand/nevia-mark.svg"
              alt="NEVIA"
              style={{ width: '24px', height: '24px' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.12em', lineHeight: 1.1, fontFamily: "'Inter', sans-serif" }}>
              NEVIA
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase' }}>
              Regional Mobility Intelligence
            </div>
          </div>
        </div>

        {/* Center: 4 Primary Role Workspaces Navigation (Hidden on Landing Page) */}
        {activeTab !== 'landing' && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {primaryRoleTabs.map((tab) => {
              const active = isTabActive(tab.id);
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectNav(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    background: active ? 'var(--brand-accent-subtle)' : 'transparent',
                    color: active ? 'var(--brand-accent)' : 'var(--text-secondary)',
                    border: '1px solid transparent',
                    fontSize: '0.84rem',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    position: 'relative'
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '0.85rem',
                        right: '0.85rem',
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
        )}

        {/* Right: Utility Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* 1. [ Connected ] Indicator */}
          <ConnectivityBadge />

          {/* 2. [ Notifications ] Bell (Shown in Workspace mode) */}
          {activeTab !== 'landing' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const willOpen = !showNotificationMenu;
                  closeAllPopups();
                  setShowNotificationMenu(willOpen);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: unreadCount > 0 ? 'var(--color-critical-bg)' : 'var(--bg-surface)',
                  color: unreadCount > 0 ? 'var(--color-critical)' : 'var(--text-secondary)',
                  border: unreadCount > 0 ? '1px solid var(--color-critical-border)' : '1px solid var(--border-default)',
                  padding: '0.35rem 0.55rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  minWidth: '32px',
                  height: '30px'
                }}
                title={`Notifications (${unreadCount} unread)`}
              >
                <Bell size={14} />
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
                    maxHeight: '380px',
                    overflowY: 'auto',
                    zIndex: 1200,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      padding: '0.55rem 0.85rem',
                      background: 'var(--bg-subtle)',
                      borderBottom: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {t('notifications', 'Operational Notifications')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {unreadCount} unread
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      No active notifications
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {notifications.map((item) => (
                        <div
                          key={item.notification_id}
                          style={{
                            padding: '0.65rem 0.85rem',
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
                                fontSize: '0.65rem',
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
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                            {item.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. [ English ] Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                const willOpen = !showLangMenu;
                closeAllPopups();
                setShowLangMenu(willOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-default)',
                padding: '0.35rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                height: '30px'
              }}
              title="Select Operational Language"
            >
              <Globe size={14} color="var(--brand-accent)" />
              <span>{currentLangMeta?.nativeName || 'English'}</span>
              <ChevronDown size={12} />
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
                  gap: '0.2rem',
                  width: '145px'
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
                      <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>({item.name})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. [ Theme ] Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                const willOpen = !showThemeMenu;
                closeAllPopups();
                setShowThemeMenu(willOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-default)',
                padding: '0.35rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                height: '30px'
              }}
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? <Moon size={14} /> : theme === 'system' ? <Laptop size={14} /> : <Sun size={14} />}
              <span style={{ textTransform: 'capitalize' }}>{theme}</span>
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
                  padding: '0.3rem',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  width: '125px'
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
                        gap: '0.45rem',
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
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. [ Switch ] Workspace Selector (Shown in Workspace mode) */}
          {activeTab !== 'landing' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const willOpen = !showSwitchMenu;
                  closeAllPopups();
                  setShowSwitchMenu(willOpen);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: showSwitchMenu ? 'var(--brand-accent)' : 'var(--brand-navy)',
                  color: '#FFFFFF',
                  border: '1px solid transparent',
                  padding: '0.35rem 0.7rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '30px',
                  boxShadow: 'var(--shadow-xs)'
                }}
                title="Switch Operational Workspace"
              >
                <RefreshCw size={13} />
                <span>{t('switch', 'Switch Role')}</span>
                <ChevronDown size={12} />
              </button>

              {showSwitchMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.45rem',
                    zIndex: 1200,
                    width: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.2rem 0.5rem' }}>
                    Select Operational Workspace
                  </div>

                  {roleWorkspaces.map((ws) => {
                    const Icon = ws.icon;
                    const isActive = isTabActive(ws.id);

                    return (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectNav(ws.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.55rem',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-xs)',
                          background: isActive ? 'var(--brand-accent-subtle)' : 'transparent',
                          border: isActive ? '1px solid var(--brand-accent)' : '1px solid transparent',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            background: ws.color,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}
                        >
                          <Icon size={13} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? 'var(--brand-accent)' : 'var(--text-main)' }}>
                            {ws.role}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.25 }}>
                            {ws.subtext}
                          </div>
                        </div>
                        {isActive && <Check size={14} color="var(--brand-accent)" style={{ flexShrink: 0, marginTop: '3px' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6. [ ⋮ More ] Advanced Options (Model Validation, Provenance, System Info) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                const willOpen = !showMoreMenu;
                closeAllPopups();
                setShowMoreMenu(willOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: showMoreMenu ? 'var(--brand-accent-subtle)' : 'var(--bg-surface)',
                color: showMoreMenu ? 'var(--brand-accent)' : 'var(--text-main)',
                border: '1px solid var(--border-default)',
                padding: '0.35rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                height: '30px'
              }}
              title="More Options"
            >
              <MoreVertical size={15} />
              <span>{t('more', 'More')}</span>
            </button>

            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.45rem',
                  zIndex: 1200,
                  width: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.2rem 0.45rem' }}>
                    Advanced & Verification
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => handleSelectNav('operational_validation')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: activeTab === 'operational_validation' ? 'var(--brand-accent-subtle)' : 'transparent',
                        color: activeTab === 'operational_validation' ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: activeTab === 'operational_validation' ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Activity size={14} />
                      <span>{t('model_validation', 'Model Validation')}</span>
                    </button>

                    <button
                      onClick={() => handleSelectNav('data_audit')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: activeTab === 'data_audit' ? 'var(--brand-accent-subtle)' : 'transparent',
                        color: activeTab === 'data_audit' ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: activeTab === 'data_audit' ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <FileText size={14} />
                      <span>{t('data_provenance', 'Data Provenance')}</span>
                    </button>

                    <button
                      onClick={() => handleSelectNav('analytics')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: activeTab === 'analytics' ? 'var(--brand-accent-subtle)' : 'transparent',
                        color: activeTab === 'analytics' ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: activeTab === 'analytics' ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <BarChart3 size={14} />
                      <span>{t('operational_analytics', 'Operational Analytics')}</span>
                    </button>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.2rem 0.45rem' }}>
                    Diagnostics & Portal
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => {
                        toggleDemoMode();
                        setShowMoreMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: demoMode ? 'var(--color-monitor-bg)' : 'transparent',
                        color: demoMode ? 'var(--color-monitor)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: demoMode ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SlidersHorizontal size={14} />
                        <span>{t('simulation_mode', 'Simulation Controls')}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {demoMode ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectNav('landing')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: activeTab === 'landing' ? 'var(--brand-accent-subtle)' : 'transparent',
                        color: activeTab === 'landing' ? 'var(--brand-accent)' : 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: activeTab === 'landing' ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Globe size={14} />
                      <span>{t('landing_portal', 'NEVIA Landing Portal')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSystemModal(true);
                        setShowMoreMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '3px',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Info size={14} />
                      <span>{t('system_status', 'System Information')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information Modal */}
      {showSystemModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 17, 31, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowSystemModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.45rem',
              maxWidth: '540px',
              width: '92%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/brand/nevia-mark.svg" alt="NEVIA" style={{ width: '24px', height: '24px' }} />
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                  NEVIA • System Information
                </span>
              </div>
              <button
                onClick={() => setShowSystemModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Platform Identity</div>
                <div>NEVIA — Regional Mobility Intelligence Platform</div>
              </div>

              <div><strong>Problem Statement:</strong> SIH26002 (Smart Mountain Logistics & Road Accessibility)</div>
              <div><strong>Ministry:</strong> Ministry of Development of North Eastern Region (MDoNER)</div>
              <div><strong>Development Team:</strong> INNOVEXA</div>
              <div><strong>Geographic Scope:</strong> 8 North Eastern States (Sikkim Active Pilot + 7 Representative Corridors)</div>
              <div><strong>Core Framework:</strong> OBSERVE → PREDICT → VERIFY → ROUTE → DELIVER</div>
              <div><strong>Operational Workspaces:</strong> Logistics Coordinator • Driver • Field Reporter • Authority / Verifier</div>
              <div><strong>ML Engine:</strong> Monotonic Calibrated HistGradientBoosting Classifier (8-Feature Schema)</div>
              <div><strong>Weather Ingestion:</strong> India Meteorological Department (IMD) AWS Integration Layer</div>
              <div><strong>Offline Protocol:</strong> IndexedDB Client Store-and-Forward + Dual Sync Queue</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
