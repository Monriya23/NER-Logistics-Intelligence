import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const SimulationContext = createContext();

export const SimulationProvider = ({ children, onStateChange }) => {
  const [simState, setSimState] = useState({
    current_step_number: 1,
    total_steps: 10,
    title: '1. Emergency Medicine Requisition Logged',
    description: 'Chungthang Primary Health Centre (PHC) reports critical shortage of Polyvalent Snake Anti-Venom.',
    active_roles: ['LOGISTICS_MANAGER'],
    all_steps: []
  });
  const [loading, setLoading] = useState(false);

  const fetchState = async () => {
    try {
      const res = await api.getSimulationState();
      if (res.success) {
        setSimState(res.state);
      }
    } catch (err) {
      console.warn('Simulation state fetch failed', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const goToStep = async (stepNum) => {
    setLoading(true);
    try {
      const res = await api.executeSimulationStep(stepNum);
      if (res.success) {
        setSimState(res.state);
        if (onStateChange) onStateChange();
        if (stepNum === 10) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Error executing step', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    setLoading(true);
    try {
      const res = await api.advanceSimulation();
      if (res.success) {
        setSimState(res.state);
        if (onStateChange) onStateChange();
        if (res.state.current_step_number === 10) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Error advancing step', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.resetSimulation();
      if (res.success) {
        setSimState(res.state);
        if (onStateChange) onStateChange();
      }
    } catch (err) {
      console.error('Error resetting simulation', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimulationContext.Provider value={{
      simState,
      loading,
      goToStep,
      nextStep,
      resetSimulation,
      refreshState: fetchState
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
