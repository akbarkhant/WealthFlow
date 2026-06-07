  import { useCallback, useEffect, useState } from 'react';

  /**
   * @param {() => Promise<T>} apiFn
   * @param {unknown[]} deps
   * @returns {{ data: T | null, loading: boolean, error: string | null, refetch: () => Promise<T|undefined> }}
   */
  export function useApi(apiFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFn();
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Something went wrong');
        throw err;
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
      let cancelled = false;

      const run = async () => {
        try {
          setLoading(true);
          setError(null);
          const result = await apiFn();
          if (!cancelled) {
            setData(result);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err.message || 'Something went wrong');
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      run();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, refetch };
  }
