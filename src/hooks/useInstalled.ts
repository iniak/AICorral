import { useQuery } from '@tanstack/react-query';
import { api } from '../api/tauri';

export function useInstalled() {
  return useQuery({
    queryKey: ['installed'],
    queryFn: api.detectInstalled,
    staleTime: 30_000,
  });
}
