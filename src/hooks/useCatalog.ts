import { useQuery } from '@tanstack/react-query';
import { api } from '../api/tauri';

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: api.listCatalog,
    staleTime: Infinity,
  });
}
