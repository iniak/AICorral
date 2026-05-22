import { useQuery } from '@tanstack/react-query';
import { type as osType } from '@tauri-apps/plugin-os';

export function usePlatform() {
  return useQuery({
    queryKey: ['platform'],
    queryFn: osType,
    staleTime: Infinity,
  });
}
