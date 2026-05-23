import type { ReactNode } from 'react';
import { siClaude, siCline, siGooglegemini, siMoonshotai } from 'simple-icons';
import gooseLogo from '../assets/logos/goose-logo-light.png';
import Monogram from './Monogram';

const SIZES = { sm: 28, md: 36, lg: 44 };
const ICON_SIZES = { sm: 14, md: 18, lg: 22 };

type IconDef = { bg: string; icon: (sz: number) => ReactNode };

const ICONS: Record<string, IconDef> = {
  'claude-code': {
    bg: '#D97757',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siClaude.path} />
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
    bg: '#0F172A',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siMoonshotai.path} />
      </svg>
    ),
  },
  'aider': {
    bg: '#020403',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 48 48" fill="none" shapeRendering="crispEdges">
        <defs>
          <filter id="aiderPixelGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.08 0 0 0 0 0.69 0 0 0 0 0.08 0 0 0 0.75 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#aiderPixelGlow)">
          <rect x="13" y="4" width="20" height="6" fill="#00F879" />
          <rect x="28" y="10" width="6" height="28" fill="#00D86B" />
          <rect x="6" y="17" width="22" height="6" fill="#00F879" />
          <rect x="13" y="30" width="21" height="6" fill="#00F879" />
          <rect x="34" y="36" width="5" height="7" fill="#00D86B" />
        </g>
      </svg>
    ),
  },
  'cline': {
    bg: '#0277BD',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siCline.path} />
      </svg>
    ),
  },
  'goose': {
    bg: '#FFFFFF',
    icon: (sz) => {
      const px = Math.round(sz * 1.45);
      return <img src={gooseLogo} alt="" width={px} height={px} style={{ display: 'block', objectFit: 'contain' }} />;
    },
  },
  'antigravity': {
    bg: '#F7F9FF',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 112 112" fill="none">
        <defs>
          <linearGradient id="antigravityMark" x1="23" y1="22" x2="91" y2="94" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00B95C" />
            <stop offset="0.33" stopColor="#FFE432" />
            <stop offset="0.66" stopColor="#FC413D" />
            <stop offset="1" stopColor="#3186FF" />
          </linearGradient>
        </defs>
        <path
          d="M89.6992 93.695C94.3659 97.195 101.366 94.8617 94.9492 88.445C75.6992 69.7783 79.7825 18.445 55.8659 18.445C31.9492 18.445 36.0325 69.7783 16.7825 88.445C9.78251 95.445 17.3658 97.195 22.0325 93.695C40.1159 81.445 38.9492 59.8617 55.8659 59.8617C72.7825 59.8617 71.6159 81.445 89.6992 93.695Z"
          fill="url(#antigravityMark)"
        />
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
