import { useQuery } from '@tanstack/react-query';
import { api } from '../api/tauri';

export function useLatest(ids: string[]) {
  return useQuery({
    queryKey: ['latest', ids],
    queryFn: () => api.checkLatest(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
  });
}
