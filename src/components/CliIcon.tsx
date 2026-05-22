import type { ReactNode } from 'react';
import { siAnthropic, siGooglegemini } from 'simple-icons';
import Monogram from './Monogram';

const SIZES = { sm: 28, md: 36, lg: 44 };
const ICON_SIZES = { sm: 14, md: 18, lg: 22 };

type IconDef = { bg: string; icon: (sz: number) => ReactNode };

const ICONS: Record<string, IconDef> = {
  'claude-code': {
    bg: '#CC6633',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siAnthropic.path} />
      </svg>
    ),
  },
  'codex': {
    bg: '#0f0f0f',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 4v16M6.9 7.5l10.2 9M17.1 7.5L6.9 16.5" />
      </svg>
    ),
  },
  'gemini-cli': {
    bg: '#4285F4',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siGooglegemini.path} />
      </svg>
    ),
  },
  'kimi-cli': {
    bg: '#1A1A2E',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  'aider': {
    bg: '#2E7D32',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8l5 4-5 4" />
        <path d="M12 16h7" />
      </svg>
    ),
  },
  'cline': {
    bg: '#0277BD',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <path d="M19 9.5A7.5 7.5 0 1 0 19 14.5" />
      </svg>
    ),
  },
  'goose': {
    bg: '#00897B',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d="M17 9c-1.5-2-4-2.5-6-1L7 10 4 8.5C3.5 10 4.5 11 6 10.5L8 10l5.5 2.5-3.5 3C8 16 6.5 15.5 5 14L4 15c2 2.5 5 3 7.5 1.5L17 12c1-.5 1.5-2 0-3z" />
      </svg>
    ),
  },
  'antigravity': {
    bg: '#D84315',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d="M12 3L5 11h4v9a1 1 0 0 0 6 0v-9h4z" />
      </svg>
    ),
  },
};

interface Props {
  id: string;
  mono: string;
  hue: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CliIcon({ id, mono, hue, size = 'md' }: Props) {
  const def = ICONS[id];
  const px = SIZES[size];
  const iconSz = ICON_SIZES[size];

  if (!def) {
    return <Monogram mono={mono} hue={hue} size={size} />;
  }

  return (
    <div style={{
      width: px, height: px, borderRadius: 8,
      background: def.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {def.icon(iconSz)}
    </div>
  );
}
