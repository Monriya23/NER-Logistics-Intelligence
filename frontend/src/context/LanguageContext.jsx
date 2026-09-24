import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { LOCAL_TRANSLATIONS, SUPPORTED_LANGUAGES, getLocalTranslations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('ner_app_language') || 'en';
    } catch {
      return 'en';
    }
  });

  // Start with locally bundled translations for 100% offline availability
  const [translations, setTranslations] = useState(() => getLocalTranslations(currentLang));

  useEffect(() => {
    // Immediately set local translations synchronously for zero flicker / offline readiness
    setTranslations(getLocalTranslations(currentLang));

    // Try fetching fresh translations from backend if online
    const fetchRemoteTranslations = async () => {
      try {
        const res = await api.getTranslations(currentLang);
        if (res && res.success && res.translations) {
          setTranslations(prev => ({
            ...prev,
            ...res.translations
          }));
        }
      } catch (err) {
        // Quietly fallback to local translations when offline
      }
    };
    fetchRemoteTranslations();
  }, [currentLang]);

  const t = useCallback((key, defaultVal) => {
    if (!key) return '';
    return translations[key] || getLocalTranslations(currentLang)[key] || defaultVal || key;
  }, [translations, currentLang]);

  const changeLanguage = (langCode) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      setCurrentLang(langCode);
      try {
        localStorage.setItem('ner_app_language', langCode);
      } catch {}
    }
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        currentLangMeta,
        changeLanguage,
        t,
        translations,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
