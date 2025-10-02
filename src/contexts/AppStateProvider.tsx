'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { BatchInstruction } from '@/lib/batchTransactionBuilder';

export interface AppState {
  batchBuilder: {
    instructions: BatchInstruction[];
    simulationHistory: Array<{
      timestamp: number;
      totalComputeUnits: number;
      totalFee: number;
      canBatch: boolean;
    }>;
  };
  simulation: {
    lastComputeUnitLimit: number;
    lastComputeUnitPrice: number;
    favoritePresets: string[];
  };
  preferences: {
    autoSaveEnabled: boolean;
    showAdvancedOptions: boolean;
    defaultSimulationMode: 'conservative' | 'standard' | 'aggressive';
  };
}

type AppAction =
  | { type: 'ADD_BATCH_INSTRUCTION'; payload: BatchInstruction }
  | { type: 'REMOVE_BATCH_INSTRUCTION'; payload: string }
  | { type: 'UPDATE_BATCH_INSTRUCTION'; payload: { id: string; updates: Partial<BatchInstruction> } }
  | { type: 'CLEAR_BATCH_INSTRUCTIONS' }
  | { type: 'ADD_SIMULATION_HISTORY'; payload: AppState['batchBuilder']['simulationHistory'][0] }
  | { type: 'UPDATE_SIMULATION_SETTINGS'; payload: Partial<AppState['simulation']> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['preferences']> }
  | { type: 'RESTORE_STATE'; payload: AppState };

const initialState: AppState = {
  batchBuilder: {
    instructions: [],
    simulationHistory: [],
  },
  simulation: {
    lastComputeUnitLimit: 1400,
    lastComputeUnitPrice: 0,
    favoritePresets: ['simple', 'token'],
  },
  preferences: {
    autoSaveEnabled: true,
    showAdvancedOptions: false,
    defaultSimulationMode: 'standard',
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_BATCH_INSTRUCTION':
      return {
        ...state,
        batchBuilder: {
          ...state.batchBuilder,
          instructions: [...state.batchBuilder.instructions, action.payload],
        },
      };

    case 'REMOVE_BATCH_INSTRUCTION':
      return {
        ...state,
        batchBuilder: {
          ...state.batchBuilder,
          instructions: state.batchBuilder.instructions.filter(
            (instr) => instr.id !== action.payload
          ),
        },
      };

    case 'UPDATE_BATCH_INSTRUCTION':
      return {
        ...state,
        batchBuilder: {
          ...state.batchBuilder,
          instructions: state.batchBuilder.instructions.map((instr) =>
            instr.id === action.payload.id
              ? { ...instr, ...action.payload.updates }
              : instr
          ),
        },
      };

    case 'CLEAR_BATCH_INSTRUCTIONS':
      return {
        ...state,
        batchBuilder: {
          ...state.batchBuilder,
          instructions: [],
        },
      };

    case 'ADD_SIMULATION_HISTORY':
      return {
        ...state,
        batchBuilder: {
          ...state.batchBuilder,
          simulationHistory: [
            action.payload,
            ...state.batchBuilder.simulationHistory.slice(0, 9), // Keep last 10
          ],
        },
      };

    case 'UPDATE_SIMULATION_SETTINGS':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          ...action.payload,
        },
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case 'RESTORE_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  saveState: () => void;
  clearState: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'solana-dev-tool-state';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'RESTORE_STATE', payload: parsedState });
      }
    } catch (error) {
      console.warn('Failed to load saved state:', error);
    }
  }, []);

  // Auto-save state to localStorage when it changes (if enabled)
  useEffect(() => {
    if (state.preferences.autoSaveEnabled) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save state:', error);
      }
    }
  }, [state]);

  const saveState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const clearState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'RESTORE_STATE', payload: initialState });
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, saveState, clearState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}