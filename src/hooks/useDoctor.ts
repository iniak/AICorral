import { useQuery } from '@tanstack/react-query';
import { api } from '../api/tauri';

export function useDoctor(enabled = true) {
  return useQuery({
    queryKey: ['doctor'],
    queryFn: api.doctor,
    enabled,
    staleTime: 60_000,
  });
}
