import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api } from '../api/tauri';
import type { ProgressEvent } from '../types';
import type { UnlistenFn } from '@tauri-apps/api/event';

type OpType = 'install' | 'upgrade' | 'uninstall';

export function useInstallMutation(
  onProgress?: (event: ProgressEvent) => void
) {
  const queryClient = useQueryClient();
  const unlistenRef = useRef<UnlistenFn | null>(null);

  useEffect(() => {
    let active = true;
    api.onProgress((event) => {
      if (active) onProgress?.(event);
    }).then((unlisten) => {
      unlistenRef.current = unlisten;
    });
    return () => {
      active = false;
      unlistenRef.current?.();
    };
  }, []);

  const opFn: Record<OpType, (id: string) => Promise<void>> = {
    install:   api.install,
    upgrade:   api.upgrade,
    uninstall: api.uninstall,
  };

  return useMutation({
    mutationFn: ({ op, id }: { op: OpType; id: string }) => opFn[op](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed'] });
    },
  });
}
