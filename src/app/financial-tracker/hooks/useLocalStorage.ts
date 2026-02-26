// src/app/financial-tracker/hooks/useLocalStorage.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================
// INTERFACES & TYPES
// ============================================

interface StorageOptions<T> {
  defaultValue: T;
  prefix?: string;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncAcrossTabs?: boolean;
  expiry?: number;
  encrypt?: boolean;
  version?: number;
  migrate?: (oldValue: any, oldVersion: number) => T;
  onError?: (error: Error) => void;
  storageType?: 'local' | 'session';
  maxSize?: number;
}

interface StorageValue<T> {
  value: T;
  timestamp: number;
  version: number;
  expiry?: number;
}

interface StorageStats {
  key: string;
  size: number;
  created: Date;
  lastAccessed: Date;
  lastModified: Date;
  accessCount: number;
}

interface CustomStorageEvent<T> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  timestamp: number;
  source: 'current' | 'other';
}

type StorageListener<T> = (event: CustomStorageEvent<T>) => void;

interface BackupData<T> {
  key: string;
  value: T;
  timestamp: number;
  version: number;
  metadata: Record<string, any>;
}

interface StorageControls<T> {
  remove: () => void;
  clear: () => void;
  has: () => boolean;
  stats: () => StorageStats | null;
  listen: (listener: StorageListener<T>) => () => void;
  refresh: () => void;
  migrate: (newVersion: number, migrator: (oldValue: any) => T) => void;
  export: () => string;
  import: (data: string) => boolean;
  backup: () => BackupData<T>;
  restore: (backup: BackupData<T>) => boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_OPTIONS = {
  prefix: 'app',
  serializer: JSON.stringify,
  deserializer: JSON.parse,
  syncAcrossTabs: true,
  storageType: 'local' as const,
  version: 1,
};

const STORAGE_PREFIX = 'financial_tracker';

// ============================================
// MAIN HOOK
// ============================================

export function useLocalStorage<T>(
  key: string,
  options: StorageOptions<T>
): [T, (value: T | ((val: T) => T)) => void, StorageControls<T>] {
  const {
    defaultValue,
    prefix = DEFAULT_OPTIONS.prefix,
    serializer = DEFAULT_OPTIONS.serializer,
    deserializer = DEFAULT_OPTIONS.deserializer,
    syncAcrossTabs = DEFAULT_OPTIONS.syncAcrossTabs,
    expiry,
    encrypt = false,
    version = DEFAULT_OPTIONS.version,
    migrate,
    onError,
    storageType = DEFAULT_OPTIONS.storageType,
    maxSize,
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      const item = storage.getItem(fullKey);

      if (item) {
        try {
          const parsed: StorageValue<T> = deserializer(item);
          
          if (parsed.expiry && Date.now() > parsed.expiry) {
            storage.removeItem(fullKey);
            return defaultValue;
          }

          if (parsed.version !== version && migrate) {
            const migrated = migrate(parsed.value, parsed.version);
            const newValue: StorageValue<T> = {
              value: migrated,
              timestamp: Date.now(),
              version,
              expiry: parsed.expiry,
            };
            storage.setItem(fullKey, serializer(newValue));
            return migrated;
          }

          return parsed.value;
        } catch {
          return item as unknown as T;
        }
      }
      return defaultValue;
    } catch (error) {
      onError?.(error as Error);
      return defaultValue;
    }
  });

  const listeners = useMemo(() => new Map<string, StorageListener<T>>(), []);

  const updateStorage = useCallback((newValue: T) => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      
      const storageValue: StorageValue<T> = {
        value: newValue,
        timestamp: Date.now(),
        version,
        expiry: expiry ? Date.now() + expiry : undefined,
      };

      let serialized = serializer(storageValue);

      if (encrypt) {
        serialized = btoa(serialized);
      }

      storage.setItem(fullKey, serialized);

      if (maxSize) {
        const keys: { key: string; timestamp: number }[] = [];
        for (let i = 0; i < storage.length; i++) {
          const storageKey = storage.key(i);
          if (storageKey?.startsWith(`${STORAGE_PREFIX}:${prefix}:`)) {
            try {
              const item = storage.getItem(storageKey);
              if (item) {
                const parsed = deserializer(item);
                keys.push({
                  key: storageKey,
                  timestamp: parsed.timestamp || 0,
                });
              }
            } catch {}
          }
        }
        
        keys.sort((a, b) => a.timestamp - b.timestamp);
        while (keys.length > maxSize) {
          const oldest = keys.shift();
          if (oldest) storage.removeItem(oldest.key);
        }
      }

      const event: CustomStorageEvent<T> = {
        key,
        oldValue: storedValue,
        newValue,
        timestamp: Date.now(),
        source: 'current',
      };
      listeners.forEach((listener) => listener(event));

      setStoredValue(newValue);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, prefix, serializer, storedValue, version, expiry, encrypt, storageType, listeners, onError, maxSize, deserializer]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      updateStorage(newValue);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [storedValue, updateStorage, onError]);

  const remove = useCallback(() => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      storage.removeItem(fullKey);
      
      const event: CustomStorageEvent<T> = {
        key,
        oldValue: storedValue,
        newValue: null,
        timestamp: Date.now(),
        source: 'current',
      };
      listeners.forEach((listener) => listener(event));
      
      setStoredValue(defaultValue);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, prefix, storedValue, defaultValue, storageType, listeners, onError]);

  const clear = useCallback(() => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      storage.removeItem(fullKey);
      setStoredValue(defaultValue);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, prefix, defaultValue, storageType, onError]);

  const has = useCallback(() => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      return storage.getItem(fullKey) !== null;
    } catch (error) {
      onError?.(error as Error);
      return false;
    }
  }, [key, prefix, storageType, onError]);

  const stats = useCallback((): StorageStats | null => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      const item = storage.getItem(fullKey);
      
      if (!item) return null;

      return {
        key: fullKey,
        size: new Blob([item]).size,
        created: new Date(),
        lastAccessed: new Date(),
        lastModified: new Date(),
        accessCount: 0,
      };
    } catch (error) {
      onError?.(error as Error);
      return null;
    }
  }, [key, prefix, storageType, onError]);

  const listen = useCallback((listener: StorageListener<T>) => {
    const id = Math.random().toString(36).substr(2, 9);
    listeners.set(id, listener);
    
    return () => {
      listeners.delete(id);
    };
  }, [listeners]);

  const refresh = useCallback(() => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      const item = storage.getItem(fullKey);
      
      if (item) {
        try {
          const parsed: StorageValue<T> = deserializer(item);
          setStoredValue(parsed.value);
        } catch {
          setStoredValue(item as unknown as T);
        }
      } else {
        setStoredValue(defaultValue);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, prefix, defaultValue, deserializer, storageType, onError]);

  const migrateVersion = useCallback((newVersion: number, migrator: (oldValue: any) => T) => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      const item = storage.getItem(fullKey);
      
      if (item) {
        const parsed: StorageValue<T> = deserializer(item);
        const migrated = migrator(parsed.value);
        const newValue: StorageValue<T> = {
          value: migrated,
          timestamp: Date.now(),
          version: newVersion,
          expiry: parsed.expiry,
        };
        storage.setItem(fullKey, serializer(newValue));
        setStoredValue(migrated);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [key, prefix, deserializer, serializer, storageType, onError]);

  const exportData = useCallback((): string => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      const item = storage.getItem(fullKey);
      return item || '';
    } catch (error) {
      onError?.(error as Error);
      return '';
    }
  }, [key, prefix, storageType, onError]);

  const importData = useCallback((data: string): boolean => {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      storage.setItem(fullKey, data);
      
      try {
        const parsed: StorageValue<T> = deserializer(data);
        setStoredValue(parsed.value);
      } catch {
        setStoredValue(data as unknown as T);
      }
      
      return true;
    } catch (error) {
      onError?.(error as Error);
      return false;
    }
  }, [key, prefix, deserializer, storageType, onError]);

  const backup = useCallback((): BackupData<T> => {
    return {
      key,
      value: storedValue,
      timestamp: Date.now(),
      version,
      metadata: {
        storageType,
        encrypted: encrypt,
      },
    };
  }, [key, storedValue, version, storageType, encrypt]);

  const restore = useCallback((backupData: BackupData<T>): boolean => {
    try {
      if (backupData.key === key) {
        setValue(backupData.value);
        return true;
      }
      return false;
    } catch (error) {
      onError?.(error as Error);
      return false;
    }
  }, [key, setValue, onError]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      const fullKey = `${STORAGE_PREFIX}:${prefix}:${key}`;
      if (e.key === fullKey && e.newValue !== e.oldValue) {
        try {
          let newValue: T;
          if (e.newValue) {
            try {
              const parsed: StorageValue<T> = deserializer(e.newValue);
              newValue = parsed.value;
            } catch {
              newValue = e.newValue as unknown as T;
            }
          } else {
            newValue = defaultValue;
          }

          const event: CustomStorageEvent<T> = {
            key,
            oldValue: storedValue,
            newValue,
            timestamp: Date.now(),
            source: 'other',
          };
          listeners.forEach((listener) => listener(event));

          setStoredValue(newValue);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, prefix, syncAcrossTabs, deserializer, storedValue, defaultValue, listeners, onError]);

  return [
    storedValue,
    setValue,
    {
      remove,
      clear,
      has,
      stats,
      listen,
      refresh,
      migrate: migrateVersion,
      export: exportData,
      import: importData,
      backup,
      restore,
    },
  ];
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

export function useTheme(defaultTheme: 'light' | 'dark' | 'system' = 'system') {
  return useLocalStorage<'light' | 'dark' | 'system'>('theme', {
    defaultValue: defaultTheme,
    prefix: 'settings',
  });
}

export function useUserPreferences<T extends Record<string, any>>(defaultPrefs: T) {
  return useLocalStorage<T>('preferences', {
    defaultValue: defaultPrefs,
    prefix: 'user',
    version: 1,
    migrate: (oldPrefs) => oldPrefs as T,
  });
}

export function useSessionData<T>(key: string, defaultValue: T) {
  return useLocalStorage<T>(key, {
    defaultValue,
    prefix: 'session',
    storageType: 'session',
    syncAcrossTabs: false,
  });
}

export function useEncryptedStorage<T>(key: string, defaultValue: T) {
  return useLocalStorage<T>(key, {
    defaultValue,
    prefix: 'secure',
    encrypt: true,
  });
}