import { useEffect, useState } from 'react';
import { ApiStatus, getApiStatus, subscribeApiStatus } from './apiStatus';

/**
 * Custom React Hook: useApiStatus
 * Returns 'checking' | 'live' | 'offline' reactively
 */
export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>(getApiStatus());
  useEffect(() => subscribeApiStatus(setStatus), []);
  return status;
}
