import React, { createContext, useContext, useState } from 'react';

const DemoModeContext = createContext();

const DEMO_MODE_STORAGE_KEY = 'NER_LOGISTICS_DEMO_MODE';

export const DemoModeProvider = ({ children }) => {
  const [demoMode, setDemoModeState] = useState(() => {
    try {
      return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setDemoMode = (enabled) => {
    setDemoModeState(enabled);
    try {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to persist demo mode state', e);
    }
  };

  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  return (
    <DemoModeContext.Provider value={{ demoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoModeContext);
