import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TasbeehSession = {
  id: string;
  count: number;
  target: number;
  savedAt: string;
};

export type AppStateData = {
  darkMode: boolean;
  notificationsEnabled: boolean;
  count: number;
  target: string;
  savedSessions: TasbeehSession[];
  bookmarks: string[];
  recentlyRead: string[];
};

type AppStateContextValue = {
  data: AppStateData;
  setData: React.Dispatch<React.SetStateAction<AppStateData>>;
  ready: boolean;
  storageError: string | null;
};

const STORAGE_KEY = 'noor-e-hidayat.state.v1';
const initialData: AppStateData = {
  darkMode: false,
  notificationsEnabled: false,
  count: 0,
  target: '33',
  savedSessions: [],
  bookmarks: [],
  recentlyRead: [],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isAppStateData(parsed) && mounted) {
            setData({ ...initialData, ...parsed });
          } else if (mounted) {
            setStorageError('Saved app data has an invalid format. Defaults are being used.');
          }
        }
      } catch {
        if (mounted) {
          setStorageError('Saved app data could not be loaded. Changes may not persist on this device.');
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void loadState();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    async function persistState() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStorageError(null);
      } catch {
        setStorageError('Changes could not be saved to this device. Check available storage and try again.');
      }
    }

    void persistState();
  }, [data, ready]);

  const value = useMemo(
    () => ({ data, setData, ready, storageError }),
    [data, ready, storageError],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider.');
  }
  return context;
}

function isAppStateData(value: unknown): value is AppStateData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AppStateData>;
  return (
    typeof candidate.darkMode === 'boolean' &&
    typeof candidate.notificationsEnabled === 'boolean' &&
    Number.isInteger(candidate.count) &&
    typeof candidate.target === 'string' &&
    Array.isArray(candidate.savedSessions) &&
    Array.isArray(candidate.bookmarks) &&
    Array.isArray(candidate.recentlyRead)
  );
}
