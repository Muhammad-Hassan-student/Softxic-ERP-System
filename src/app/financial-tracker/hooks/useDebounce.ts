// src/app/financial-tracker/hooks/useDebounce.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// INTERFACES & TYPES
// ============================================

interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
  cancelOnUnmount?: boolean;
  type?: 'timeout' | 'raf' | 'idle';
}

interface DebouncedState<T> {
  value: T;
  isPending: boolean;
  isFlushing: boolean;
  progress: number;
}

interface DebouncedControls<T> {
  flush: () => void;
  cancel: () => void;
  pending: () => boolean;
  setValue: (value: T | ((prev: T) => T)) => void;
  updateOptions: (options: Partial<DebounceOptions>) => void;
  reset: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_OPTIONS: DebounceOptions = {
  delay: 300,
  leading: false,
  trailing: true,
  cancelOnUnmount: true,
  type: 'timeout',
};

// ============================================
// MAIN HOOK WITH OVERLOADS
// ============================================

export function useDebounce<T>(
  initialValue: T | (() => T)
): [T, DebouncedControls<T>];

export function useDebounce<T>(
  initialValue: T | (() => T),
  delay: number
): [T, DebouncedControls<T>];

export function useDebounce<T>(
  initialValue: T | (() => T),
  options: DebounceOptions
): [T, DebouncedControls<T>];

export function useDebounce<T>(
  initialValue: T | (() => T),
  delayOrOptions?: number | DebounceOptions
): [T, DebouncedControls<T>] {
  
  // Normalize arguments
  let options: DebounceOptions;
  
  if (typeof delayOrOptions === 'number') {
    options = { delay: delayOrOptions };
  } else if (delayOrOptions) {
    options = delayOrOptions;
  } else {
    options = {};
  }

  const {
    delay = DEFAULT_OPTIONS.delay!,
    leading = DEFAULT_OPTIONS.leading!,
    trailing = DEFAULT_OPTIONS.trailing!,
    maxWait,
    cancelOnUnmount = DEFAULT_OPTIONS.cancelOnUnmount!,
    type = DEFAULT_OPTIONS.type!,
  } = options;

  const [state, setState] = useState<DebouncedState<T>>(() => ({
    value: initialValue instanceof Function ? initialValue() : initialValue,
    isPending: false,
    isFlushing: false,
    progress: 0,
  }));

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleRef = useRef<number | null>(null);
  const maxWaitRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const leadingCalledRef = useRef(false);
  const pendingValueRef = useRef<T>(state.value);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (idleRef.current && 'cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(idleRef.current);
      idleRef.current = null;
    }
    if (maxWaitRef.current) {
      clearTimeout(maxWaitRef.current);
      maxWaitRef.current = null;
    }
    
    leadingCalledRef.current = false;
    startTimeRef.current = null;
    
    setState(prev => ({
      ...prev,
      isPending: false,
      isFlushing: false,
      progress: 0,
    }));
  }, []);

  const flush = useCallback(() => {
    if (pendingValueRef.current === undefined) return;

    cancel();
    
    setState(prev => ({
      ...prev,
      value: pendingValueRef.current!,
      isFlushing: true,
      isPending: false,
      progress: 100,
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, isFlushing: false }));
    }, 0);

    pendingValueRef.current = undefined!;
  }, [cancel]);

  const pending = useCallback(() => {
    return state.isPending;
  }, [state.isPending]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = value instanceof Function ? value(state.value) : value;
    pendingValueRef.current = newValue;
    
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    if (leading && !leadingCalledRef.current && !state.isPending) {
      leadingCalledRef.current = true;
      setState(prev => ({
        ...prev,
        value: newValue,
        isPending: true,
        progress: 0,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isPending: true,
      progress: Math.min(((Date.now() - (startTimeRef.current || 0)) / delay) * 100, 100),
    }));

    cancel();

    if (maxWait && !maxWaitRef.current) {
      maxWaitRef.current = setTimeout(() => {
        flush();
      }, maxWait);
    }

    const executeTrailing = () => {
      if (trailing) {
        flush();
      }
      leadingCalledRef.current = false;
      startTimeRef.current = null;
    };

    if (type === 'timeout') {
      timeoutRef.current = setTimeout(executeTrailing, delay);
    } else if (type === 'raf') {
      let start = performance.now();
      const animate = () => {
        const now = performance.now();
        const elapsed = now - start;
        
        setState(prev => ({
          ...prev,
          progress: Math.min((elapsed / delay) * 100, 100),
        }));

        if (elapsed >= delay) {
          executeTrailing();
        } else {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    } else if (type === 'idle' && 'requestIdleCallback' in window) {
      idleRef.current = (window as any).requestIdleCallback(executeTrailing, { timeout: delay });
    }
  }, [state.value, state.isPending, leading, trailing, delay, maxWait, type, cancel, flush]);

  const updateOptions = useCallback((newOptions: Partial<DebounceOptions>) => {
    // Options are handled by the hook's internal state
    // This is just a placeholder for API consistency
  }, []);

  const reset = useCallback(() => {
    cancel();
    pendingValueRef.current = undefined!;
    leadingCalledRef.current = false;
    startTimeRef.current = null;
    setState(prev => ({
      ...prev,
      isPending: false,
      isFlushing: false,
      progress: 0,
    }));
  }, [cancel]);

  useEffect(() => {
    return () => {
      if (cancelOnUnmount) {
        cancel();
      }
    };
  }, [cancel, cancelOnUnmount]);

  useEffect(() => {
    if (!state.isPending) {
      pendingValueRef.current = undefined!;
    }
  }, [state.isPending]);

  return [
    state.value,
    {
      flush,
      cancel,
      pending,
      setValue,
      updateOptions,
      reset,
    },
  ];
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

export function useDebouncedSearch<T = string>(
  initialValue: T = '' as T,
  delay: number = 300
) {
  return useDebounce(initialValue, { delay, leading: false, trailing: true });
}

export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  args: A,
  delay: number = 300
) {
  const [debouncedArgs, { setValue }] = useDebounce(args, { delay });

  useEffect(() => {
    setValue(args);
  }, [args, setValue]);

  useEffect(() => {
    callback(...debouncedArgs);
  }, [debouncedArgs, callback]);

  return debouncedArgs;
}

export function useThrottle<T>(
  value: T,
  limit: number = 300
): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }, limit);
      }
    };

    handler();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, limit]);

  return throttledValue;
}

export function useDebounceEffect(
  effect: () => void | (() => void),
  deps: any[],
  delay: number = 300
) {
  const [debouncedDeps, { setValue }] = useDebounce(deps, { delay });

  useEffect(() => {
    setValue(deps);
  }, [deps, setValue]);

  useEffect(() => {
    return effect();
  }, [debouncedDeps]);
}

export function useDebounceMemo<T>(
  factory: () => T,
  deps: any[],
  delay: number = 300
): T {
  const [debouncedDeps, { setValue }] = useDebounce(deps, { delay });
  const [value, setValueState] = useState<T>(factory);

  useEffect(() => {
    setValue(deps);
  }, [deps, setValue]);

  useEffect(() => {
    setValueState(factory());
  }, [debouncedDeps]);

  return value;
}