import { useState, useEffect } from 'react';
import { Agency } from '@/lib/types';

export function useAgencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agencies')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar agencias');
        return res.json();
      })
      .then((data) => {
        setAgencies(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar las agencias');
        setIsLoading(false);
      });
  }, []);

  return { agencies, isLoading, error };
}
