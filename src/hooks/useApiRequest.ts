'use client';

import { useState, useCallback } from 'react';
import { apiRequest, ApiResponse } from '@/lib/api-request';

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T;
}

export function useApiRequest<T = any>(
  endpoint: string,
  options: UseApiRequestOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse<T> | null>(null);

  const execute = useCallback(
    async (requestOptions: any = {}) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiRequest<T>(endpoint, requestOptions);
        setResponse(result);

        if (result.success) {
          setData(result.data);
          options.onSuccess?.(result.data!);
        } else {
          setError(result.message || 'Request failed');
          options.onError?.(result.message || 'Request failed');
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Network error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    response,
    execute,
    refetch,
  };
}